-- Migration 0013: Session acceptance workflow
-- Tutor and student must accept/reject/modify sessions before they are confirmed

-- Tutor acceptance tracking on cours table
ALTER TABLE cours ADD COLUMN tutor_status TEXT DEFAULT 'pending';
ALTER TABLE cours ADD COLUMN tutor_proposed_date TEXT;
ALTER TABLE cours ADD COLUMN tutor_proposed_time TEXT;
ALTER TABLE cours ADD COLUMN tutor_response_note TEXT;
ALTER TABLE cours ADD COLUMN tutor_responded_at TEXT;

-- Student acceptance tracking on cours_eleves table
ALTER TABLE cours_eleves ADD COLUMN eleve_status TEXT DEFAULT 'pending';
ALTER TABLE cours_eleves ADD COLUMN eleve_proposed_date TEXT;
ALTER TABLE cours_eleves ADD COLUMN eleve_proposed_time TEXT;
ALTER TABLE cours_eleves ADD COLUMN eleve_response_note TEXT;
ALTER TABLE cours_eleves ADD COLUMN eleve_responded_at TEXT;
