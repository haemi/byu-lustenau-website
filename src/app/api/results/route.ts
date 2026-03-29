import { NextResponse } from "next/server";
import { getResults } from "@/lib/laps";

export const dynamic = "force-dynamic";

export async function GET() {
    const results = await getResults();
    if (!results) {
        return NextResponse.json(
            { error: "Rennen noch nicht beendet." },
            { status: 404 }
        );
    }
    return NextResponse.json(results);
}
