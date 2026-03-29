"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface LeaderboardEntry {
    bibNumber: number;
    firstName: string;
    lastName: string;
    club: string;
    completedLaps: number;
    status: "active" | "dnf";
    lastLapTime: string | null;
}

interface LeaderboardData {
    race: {
        status: string;
        startedAt: string | null;
        currentYard: number;
    };
    leaderboard: LeaderboardEntry[];
}

function formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString("de-AT", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getElapsedHours(startedAt: string): string {
    const diff = Date.now() - new Date(startedAt).getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
}

export default function LeaderboardPage() {
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/leaderboard");
                if (res.ok) setData(await res.json());
            } catch {
                // silently retry on next interval
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(timer);
    }, []);

    const activeRunners =
        data?.leaderboard.filter((r) => r.status === "active") || [];
    const dnfRunners =
        data?.leaderboard.filter((r) => r.status === "dnf") || [];

    return (
        <>
            <Header />
            <main className="pt-20 sm:pt-24 pb-16 min-h-screen bg-byu-gray">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Race Status Banner */}
                    <div className="text-center mb-10">
                        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-byu-black mb-3">
                            Live Leaderboard
                        </h1>
                        {data?.race.status === "running" && data.race.startedAt ? (
                            <div className="inline-flex items-center gap-3 bg-green-100 text-green-800 px-5 py-2.5 rounded-full text-sm font-semibold">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
                                </span>
                                Yard {data.race.currentYard} &middot;{" "}
                                {getElapsedHours(data.race.startedAt)}
                            </div>
                        ) : data?.race.status === "finished" ? (
                            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-5 py-2.5 rounded-full text-sm font-semibold">
                                Rennen beendet
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-5 py-2.5 rounded-full text-sm font-semibold">
                                Rennen hat noch nicht begonnen
                            </div>
                        )}
                    </div>

                    {!data || data.leaderboard.length === 0 ? (
                        <div className="text-center text-byu-black/50 py-20">
                            <p className="text-lg">
                                Noch keine Daten verfügbar.
                            </p>
                            <p className="text-sm mt-2">
                                Das Leaderboard wird automatisch aktualisiert sobald das
                                Rennen startet.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Active Runners Table */}
                            {activeRunners.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
                                    <div className="px-6 py-4 border-b border-gray-100">
                                        <h2 className="font-heading text-lg font-bold text-byu-black">
                                            Im Rennen ({activeRunners.length})
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-sm text-byu-black/50 border-b border-gray-50">
                                                    <th className="px-6 py-3 font-medium">#</th>
                                                    <th className="px-6 py-3 font-medium">Startnr.</th>
                                                    <th className="px-6 py-3 font-medium">Name</th>
                                                    <th className="px-6 py-3 font-medium hidden sm:table-cell">
                                                        Verein
                                                    </th>
                                                    <th className="px-6 py-3 font-medium text-right">
                                                        Runden
                                                    </th>
                                                    <th className="px-6 py-3 font-medium text-right hidden sm:table-cell">
                                                        Letzte Runde
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeRunners.map((runner, idx) => (
                                                    <tr
                                                        key={runner.bibNumber}
                                                        className="border-b border-gray-50 last:border-0 hover:bg-byu-gray/50"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`font-bold ${
                                                                    idx === 0
                                                                        ? "text-byu-gold-dark text-lg"
                                                                        : "text-byu-black/40"
                                                                }`}
                                                            >
                                                                {idx + 1}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="bg-byu-green text-white text-xs font-bold w-7 h-7 rounded-full inline-flex items-center justify-center">
                                                                {runner.bibNumber}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 font-semibold text-byu-black">
                                                            {runner.firstName} {runner.lastName}
                                                        </td>
                                                        <td className="px-6 py-4 text-byu-black/60 hidden sm:table-cell">
                                                            {runner.club || "–"}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className="font-bold text-byu-green text-lg">
                                                                {runner.completedLaps}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-byu-black/50 hidden sm:table-cell">
                                                            {runner.lastLapTime
                                                                ? formatTime(runner.lastLapTime)
                                                                : "–"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* DNF Runners */}
                            {dnfRunners.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100">
                                        <h2 className="font-heading text-lg font-bold text-byu-black/60">
                                            Ausgeschieden ({dnfRunners.length})
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-sm text-byu-black/40 border-b border-gray-50">
                                                    <th className="px-6 py-3 font-medium">Startnr.</th>
                                                    <th className="px-6 py-3 font-medium">Name</th>
                                                    <th className="px-6 py-3 font-medium hidden sm:table-cell">
                                                        Verein
                                                    </th>
                                                    <th className="px-6 py-3 font-medium text-right">
                                                        Runden
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dnfRunners.map((runner) => (
                                                    <tr
                                                        key={runner.bibNumber}
                                                        className="border-b border-gray-50 last:border-0 text-byu-black/50"
                                                    >
                                                        <td className="px-6 py-3">
                                                            <span className="bg-gray-300 text-white text-xs font-bold w-7 h-7 rounded-full inline-flex items-center justify-center">
                                                                {runner.bibNumber}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            {runner.firstName} {runner.lastName}
                                                        </td>
                                                        <td className="px-6 py-3 hidden sm:table-cell">
                                                            {runner.club || "–"}
                                                        </td>
                                                        <td className="px-6 py-3 text-right font-semibold">
                                                            {runner.completedLaps}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Auto-refresh note */}
                    <p className="text-center text-xs text-byu-black/30 mt-8" suppressHydrationWarning>
                        Automatische Aktualisierung alle 10 Sekunden
                    </p>
                </div>
            </main>
            <Footer />
        </>
    );
}
