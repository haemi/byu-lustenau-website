import { NextResponse } from "next/server";
import { getResults } from "@/lib/laps";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const results = await getResults();
        if (!results) {
            return NextResponse.json(
                { error: "Rennen noch nicht beendet." },
                { status: 404 }
            );
        }
        return NextResponse.json(results);
    } catch (error) {
        console.error("[Results API]", error);
        return NextResponse.json(
            { error: "Interner Fehler beim Laden der Ergebnisse." },
            { status: 500 }
        );
    }
}
