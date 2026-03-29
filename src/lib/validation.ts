export interface ValidationError {
    field: string;
    message: string;
}

export interface RegistrationInput {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    gender: string;
    club: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    experience: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s\-()]{6,20}$/;

export function validateRegistration(data: RegistrationInput): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data.firstName?.trim()) {
        errors.push({ field: "firstName", message: "Vorname ist erforderlich." });
    }
    if (!data.lastName?.trim()) {
        errors.push({ field: "lastName", message: "Nachname ist erforderlich." });
    }
    if (!data.email?.trim() || !EMAIL_RE.test(data.email)) {
        errors.push({ field: "email", message: "Bitte gib eine gültige E-Mail-Adresse ein." });
    }
    if (!data.dateOfBirth) {
        errors.push({ field: "dateOfBirth", message: "Geburtsdatum ist erforderlich." });
    } else {
        const dob = new Date(data.dateOfBirth);
        const now = new Date();
        const age = now.getFullYear() - dob.getFullYear();
        if (isNaN(dob.getTime())) {
            errors.push({ field: "dateOfBirth", message: "Ungültiges Datum." });
        } else if (age < 18 || age > 100) {
            errors.push({ field: "dateOfBirth", message: "Du musst mindestens 18 Jahre alt sein." });
        }
    }
    if (!["male", "female", "other"].includes(data.gender)) {
        errors.push({ field: "gender", message: "Bitte wähle ein Geschlecht." });
    }
    if (!data.emergencyContactName?.trim()) {
        errors.push({ field: "emergencyContactName", message: "Notfallkontakt Name ist erforderlich." });
    }
    if (!data.emergencyContactPhone?.trim() || !PHONE_RE.test(data.emergencyContactPhone)) {
        errors.push({ field: "emergencyContactPhone", message: "Bitte gib eine gültige Telefonnummer ein." });
    }

    return errors;
}
