import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    const checks: Record<string, string> = {
        server: "ok",
        postgres_url: process.env.POSTGRES_URL ? "set" : "missing",
        database_url: process.env.DATABASE_URL ? "set" : "missing",
    };

    try {
        await ensureSchema();
        const { rows } = await sql`SELECT COUNT(*)::int AS count FROM registrations`;
        checks.database = "connected";
        checks.registrations_count = String(rows[0].count);
    } catch (error) {
        checks.database = "error";
        checks.database_error = error instanceof Error ? error.message : String(error);
    }

    const healthy = checks.database === "connected";
    return NextResponse.json(checks, { status: healthy ? 200 : 503 });
}
