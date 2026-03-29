import { sql, ensureSchema } from "./db";

const MAX_PARTICIPANTS = 50;

export interface Registration {
    id: string;
    bibNumber: number | null;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other";
    club: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    experience: string;
    status: "confirmed" | "waitlisted" | "cancelled";
    registeredAt: string;
}

function rowToRegistration(row: Record<string, unknown>): Registration {
    return {
        id: row.id as string,
        bibNumber: row.bib_number as number | null,
        firstName: row.first_name as string,
        lastName: row.last_name as string,
        email: row.email as string,
        dateOfBirth: row.date_of_birth as string,
        gender: row.gender as "male" | "female" | "other",
        club: row.club as string,
        emergencyContactName: row.emergency_contact_name as string,
        emergencyContactPhone: row.emergency_contact_phone as string,
        experience: row.experience as string,
        status: row.status as "confirmed" | "waitlisted" | "cancelled",
        registeredAt: row.registered_at instanceof Date
            ? (row.registered_at as Date).toISOString()
            : String(row.registered_at),
    };
}

export async function getRegistrations(): Promise<Registration[]> {
    await ensureSchema();
    const { rows } = await sql`SELECT * FROM registrations ORDER BY registered_at ASC`;
    return rows.map(rowToRegistration);
}

export async function getRegistrationByEmail(email: string): Promise<Registration | undefined> {
    await ensureSchema();
    const { rows } = await sql`
        SELECT * FROM registrations
        WHERE LOWER(email) = LOWER(${email}) AND status != 'cancelled'
        LIMIT 1
    `;
    return rows.length > 0 ? rowToRegistration(rows[0]) : undefined;
}

export async function getConfirmedCount(): Promise<number> {
    await ensureSchema();
    const { rows } = await sql`SELECT COUNT(*)::int AS count FROM registrations WHERE status = 'confirmed'`;
    return rows[0].count;
}

export async function getWaitlistCount(): Promise<number> {
    await ensureSchema();
    const { rows } = await sql`SELECT COUNT(*)::int AS count FROM registrations WHERE status = 'waitlisted'`;
    return rows[0].count;
}

export async function addRegistration(
    data: Omit<Registration, "id" | "bibNumber" | "status" | "registeredAt">
): Promise<Registration> {
    await ensureSchema();

    const confirmedCount = await getConfirmedCount();
    const isWaitlisted = confirmedCount >= MAX_PARTICIPANTS;

    let bibNumber: number | null = null;
    if (!isWaitlisted) {
        const { rows } = await sql`
            UPDATE race_state SET next_bib_number = next_bib_number + 1
            WHERE id = 1
            RETURNING next_bib_number - 1 AS bib
        `;
        bibNumber = rows[0].bib;
    }

    const status = isWaitlisted ? "waitlisted" : "confirmed";

    const { rows } = await sql`
        INSERT INTO registrations (
            first_name, last_name, email, date_of_birth, gender,
            club, emergency_contact_name, emergency_contact_phone,
            experience, status, bib_number
        ) VALUES (
            ${data.firstName}, ${data.lastName}, ${data.email}, ${data.dateOfBirth}, ${data.gender},
            ${data.club}, ${data.emergencyContactName}, ${data.emergencyContactPhone},
            ${data.experience}, ${status}, ${bibNumber}
        )
        RETURNING *
    `;

    return rowToRegistration(rows[0]);
}

export async function cancelRegistration(id: string): Promise<Registration | null> {
    await ensureSchema();

    const { rows: current } = await sql`SELECT * FROM registrations WHERE id = ${id}`;
    if (current.length === 0 || current[0].status === "cancelled") return null;

    const wasBibbed = current[0].bib_number !== null;

    await sql`
        UPDATE registrations SET status = 'cancelled', bib_number = NULL
        WHERE id = ${id}
    `;

    if (wasBibbed) {
        const { rows: waitlisted } = await sql`
            SELECT id FROM registrations
            WHERE status = 'waitlisted'
            ORDER BY registered_at ASC
            LIMIT 1
        `;
        if (waitlisted.length > 0) {
            const { rows: bibRows } = await sql`
                UPDATE race_state SET next_bib_number = next_bib_number + 1
                WHERE id = 1
                RETURNING next_bib_number - 1 AS bib
            `;
            await sql`
                UPDATE registrations
                SET status = 'confirmed', bib_number = ${bibRows[0].bib}
                WHERE id = ${waitlisted[0].id}
            `;
        }
    }

    const { rows: updated } = await sql`SELECT * FROM registrations WHERE id = ${id}`;
    return rowToRegistration(updated[0]);
}

export async function updateRegistrationStatus(
    id: string,
    newStatus: "confirmed" | "waitlisted" | "cancelled"
): Promise<Registration | null> {
    await ensureSchema();

    const { rows } = await sql`SELECT * FROM registrations WHERE id = ${id}`;
    if (rows.length === 0) return null;

    const oldStatus = rows[0].status as string;
    if (oldStatus === newStatus) return rowToRegistration(rows[0]);

    if (newStatus === "cancelled") {
        return cancelRegistration(id);
    }

    if (newStatus === "confirmed" && oldStatus !== "confirmed") {
        const { rows: bibRows } = await sql`
            UPDATE race_state SET next_bib_number = next_bib_number + 1
            WHERE id = 1
            RETURNING next_bib_number - 1 AS bib
        `;
        await sql`
            UPDATE registrations SET status = 'confirmed', bib_number = ${bibRows[0].bib}
            WHERE id = ${id}
        `;
    } else if (newStatus === "waitlisted") {
        const hadBib = rows[0].bib_number !== null;
        await sql`
            UPDATE registrations SET status = 'waitlisted', bib_number = NULL
            WHERE id = ${id}
        `;

        if (hadBib) {
            const { rows: waitlisted } = await sql`
                SELECT id FROM registrations
                WHERE id != ${id} AND status = 'waitlisted'
                ORDER BY registered_at ASC
                LIMIT 1
            `;
            if (waitlisted.length > 0) {
                const { rows: bibRows } = await sql`
                    UPDATE race_state SET next_bib_number = next_bib_number + 1
                    WHERE id = 1
                    RETURNING next_bib_number - 1 AS bib
                `;
                await sql`
                    UPDATE registrations
                    SET status = 'confirmed', bib_number = ${bibRows[0].bib}
                    WHERE id = ${waitlisted[0].id}
                `;
            }
        }
    }

    const { rows: updated } = await sql`SELECT * FROM registrations WHERE id = ${id}`;
    return rowToRegistration(updated[0]);
}

export async function getRegistrationById(id: string): Promise<Registration | undefined> {
    await ensureSchema();
    const { rows } = await sql`SELECT * FROM registrations WHERE id = ${id}`;
    return rows.length > 0 ? rowToRegistration(rows[0]) : undefined;
}
