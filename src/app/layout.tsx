import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "BYU Lustenau – Backyard Ultra am Vetterhof",
    description:
        "Backyard Ultra Lustenau am Vetterhof – Jede Stunde 6,7 km. Der Letzte gewinnt. Melde dich jetzt an!",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="de">
            <body className="font-body text-byu-black bg-white antialiased">
                {children}
            </body>
        </html>
    );
}
