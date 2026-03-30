-- Session pricing
ALTER TABLE cours ADD COLUMN prix_total REAL;
ALTER TABLE cours ADD COLUMN settled INTEGER DEFAULT 0;
ALTER TABLE cours_eleves ADD COLUMN payment_id TEXT;
ALTER TABLE payments ADD COLUMN cours_id TEXT;
ALTER TABLE payments ADD COLUMN eleve_id TEXT;

-- Admin pricing settings
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO admin_settings (key, value) VALUES ('prix_individuel_heure', '30');
INSERT OR IGNORE INTO admin_settings (key, value) VALUES ('prix_collectif_heure', '15');

-- Escrow & Wallet system
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  wallet_type TEXT NOT NULL CHECK(wallet_type IN ('escrow', 'tutor', 'admin')),
  owner_id TEXT,
  cours_id TEXT,
  eleve_id TEXT,
  payment_id TEXT,
  type TEXT NOT NULL CHECK(type IN ('credit', 'debit')),
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  balance_after REAL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Tutor wallet balances
CREATE TABLE IF NOT EXISTS tutor_wallets (
  formateur_id TEXT PRIMARY KEY,
  balance REAL DEFAULT 0,
  total_earned REAL DEFAULT 0,
  total_withdrawn REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Admin/platform wallet balance
INSERT OR IGNORE INTO admin_settings (key, value) VALUES ('admin_wallet_balance', '0');
INSERT OR IGNORE INTO admin_settings (key, value) VALUES ('escrow_balance', '0');
