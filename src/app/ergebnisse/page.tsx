"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ResultEntry {
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

interface RaceResults {
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

function formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString("de-AT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function formatDuration(startedAt: string, finishedAt: string): string {
    const diff = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}min`;
}

export default function ErgebnissePage() {
    const [data, setData] = useState<RaceResults | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/results")
            .then((res) => (res.ok ? res.json() : null))
            .then((d) => setData(d))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <Header />
            <main className="pt-20 sm:pt-24 pb-16 min-h-screen bg-byu-gray">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-byu-black mb-3">
                            Ergebnisse
                        </h1>
                        <p className="text-byu-black/60">
                            Offizielle Ergebnisliste der BYU Lustenau Backyard Ultra
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-byu-black/50">
                            Ergebnisse werden geladen...
                        </div>
                    ) : !data ? (
                        <div className="text-center py-20">
                            <p className="text-lg text-byu-black/50">
                                Noch keine Ergebnisse verfügbar.
                            </p>
                            <p className="text-sm text-byu-black/40 mt-2">
                                Die Ergebnisse werden nach Rennende hier veröffentlicht.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Race Info */}
                            {data.race.startedAt && data.race.finishedAt && (
                                <div className="text-center mb-8">
                                    <p className="text-sm text-byu-black/50">
                                        {formatDate(data.race.startedAt)} &middot; Dauer:{" "}
                                        {formatDuration(data.race.startedAt, data.race.finishedAt)}
                                    </p>
                                </div>
                            )}

                            {/* Statistics */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                                <StatCard
                                    label="Teilnehmer"
                                    value={data.statistics.totalRunners.toString()}
                                />
                                <StatCard
                                    label="Meiste Runden"
                                    value={data.statistics.maxLaps.toString()}
                                />
                                <StatCard
                                    label="Durchschnitt"
                                    value={`${data.statistics.averageLaps} Rd.`}
                                />
                                <StatCard
                                    label="Gesamtdistanz"
                                    value={`${data.statistics.totalDistanceAllRunnersKm} km`}
                                />
                            </div>

                            {/* Winner Highlight */}
                            {data.results.filter((r) => r.isWinner).map((winner) => (
                                <div
                                    key={winner.bibNumber}
                                    className="bg-gradient-to-r from-byu-gold/20 via-byu-gold/10 to-byu-gold/20 border-2 border-byu-gold rounded-2xl p-6 sm:p-8 mb-8 text-center"
                                >
                                    <p className="text-sm font-semibold text-byu-gold-dark uppercase tracking-wider mb-2">
                                        Sieger
                                    </p>
                                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-byu-black">
                                        {winner.firstName} {winner.lastName}
                                    </h2>
                                    {winner.club && (
                                        <p className="text-byu-black/60 mt-1">{winner.club}</p>
                                    )}
                                    <p className="text-byu-green font-bold text-xl mt-3">
                                        {winner.completedLaps} Runden &middot;{" "}
                                        {winner.totalDistanceKm} km
                                    </p>
                                    <Link
                                        href={`/urkunde/${winner.bibNumber}`}
                                        className="inline-block mt-4 bg-byu-green text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-byu-green-dark transition-colors"
                                    >
                                        Urkunde herunterladen
                                    </Link>
                                </div>
                            ))}

                            {/* Full Results Table */}
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="font-heading text-lg font-bold text-byu-black">
                                        Alle Ergebnisse
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-sm text-byu-black/50 border-b border-gray-50">
                                                <th className="px-6 py-3 font-medium">Platz</th>
                                                <th className="px-6 py-3 font-medium">Startnr.</th>
                                                <th className="px-6 py-3 font-medium">Name</th>
                                                <th className="px-6 py-3 font-medium hidden sm:table-cell">
                                                    Verein
                                                </th>
                                                <th className="px-6 py-3 font-medium text-right">
                                                    Runden
                                                </th>
                                                <th className="px-6 py-3 font-medium text-right hidden sm:table-cell">
                                                    Distanz
                                                </th>
                                                <th className="px-6 py-3 font-medium text-center">
                                                    Urkunde
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.results.map((runner) => (
                                                <tr
                                                    key={runner.bibNumber}
                                                    className={`border-b border-gray-50 last:border-0 hover:bg-byu-gray/50 ${
                                                        runner.isWinner
                                                            ? "bg-byu-gold/5"
                                                            : ""
                                                    }`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`font-bold ${
                                                                runner.rank === 1
                                                                    ? "text-byu-gold-dark text-lg"
                                                                    : runner.rank <= 3
                                                                    ? "text-byu-green"
                                                                    : "text-byu-black/40"
                                                            }`}
                                                        >
                                                            {runner.rank}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`text-white text-xs font-bold w-7 h-7 rounded-full inline-flex items-center justify-center ${
                                                                runner.isWinner
                                                                    ? "bg-byu-gold-dark"
                                                                    : runner.dnfAfterLap !== null
                                                                    ? "bg-gray-300"
                                                                    : "bg-byu-green"
                                                            }`}
                                                        >
                                                            {runner.bibNumber}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-byu-black">
                                                        {runner.firstName}{" "}
                                                        {runner.lastName}
                                                    </td>
                                                    <td className="px-6 py-4 text-byu-black/60 hidden sm:table-cell">
                                                        {runner.club || "–"}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="font-bold text-byu-green text-lg">
                                                            {runner.completedLaps}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-byu-black/60 hidden sm:table-cell">
                                                        {runner.totalDistanceKm} km
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Link
                                                            href={`/urkunde/${runner.bibNumber}`}
                                                            className="text-byu-blue hover:text-byu-blue-dark text-sm font-medium"
                                                        >
                                                            PDF
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white rounded-xl p-4 sm:p-5 text-center shadow-sm">
            <p className="text-2xl sm:text-3xl font-bold text-byu-green">{value}</p>
            <p className="text-xs sm:text-sm text-byu-black/50 mt-1">{label}</p>
        </div>
    );
}
