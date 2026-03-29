"use client";

import { useState, useEffect, useCallback } from "react";

interface Lap {
    lapNumber: number;
    completedAt: string;
    durationSeconds: number;
}

interface Runner {
    registrationId: string;
    bibNumber: number;
    firstName: string;
    lastName: string;
    club: string;
    laps: Lap[];
    status: "active" | "dnf";
    dnfAfterLap: number | null;
}

interface RaceState {
    status: "not_started" | "running" | "finished";
    startedAt: string | null;
    finishedAt: string | null;
    currentYard: number;
    runners: Runner[];
}

interface Registration {
    id: string;
    bibNumber: number | null;
    firstName: string;
    lastName: string;
    status: string;
}

export default function TrackerAdmin() {
    const [auth, setAuth] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [race, setRace] = useState<RaceState | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const headers = useCallback(
        () => ({
            Authorization: `Bearer ${auth}`,
            "Content-Type": "application/json",
        }),
        [auth]
    );

    const fetchRace = useCallback(async () => {
        const res = await fetch("/api/admin/race", { headers: headers() });
        if (!res.ok) return;
        setRace(await res.json());
    }, [headers]);

    const fetchRegistrations = useCallback(async () => {
        const res = await fetch("/api/admin/registrations?status=confirmed", {
            headers: headers(),
        });
        if (!res.ok) return;
        const data = await res.json();
        setRegistrations(data.registrations || []);
    }, [headers]);

    const handleLogin = async () => {
        setError("");
        const res = await fetch("/api/admin/race", {
            headers: { Authorization: `Bearer ${auth}` },
        });
        if (res.ok) {
            setAuthenticated(true);
            setRace(await res.json());
            fetchRegistrations();
        } else {
            setError("Falsches Passwort");
        }
    };

    useEffect(() => {
        if (!authenticated) return;
        const interval = setInterval(fetchRace, 5000);
        return () => clearInterval(interval);
    }, [authenticated, fetchRace]);

    const raceAction = async (action: string, extra?: Record<string, unknown>) => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/race", {
                method: "POST",
                headers: headers(),
                body: JSON.stringify({ action, ...extra }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Fehler");
                return;
            }
            setRace(await res.json());
        } finally {
            setLoading(false);
        }
    };

    const recordLap = async (registrationId: string) => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/laps", {
                method: "POST",
                headers: headers(),
                body: JSON.stringify({ registrationId }),
            });
            if (res.ok) setRace(await res.json());
        } finally {
            setLoading(false);
        }
    };

    if (!authenticated) {
        return (
            <div className="min-h-screen bg-byu-gray flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">
                    <h1 className="font-heading text-2xl font-bold text-byu-black mb-6 text-center">
                        Race Tracker – Admin
                    </h1>
                    {error && (
                        <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
                    )}
                    <input
                        type="password"
                        value={auth}
                        onChange={(e) => setAuth(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        placeholder="Admin-Passwort"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-byu-green focus:border-transparent outline-none"
                    />
                    <button
                        onClick={handleLogin}
                        className="w-full bg-byu-green text-white font-semibold py-3 rounded-lg hover:bg-byu-green-dark transition-colors"
                    >
                        Anmelden
                    </button>
                </div>
            </div>
        );
    }

    const activeRunners = race?.runners.filter((r) => r.status === "active") || [];
    const dnfRunners = race?.runners.filter((r) => r.status === "dnf") || [];

    return (
        <div className="min-h-screen bg-byu-gray">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="font-heading text-3xl font-bold text-byu-black">
                            Race Tracker
                        </h1>
                        <p className="text-byu-black/60 mt-1">
                            Live-Verwaltung des Backyard Ultra
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                race?.status === "running"
                                    ? "bg-green-100 text-green-800"
                                    : race?.status === "finished"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            {race?.status === "running"
                                ? `Yard ${race.currentYard} läuft`
                                : race?.status === "finished"
                                  ? "Rennen beendet"
                                  : "Nicht gestartet"}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Race Controls */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    <h2 className="font-heading text-xl font-bold text-byu-black mb-4">
                        Steuerung
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {race?.status === "not_started" && (
                            <button
                                onClick={() => {
                                    const ids = registrations.map((r) => r.id);
                                    if (ids.length === 0) {
                                        setError("Keine bestätigten Anmeldungen vorhanden");
                                        return;
                                    }
                                    if (confirm(`Rennen mit ${ids.length} Läufern starten?`)) {
                                        raceAction("start", { registrationIds: ids });
                                    }
                                }}
                                disabled={loading}
                                className="bg-byu-green text-white font-semibold px-6 py-3 rounded-lg hover:bg-byu-green-dark transition-colors disabled:opacity-50"
                            >
                                Rennen starten ({registrations.length} Läufer)
                            </button>
                        )}
                        {race?.status === "running" && (
                            <>
                                <button
                                    onClick={() => {
                                        if (confirm(`Yard ${(race?.currentYard || 0) + 1} starten?`)) {
                                            raceAction("advance_yard");
                                        }
                                    }}
                                    disabled={loading}
                                    className="bg-byu-blue text-white font-semibold px-6 py-3 rounded-lg hover:bg-byu-blue-dark transition-colors disabled:opacity-50"
                                >
                                    Nächster Yard ({(race?.currentYard || 0) + 1})
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm("Rennen beenden?")) {
                                            raceAction("finish");
                                        }
                                    }}
                                    disabled={loading}
                                    className="bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                                >
                                    Rennen beenden
                                </button>
                            </>
                        )}
                        {race?.status !== "not_started" && (
                            <button
                                onClick={() => {
                                    if (confirm("Race-Daten komplett zurücksetzen?")) {
                                        raceAction("reset");
                                    }
                                }}
                                disabled={loading}
                                className="bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                Zurücksetzen
                            </button>
                        )}
                    </div>
                </div>

                {/* Active Runners */}
                {race?.status === "running" && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                        <h2 className="font-heading text-xl font-bold text-byu-black mb-4">
                            Aktive Läufer – Yard {race.currentYard}
                        </h2>
                        <p className="text-sm text-byu-black/50 mb-4">
                            Tippe auf einen Läufer um die Runde zu erfassen, oder markiere als DNF.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {activeRunners.map((runner) => {
                                const hasCurrentLap = runner.laps.some(
                                    (l) => l.lapNumber === race.currentYard
                                );
                                return (
                                    <div
                                        key={runner.registrationId}
                                        className={`border rounded-xl p-4 ${
                                            hasCurrentLap
                                                ? "border-green-300 bg-green-50"
                                                : "border-gray-200"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-byu-green text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
                                                    {runner.bibNumber}
                                                </span>
                                                <div>
                                                    <p className="font-semibold text-byu-black">
                                                        {runner.firstName} {runner.lastName}
                                                    </p>
                                                    {runner.club && (
                                                        <p className="text-xs text-byu-black/50">
                                                            {runner.club}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-sm text-byu-black/60">
                                                {runner.laps.length} Runden
                                            </span>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            {!hasCurrentLap ? (
                                                <button
                                                    onClick={() => recordLap(runner.registrationId)}
                                                    disabled={loading}
                                                    className="flex-1 bg-byu-green text-white text-sm font-semibold py-2 rounded-lg hover:bg-byu-green-dark transition-colors disabled:opacity-50"
                                                >
                                                    Runde erfassen
                                                </button>
                                            ) : (
                                                <span className="flex-1 text-center text-green-700 text-sm font-semibold py-2">
                                                    Runde {race.currentYard} erfasst
                                                </span>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            `${runner.firstName} ${runner.lastName} als DNF markieren?`
                                                        )
                                                    ) {
                                                        raceAction("dnf", {
                                                            registrationId: runner.registrationId,
                                                        });
                                                    }
                                                }}
                                                disabled={loading}
                                                className="bg-red-100 text-red-700 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                            >
                                                DNF
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* DNF Runners */}
                {dnfRunners.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-heading text-xl font-bold text-byu-black mb-4">
                            Ausgeschieden (DNF)
                        </h2>
                        <div className="space-y-2">
                            {dnfRunners
                                .sort((a, b) => (b.dnfAfterLap || 0) - (a.dnfAfterLap || 0))
                                .map((runner) => (
                                    <div
                                        key={runner.registrationId}
                                        className="flex items-center justify-between border border-gray-100 rounded-lg p-3 bg-gray-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="bg-gray-400 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
                                                {runner.bibNumber}
                                            </span>
                                            <span className="text-byu-black/70">
                                                {runner.firstName} {runner.lastName}
                                            </span>
                                        </div>
                                        <span className="text-sm text-byu-black/50">
                                            {runner.dnfAfterLap} Runden
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
