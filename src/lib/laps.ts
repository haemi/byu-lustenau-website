import { sql, ensureSchema } from "./db";
import { getRegistrations } from "./registrations";

export interface Lap {
    lapNumber: number;
    completedAt: string;
    durationSeconds: number;
}

export interface Runner {
    registrationId: string;
    bibNumber: number;
    firstName: string;
    lastName: string;
    club: string;
    laps: Lap[];
    status: "active" | "dnf";
    dnfAfterLap: number | null;
    dnfAt: string | null;
}

export interface RaceState {
    status: "not_started" | "running" | "finished";
    startedAt: string | null;
    finishedAt: string | null;
    currentYard: number;
    runners: Runner[];
}

async function loadRunners(): Promise<Runner[]> {
    const { rows: runnerRows } = await sql`
        SELECT * FROM runners ORDER BY bib_number ASC
    `;

    const runners: Runner[] = [];
    for (const r of runnerRows) {
        const { rows: lapRows } = await sql`
            SELECT * FROM laps
            WHERE registration_id = ${r.registration_id}
            ORDER BY lap_number ASC
        `;

        runners.push({
            registrationId: r.registration_id as string,
            bibNumber: r.bib_number as number,
            firstName: r.first_name as string,
            lastName: r.last_name as string,
            club: r.club as string,
            laps: lapRows.map((l) => ({
                lapNumber: l.lap_number as number,
                completedAt: l.completed_at instanceof Date
                    ? (l.completed_at as Date).toISOString()
                    : String(l.completed_at),
                durationSeconds: l.duration_seconds as number,
            })),
            status: r.status as "active" | "dnf",
            dnfAfterLap: r.dnf_after_lap as number | null,
            dnfAt: r.dnf_at instanceof Date
                ? (r.dnf_at as Date).toISOString()
                : (r.dnf_at as string | null),
        });
    }
    return runners;
}

export async function getRaceState(): Promise<RaceState> {
    await ensureSchema();
    const { rows } = await sql`SELECT * FROM race_state WHERE id = 1`;
    const rs = rows[0];
    const runners = await loadRunners();

    return {
        status: rs.status as "not_started" | "running" | "finished",
        startedAt: rs.started_at instanceof Date
            ? (rs.started_at as Date).toISOString()
            : (rs.started_at as string | null),
        finishedAt: rs.finished_at instanceof Date
            ? (rs.finished_at as Date).toISOString()
            : (rs.finished_at as string | null),
        currentYard: rs.current_yard as number,
        runners,
    };
}

export async function startRace(registrationIds: string[]): Promise<RaceState> {
    await ensureSchema();
    const allRegs = await getRegistrations();
    const confirmed = allRegs.filter(
        (r) => registrationIds.includes(r.id) && r.status === "confirmed" && r.bibNumber !== null
    );

    // Clear any previous race data
    await sql`DELETE FROM laps`;
    await sql`DELETE FROM runners`;

    const now = new Date().toISOString();

    for (const r of confirmed) {
        await sql`
            INSERT INTO runners (registration_id, bib_number, first_name, last_name, club, status)
            VALUES (${r.id}, ${r.bibNumber}, ${r.firstName}, ${r.lastName}, ${r.club}, 'active')
        `;
    }

    await sql`
        UPDATE race_state
        SET status = 'running', started_at = ${now}, finished_at = NULL, current_yard = 1
        WHERE id = 1
    `;

    return getRaceState();
}

export async function advanceYard(): Promise<RaceState> {
    await ensureSchema();
    const { rows } = await sql`SELECT status FROM race_state WHERE id = 1`;
    if (rows[0].status !== "running") return getRaceState();

    await sql`UPDATE race_state SET current_yard = current_yard + 1 WHERE id = 1`;
    return getRaceState();
}

export async function recordLap(registrationId: string, durationSeconds?: number): Promise<RaceState> {
    await ensureSchema();
    const { rows: rsRows } = await sql`SELECT status, current_yard FROM race_state WHERE id = 1`;
    if (rsRows[0].status !== "running") return getRaceState();

    const { rows: runnerRows } = await sql`
        SELECT status FROM runners WHERE registration_id = ${registrationId}
    `;
    if (runnerRows.length === 0 || runnerRows[0].status !== "active") return getRaceState();

    const lapNumber = rsRows[0].current_yard as number;

    // Use ON CONFLICT to prevent duplicate laps
    await sql`
        INSERT INTO laps (registration_id, lap_number, duration_seconds)
        VALUES (${registrationId}, ${lapNumber}, ${durationSeconds ?? 0})
        ON CONFLICT (registration_id, lap_number) DO NOTHING
    `;

    return getRaceState();
}

export async function markDNF(registrationId: string): Promise<RaceState> {
    await ensureSchema();
    const { rows: rsRows } = await sql`SELECT status FROM race_state WHERE id = 1`;
    if (rsRows[0].status !== "running") return getRaceState();

    const { rows: runnerRows } = await sql`
        SELECT status FROM runners WHERE registration_id = ${registrationId}
    `;
    if (runnerRows.length === 0 || runnerRows[0].status !== "active") return getRaceState();

    const { rows: lapCount } = await sql`
        SELECT COUNT(*)::int AS count FROM laps WHERE registration_id = ${registrationId}
    `;
    const now = new Date().toISOString();

    await sql`
        UPDATE runners
        SET status = 'dnf', dnf_after_lap = ${lapCount[0].count}, dnf_at = ${now}
        WHERE registration_id = ${registrationId}
    `;

    // Check if race should auto-finish (1 or fewer active runners)
    const { rows: activeCount } = await sql`
        SELECT COUNT(*)::int AS count FROM runners WHERE status = 'active'
    `;
    if (activeCount[0].count <= 1) {
        await sql`
            UPDATE race_state SET status = 'finished', finished_at = ${now} WHERE id = 1
        `;
    }

    return getRaceState();
}

