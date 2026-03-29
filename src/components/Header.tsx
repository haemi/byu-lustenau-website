"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
    { href: "/#about", label: "Über das Rennen" },
    { href: "/#details", label: "Details" },
    { href: "/#location", label: "Ort" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/registration", label: "Anmeldung" },
];

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/logo.png"
                            alt="BYU Lustenau Logo"
                            width={48}
                            height={48}
                            className="w-10 h-10 sm:w-12 sm:h-12"
                        />
                        <span className="font-heading font-bold text-lg sm:text-xl text-byu-black">
                            BYU Lustenau
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={
                                    link.href === "/registration"
                                        ? "bg-byu-green text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-byu-green-dark transition-colors"
                                        : "text-byu-black/70 hover:text-byu-green font-medium transition-colors"
                                }
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <button
                        className="md:hidden p-2"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menü öffnen"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {menuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {menuOpen && (
                <nav className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className={
                                link.href === "/registration"
                                    ? "block mt-3 bg-byu-green text-white text-center px-5 py-3 rounded-lg font-semibold"
                                    : "block py-3 text-byu-black/70 hover:text-byu-green font-medium border-b border-gray-50"
                            }
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
}
