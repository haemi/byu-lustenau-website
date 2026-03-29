import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const RACE_FILE = join(DATA_DIR, "race.json");

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

function ensureDataDir(): void {
    const { mkdirSync } = require("fs");
    if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
    }
}

function readRace(): RaceState {
    ensureDataDir();
    if (!existsSync(RACE_FILE)) {
        return {
            status: "not_started",
            startedAt: null,
            finishedAt: null,
            currentYard: 0,
            runners: [],
        };
    }
    const raw = readFileSync(RACE_FILE, "utf-8");
    return JSON.parse(raw);
}

function writeRace(state: RaceState): void {
    ensureDataDir();
    writeFileSync(RACE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

export function getRaceState(): RaceState {
    return readRace();
}

export function startRace(registrationIds: string[]): RaceState {
    const { getRegistrations } = require("./registrations");
    const allRegs = getRegistrations();
    const confirmed = allRegs.filter(
        (r: { id: string; status: string; bibNumber: number | null }) =>
            registrationIds.includes(r.id) && r.status === "confirmed" && r.bibNumber !== null
    );

    const runners: Runner[] = confirmed.map(
        (r: { id: string; bibNumber: number; firstName: string; lastName: string; club: string }) => ({
            registrationId: r.id,
            bibNumber: r.bibNumber,
            firstName: r.firstName,
            lastName: r.lastName,
            club: r.club,
            laps: [],
            status: "active" as const,
            dnfAfterLap: null,
            dnfAt: null,
        })
    );

    const state: RaceState = {
        status: "running",
        startedAt: new Date().toISOString(),
        finishedAt: null,
        currentYard: 1,
        runners: runners.sort((a, b) => a.bibNumber - b.bibNumber),
    };

    writeRace(state);
    return state;
}

export function advanceYard(): RaceState {
    const state = readRace();
    if (state.status !== "running") return state;
    state.currentYard++;
    writeRace(state);
    return state;
}

export function recordLap(registrationId: string, durationSeconds?: number): RaceState {
    const state = readRace();
    if (state.status !== "running") return state;

    const runner = state.runners.find((r) => r.registrationId === registrationId);
    if (!runner || runner.status !== "active") return state;

    const lapNumber = state.currentYard;
    const alreadyRecorded = runner.laps.some((l) => l.lapNumber === lapNumber);
    if (alreadyRecorded) return state;

    runner.laps.push({
        lapNumber,
        completedAt: new Date().toISOString(),
        durationSeconds: durationSeconds ?? 0,
    });

    writeRace(state);
    return state;
}

export function markDNF(registrationId: string): RaceState {
    const state = readRace();
    if (state.status !== "running") return state;

    const runner = state.runners.find((r) => r.registrationId === registrationId);
    if (!runner || runner.status !== "active") return state;

    runner.status = "dnf";
    runner.dnfAfterLap = runner.laps.length;
    runner.dnfAt = new Date().toISOString();

    const activeRunners = state.runners.filter((r) => r.status === "active");
    if (activeRunners.length <= 1) {
        state.status = "finished";
        state.finishedAt = new Date().toISOString();
    }

    writeRace(state);
    return state;
}

export function finishRace(): RaceState {
    const state = readRace();
    if (state.status !== "running") return state;
    state.status = "finished";
    state.finishedAt = new Date().toISOString();
    writeRace(state);
    return state;
}

export function resetRace(): RaceState {
    const state: RaceState = {
        status: "not_started",
        startedAt: null,
        finishedAt: null,
        currentYard: 0,
        runners: [],
    };
    writeRace(state);
    return state;
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

export function getResults(): RaceResults | null {
    const state = readRace();
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

export function getRunnerByBib(bibNumber: number): { runner: Runner; registrationId: string } | null {
    const state = readRace();
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

export function getLeaderboard(): {
    race: { status: string; startedAt: string | null; currentYard: number };
    leaderboard: LeaderboardEntry[];
} {
    const state = readRace();
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
