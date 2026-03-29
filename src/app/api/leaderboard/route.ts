import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/laps";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        return NextResponse.json(await getLeaderboard());
    } catch (error) {
        console.error("[Leaderboard API]", error);
        return NextResponse.json(
            { error: "Interner Fehler beim Laden des Leaderboards." },
            { status: 500 }
        );
    }
}
