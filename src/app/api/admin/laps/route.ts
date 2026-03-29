import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { recordLap, getRaceState } from "@/lib/laps";

export async function POST(request: NextRequest) {
    const authError = verifyAdminAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { registrationId, durationSeconds } = body;

    if (!registrationId) {
        return NextResponse.json(
            { error: "registrationId required" },
            { status: 400 }
        );
    }

    const state = await recordLap(registrationId, durationSeconds);
    return NextResponse.json(state);
}

export async function GET(request: NextRequest) {
    const authError = verifyAdminAuth(request);
    if (authError) return authError;

    return NextResponse.json(await getRaceState());
}
