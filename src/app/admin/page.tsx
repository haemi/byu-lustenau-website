"use client";

import { useState, useEffect, useCallback } from "react";

interface Registration {
    id: string;
    bibNumber: number | null;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other";
    club: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    experience: string;
    status: "confirmed" | "waitlisted" | "cancelled";
    registeredAt: string;
}

interface Stats {
    total: number;
    confirmed: number;
    waitlisted: number;
    cancelled: number;
}

const STATUS_LABELS: Record<string, string> = {
    confirmed: "Bestätigt",
    waitlisted: "Warteliste",
    cancelled: "Storniert",
};

const STATUS_COLORS: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    waitlisted: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
};

const GENDER_LABELS: Record<string, string> = {
    male: "Männlich",
    female: "Weiblich",
    other: "Divers",
};

export default function AdminPage() {
    const [secret, setSecret] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [loginError, setLoginError] = useState("");

    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, confirmed: 0, waitlisted: 0, cancelled: 0 });
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchRegistrations = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== "all") params.set("status", statusFilter);
            if (search.trim()) params.set("search", search.trim());

            const res = await fetch(`/api/admin/registrations?${params}`, {
                headers: { Authorization: `Bearer ${secret}` },
            });

            if (res.status === 401) {
                setAuthenticated(false);
                setLoginError("Sitzung abgelaufen. Bitte erneut anmelden.");
                return;
            }

            const data = await res.json();
            setRegistrations(data.registrations);
            setStats({
                total: data.total,
                confirmed: data.confirmed,
                waitlisted: data.waitlisted,
                cancelled: data.cancelled,
            });
        } catch {
            console.error("Failed to fetch registrations");
        } finally {
            setLoading(false);
        }
    }, [secret, statusFilter, search]);

    useEffect(() => {
        if (authenticated) {
            fetchRegistrations();
        }
    }, [authenticated, fetchRegistrations]);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoginError("");

        const res = await fetch("/api/admin/registrations", {
            headers: { Authorization: `Bearer ${secret}` },
        });

        if (res.ok) {
            setAuthenticated(true);
        } else {
            setLoginError("Falsches Passwort.");
        }
    }

    async function handleStatusChange(id: string, newStatus: string) {
        setUpdating(id);
        try {
            const res = await fetch(`/api/admin/registrations/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${secret}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                await fetchRegistrations();
            }
        } catch {
            console.error("Failed to update status");
        } finally {
            setUpdating(null);
        }
    }

    async function handleExportCsv() {
        const params = new URLSearchParams({ format: "csv" });
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (search.trim()) params.set("search", search.trim());

        const res = await fetch(`/api/admin/registrations?${params}`, {
            headers: { Authorization: `Bearer ${secret}` },
        });

        if (!res.ok) return;

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `registrierungen-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    if (!authenticated) {
        return (
            <div className="min-h-screen bg-byu-gray flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
                    <h1 className="font-heading text-2xl font-bold text-byu-black mb-2">
                        Admin-Bereich
                    </h1>
                    <p className="text-gray-600 mb-6">
                        BYU Lustenau – Registrierungsverwaltung
                    </p>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="secret" className="block text-sm font-medium text-gray-700 mb-1">
                                Admin-Passwort
                            </label>
                            <input
                                id="secret"
                                type="password"
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-byu-green focus:border-transparent outline-none"
                                placeholder="Passwort eingeben"
                                required
                            />
                        </div>
                        {loginError && (
                            <p className="text-red-600 text-sm">{loginError}</p>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-byu-green hover:bg-byu-green-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            Anmelden
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-byu-gray">
            <header className="bg-byu-green text-white px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-xl font-bold">BYU Lustenau Admin</h1>
                        <p className="text-green-100 text-sm">Registrierungsverwaltung</p>
                    </div>
                    <button
                        onClick={() => {
                            setAuthenticated(false);
                            setSecret("");
                        }}
                        className="text-green-100 hover:text-white text-sm underline"
                    >
                        Abmelden
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard label="Gesamt" value={stats.total} color="bg-white" />
                    <StatCard label="Bestätigt" value={stats.confirmed} color="bg-green-50 border-green-200" />
                    <StatCard label="Warteliste" value={stats.waitlisted} color="bg-yellow-50 border-yellow-200" />
                    <StatCard label="Storniert" value={stats.cancelled} color="bg-red-50 border-red-200" />
                </div>

                {/* Filters & Export */}
                <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Name, E-Mail oder Verein suchen..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-byu-green focus:border-transparent outline-none text-sm"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-byu-green focus:border-transparent outline-none text-sm bg-white"
                    >
                        <option value="all">Alle Status</option>
                        <option value="confirmed">Bestätigt</option>
                        <option value="waitlisted">Warteliste</option>
                        <option value="cancelled">Storniert</option>
                    </select>
                    <button
                        onClick={handleExportCsv}
                        className="bg-byu-blue hover:bg-byu-blue-dark text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm whitespace-nowrap"
                    >
                        CSV Export
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Laden...</div>
                    ) : registrations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Keine Registrierungen gefunden.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-left text-gray-600 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Nr.</th>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3 hidden md:table-cell">E-Mail</th>
                                        <th className="px-4 py-3 hidden lg:table-cell">Verein</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 hidden sm:table-cell">Datum</th>
                                        <th className="px-4 py-3">Aktion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {registrations.map((reg) => (
                                        <RegistrationRow
                                            key={reg.id}
                                            reg={reg}
                                            expanded={expandedId === reg.id}
                                            onToggle={() =>
                                                setExpandedId(expandedId === reg.id ? null : reg.id)
                                            }
                                            onStatusChange={handleStatusChange}
                                            updating={updating === reg.id}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className={`${color} border rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-byu-black">{value}</div>
            <div className="text-sm text-gray-600">{label}</div>
        </div>
    );
}

function RegistrationRow({
    reg,
    expanded,
    onToggle,
    onStatusChange,
    updating,
}: {
    reg: Registration;
    expanded: boolean;
    onToggle: () => void;
    onStatusChange: (id: string, status: string) => void;
    updating: boolean;
}) {
    return (
        <>
            <tr
                className="hover:bg-gray-50 cursor-pointer"
                onClick={onToggle}
            >
                <td className="px-4 py-3 font-mono text-gray-500">
                    {reg.bibNumber ?? "—"}
                </td>
                <td className="px-4 py-3 font-medium">
                    {reg.firstName} {reg.lastName}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                    {reg.email}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
                    {reg.club || "—"}
                </td>
                <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[reg.status]}`}>
                        {STATUS_LABELS[reg.status]}
                    </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-gray-500 text-xs">
                    {new Date(reg.registeredAt).toLocaleDateString("de-AT")}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                        value={reg.status}
                        onChange={(e) => onStatusChange(reg.id, e.target.value)}
                        disabled={updating}
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white disabled:opacity-50"
                    >
                        <option value="confirmed">Bestätigt</option>
                        <option value="waitlisted">Warteliste</option>
                        <option value="cancelled">Storniert</option>
                    </select>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-gray-50">
                    <td colSpan={7} className="px-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                            <Detail label="E-Mail" value={reg.email} />
                            <Detail label="Geburtsdatum" value={reg.dateOfBirth} />
                            <Detail label="Geschlecht" value={GENDER_LABELS[reg.gender]} />
                            <Detail label="Verein" value={reg.club || "—"} />
                            <Detail label="Notfallkontakt" value={reg.emergencyContactName} />
                            <Detail label="Notfalltelefon" value={reg.emergencyContactPhone} />
                            {reg.experience && (
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <Detail label="Lauferfahrung" value={reg.experience} />
                                </div>
                            )}
                            <Detail
                                label="Registriert am"
                                value={new Date(reg.registeredAt).toLocaleString("de-AT")}
                            />
                            <Detail label="ID" value={reg.id} />
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="text-gray-500 text-xs uppercase">{label}</span>
            <p className="text-gray-800">{value}</p>
        </div>
    );
}
