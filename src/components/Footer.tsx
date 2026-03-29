import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-byu-black text-white/80">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-heading text-lg font-bold text-white mb-3">
                            BYU Lustenau
                        </h3>
                        <p className="text-sm leading-relaxed">
                            Backyard Ultra am Vetterhof, Lustenau.
                            <br />
                            Jede Stunde 6,7 km. Der Letzte gewinnt.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-3">Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/#about" className="hover:text-byu-gold transition-colors">
                                    Über das Rennen
                                </Link>
                            </li>
                            <li>
                                <Link href="/#details" className="hover:text-byu-gold transition-colors">
                                    Event Details
                                </Link>
                            </li>
                            <li>
                                <Link href="/registration" className="hover:text-byu-gold transition-colors">
                                    Anmeldung
                                </Link>
                            </li>
                            <li>
                                <Link href="/ergebnisse" className="hover:text-byu-gold transition-colors">
                                    Ergebnisse
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-3">Kontakt</h4>
                        <p className="text-sm leading-relaxed">
                            Vetterhof
                            <br />
                            Lustenau, Vorarlberg
                            <br />
                            Österreich
                        </p>
                    </div>
                </div>
                <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/50">
                    © {new Date().getFullYear()} BYU Lustenau. Alle Rechte vorbehalten.
                </div>
            </div>
        </footer>
    );
}
