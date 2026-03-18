-- Migration 0003: Add missing tables (factures, facture_lignes, compteur_factures, paiements_formateurs)
-- and missing column urssaf_compte_actif on parents

-- ============================================================================
-- FACTURES (invoices)
-- ============================================================================
CREATE TABLE IF NOT EXISTS factures (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  parent_id TEXT NOT NULL REFERENCES parents(id),
  reference TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'package',
  date_emission TEXT DEFAULT (datetime('now')),
  montant_brut REAL NOT NULL DEFAULT 0,
  credit_impot REAL NOT NULL DEFAULT 0,
  reste_a_charge REAL NOT NULL DEFAULT 0,
  eligible_credit_impot INTEGER NOT NULL DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'brouillon',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_factures_parent ON factures(parent_id);
CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures(statut);
CREATE INDEX IF NOT EXISTS idx_factures_date ON factures(date_emission);

-- ============================================================================
-- FACTURE LIGNES (invoice line items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS facture_lignes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  facture_id TEXT NOT NULL REFERENCES factures(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantite REAL NOT NULL DEFAULT 1,
  prix_unitaire REAL NOT NULL DEFAULT 0,
  montant REAL NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_facture_lignes_facture ON facture_lignes(facture_id);

-- ============================================================================
-- COMPTEUR FACTURES (invoice numbering: FAC-YYYY-NNNN)
-- ============================================================================
CREATE TABLE IF NOT EXISTS compteur_factures (
  annee INTEGER PRIMARY KEY,
  dernier_numero INTEGER NOT NULL DEFAULT 0
);

-- ============================================================================
-- PAIEMENTS FORMATEURS (tutor payouts tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS paiements_formateurs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  formateur_id TEXT NOT NULL REFERENCES formateurs(id),
  mois TEXT NOT NULL,
  montant REAL NOT NULL DEFAULT 0,
  nb_heures REAL NOT NULL DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'en_attente',
  date_virement TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_paiements_formateurs_formateur ON paiements_formateurs(formateur_id);
CREATE INDEX IF NOT EXISTS idx_paiements_formateurs_mois ON paiements_formateurs(mois);

-- ============================================================================
-- ADD MISSING COLUMN to parents
-- ============================================================================
ALTER TABLE parents ADD COLUMN urssaf_compte_actif INTEGER DEFAULT 0;
