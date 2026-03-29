"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    gender: string;
    club: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    experience: string;
    agreeTerms: boolean;
}

interface FieldError {
    field: string;
    message: string;
}

interface RegistrationResult {
    firstName: string;
    lastName: string;
    bibNumber: number | null;
    status: "confirmed" | "waitlisted";
}

const initialFormData: FormData = {
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    club: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    experience: "",
    agreeTerms: false,
};

export default function RegistrationPage() {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [result, setResult] = useState<RegistrationResult | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
    const [generalError, setGeneralError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {
        const target = e.target;
        const value =
            target instanceof HTMLInputElement && target.type === "checkbox"
                ? target.checked
                : target.value;
        setFormData((prev) => ({ ...prev, [target.name]: value }));
        setFieldErrors((prev) => prev.filter((err) => err.field !== target.name));
        setGeneralError("");
    }

    function getFieldError(field: string): string | undefined {
        return fieldErrors.find((e) => e.field === field)?.message;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setFieldErrors([]);
        setGeneralError("");

        try {
            const res = await fetch("/api/registration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.status === 422 && data.errors) {
                setFieldErrors(data.errors);
            } else if (res.status === 409) {
                setGeneralError(data.error || "Diese E-Mail ist bereits registriert.");
            } else if (!res.ok) {
                setGeneralError(data.error || "Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
            } else {
                setResult(data.registration);
            }
        } catch {
            setGeneralError("Verbindungsfehler. Bitte versuche es erneut.");
        } finally {
            setSubmitting(false);
        }
    }

    if (result) {
        return (
            <>
                <Header />
                <main className="pt-20 min-h-screen bg-byu-gray flex items-center justify-center">
                    <div className="max-w-lg mx-auto px-4 text-center py-20">
                        <div className="w-20 h-20 bg-byu-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-byu-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="font-heading text-3xl font-bold text-byu-black mb-4">
                            {result.status === "confirmed" ? "Anmeldung bestätigt!" : "Auf der Warteliste!"}
                        </h1>
                        {result.status === "confirmed" ? (
                            <>
                                <p className="text-byu-black/70 text-lg mb-4">
                                    Danke, {result.firstName}! Deine Anmeldung ist bestätigt.
                                </p>
                                <div className="bg-white rounded-xl p-6 shadow-sm inline-block">
                                    <p className="text-sm text-byu-black/50 mb-1">Deine Startnummer</p>
                                    <p className="text-5xl font-bold text-byu-green">{result.bibNumber}</p>
                                </div>
                            </>
                        ) : (
                            <p className="text-byu-black/70 text-lg">
                                Danke, {result.firstName}! Alle Startplätze sind vergeben.
                                Du stehst auf der Warteliste und wir melden uns,
                                sobald ein Platz frei wird.
                            </p>
                        )}
                        <p className="text-byu-black/50 text-sm mt-6">
                            Du erhältst eine Bestätigung per E-Mail.
                        </p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    const inputClass = (field: string) =>
        `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-byu-green focus:border-transparent outline-none transition ${
            getFieldError(field) ? "border-red-400 bg-red-50" : "border-gray-200"
        }`;

    return (
        <>
            <Header />
            <main className="pt-20 min-h-screen bg-byu-gray">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
                    <div className="text-center mb-10">
                        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-byu-black mb-3">
                            Anmeldung
                        </h1>
                        <p className="text-byu-black/60 text-lg">
                            Sichere dir deinen Startplatz beim BYU Lustenau Backyard Ultra.
                        </p>
                    </div>

                    {generalError && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">
                            {generalError}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-2xl shadow-sm p-6 sm:p-10 space-y-6"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-semibold text-byu-black mb-1.5">
                                    Vorname *
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={inputClass("firstName")}
                                />
                                {getFieldError("firstName") && (
                                    <p className="text-red-500 text-xs mt-1">{getFieldError("firstName")}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-semibold text-byu-black mb-1.5">
                                    Nachname *
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={inputClass("lastName")}
                                />
                                {getFieldError("lastName") && (
                                    <p className="text-red-500 text-xs mt-1">{getFieldError("lastName")}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-byu-black mb-1.5">
                                E-Mail *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className={inputClass("email")}
                            />
                            {getFieldError("email") && (
                                <p className="text-red-500 text-xs mt-1">{getFieldError("email")}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-byu-black mb-1.5">
                                    Geburtsdatum *
                                </label>
                                <input
                                    type="date"
                                    id="dateOfBirth"
                                    name="dateOfBirth"
                                    required
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className={inputClass("dateOfBirth")}
                                />
                                {getFieldError("dateOfBirth") && (
                                    <p className="text-red-500 text-xs mt-1">{getFieldError("dateOfBirth")}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="gender" className="block text-sm font-semibold text-byu-black mb-1.5">
                                    Geschlecht *
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    required
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className={`${inputClass("gender")} bg-white`}
                                >
                                    <option value="">Bitte wählen</option>
                                    <option value="male">Männlich</option>
                                    <option value="female">Weiblich</option>
                                    <option value="other">Divers</option>
                                </select>
                                {getFieldError("gender") && (
                                    <p className="text-red-500 text-xs mt-1">{getFieldError("gender")}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="club" className="block text-sm font-semibold text-byu-black mb-1.5">
                                Verein / Team
                            </label>
                            <input
                                type="text"
                                id="club"
                                name="club"
                                value={formData.club}
                                onChange={handleChange}
                                placeholder="Optional"
                                className={inputClass("club")}
                            />
                        </div>

                        <fieldset className="border-t border-gray-100 pt-6">
                            <legend className="font-heading text-lg font-bold text-byu-black mb-4">
                                Notfallkontakt
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="emergencyContactName" className="block text-sm font-semibold text-byu-black mb-1.5">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="emergencyContactName"
                                        name="emergencyContactName"
                                        required
                                        value={formData.emergencyContactName}
                                        onChange={handleChange}
                                        className={inputClass("emergencyContactName")}
                                    />
                                    {getFieldError("emergencyContactName") && (
                                        <p className="text-red-500 text-xs mt-1">{getFieldError("emergencyContactName")}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="emergencyContactPhone" className="block text-sm font-semibold text-byu-black mb-1.5">
                                        Telefon *
                                    </label>
                                    <input
                                        type="tel"
                                        id="emergencyContactPhone"
                                        name="emergencyContactPhone"
                                        required
                                        value={formData.emergencyContactPhone}
                                        onChange={handleChange}
                                        className={inputClass("emergencyContactPhone")}
                                    />
                                    {getFieldError("emergencyContactPhone") && (
                                        <p className="text-red-500 text-xs mt-1">{getFieldError("emergencyContactPhone")}</p>
                                    )}
                                </div>
                            </div>
                        </fieldset>

                        <div>
                            <label htmlFor="experience" className="block text-sm font-semibold text-byu-black mb-1.5">
                                Lauferfahrung
                            </label>
                            <textarea
                                id="experience"
                                name="experience"
                                rows={3}
                                value={formData.experience}
                                onChange={handleChange}
                                placeholder="Erzähl uns kurz von deiner Lauferfahrung (optional)"
                                className={`${inputClass("experience")} resize-none`}
                            />
                        </div>

                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                name="agreeTerms"
                                required
                                checked={formData.agreeTerms}
                                onChange={handleChange}
                                className="mt-1 w-4 h-4 accent-byu-green"
                            />
                            <label htmlFor="agreeTerms" className="text-sm text-byu-black/70">
                                Ich bestätige, dass ich die Teilnahmebedingungen gelesen habe
                                und auf eigene Verantwortung am Rennen teilnehme. *
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-byu-green text-white font-bold py-4 rounded-lg text-lg hover:bg-byu-green-dark transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Wird gesendet..." : "Anmeldung absenden"}
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    );
}
