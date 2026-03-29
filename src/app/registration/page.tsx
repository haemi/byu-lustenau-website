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
    const [submitted, setSubmitted] = useState(false);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {
        const target = e.target;
        const value =
            target instanceof HTMLInputElement && target.type === "checkbox"
                ? target.checked
                : target.value;
        setFormData((prev) => ({ ...prev, [target.name]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // TODO: Send to backend API
        console.log("Registration submitted:", formData);
        setSubmitted(true);
    }

    if (submitted) {
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
                            Anmeldung erhalten!
                        </h1>
                        <p className="text-byu-black/70 text-lg">
                            Danke, {formData.firstName}! Wir haben deine Anmeldung
                            erhalten und melden uns per E-Mail bei dir.
                        </p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

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
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-byu-green focus:border-transparent outline-none transition"
                                />
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
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-byu-green focus:border-transparent outline-none transition"
                                />
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
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-byu-green focus:border-transparent outline-none transition"
                            />
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
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-byu-green focus:border-transparent outline-none transition"
                                />
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
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-byu-green focus:border-transparent outline-none transition bg-white"
                                >
                                    <option value="">Bitte wählen</option>
                                    <option value="male">Männlich</option>
                                    <option value="female">Weiblich</option>
                                    <option value="other">Divers</option>
                                </select>
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
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-byu-green focus:border-transparent outline-none transition"
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
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-byu-green focus:border-transparent outline-none transition"
                                    />
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
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-byu-green focus:border-transparent outline-none transition"
                                    />
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
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-byu-green focus:border-transparent outline-none transition resize-none"
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
                            className="w-full bg-byu-green text-white font-bold py-4 rounded-lg text-lg hover:bg-byu-green-dark transition-colors shadow-sm"
                        >
                            Anmeldung absenden
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    );
}
