-- ============================================
-- CREDIT SYSTEM - Migration
-- ============================================

-- Packs disponibles a l'achat
CREATE TABLE IF NOT EXISTS packs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  name_en TEXT,
  name_ar TEXT,
  credits INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  price_per_credit_cents INTEGER GENERATED ALWAYS AS (price_cents / credits) STORED,
  validity_days INTEGER DEFAULT 90,
  badge TEXT,
  description TEXT,
  description_en TEXT,
  description_ar TEXT,
  active INTEGER DEFAULT 1,
  ordre INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Achats de packs par les etudiants
CREATE TABLE IF NOT EXISTS credit_purchases (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  student_id TEXT NOT NULL,
  parent_id TEXT,
  pack_id TEXT NOT NULL REFERENCES packs(id),
  credits_purchased INTEGER NOT NULL,
  credits_remaining INTEGER NOT NULL,
  amount_paid_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_gateway TEXT,
  payment_transaction_id TEXT,
  purchased_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  extended_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'refunded')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Solde de credits par etudiant (vue agregee, mise a jour automatique)
CREATE TABLE IF NOT EXISTS credit_balances (
  student_id TEXT PRIMARY KEY,
  total_credits INTEGER DEFAULT 0,
  reserved_credits INTEGER DEFAULT 0,
  available_credits INTEGER DEFAULT 0,
  lifetime_credits INTEGER DEFAULT 0,
  lifetime_spent INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Transactions de credits (historique complet immutable)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  student_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN (
    'purchase', 'debit_group', 'debit_individual', 'debit_urgent',
    'reserve', 'release', 'refund_cancel', 'refund_platform',
    'compensation', 'expire', 'extend'
  )),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Inscriptions des etudiants aux seances (reserve credits)
CREATE TABLE IF NOT EXISTS session_enrollments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  session_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  credits_reserved INTEGER NOT NULL,
  status TEXT DEFAULT 'reserved' CHECK(status IN (
    'reserved', 'confirmed', 'attended', 'absent', 'cancelled', 'refunded'
  )),
  enrolled_at TEXT DEFAULT (datetime('now')),
  cancelled_at TEXT,
  attended_at TEXT,
  cancel_reason TEXT
);

-- Signalements qualite
CREATE TABLE IF NOT EXISTS quality_reports (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  session_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  tutor_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'resolved')),
  resolution TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Notifications de credits envoyees (eviter doublons)
CREATE TABLE IF NOT EXISTS credit_notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  purchase_id TEXT NOT NULL REFERENCES credit_purchases(id),
  type TEXT NOT NULL CHECK(type IN ('expiry_30d', 'expiry_7d', 'expiry_1d', 'low_balance')),
  sent_at TEXT DEFAULT (datetime('now'))
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_credit_purchases_student ON credit_purchases(student_id, status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_student ON credit_transactions(student_id, created_at);
CREATE INDEX IF NOT EXISTS idx_session_enrollments_session ON session_enrollments(session_id, status);
CREATE INDEX IF NOT EXISTS idx_session_enrollments_student ON session_enrollments(student_id, status);
CREATE INDEX IF NOT EXISTS idx_credit_notifications_purchase ON credit_notifications(purchase_id, type);

-- Seed: Packs par defaut (grille recommandee)
INSERT OR IGNORE INTO packs (id, name, name_en, name_ar, credits, price_cents, currency, validity_days, badge, description, description_en, description_ar, active, ordre)
VALUES
  ('pack_essai', 'Essai', 'Trial', 'تجربة', 3, 2900, 'USD', 90, NULL, '3 cours groupe ou 1 individuel', '3 group or 1 individual class', '3 حصص جماعية أو حصة فردية واحدة', 1, 1),
  ('pack_standard', 'Standard', 'Standard', 'قياسي', 10, 8900, 'USD', 90, 'Popular', '10 cours groupe ou 3 individuels + 1 groupe', '10 group or 3 individual + 1 group', '10 حصص جماعية أو 3 فردية + 1 جماعية', 1, 2),
  ('pack_intensif', 'Intensif', 'Intensive', 'مكثف', 25, 19900, 'USD', 90, 'Best Value', '25 cours groupe ou 8 individuels + 1 groupe', '25 group or 8 individual + 1 group', '25 حصة جماعية أو 8 فردية + 1 جماعية', 1, 3),
  ('pack_annuel', 'Annuel', 'Annual', 'سنوي', 50, 34900, 'USD', 180, NULL, '50 cours groupe ou 16 individuels + 2 groupes', '50 group or 16 individual + 2 group', '50 حصة جماعية أو 16 فردية + 2 جماعية', 1, 4);
