import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { getRegistrationById, updateRegistrationStatus } from "@/lib/registrations";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = verifyAdminAuth(request);
    if (authError) return authError;

    const { id } = await params;

    const existing = await getRegistrationById(id);
    if (!existing) {
        return NextResponse.json({ error: "Registrierung nicht gefunden." }, { status: 404 });
    }

    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }

    const newStatus = body.status;
    if (
        typeof newStatus !== "string" ||
        !["confirmed", "waitlisted", "cancelled"].includes(newStatus)
    ) {
        return NextResponse.json(
            { error: "Ungültiger Status. Erlaubt: confirmed, waitlisted, cancelled." },
            { status: 422 }
        );
    }

    const updated = await updateRegistrationStatus(
        id,
        newStatus as "confirmed" | "waitlisted" | "cancelled"
    );

    if (!updated) {
        return NextResponse.json({ error: "Status konnte nicht aktualisiert werden." }, { status: 500 });
    }

    return NextResponse.json({ registration: updated });
}
