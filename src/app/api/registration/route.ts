import { NextRequest, NextResponse } from "next/server";
import { validateRegistration } from "@/lib/validation";
import {
    addRegistration,
    getRegistrationByEmail,
    getRegistrations,
    getConfirmedCount,
    getWaitlistCount,
} from "@/lib/registrations";
import { sendConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Ungültige Anfrage." },
            { status: 400 }
        );
    }

    const input = {
        firstName: String(body.firstName ?? "").trim(),
        lastName: String(body.lastName ?? "").trim(),
        email: String(body.email ?? "").trim(),
        dateOfBirth: String(body.dateOfBirth ?? ""),
        gender: String(body.gender ?? ""),
        club: String(body.club ?? "").trim(),
        emergencyContactName: String(body.emergencyContactName ?? "").trim(),
        emergencyContactPhone: String(body.emergencyContactPhone ?? "").trim(),
        experience: String(body.experience ?? "").trim(),
    };

    const errors = validateRegistration(input);
    if (errors.length > 0) {
        return NextResponse.json({ errors }, { status: 422 });
    }

    try {
        const existing = await getRegistrationByEmail(input.email);
        if (existing) {
            return NextResponse.json(
                { error: "Diese E-Mail-Adresse ist bereits registriert." },
                { status: 409 }
            );
        }

        const registration = await addRegistration({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            dateOfBirth: input.dateOfBirth,
            gender: input.gender as "male" | "female" | "other",
            club: input.club,
            emergencyContactName: input.emergencyContactName,
            emergencyContactPhone: input.emergencyContactPhone,
            experience: input.experience,
        });

        console.log(
            `[Registration] ${registration.firstName} ${registration.lastName} — ` +
            `Status: ${registration.status}, Bib: ${registration.bibNumber ?? "waitlisted"}`
        );

        sendConfirmationEmail({
            email: registration.email,
            firstName: registration.firstName,
            lastName: registration.lastName,
            bibNumber: registration.bibNumber,
            status: registration.status as "confirmed" | "waitlisted",
        });

        return NextResponse.json(
            {
                registration: {
                    id: registration.id,
                    firstName: registration.firstName,
                    lastName: registration.lastName,
                    bibNumber: registration.bibNumber,
                    status: registration.status,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[Registration API]", error);
        return NextResponse.json(
            { error: "Interner Fehler bei der Registrierung." },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    // Simple auth guard for admin access — replace with proper auth later
    if (secret !== process.env.ADMIN_SECRET && secret !== "byu-admin-2026") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registrations = await getRegistrations();
    return NextResponse.json({
        total: registrations.length,
        confirmed: await getConfirmedCount(),
        waitlisted: await getWaitlistCount(),
        registrations,
    });
}
