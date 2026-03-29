import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin-auth";
import {
    getRaceState,
    startRace,
    advanceYard,
    finishRace,
    resetRace,
    markDNF,
} from "@/lib/laps";

export async function GET(request: NextRequest) {
    const authError = verifyAdminAuth(request);
    if (authError) return authError;

    return NextResponse.json(await getRaceState());
}

export async function POST(request: NextRequest) {
    const authError = verifyAdminAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { action } = body;

    switch (action) {
        case "start": {
            const { registrationIds } = body;
            if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
                return NextResponse.json(
                    { error: "registrationIds required" },
                    { status: 400 }
                );
            }
            return NextResponse.json(await startRace(registrationIds));
        }
        case "advance_yard":
            return NextResponse.json(await advanceYard());
        case "dnf": {
            const { registrationId } = body;
            if (!registrationId) {
                return NextResponse.json(
                    { error: "registrationId required" },
                    { status: 400 }
                );
            }
            return NextResponse.json(await markDNF(registrationId));
        }
        case "finish":
            return NextResponse.json(await finishRace());
        case "reset":
            return NextResponse.json(await resetRace());
        default:
            return NextResponse.json(
                { error: "Unknown action. Use: start, advance_yard, dnf, finish, reset" },
                { status: 400 }
            );
    }
}