export async function finishRace(): Promise<RaceState> {
    await ensureSchema();
    const { rows } = await sql`SELECT status FROM race_state WHERE id = 1`;
    if (rows[0].status !== "running") return getRaceState();

    await sql`
        UPDATE race_state SET status = 'finished', finished_at = ${new Date().toISOString()} WHERE id = 1
    `;
    return getRaceState();
}

export async function resetRace(): Promise<RaceState> {
    await ensureSchema();
    await sql`DELETE FROM laps`;
    await sql`DELETE FROM runners`;
    await sql`
        UPDATE race_state
        SET status = 'not_started', started_at = NULL, finished_at = NULL, current_yard = 0
        WHERE id = 1
    `;
    return getRaceState();
}

export interface ResultEntry {
    rank: number;
    bibNumber: number;
    firstName: string;
    lastName: string;
    club: string;
    completedLaps: number;
    totalDistanceKm: number;
    isWinner: boolean;
    dnfAfterLap: number | null;
}

export interface RaceResults {
    race: {
        status: string;
        startedAt: string | null;
        finishedAt: string | null;
        totalYards: number;
    };
    statistics: {
        totalRunners: number;
        finishers: number;
        dnfCount: number;
        averageLaps: number;
        maxLaps: number;
        totalDistanceAllRunnersKm: number;
    };
    results: ResultEntry[];
}

const LAP_DISTANCE_KM = 6.706;

export async function getResults(): Promise<RaceResults | null> {
    await ensureSchema();
    const state = await getRaceState();
    if (state.status !== "finished" || state.runners.length === 0) return null;

    const sorted = [...state.runners].sort((a, b) => {
        if (b.laps.length !== a.laps.length) return b.laps.length - a.laps.length;
        if (a.status === "active" && b.status !== "active") return -1;
        if (a.status !== "active" && b.status === "active") return 1;
        return a.bibNumber - b.bibNumber;
    });

    const maxLaps = sorted.length > 0 ? sorted[0].laps.length : 0;
    const totalLapsAll = sorted.reduce((sum, r) => sum + r.laps.length, 0);
    const dnfCount = sorted.filter((r) => r.status === "dnf").length;

    const results: ResultEntry[] = sorted.map((r, idx) => ({
        rank: idx + 1,
        bibNumber: r.bibNumber,
        firstName: r.firstName,
        lastName: r.lastName,
        club: r.club,
        completedLaps: r.laps.length,
        totalDistanceKm: Math.round(r.laps.length * LAP_DISTANCE_KM * 10) / 10,
        isWinner: r.status === "active" && r.laps.length === maxLaps,
        dnfAfterLap: r.dnfAfterLap,
    }));

    return {
        race: {
            status: state.status,
            startedAt: state.startedAt,
            finishedAt: state.finishedAt,
            totalYards: state.currentYard,
        },
        statistics: {
            totalRunners: state.runners.length,
            finishers: state.runners.filter((r) => r.status === "active").length,
            dnfCount,
            averageLaps: state.runners.length > 0 ? Math.round((totalLapsAll / state.runners.length) * 10) / 10 : 0,
            maxLaps,
            totalDistanceAllRunnersKm: Math.round(totalLapsAll * LAP_DISTANCE_KM * 10) / 10,
        },
        results,
    };
}

export async function getRunnerByBib(bibNumber: number): Promise<{ runner: Runner; registrationId: string } | null> {
    await ensureSchema();
    const state = await getRaceState();
    const runner = state.runners.find((r) => r.bibNumber === bibNumber);
    if (!runner) return null;
    return { runner, registrationId: runner.registrationId };
}

export interface LeaderboardEntry {
    bibNumber: number;
    firstName: string;
    lastName: string;
    club: string;
    completedLaps: number;
    status: "active" | "dnf";
    lastLapTime: string | null;
}

export async function getLeaderboard(): Promise<{
    race: { status: string; startedAt: string | null; currentYard: number };
    leaderboard: LeaderboardEntry[];
}> {
    await ensureSchema();
    const state = await getRaceState();
    const leaderboard: LeaderboardEntry[] = state.runners
        .map((r) => ({
            bibNumber: r.bibNumber,
            firstName: r.firstName,
            lastName: r.lastName,
            club: r.club,
            completedLaps: r.laps.length,
            status: r.status,
            lastLapTime: r.laps.length > 0 ? r.laps[r.laps.length - 1].completedAt : null,
        }))
        .sort((a, b) => {
            if (a.status === "active" && b.status !== "active") return -1;
            if (a.status !== "active" && b.status === "active") return 1;
            if (b.completedLaps !== a.completedLaps) return b.completedLaps - a.completedLaps;
            return a.bibNumber - b.bibNumber;
        });

    return {
        race: {
            status: state.status,
            startedAt: state.startedAt,
            currentYard: state.currentYard,
        },
        leaderboard,
    };
}
