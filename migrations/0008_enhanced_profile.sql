-- Migration 0008: Enhanced Profile Page
-- Adds profile fields for students, notification prefs for all users

-- Student-specific profile fields
ALTER TABLE users ADD COLUMN gender TEXT;
ALTER TABLE users ADD COLUMN date_of_birth TEXT;
ALTER TABLE users ADD COLUMN city TEXT;
ALTER TABLE users ADD COLUMN country TEXT;
ALTER TABLE users ADD COLUMN postal_code TEXT;
ALTER TABLE users ADD COLUMN photo_url TEXT;
ALTER TABLE users ADD COLUMN doc_identite_url TEXT;
ALTER TABLE users ADD COLUMN doc_diplome_url TEXT;

-- Notification preferences (both students and tutors)
ALTER TABLE users ADD COLUMN notif_sms_lessons INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN notif_email_activity INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN notif_email_lessons INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN notif_email_offers INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN notif_email_newsletter INTEGER DEFAULT 1;
