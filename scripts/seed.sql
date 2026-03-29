-- BYU Lustenau Backyard Ultra - Seed Data
-- Run this against your local/dev Postgres database

-- Reset tables
DELETE FROM laps;
DELETE FROM runners;
DELETE FROM registrations;

-- Reset race state
UPDATE race_state SET
    status = 'not_started',
    started_at = NULL,
    finished_at = NULL,
    current_yard = 0,
    next_bib_number = 6
WHERE id = 1;

-- If race_state doesn't exist yet, insert it
INSERT INTO race_state (id, status, current_yard, next_bib_number)
VALUES (1, 'not_started', 0, 6)
ON CONFLICT (id) DO NOTHING;

-- Sample registrations
INSERT INTO registrations (id, bib_number, first_name, last_name, email, date_of_birth, gender, club, emergency_contact_name, emergency_contact_phone, experience, status, registered_at)
VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, 'Markus', 'Hofer', 'markus.hofer@example.com', '1988-03-15', 'male', 'LC Lustenau', 'Anna Hofer', '+43 664 1234567', '5 Backyard Ultras, bester Platz: 3.', 'confirmed', '2026-01-15T10:30:00Z'),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2, 'Sabine', 'Gruber', 'sabine.gruber@example.com', '1992-07-22', 'female', 'TSV Dornbirn', 'Peter Gruber', '+43 650 2345678', 'Marathon, Trail Running', 'confirmed', '2026-01-16T14:15:00Z'),
    ('c3d4e5f6-a7b8-9012-cdef-123456789012', 3, 'Thomas', 'Berger', 'thomas.berger@example.com', '1985-11-08', 'male', '', 'Lisa Berger', '+43 676 3456789', 'Erster Backyard Ultra!', 'confirmed', '2026-01-20T09:00:00Z'),
    ('d4e5f6a7-b8c9-0123-defa-234567890123', 4, 'Lisa', 'Maier', 'lisa.maier@example.com', '1995-04-30', 'female', 'LG Feldkirch', 'Max Maier', '+43 660 4567890', 'Ultra Trail, 100km', 'confirmed', '2026-02-01T16:45:00Z'),
    ('e5f6a7b8-c9d0-1234-efab-345678901234', 5, 'Stefan', 'Pichler', 'stefan.pichler@example.com', '1990-09-12', 'male', 'RC Bregenz', 'Maria Pichler', '+43 664 5678901', 'Diverse Ultramarathons', 'confirmed', '2026-02-10T11:20:00Z');
