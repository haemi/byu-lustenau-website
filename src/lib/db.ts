import { sql } from "@vercel/postgres";

let initialized = false;

export async function ensureSchema(): Promise<void> {
    if (initialized) return;

    await sql`
        CREATE TABLE IF NOT EXISTS registrations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            bib_number INTEGER,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL,
            date_of_birth TEXT NOT NULL,
            gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
            club TEXT NOT NULL DEFAULT '',
            emergency_contact_name TEXT NOT NULL,
            emergency_contact_phone TEXT NOT NULL,
            experience TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'cancelled')),
            registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS race_state (
            id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
            status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'running', 'finished')),
            started_at TIMESTAMPTZ,
            finished_at TIMESTAMPTZ,
            current_yard INTEGER NOT NULL DEFAULT 0,
            next_bib_number INTEGER NOT NULL DEFAULT 1
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS runners (
            registration_id UUID PRIMARY KEY REFERENCES registrations(id),
            bib_number INTEGER NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            club TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dnf')),
            dnf_after_lap INTEGER,
            dnf_at TIMESTAMPTZ
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS laps (
            id SERIAL PRIMARY KEY,
            registration_id UUID NOT NULL REFERENCES runners(registration_id),
            lap_number INTEGER NOT NULL,
            completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            duration_seconds INTEGER NOT NULL DEFAULT 0,
            UNIQUE(registration_id, lap_number)
        )
    `;

    // Ensure race_state singleton row exists
    await sql`
        INSERT INTO race_state (id, status, current_yard, next_bib_number)
        VALUES (1, 'not_started', 0, 1)
        ON CONFLICT (id) DO NOTHING
    `;

    initialized = true;
}

export { sql };
