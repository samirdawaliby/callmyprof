-- ============================================
-- CALLMYPROF - Schema D1
-- Migration 0001 : All tables + indexes
-- International tutoring platform (EN/FR/AR)
-- ============================================

-- ============================================
-- CATALOGUE : Domains, Subdomains, Topics
-- ============================================

CREATE TABLE IF NOT EXISTS domaines (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  nom_en TEXT,
  nom_ar TEXT,
  icone TEXT,
  description TEXT,
  ordre INTEGER DEFAULT 0,
  actif INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS sous_domaines (
  id TEXT PRIMARY KEY,
  domaine_id TEXT NOT NULL REFERENCES domaines(id),
  nom TEXT NOT NULL,
  nom_en TEXT,
  nom_ar TEXT,
  icone TEXT,
  description TEXT,
  ordre INTEGER DEFAULT 0,
  actif INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS thematiques (
  id TEXT PRIMARY KEY,
  sous_domaine_id TEXT NOT NULL REFERENCES sous_domaines(id),
  nom TEXT NOT NULL,
  nom_en TEXT,
  nom_ar TEXT,
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
  preferred_language TEXT DEFAULT 'en',
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
-- LEADS (CTA form submissions)
-- ============================================

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  -- Contact info
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  country_code TEXT DEFAULT '+1',
  -- Need
  domaine_id TEXT REFERENCES domaines(id),
  subject_description TEXT,
  level TEXT,
  preferred_schedule TEXT,
  service_type TEXT DEFAULT 'individual' CHECK(service_type IN ('individual', 'group', 'online')),
  -- Qualification
  statut TEXT DEFAULT 'new' CHECK(statut IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  callback_date TEXT,
  callback_notes TEXT,
  assigned_admin_id TEXT REFERENCES users(id),
  -- Conversion
  converted_parent_id TEXT REFERENCES parents(id),
  -- Geo & i18n
  country TEXT,
  detected_locale TEXT DEFAULT 'en',
  -- UTM tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  -- Meta
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- TUTORS (Formateurs)
-- ============================================

CREATE TABLE IF NOT EXISTS formateurs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES users(id),
  -- Step 1: Personal info
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  ville TEXT NOT NULL,
  country TEXT DEFAULT 'LB',
  code_postal TEXT,
  rayon_km INTEGER DEFAULT 10,
  photo_url TEXT,
  preferred_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'Asia/Beirut',
  -- Step 2: Skills
  bio TEXT,
  diplomes TEXT,                        -- JSON array
  experience_annees INTEGER DEFAULT 0,
  tarif_horaire_individuel REAL,
  tarif_horaire_collectif REAL,
  currency TEXT DEFAULT 'USD',
  accepte_domicile INTEGER DEFAULT 1,
  accepte_collectif INTEGER DEFAULT 1,
  accepte_visio INTEGER DEFAULT 1,
  lieu_collectif TEXT,
  -- Step 3: Documents (R2)
  r2_folder TEXT,
  doc_identite_url TEXT,
  doc_diplomes_url TEXT,
  doc_cv_url TEXT,
  doc_casier_url TEXT,
  doc_rib_url TEXT,
  iban TEXT,
  -- Step 4: Contract
  contract_signed INTEGER DEFAULT 0,
  non_compete_signed INTEGER DEFAULT 0,
  contract_pdf_url TEXT,
  signature_url TEXT,
  date_signature TEXT,
  -- Onboarding tracking
  onboarding_step INTEGER DEFAULT 1,
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
-- CONTRACTS (Lebanon-based)
-- ============================================

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  formateur_id TEXT NOT NULL REFERENCES formateurs(id),
  type TEXT DEFAULT 'freelance' CHECK(type IN ('freelance', 'employment')),
  -- Key clauses
  non_compete_clause INTEGER DEFAULT 1,
  non_compete_duration_months INTEGER DEFAULT 12,
  commission_rate REAL DEFAULT 0.30,
  -- Signing
  signed_at TEXT,
  signature_url TEXT,
  pdf_url TEXT,
  ip_address TEXT,
  -- Status
  statut TEXT DEFAULT 'pending' CHECK(statut IN ('pending', 'signed', 'expired', 'terminated')),
  expires_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- FAMILIES & STUDENTS
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
  country TEXT DEFAULT 'LB',
  code_postal TEXT,
  preferred_language TEXT DEFAULT 'en',
  source TEXT DEFAULT 'website',
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
  preferred_language TEXT DEFAULT 'en',
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
  nom_en TEXT,
  nom_ar TEXT,
  type_cours TEXT NOT NULL CHECK(type_cours IN ('individuel','collectif','mixte')),
  nb_heures REAL NOT NULL,
  prix REAL NOT NULL,
  prix_par_heure REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
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
  thematiques TEXT NOT NULL,
  heures_total REAL NOT NULL,
  heures_utilisees REAL DEFAULT 0,
  heures_restantes REAL GENERATED ALWAYS AS (heures_total - heures_utilisees) STORED,
  montant_paye REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  date_achat TEXT DEFAULT (datetime('now')),
  date_expiration TEXT NOT NULL,
  statut TEXT DEFAULT 'actif' CHECK(statut IN ('actif','expire','epuise','rembourse')),
  stripe_payment_id TEXT,
  paypal_payment_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- CLASSES (Cours)
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
  is_online INTEGER DEFAULT 0,
  meeting_url TEXT,
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
-- CALENDAR SLOTS
-- ============================================

CREATE TABLE IF NOT EXISTS calendar_slots (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  formateur_id TEXT NOT NULL REFERENCES formateurs(id),
  date_slot TEXT NOT NULL,
  heure_debut TEXT NOT NULL,
  heure_fin TEXT NOT NULL,
  type TEXT DEFAULT 'available' CHECK(type IN ('available', 'booked', 'blocked')),
  cours_id TEXT REFERENCES cours(id),
  is_group_slot INTEGER DEFAULT 0,
  max_students INTEGER DEFAULT 1,
  current_students INTEGER DEFAULT 0,
  recurring_rule TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- GROUP CLASSES
-- ============================================

CREATE TABLE IF NOT EXISTS group_classes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  formateur_id TEXT NOT NULL REFERENCES formateurs(id),
  thematique_id TEXT NOT NULL REFERENCES thematiques(id),
  titre TEXT NOT NULL,
  description TEXT,
  date_debut TEXT NOT NULL,
  heure_debut TEXT NOT NULL,
  duree_minutes INTEGER DEFAULT 60,
  recurrence TEXT DEFAULT 'once' CHECK(recurrence IN ('once', 'weekly', 'biweekly')),
  nb_seances INTEGER DEFAULT 1,
  max_eleves INTEGER DEFAULT 6,
  min_eleves INTEGER DEFAULT 2,
  inscrits INTEGER DEFAULT 0,
  prix_par_eleve REAL NOT NULL,
  prix_par_seance REAL,
  currency TEXT DEFAULT 'USD',
  statut TEXT DEFAULT 'ouvert' CHECK(statut IN ('ouvert','complet','en_cours','termine','annule')),
  lieu TEXT,
  is_online INTEGER DEFAULT 0,
  meeting_url TEXT,
  niveau TEXT,
  langue TEXT DEFAULT 'en',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS group_class_inscriptions (
  group_class_id TEXT NOT NULL REFERENCES group_classes(id),
  eleve_id TEXT NOT NULL REFERENCES eleves(id),
  date_inscription TEXT DEFAULT (datetime('now')),
  statut TEXT DEFAULT 'inscrit' CHECK(statut IN ('inscrit', 'annule')),
  PRIMARY KEY (group_class_id, eleve_id)
);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  parent_id TEXT REFERENCES parents(id),
  lead_id TEXT REFERENCES leads(id),
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  method TEXT CHECK(method IN ('stripe', 'paypal', 'cash', 'bank_transfer')),
  stripe_payment_id TEXT,
  paypal_payment_id TEXT,
  statut TEXT DEFAULT 'pending' CHECK(statut IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tutor_payouts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  formateur_id TEXT NOT NULL REFERENCES formateurs(id),
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  hours_worked REAL NOT NULL,
  gross_amount REAL NOT NULL,
  commission REAL NOT NULL,
  net_amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  statut TEXT DEFAULT 'pending' CHECK(statut IN ('pending', 'paid', 'failed')),
  paid_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- REVIEWS & MESSAGES
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
-- CHATBOT CONVERSATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS chat_conversations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  lead_id TEXT REFERENCES leads(id),
  visitor_ip TEXT,
  locale TEXT DEFAULT 'en',
  channel TEXT DEFAULT 'web' CHECK(channel IN ('web', 'whatsapp')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  conversation_id TEXT NOT NULL REFERENCES chat_conversations(id),
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sous_domaines_domaine ON sous_domaines(domaine_id);
CREATE INDEX IF NOT EXISTS idx_thematiques_sous_domaine ON thematiques(sous_domaine_id);
CREATE INDEX IF NOT EXISTS idx_leads_statut ON leads(statut);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_formateurs_ville ON formateurs(ville);
CREATE INDEX IF NOT EXISTS idx_formateurs_statut ON formateurs(application_status);
CREATE INDEX IF NOT EXISTS idx_formateur_thematiques_f ON formateur_thematiques(formateur_id);
CREATE INDEX IF NOT EXISTS idx_formateur_thematiques_t ON formateur_thematiques(thematique_id);
CREATE INDEX IF NOT EXISTS idx_contracts_formateur ON contracts(formateur_id);
CREATE INDEX IF NOT EXISTS idx_eleves_parent ON eleves(parent_id);
CREATE INDEX IF NOT EXISTS idx_packages_eleve ON packages_achetes(eleve_id);
CREATE INDEX IF NOT EXISTS idx_packages_statut ON packages_achetes(statut);
CREATE INDEX IF NOT EXISTS idx_cours_formateur ON cours(formateur_id);
CREATE INDEX IF NOT EXISTS idx_cours_date ON cours(date_cours);
CREATE INDEX IF NOT EXISTS idx_cours_thematique ON cours(thematique_id);
CREATE INDEX IF NOT EXISTS idx_cours_eleves_eleve ON cours_eleves(eleve_id);
CREATE INDEX IF NOT EXISTS idx_calendar_formateur ON calendar_slots(formateur_id, date_slot);
CREATE INDEX IF NOT EXISTS idx_calendar_date ON calendar_slots(date_slot);
CREATE INDEX IF NOT EXISTS idx_calendar_type ON calendar_slots(type);
CREATE INDEX IF NOT EXISTS idx_group_classes_formateur ON group_classes(formateur_id);
CREATE INDEX IF NOT EXISTS idx_group_classes_statut ON group_classes(statut);
CREATE INDEX IF NOT EXISTS idx_payments_parent ON payments(parent_id);
CREATE INDEX IF NOT EXISTS idx_payments_statut ON payments(statut);
CREATE INDEX IF NOT EXISTS idx_tutor_payouts_formateur ON tutor_payouts(formateur_id);
CREATE INDEX IF NOT EXISTS idx_avis_formateur ON avis(formateur_id);
CREATE INDEX IF NOT EXISTS idx_messages_dest ON messages(destinataire_id, lu);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_lead ON chat_conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id);
