import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/laps";

export const dynamic = "force-dynamic";

export async function GET() {
    return NextResponse.json(getLeaderboard());
}
