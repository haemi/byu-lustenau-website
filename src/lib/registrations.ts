import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "registrations.json");

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

interface RegistrationStore {
    registrations: Registration[];
    nextBibNumber: number;
}

function ensureDataDir(): void {
    const { mkdirSync } = require("fs");
    if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
    }
}

function readStore(): RegistrationStore {
    ensureDataDir();
    if (!existsSync(DATA_FILE)) {
        return { registrations: [], nextBibNumber: 1 };
    }
    const raw = readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
}

function writeStore(store: RegistrationStore): void {
    ensureDataDir();
    writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export function getRegistrations(): Registration[] {
    return readStore().registrations;
}

export function getRegistrationByEmail(email: string): Registration | undefined {
    return readStore().registrations.find(
        (r) => r.email.toLowerCase() === email.toLowerCase() && r.status !== "cancelled"
    );
}

export function getConfirmedCount(): number {
    return readStore().registrations.filter((r) => r.status === "confirmed").length;
}

export function getWaitlistCount(): number {
    return readStore().registrations.filter((r) => r.status === "waitlisted").length;
}

export function addRegistration(
    data: Omit<Registration, "id" | "bibNumber" | "status" | "registeredAt">
): Registration {
    const store = readStore();
    const confirmedCount = store.registrations.filter((r) => r.status === "confirmed").length;
    const isWaitlisted = confirmedCount >= MAX_PARTICIPANTS;

    const registration: Registration = {
        ...data,
        id: crypto.randomUUID(),
        bibNumber: isWaitlisted ? null : store.nextBibNumber,
        status: isWaitlisted ? "waitlisted" : "confirmed",
        registeredAt: new Date().toISOString(),
    };

    if (!isWaitlisted) {
        store.nextBibNumber++;
    }

    store.registrations.push(registration);
    writeStore(store);
    return registration;
}

export function cancelRegistration(id: string): Registration | null {
    const store = readStore();
    const reg = store.registrations.find((r) => r.id === id);
    if (!reg || reg.status === "cancelled") return null;

    const wasBibbed = reg.bibNumber !== null;
    reg.status = "cancelled";
    reg.bibNumber = null;

    // Promote first waitlisted runner if a confirmed spot opened
    if (wasBibbed) {
        const firstWaitlisted = store.registrations.find((r) => r.status === "waitlisted");
        if (firstWaitlisted) {
            firstWaitlisted.status = "confirmed";
            firstWaitlisted.bibNumber = store.nextBibNumber;
            store.nextBibNumber++;
        }
    }

    writeStore(store);
    return reg;
}

export function updateRegistrationStatus(
    id: string,
    newStatus: "confirmed" | "waitlisted" | "cancelled"
): Registration | null {
    const store = readStore();
    const reg = store.registrations.find((r) => r.id === id);
    if (!reg) return null;

    const oldStatus = reg.status;
    if (oldStatus === newStatus) return reg;

    if (newStatus === "cancelled") {
        return cancelRegistration(id);
    }

    if (newStatus === "confirmed" && oldStatus !== "confirmed") {
        reg.status = "confirmed";
        reg.bibNumber = store.nextBibNumber;
        store.nextBibNumber++;
    } else if (newStatus === "waitlisted") {
        const hadBib = reg.bibNumber !== null;
        reg.status = "waitlisted";
        reg.bibNumber = null;

        if (hadBib) {
            const firstWaitlisted = store.registrations.find(
                (r) => r.id !== id && r.status === "waitlisted"
            );
            if (firstWaitlisted) {
                firstWaitlisted.status = "confirmed";
                firstWaitlisted.bibNumber = store.nextBibNumber;
                store.nextBibNumber++;
            }
        }
    }

    writeStore(store);
    return reg;
}

export function getRegistrationById(id: string): Registration | undefined {
    return readStore().registrations.find((r) => r.id === id);
}
