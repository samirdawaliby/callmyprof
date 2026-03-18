-- Migration 0005: Booking system tables

-- Booking tokens (one-time links sent to leads)
CREATE TABLE IF NOT EXISTS booking_tokens (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_booking_tokens_token ON booking_tokens(token);
CREATE INDEX IF NOT EXISTS idx_booking_tokens_lead ON booking_tokens(lead_id);

-- Bookings (confirmed appointments)
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id),
  booking_date TEXT NOT NULL,
  booking_time TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_bookings_lead ON bookings(lead_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);

-- Email log (track sent emails)
CREATE TABLE IF NOT EXISTS lead_emails (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id),
  type TEXT NOT NULL,
  email_to TEXT NOT NULL,
  resend_id TEXT,
  sent_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_lead_emails_lead ON lead_emails(lead_id);
