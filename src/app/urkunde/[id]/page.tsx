"use client";

import { useState, useEffect, use } from "react";

interface CertificateData {
    firstName: string;
    lastName: string;
    club: string;
    bibNumber: number;
    rank: number;
    completedLaps: number;
    totalDistanceKm: number;
    isWinner: boolean;
    raceDate: string;
    totalRunners: number;
}

export default function UrkondePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [data, setData] = useState<CertificateData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/results")
            .then((res) => (res.ok ? res.json() : Promise.reject("not_found")))
            .then((results) => {
                const bibNumber = parseInt(id, 10);
                const runner = results.results.find(
                    (r: { bibNumber: number }) => r.bibNumber === bibNumber
                );
                if (!runner) {
                    setError("Teilnehmer nicht gefunden.");
                    return;
                }
                setData({
                    firstName: runner.firstName,
                    lastName: runner.lastName,
                    club: runner.club,
                    bibNumber: runner.bibNumber,
                    rank: runner.rank,
                    completedLaps: runner.completedLaps,
                    totalDistanceKm: runner.totalDistanceKm,
                    isWinner: runner.isWinner,
                    raceDate: results.race.startedAt
                        ? new Date(results.race.startedAt).toLocaleDateString("de-AT", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                          })
                        : "",
                    totalRunners: results.statistics.totalRunners,
                });
            })
            .catch(() => setError("Ergebnisse noch nicht verfügbar."))
            .finally(() => setLoading(false));
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-byu-gray">
                <p className="text-byu-black/50">Urkunde wird geladen...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-byu-gray">
                <div className="text-center">
                    <p className="text-lg text-byu-black/50">{error}</p>
                    <a
                        href="/ergebnisse"
                        className="inline-block mt-4 text-byu-blue hover:text-byu-blue-dark font-medium"
                    >
                        Zurück zu den Ergebnissen
                    </a>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Print button - hidden when printing */}
            <div className="print:hidden fixed top-4 right-4 z-50 flex gap-3">
                <a
                    href="/ergebnisse"
                    className="bg-white text-byu-black px-5 py-2.5 rounded-lg font-semibold shadow-md hover:bg-gray-50 transition-colors"
                >
                    Zurück
                </a>
                <button
                    onClick={handlePrint}
                    className="bg-byu-green text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:bg-byu-green-dark transition-colors"
                >
                    Als PDF speichern
                </button>
            </div>

            {/* Certificate */}
            <div className="min-h-screen flex items-center justify-center bg-byu-gray print:bg-white p-8 print:p-0">
                <div className="w-full max-w-[210mm] aspect-[210/297] bg-white border-2 border-gray-200 print:border-0 shadow-lg print:shadow-none relative overflow-hidden">
                    {/* Decorative border */}
                    <div className="absolute inset-4 sm:inset-8 border-2 border-byu-green/20 rounded-lg pointer-events-none" />
                    <div className="absolute inset-5 sm:inset-9 border border-byu-gold/30 rounded-lg pointer-events-none" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-between px-8 sm:px-16 py-10 sm:py-16 text-center">
                        {/* Header */}
                        <div>
                            <h2 className="text-sm sm:text-base uppercase tracking-[0.3em] text-byu-green font-semibold mb-2">
                                BYU Lustenau
                            </h2>
                            <h3 className="text-xs sm:text-sm uppercase tracking-[0.2em] text-byu-black/40">
                                Backyard Ultra am Vetterhof
                            </h3>
                        </div>

                        {/* Title */}
                        <div className="my-4">
                            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-byu-black mb-2">
                                {data.isWinner ? "Siegerurkunde" : "Finisher-Urkunde"}
                            </h1>
                            <div className="w-24 h-0.5 bg-byu-gold mx-auto mt-4" />
                        </div>

                        {/* Runner info */}
                        <div>
                            <p className="text-sm text-byu-black/50 mb-2">
                                Hiermit wird bestätigt, dass
                            </p>
                            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-byu-black">
                                {data.firstName} {data.lastName}
                            </h2>
                            {data.club && (
                                <p className="text-byu-black/60 mt-1 text-lg">{data.club}</p>
                            )}
                        </div>

                        {/* Achievement */}
                        <div>
                            <p className="text-byu-black/60 text-sm mb-3">
                                am {data.raceDate} erfolgreich teilgenommen und
                            </p>
                            <div className="flex items-center justify-center gap-6 sm:gap-10">
                                <div>
                                    <p className="text-3xl sm:text-4xl font-bold text-byu-green">
                                        {data.completedLaps}
                                    </p>
                                    <p className="text-xs text-byu-black/50 uppercase tracking-wider">
                                        Runden
                                    </p>
                                </div>
                                <div className="w-px h-12 bg-byu-black/10" />
                                <div>
                                    <p className="text-3xl sm:text-4xl font-bold text-byu-green">
                                        {data.totalDistanceKm}
                                    </p>
                                    <p className="text-xs text-byu-black/50 uppercase tracking-wider">
                                        Kilometer
                                    </p>
                                </div>
                                <div className="w-px h-12 bg-byu-black/10" />
                                <div>
                                    <p className="text-3xl sm:text-4xl font-bold text-byu-gold-dark">
                                        {data.rank}.
                                    </p>
                                    <p className="text-xs text-byu-black/50 uppercase tracking-wider">
                                        Platz
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-byu-black/40 mt-3">
                                von {data.totalRunners} Teilnehmern
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="w-full">
                            <div className="w-24 h-0.5 bg-byu-gold mx-auto mb-4" />
                            <p className="text-xs text-byu-black/40">
                                Jede Stunde 6,706 km &middot; Der Letzte gewinnt
                            </p>
                            <p className="text-xs text-byu-black/30 mt-1">
                                Lustenau, Vorarlberg &middot; Startnummer {data.bibNumber}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
