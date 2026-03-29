import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
    return (
        <>
            <Header />
            <main>
                {/* Hero */}
                <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-byu-green via-byu-green-dark to-byu-blue text-white overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/logo.png')] bg-center bg-no-repeat bg-contain opacity-5" />
                    <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-32">
                        <Image
                            src="/logo.png"
                            alt="BYU Lustenau Logo"
                            width={180}
                            height={180}
                            className="mx-auto mb-8 drop-shadow-2xl"
                            priority
                        />
                        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
                            Backyard Ultra
                            <br />
                            <span className="text-byu-gold">Lustenau</span>
                        </h1>
                        <p className="text-xl sm:text-2xl text-white/90 mb-3 font-light">
                            am Vetterhof
                        </p>
                        <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
                            Jede Stunde 6,7 km. Kein Zeitlimit, kein festes Ziel –
                            nur du gegen das Feld. Der Letzte gewinnt.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/registration"
                                className="bg-byu-gold text-byu-black font-bold px-8 py-4 rounded-lg text-lg hover:bg-byu-gold-dark transition-colors shadow-lg"
                            >
                                Jetzt anmelden
                            </Link>
                            <Link
                                href="#about"
                                className="border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-white/10 transition-colors"
                            >
                                Mehr erfahren
                            </Link>
                        </div>
                    </div>
                </section>

                {/* About */}
                <section id="about" className="py-20 sm:py-28 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center mb-16">
                            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-byu-black mb-6">
                                Was ist ein Backyard Ultra?
                            </h2>
                            <p className="text-lg text-byu-black/70 leading-relaxed">
                                Ein Backyard Ultra ist das purste Laufformat der Welt.
                                Alle Läufer starten gemeinsam und laufen eine Runde von
                                exakt 6,706 km. Sie haben dafür eine Stunde Zeit.
                                Wer rechtzeitig zurück ist, ruht sich aus – und läuft
                                in der nächsten Stunde wieder. Wer nicht mehr antritt,
                                scheidet aus. Es gibt nur einen Gewinner: die letzte
                                Person, die noch eine Runde vollendet.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center p-8 rounded-2xl bg-byu-gray">
                                <div className="w-16 h-16 bg-byu-green/10 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <svg className="w-8 h-8 text-byu-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-heading text-xl font-bold mb-3">Jede Stunde</h3>
                                <p className="text-byu-black/60">
                                    Eine Runde pro Stunde. Du entscheidest,
                                    wie du dir die Zeit einteilst.
                                </p>
                            </div>
                            <div className="text-center p-8 rounded-2xl bg-byu-gray">
                                <div className="w-16 h-16 bg-byu-blue/10 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <svg className="w-8 h-8 text-byu-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <h3 className="font-heading text-xl font-bold mb-3">6,706 km</h3>
                                <p className="text-byu-black/60">
                                    Die offizielle Distanz pro Runde –
                                    entspricht 100 Meilen in 24 Stunden.
                                </p>
                            </div>
                            <div className="text-center p-8 rounded-2xl bg-byu-gray">
                                <div className="w-16 h-16 bg-byu-gold/10 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <svg className="w-8 h-8 text-byu-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                <h3 className="font-heading text-xl font-bold mb-3">Der Letzte gewinnt</h3>
                                <p className="text-byu-black/60">
                                    Kein Zeitlimit. Kein festes Ziel. Nur du
                                    gegen alle anderen – bis einer übrig bleibt.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Event Details */}
                <section id="details" className="py-20 sm:py-28 bg-byu-gray">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center text-byu-black mb-16">
                            Event Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <div className="bg-white p-8 rounded-2xl shadow-sm">
                                <h3 className="font-heading text-xl font-bold text-byu-green mb-4">
                                    Format
                                </h3>
                                <ul className="space-y-3 text-byu-black/70">
                                    <li className="flex gap-3">
                                        <span className="text-byu-green font-bold">•</span>
                                        Offizielle Backyard Ultra Regeln
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-byu-green font-bold">•</span>
                                        6,706 km Rundkurs
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-byu-green font-bold">•</span>
                                        Start jede volle Stunde
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-byu-green font-bold">•</span>
                                        Für alle Level – vom Einsteiger bis Profi
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-sm">
                                <h3 className="font-heading text-xl font-bold text-byu-blue mb-4">
                                    Was dich erwartet
                                </h3>
                                <ul className="space-y-3 text-byu-black/70">
                                    <li className="flex gap-3">
                                        <span className="text-byu-blue font-bold">•</span>
                                        Verpflegungsstation mit Getränken & Snacks
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-byu-blue font-bold">•</span>
                                        Live-Tracking und Leaderboard
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-byu-blue font-bold">•</span>
                                        Finisher-Urkunde für alle Teilnehmer
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-byu-blue font-bold">•</span>
                                        Einzigartige Atmosphäre am Vetterhof
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-sm md:col-span-2">
                                <h3 className="font-heading text-xl font-bold text-byu-gold-dark mb-4">
                                    Teilnahmeinfos
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                                    <div>
                                        <p className="text-3xl font-bold text-byu-green">TBA</p>
                                        <p className="text-sm text-byu-black/50 mt-1">Datum</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-byu-blue">Vetterhof</p>
                                        <p className="text-sm text-byu-black/50 mt-1">Ort</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-byu-gold-dark">Begrenzt</p>
                                        <p className="text-sm text-byu-black/50 mt-1">Startplätze</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Location */}
                <section id="location" className="py-20 sm:py-28 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-byu-black mb-6">
                                Der Vetterhof
                            </h2>
                            <p className="text-lg text-byu-black/70 leading-relaxed">
                                Unser Rennen findet am Vetterhof in Lustenau statt –
                                eingebettet in die Vorarlberger Rheintal-Landschaft,
                                mit Blick auf die Schweizer und Vorarlberger Berge.
                                Ein besonderer Ort für ein besonderes Rennen.
                            </p>
                        </div>

                        <div className="bg-byu-gray rounded-2xl p-8 max-w-2xl mx-auto text-center">
                            <div className="w-16 h-16 bg-byu-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-byu-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="font-heading text-xl font-bold mb-2">Vetterhof</h3>
                            <p className="text-byu-black/60 mb-1">Lustenau, Vorarlberg</p>
                            <p className="text-byu-black/60">Österreich</p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 sm:py-28 bg-gradient-to-br from-byu-green to-byu-blue text-white">
                    <div className="max-w-3xl mx-auto px-4 text-center">
                        <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-6">
                            Bist du bereit?
                        </h2>
                        <p className="text-xl text-white/80 mb-10">
                            Sichere dir deinen Startplatz beim BYU Lustenau.
                            Egal ob erfahrener Ultraläufer oder Neueinsteiger –
                            jeder ist willkommen.
                        </p>
                        <Link
                            href="/registration"
                            className="inline-block bg-byu-gold text-byu-black font-bold px-10 py-4 rounded-lg text-lg hover:bg-byu-gold-dark transition-colors shadow-lg"
                        >
                            Zur Anmeldung
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
