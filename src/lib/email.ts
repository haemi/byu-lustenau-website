import { Resend } from "resend";

const EVENT_DATE = "21. Juni 2026";
const EVENT_NAME = "BYU Lustenau Backyard Ultra";
const FROM_ADDRESS = "BYU Lustenau <noreply@byu-lustenau.at>";

function getClient(): Resend | null {
    const key = process.env.RESEND_API_KEY;
    if (!key) return null;
    return new Resend(key);
}

interface ConfirmationParams {
    email: string;
    firstName: string;
    lastName: string;
    bibNumber: number | null;
    status: "confirmed" | "waitlisted";
}

export async function sendConfirmationEmail(params: ConfirmationParams): Promise<void> {
    const client = getClient();
    if (!client) {
        console.log("[Email] RESEND_API_KEY not set — skipping confirmation email");
        return;
    }

    const { email, firstName, lastName, bibNumber, status } = params;
    const fullName = `${firstName} ${lastName}`;

    const isConfirmed = status === "confirmed";
    const subject = isConfirmed
        ? `Anmeldung bestätigt — ${EVENT_NAME}`
        : `Warteliste — ${EVENT_NAME}`;

    const body = isConfirmed
        ? buildConfirmedText(fullName, bibNumber!)
        : buildWaitlistedText(fullName);

    try {
        await client.emails.send({
            from: FROM_ADDRESS,
            to: email,
            subject,
            text: body,
        });
        console.log(`[Email] Confirmation sent to ${email} (${status})`);
    } catch (err) {
        console.error(`[Email] Failed to send to ${email}:`, err);
    }
}

function buildConfirmedText(name: string, bibNumber: number): string {
    return [
        `Hallo ${name},`,
        "",
        `deine Anmeldung zum ${EVENT_NAME} ist bestätigt!`,
        "",
        `Startnummer: ${bibNumber}`,
        `Datum: ${EVENT_DATE}`,
        `Ort: Lustenau, Vorarlberg`,
        "",
        "Was erwartet dich?",
        "- Jede Stunde läufst du eine Runde von 6,706 km",
        "- Wer nicht rechtzeitig startet, scheidet aus",
        "- Die letzte Person, die noch läuft, gewinnt",
        "",
        "Weitere Informationen erhältst du rechtzeitig vor dem Event.",
        "",
        "Wir freuen uns auf dich!",
        `Dein ${EVENT_NAME} Team`,
    ].join("\n");
}

function buildWaitlistedText(name: string): string {
    return [
        `Hallo ${name},`,
        "",
        `vielen Dank für deine Anmeldung zum ${EVENT_NAME}.`,
        "",
        "Leider sind alle Startplätze bereits vergeben. Du stehst jetzt auf der Warteliste.",
        "Sollte ein Platz frei werden, informieren wir dich per E-Mail.",
        "",
        `Datum: ${EVENT_DATE}`,
        `Ort: Lustenau, Vorarlberg`,
        "",
        "Wir hoffen, dass ein Platz für dich frei wird!",
        `Dein ${EVENT_NAME} Team`,
    ].join("\n");
}
