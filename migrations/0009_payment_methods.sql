-- Migration 0009: Payment Methods & Tutor Payout Settings

CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  label TEXT,
  card_brand TEXT,
  card_last4 TEXT,
  card_expiry TEXT,
  paypal_email TEXT,
  bank_name TEXT,
  bank_iban TEXT,
  is_default INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);

-- Tutor payout preferences
ALTER TABLE formateurs ADD COLUMN payout_method TEXT DEFAULT 'bank';
ALTER TABLE formateurs ADD COLUMN payout_paypal TEXT;
