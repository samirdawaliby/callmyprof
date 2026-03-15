-- ============================================
-- SOUTIEN SCOLAIRE CAPLOGY - Schema D1
-- Migration 0001 : Toutes les tables + indexes
-- Uses CREATE TABLE IF NOT EXISTS (shared caplogy-db)
-- ============================================

-- ============================================
-- CATALOGUE : Domaines, Sous-domaines, Thematiques
-- ============================================

CREATE TABLE IF NOT EXISTS domaines (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  icone TEXT,
  description TEXT,
  ordre INTEGER DEFAULT 0,
  actif INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS sous_domaines (
  id TEXT PRIMARY KEY,
  domaine_id TEXT NOT NULL REFERENCES domaines(id),
  nom TEXT NOT NULL,
  icone TEXT,
  description TEXT,
  ordre INTEGER DEFAULT 0,
  actif INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS thematiques (
  id TEXT PRIMARY KEY,
  sous_domaine_id TEXT NOT NULL REFERENCES sous_domaines(id),
  nom TEXT NOT NULL,
  description TEXT,
  niveau_min TEXT,
  ordre INTEGER DEFAULT 0,
  actif INTEGER DEFAULT 1
);

-- ============================================
-- USERS & AUTH
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','parent','formateur','eleve')),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  telephone TEXT,
  avatar_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  last_login TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- FORMATEURS
-- ============================================

CREATE TABLE IF NOT EXISTS formateurs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES users(id),
  -- Etape 1 : Infos perso
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  ville TEXT NOT NULL,
  code_postal TEXT,
  rayon_km INTEGER DEFAULT 10,
  photo_url TEXT,
  -- Etape 2 : Competences
  bio TEXT,
  diplomes TEXT,                        -- JSON array
  experience_annees INTEGER DEFAULT 0,
  tarif_horaire_individuel REAL,
  tarif_horaire_collectif REAL,
  accepte_domicile INTEGER DEFAULT 1,
  accepte_collectif INTEGER DEFAULT 1,
  accepte_visio INTEGER DEFAULT 0,
  lieu_collectif TEXT,
  -- Etape 3 : Documents
  r2_folder TEXT,                       -- chemin R2 des documents
  doc_identite_url TEXT,
  doc_diplomes_url TEXT,
  doc_siret_url TEXT,
  doc_urssaf_url TEXT,
  doc_casier_url TEXT,
  doc_rib_url TEXT,
  doc_cv_url TEXT,
  iban TEXT,
  siret TEXT,
  -- Etape 4 : Validation
  signature_url TEXT,
  cgv_acceptees INTEGER DEFAULT 0,
  date_signature TEXT,
  -- Onboarding tracking
  onboarding_step INTEGER DEFAULT 1,    -- 1,2,3,4
  application_status TEXT DEFAULT 'draft' CHECK(application_status IN ('draft','submitted','en_attente','valide','refuse','suspendu')),
  -- Stats
  note_moyenne REAL DEFAULT 0,
  nb_avis INTEGER DEFAULT 0,
  nb_heures_total INTEGER DEFAULT 0,
  -- Meta
  admin_notes TEXT,
  validated_by TEXT,
  validated_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS formateur_thematiques (
  formateur_id TEXT NOT NULL REFERENCES formateurs(id),
  thematique_id TEXT NOT NULL REFERENCES thematiques(id),
  niveau_enseigne TEXT DEFAULT 'tous',
  PRIMARY KEY (formateur_id, thematique_id)
);

CREATE TABLE IF NOT EXISTS disponibilites (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  formateur_id TEXT NOT NULL REFERENCES formateurs(id),
  jour INTEGER NOT NULL CHECK(jour BETWEEN 0 AND 6),
  heure_debut TEXT NOT NULL,
  heure_fin TEXT NOT NULL,
  type_cours TEXT DEFAULT 'tous' CHECK(type_cours IN ('individuel','collectif','tous')),
  actif INTEGER DEFAULT 1
);

-- ============================================
-- FAMILLES & ELEVES
-- ============================================

CREATE TABLE IF NOT EXISTS parents (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES users(id),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  adresse TEXT,
  ville TEXT NOT NULL,
  code_postal TEXT NOT NULL,
  urssaf_compte_actif INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS eleves (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  parent_id TEXT REFERENCES parents(id),
  user_id TEXT REFERENCES users(id),
  prenom TEXT NOT NULL,
  nom TEXT,
  date_naissance TEXT,
  niveau TEXT,
  profil_specifique TEXT DEFAULT 'standard',
  notes_pedagogiques TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS eleve_thematiques (
  eleve_id TEXT NOT NULL REFERENCES eleves(id),
  thematique_id TEXT NOT NULL REFERENCES thematiques(id),
  priorite INTEGER DEFAULT 1,
  PRIMARY KEY (eleve_id, thematique_id)
);

-- ============================================
-- PACKAGES
-- ============================================

CREATE TABLE IF NOT EXISTS package_types (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  type_cours TEXT NOT NULL CHECK(type_cours IN ('individuel','collectif','mixte')),
  nb_heures REAL NOT NULL,
  prix REAL NOT NULL,
  prix_par_heure REAL NOT NULL,
  eligible_credit_impot INTEGER DEFAULT 0,
  duree_validite_jours INTEGER DEFAULT 180,
  max_eleves_collectif INTEGER DEFAULT 6,
  actif INTEGER DEFAULT 1,
  ordre INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS packages_achetes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  parent_id TEXT REFERENCES parents(id),
  eleve_id TEXT NOT NULL REFERENCES eleves(id),
  package_type_id TEXT NOT NULL REFERENCES package_types(id),
  thematiques TEXT NOT NULL,             -- JSON array thematique_ids
  heures_total REAL NOT NULL,
  heures_utilisees REAL DEFAULT 0,
  heures_restantes REAL GENERATED ALWAYS AS (heures_total - heures_utilisees) STORED,
  montant_paye REAL NOT NULL,
  credit_impot REAL DEFAULT 0,
  date_achat TEXT DEFAULT (datetime('now')),
  date_expiration TEXT NOT NULL,
  statut TEXT DEFAULT 'actif' CHECK(statut IN ('actif','expire','epuise','rembourse')),
  stripe_payment_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- COURS
-- ============================================

CREATE TABLE IF NOT EXISTS cours (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  formateur_id TEXT NOT NULL REFERENCES formateurs(id),
  thematique_id TEXT NOT NULL REFERENCES thematiques(id),
  type_cours TEXT NOT NULL CHECK(type_cours IN ('individuel','collectif')),
  titre TEXT,
  description TEXT,
  date_cours TEXT NOT NULL,
  heure_debut TEXT NOT NULL,
  duree_minutes INTEGER DEFAULT 60,
  max_eleves INTEGER DEFAULT 1,
  lieu TEXT,
  statut TEXT DEFAULT 'planifie' CHECK(statut IN ('planifie','confirme','en_cours','termine','annule')),
  notes_formateur TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cours_eleves (
  cours_id TEXT NOT NULL REFERENCES cours(id),
  eleve_id TEXT NOT NULL REFERENCES eleves(id),
  package_id TEXT REFERENCES packages_achetes(id),
  heures_debitees REAL NOT NULL DEFAULT 1,
  present INTEGER DEFAULT 1,
  notes_progression TEXT,
  PRIMARY KEY (cours_id, eleve_id)
);

-- ============================================
-- FACTURATION
-- ============================================

CREATE TABLE IF NOT EXISTS compteur_factures (
  annee INTEGER PRIMARY KEY,
  dernier_numero INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS factures (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  parent_id TEXT NOT NULL REFERENCES parents(id),
  reference TEXT UNIQUE NOT NULL,        -- "FAC-2026-0001"
  type TEXT NOT NULL CHECK(type IN ('package','mensuelle','avoir')),
  -- Dates
  date_emission TEXT NOT NULL DEFAULT (datetime('now')),
  date_realisation TEXT,                 -- date du 1er cours du mois
  periode_mois TEXT,                     -- "2026-03" pour factures mensuelles
  -- Montants
  montant_brut REAL NOT NULL,
  credit_impot REAL DEFAULT 0,
  reste_a_charge REAL NOT NULL,
  -- SAP specifique
  numero_sap TEXT,                       -- numero declaration SAP
  eligible_credit_impot INTEGER DEFAULT 0,
  avance_immediate INTEGER DEFAULT 0,
  code_nature_urssaf TEXT,               -- code prestation URSSAF
  -- Paiement
  statut TEXT DEFAULT 'brouillon' CHECK(statut IN ('brouillon','emise','payee','echec','remboursee','avoir')),
  mode_paiement TEXT,                    -- "stripe","virement","cesu","urssaf_aici"
  stripe_payment_id TEXT,
  -- PDF
  pdf_url TEXT,                          -- URL R2 du PDF genere
  -- Avoir (si annulation)
  facture_avoir_ref TEXT,                -- reference de la facture annulee
  -- Meta
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS facture_lignes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  facture_id TEXT NOT NULL REFERENCES factures(id),
  cours_id TEXT REFERENCES cours(id),
  description TEXT NOT NULL,             -- "Cours Maths College - 10/03/2026 (1h)"
  intervenant_id TEXT REFERENCES formateurs(id),
  intervenant_numero TEXT,               -- "#INT001" numero interne
  date_prestation TEXT,
  quantite REAL DEFAULT 1,              -- heures
  prix_unitaire REAL NOT NULL,          -- taux horaire TTC
  montant REAL NOT NULL                 -- quantite * prix_unitaire
);

-- Attestation fiscale annuelle
CREATE TABLE IF NOT EXISTS attestations_fiscales (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  parent_id TEXT NOT NULL REFERENCES parents(id),
  annee INTEGER NOT NULL,
  -- Totaux
  montant_total_paye REAL NOT NULL,
  montant_cesu_prefinance REAL DEFAULT 0,
  montant_ouvrant_droit REAL NOT NULL,   -- total - cesu prefinance
  credit_impot_calcule REAL NOT NULL,    -- 50% du montant ouvrant droit
  -- Detail
  detail_interventions TEXT NOT NULL,    -- JSON : [{formateur, dates, durees, montants}]
  -- Generation
  pdf_url TEXT,
  date_generation TEXT DEFAULT (datetime('now')),
  -- Meta
  UNIQUE(parent_id, annee)
);

-- Paiements formateurs
CREATE TABLE IF NOT EXISTS paiements_formateurs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  formateur_id TEXT NOT NULL REFERENCES formateurs(id),
  mois TEXT NOT NULL,
  montant REAL NOT NULL,
  nb_heures REAL NOT NULL,
  detail TEXT,                          -- JSON detail par cours
  statut TEXT DEFAULT 'en_attente' CHECK(statut IN ('en_attente','vire','echec')),
  stripe_transfer_id TEXT,
  date_virement TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- AVIS & MESSAGES
-- ============================================

CREATE TABLE IF NOT EXISTS avis (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  eleve_id TEXT NOT NULL REFERENCES eleves(id),
  formateur_id TEXT NOT NULL REFERENCES formateurs(id),
  cours_id TEXT REFERENCES cours(id),
  note INTEGER NOT NULL CHECK(note BETWEEN 1 AND 5),
  commentaire TEXT,
  visible INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  expediteur_id TEXT NOT NULL REFERENCES users(id),
  destinataire_id TEXT NOT NULL REFERENCES users(id),
  sujet TEXT,
  contenu TEXT NOT NULL,
  lu INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sous_domaines_domaine ON sous_domaines(domaine_id);
CREATE INDEX IF NOT EXISTS idx_thematiques_sous_domaine ON thematiques(sous_domaine_id);
CREATE INDEX IF NOT EXISTS idx_formateurs_ville ON formateurs(ville);
CREATE INDEX IF NOT EXISTS idx_formateurs_statut ON formateurs(application_status);
CREATE INDEX IF NOT EXISTS idx_formateur_thematiques_f ON formateur_thematiques(formateur_id);
CREATE INDEX IF NOT EXISTS idx_formateur_thematiques_t ON formateur_thematiques(thematique_id);
CREATE INDEX IF NOT EXISTS idx_eleves_parent ON eleves(parent_id);
CREATE INDEX IF NOT EXISTS idx_packages_eleve ON packages_achetes(eleve_id);
CREATE INDEX IF NOT EXISTS idx_packages_statut ON packages_achetes(statut);
CREATE INDEX IF NOT EXISTS idx_cours_formateur ON cours(formateur_id);
CREATE INDEX IF NOT EXISTS idx_cours_date ON cours(date_cours);
CREATE INDEX IF NOT EXISTS idx_cours_thematique ON cours(thematique_id);
CREATE INDEX IF NOT EXISTS idx_cours_eleves_eleve ON cours_eleves(eleve_id);
CREATE INDEX IF NOT EXISTS idx_factures_parent ON factures(parent_id);
CREATE INDEX IF NOT EXISTS idx_factures_reference ON factures(reference);
CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures(statut);
CREATE INDEX IF NOT EXISTS idx_facture_lignes_facture ON facture_lignes(facture_id);
CREATE INDEX IF NOT EXISTS idx_avis_formateur ON avis(formateur_id);
CREATE INDEX IF NOT EXISTS idx_messages_dest ON messages(destinataire_id, lu);
CREATE INDEX IF NOT EXISTS idx_paiements_formateur ON paiements_formateurs(formateur_id);
