import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { getRegistrations, getConfirmedCount, getWaitlistCount } from "@/lib/registrations";
import type { Registration } from "@/lib/registrations";

export async function GET(request: NextRequest) {
    const authError = verifyAdminAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase();
    const format = searchParams.get("format");

    let registrations = getRegistrations();

    if (status && status !== "all") {
        registrations = registrations.filter((r) => r.status === status);
    }

    if (search) {
        registrations = registrations.filter(
            (r) =>
                r.firstName.toLowerCase().includes(search) ||
                r.lastName.toLowerCase().includes(search) ||
                r.email.toLowerCase().includes(search) ||
                (r.club && r.club.toLowerCase().includes(search))
        );
    }

    if (format === "csv") {
        const csv = registrationsToCsv(registrations);
        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="registrierungen-${new Date().toISOString().slice(0, 10)}.csv"`,
            },
        });
    }

    return NextResponse.json({
        total: getRegistrations().length,
        confirmed: getConfirmedCount(),
        waitlisted: getWaitlistCount(),
        cancelled: getRegistrations().filter((r) => r.status === "cancelled").length,
        registrations,
    });
}

function registrationsToCsv(registrations: Registration[]): string {
    const headers = [
        "Startnummer",
        "Vorname",
        "Nachname",
        "E-Mail",
        "Geburtsdatum",
        "Geschlecht",
        "Verein",
        "Notfallkontakt",
        "Notfalltelefon",
        "Status",
        "Registriert am",
    ];

    const genderLabel: Record<string, string> = {
        male: "Männlich",
        female: "Weiblich",
        other: "Divers",
    };

    const statusLabel: Record<string, string> = {
        confirmed: "Bestätigt",
        waitlisted: "Warteliste",
        cancelled: "Storniert",
    };

    const rows = registrations.map((r) => [
        r.bibNumber ?? "",
        r.firstName,
        r.lastName,
        r.email,
        r.dateOfBirth,
        genderLabel[r.gender] ?? r.gender,
        r.club,
        r.emergencyContactName,
        r.emergencyContactPhone,
        statusLabel[r.status] ?? r.status,
        new Date(r.registeredAt).toLocaleString("de-AT"),
    ]);

    const escape = (val: string | number) => {
        const str = String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    return [
        headers.map(escape).join(","),
        ...rows.map((row) => row.map(escape).join(",")),
    ].join("\n");
}
