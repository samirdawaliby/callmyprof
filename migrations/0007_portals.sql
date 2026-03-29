-- Migration 0007: Student & Tutor Portals
-- Adds portal accounts, signup tokens, and support tickets

-- Link user accounts to leads/formateurs
ALTER TABLE users ADD COLUMN lead_id TEXT;
ALTER TABLE users ADD COLUMN formateur_id TEXT;
ALTER TABLE users ADD COLUMN address TEXT;
ALTER TABLE users ADD COLUMN education TEXT;

-- Signup invitation tokens (for both students and tutors)
CREATE TABLE IF NOT EXISTS signup_tokens (
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  formateur_id TEXT,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Support/complaint tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Ticket conversation thread
CREATE TABLE IF NOT EXISTS ticket_responses (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_role TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_signup_tokens_token ON signup_tokens(token);
CREATE INDEX IF NOT EXISTS idx_users_lead_id ON users(lead_id);
CREATE INDEX IF NOT EXISTS idx_users_formateur_id ON users(formateur_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_responses_ticket ON ticket_responses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
