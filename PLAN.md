# Plan Projet - Soutien Scolaire Caplogy

## Contexte

Business de soutien scolaire et enseignement prive en France. Double modele : cours individuels a domicile (credit impot 50% URSSAF) + cours collectifs (marge 67%). Systeme de packages prepays. 200+ thematiques couvrant scolaire, langues, musique, informatique, arts, sport, pro, accompagnement specifique.

### Decisions
- **Titre** : Soutien Scolaire Caplogy
- **Frontend public** : Page unique a caplogy.com/soutienscolaire (plus tard)
- **Admin/CRM** : Worker Cloudflare avec sidebar SSR (pattern Prospector v2)
- **Lien admin** : Un seul worker fixe pour toute la partie admin (remplacable plus tard)
- **Design** : Memes couleurs que Prospector v2 (#0d3865, #6dcbdd, #092847)
- **Stack** : Cloudflare Workers + D1 + R2 + Workers AI
- **Token CF** : 8CKkdglarSl3FEOKj5bz2tgDgZbPZY7ey-ksWm5W / s.dawaliby@caplogy.com

### Architecture simplifiee

```
UN SEUL WORKER (soutien-scolaire-admin)
├── Landing page publique (/)
├── Admin sidebar (pattern Prospector v2)
│   ├── Dashboard
│   ├── Formateurs (onboarding, gestion, validation)
│   ├── Eleves & Familles
│   ├── Catalogue (domaines, thematiques)
│   ├── Cours & Planning
│   ├── Packages
│   ├── Facturation (generation auto, URSSAF)
│   ├── Avis
│   └── Statistiques
├── D1 Database
├── R2 Storage (documents, photos, factures PDF)
└── Workers AI (matching, suggestions)
```

---

## REFERENCES EXISTANTES A REUTILISER

| Fichier source | Quoi prendre |
|---------------|-------------|
| `caplogy-prospector-v2/shared/html-utils.ts` | CSS_VARS, CSS_BASE, CSS_SIDEBAR, htmlPage(), htmlSidebar(), htmlHead(), escapeHtml(), formatDateFr() |
| `site-factory/recruitment/src/index.js` | Pattern onboarding 4 etapes, upload documents R2, validation formulaires, progress bar |
| `site-factory/api/src/index.js` | Pattern API REST, upload R2, IBAN extraction |
| `caplogy-prospector-v2/workers/crm/crm-clients-page.ts` | Pattern page listing avec filtres, tableaux, stats cards |
| `caplogy-prospector-v2/ARCHITECTURE.md` | Pattern general Workers + D1 |

---

## BUSINESS MODEL (resume)

### Double modele

| Type | Tarif | Credit impot | Marge |
|------|-------|-------------|-------|
| Individuel a domicile | 36 EUR/h | 50% (18 EUR reste) | 39% |
| Collectif (6 max) | 15 EUR/h/eleve (90 EUR total) | Non eligible | 67% |

### Packages

| Package | Heures | Prix | Prix/h |
|---------|--------|------|--------|
| Decouverte 1h | 1 | 36 EUR | 36 EUR |
| Essentiel 5h | 5 | 170 EUR | 34 EUR |
| Confort 10h | 10 | 320 EUR | 32 EUR |
| Intensif 20h | 20 | 600 EUR | 30 EUR |
| Collectif 10h | 10 | 120 EUR | 12 EUR |

### Catalogue : 8 domaines → ~60 sous-domaines → 200+ thematiques

Scolaire, Langues, Musique, Informatique, Arts, Sport, Pro/Concours, Accompagnement specifique (DYS, TDAH, HPI, Methodologie)

---

## MODULE FACTURATION - EXIGENCES URSSAF

### Mentions obligatoires sur chaque facture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FACTURE                                   │
│                                                                  │
│  Soutien Scolaire Caplogy                                       │
│  [Adresse]                                                       │
│  SIRET : XXX XXX XXX XXXXX                                      │
│  Declaration SAP n° SAP/XXXXXXXXX du JJ/MM/AAAA                 │
│                                                                  │
│  Facture n° : FAC-2026-0001  (unique, sequentiel, chronologique) │
│  Date d'emission : JJ/MM/AAAA                                   │
│  Date de realisation : JJ/MM/AAAA                                │
│                                                                  │
│  Client :                                                        │
│  [Nom Prenom]                                                    │
│  [Adresse complete]                                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐      │
│  │ Description          │ Qte │ Taux TTC │ Montant       │      │
│  ├──────────────────────┼─────┼──────────┼───────────────┤      │
│  │ Cours Maths - College│ 4h  │ 36,00€/h │ 144,00€       │      │
│  │ Intervenant : #INT01 │     │          │               │      │
│  │ Dates : 03, 10, 17,  │     │          │               │      │
│  │ 24 mars 2026         │     │          │               │      │
│  ├──────────────────────┼─────┼──────────┼───────────────┤      │
│  │                      │     │ TOTAL    │ 144,00€       │      │
│  │                      │     │ Crédit   │ -72,00€       │      │
│  │                      │     │ impôt 50%│               │      │
│  │                      │     │ RESTE A  │ 72,00€        │      │
│  │                      │     │ CHARGE   │               │      │
│  └────────────────────────────────────────────────────────┘      │
│                                                                  │
│  TVA non applicable, art. 293 B du CGI                           │
│  Organisme de services a la personne                             │
│  declare sous le n° SAP/XXXXXXXXX                                │
│                                                                  │
│  Reglement : [mode de paiement]                                  │
│  Si avance immediate : Prelevement URSSAF (AICI)                 │
└──────────────────────────────────────────────────────────────────┘
```

### Attestation fiscale annuelle (avant le 31 mars N+1)

Contenu obligatoire :
- Identite prestataire (nom, adresse, SIRET, n° SAP, date declaration)
- Identite client (nom, adresse)
- Recapitulatif interventions : nom intervenant, n° intervenant, dates, durees
- Total annuel paye par le client
- Montant CESU prefinance (si applicable, a separer)
- Montant net ouvrant droit au credit d'impot
- Clause de certification signee

### Numerotation factures

- Format : `FAC-AAAA-NNNN` (ex: FAC-2026-0001)
- Sequentiel, chronologique, sans trou
- Jamais supprimer une facture → emettre un avoir
- Conservation 10 ans (format original)

### API Tiers de Prestation URSSAF (avance immediate)

Donnees a transmettre par facture :
- idClient (lie au compte URSSAF du client)
- numFactureTiers (notre numero de facture)
- Date de realisation (1er jour du mois couvert)
- Code nature prestation (code URSSAF SAP)
- Montant TTC
- Periode : exactement 1 mois calendaire

---

## MODULE ONBOARDING FORMATEURS (inspire de site-factory)

### Flow en 4 etapes (pattern site-factory)

**Etape 1 : Informations personnelles**
- Prenom, nom, email, telephone
- Ville, code postal, rayon deplacement
- Photo de profil (upload R2)

**Etape 2 : Competences & Thematiques**
- Selection domaines (checkboxes)
- Selection sous-domaines et thematiques
- Niveaux enseignes (debutant, intermediaire, avance)
- Tarif horaire souhaite (individuel + collectif)
- Bio / presentation (textarea)
- Experience (annees, diplomes)

**Etape 3 : Documents obligatoires**
- Photo d'identite (CNI/passeport/titre sejour)
- Diplomes (copies)
- Justificatif SIRET/INSEE (auto-entrepreneur)
- Attestation URSSAF de vigilance
- Extrait casier judiciaire B3 (obligatoire mineurs)
- RIB (+ extraction IBAN automatique via Workers AI)
- CV (optionnel, analyse IA)

**Etape 4 : Validation & Contrat**
- Recapitulatif complet
- Acceptation CGV / Charte formateur
- Signature electronique (canvas)
- Soumission → statut "en_attente"
- Admin valide → statut "valide" → formateur actif

### Stockage documents R2

```
formateurs/{annee}/{mois}/formateur_{id}/
├── photo.jpg
├── identite.pdf
├── diplomes.pdf
├── siret.pdf
├── urssaf.pdf
├── casier-b3.pdf
├── rib.pdf
└── cv.pdf
```

---

## SCHEMA D1 COMPLET

```sql
-- ============================================
-- CATALOGUE : Domaines, Sous-domaines, Thematiques
-- ============================================

CREATE TABLE domaines (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  icone TEXT,
  description TEXT,
  ordre INTEGER DEFAULT 0,
  actif INTEGER DEFAULT 1
);

CREATE TABLE sous_domaines (
  id TEXT PRIMARY KEY,
  domaine_id TEXT NOT NULL REFERENCES domaines(id),
  nom TEXT NOT NULL,
  icone TEXT,
  description TEXT,
  ordre INTEGER DEFAULT 0,
  actif INTEGER DEFAULT 1
);

CREATE TABLE thematiques (
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

CREATE TABLE users (
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

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- FORMATEURS
-- ============================================

CREATE TABLE formateurs (
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

CREATE TABLE formateur_thematiques (
  formateur_id TEXT NOT NULL REFERENCES formateurs(id),
  thematique_id TEXT NOT NULL REFERENCES thematiques(id),
  niveau_enseigne TEXT DEFAULT 'tous',
  PRIMARY KEY (formateur_id, thematique_id)
);

CREATE TABLE disponibilites (
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

CREATE TABLE parents (
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

CREATE TABLE eleves (
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

CREATE TABLE eleve_thematiques (
  eleve_id TEXT NOT NULL REFERENCES eleves(id),
  thematique_id TEXT NOT NULL REFERENCES thematiques(id),
  priorite INTEGER DEFAULT 1,
  PRIMARY KEY (eleve_id, thematique_id)
);

-- ============================================
-- PACKAGES
-- ============================================

CREATE TABLE package_types (
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

CREATE TABLE packages_achetes (
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

CREATE TABLE cours (
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

CREATE TABLE cours_eleves (
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

CREATE TABLE compteur_factures (
  annee INTEGER PRIMARY KEY,
  dernier_numero INTEGER DEFAULT 0
);

CREATE TABLE factures (
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

CREATE TABLE facture_lignes (
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
CREATE TABLE attestations_fiscales (
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
CREATE TABLE paiements_formateurs (
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

CREATE TABLE avis (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  eleve_id TEXT NOT NULL REFERENCES eleves(id),
  formateur_id TEXT NOT NULL REFERENCES formateurs(id),
  cours_id TEXT REFERENCES cours(id),
  note INTEGER NOT NULL CHECK(note BETWEEN 1 AND 5),
  commentaire TEXT,
  visible INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE messages (
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

CREATE INDEX idx_sous_domaines_domaine ON sous_domaines(domaine_id);
CREATE INDEX idx_thematiques_sous_domaine ON thematiques(sous_domaine_id);
CREATE INDEX idx_formateurs_ville ON formateurs(ville);
CREATE INDEX idx_formateurs_statut ON formateurs(application_status);
CREATE INDEX idx_formateur_thematiques_f ON formateur_thematiques(formateur_id);
CREATE INDEX idx_formateur_thematiques_t ON formateur_thematiques(thematique_id);
CREATE INDEX idx_eleves_parent ON eleves(parent_id);
CREATE INDEX idx_packages_eleve ON packages_achetes(eleve_id);
CREATE INDEX idx_packages_statut ON packages_achetes(statut);
CREATE INDEX idx_cours_formateur ON cours(formateur_id);
CREATE INDEX idx_cours_date ON cours(date_cours);
CREATE INDEX idx_cours_thematique ON cours(thematique_id);
CREATE INDEX idx_cours_eleves_eleve ON cours_eleves(eleve_id);
CREATE INDEX idx_factures_parent ON factures(parent_id);
CREATE INDEX idx_factures_reference ON factures(reference);
CREATE INDEX idx_factures_statut ON factures(statut);
CREATE INDEX idx_facture_lignes_facture ON facture_lignes(facture_id);
CREATE INDEX idx_avis_formateur ON avis(formateur_id);
CREATE INDEX idx_messages_dest ON messages(destinataire_id, lu);
CREATE INDEX idx_paiements_formateur ON paiements_formateurs(formateur_id);
```

---

## PLAN DE TACHES DETAILLE

---

### TACHE 1 : Initialisation du projet

**1.1 Structure du monorepo**
- 1.1.1 Creer `package.json` racine avec scripts (dev, deploy, migrate)
- 1.1.2 Creer `tsconfig.json` avec paths aliases `@shared/*`
- 1.1.3 Creer `.gitignore` (node_modules, .wrangler, .dev.vars)
- 1.1.4 `npm install wrangler typescript @cloudflare/workers-types`

**1.2 Configuration Worker**
- 1.2.1 Creer `wrangler.toml` pour le worker unique
  - name: `soutien-scolaire-admin`
  - Binding D1 database
  - Binding R2 bucket
  - Binding Workers AI
  - Variables d'env (STRIPE_KEY, etc. via secrets)
- 1.2.2 Creer `src/index.ts` : router principal (switch path + method)

**1.3 Creer la database D1**
- 1.3.1 `wrangler d1 create soutien-scolaire-db`
- 1.3.2 Reporter le database_id dans wrangler.toml

**1.4 Creer le bucket R2**
- 1.4.1 `wrangler r2 bucket create soutien-scolaire-docs`
- 1.4.2 Reporter le binding dans wrangler.toml

**1.5 CLAUDE.md du projet**
- 1.5.1 Documenter la stack, les conventions, le pattern sidebar

---

### TACHE 2 : Shared utilities (adapte du Prospector v2)

**2.1 `shared/html-utils.ts`** (copier et adapter de `/caplogy-prospector-v2/shared/html-utils.ts`)
- 2.1.1 CSS_VARS : garder les memes couleurs (#0d3865, #6dcbdd, etc.)
- 2.1.2 CSS_BASE : reset + body
- 2.1.3 CSS_SIDEBAR : identique au Prospector
- 2.1.4 Definir SIDEBAR_SECTIONS pour soutien scolaire :
  ```
  Dashboard | Formateurs | Eleves & Familles | Catalogue |
  Cours & Planning | Packages | Facturation | Avis | Stats
  ```
- 2.1.5 `htmlHead()` : titre "Soutien Scolaire Caplogy", favicon Caplogy
- 2.1.6 `htmlSidebar()` : logo "Soutien Scolaire" + user greeting
- 2.1.7 `htmlPage()` : wrapper complet
- 2.1.8 `escapeHtml()`, `formatDateFr()` (copie directe)
- 2.1.9 Toggle sidebar mobile (hamburger)

**2.2 `shared/types.ts`**
- 2.2.1 Interface `Env` (DB: D1Database, R2: R2Bucket, AI: Ai)
- 2.2.2 Types : User, Formateur, Parent, Eleve, Cours, Facture, FactureLigne, Avis, Message
- 2.2.3 Types catalogue : Domaine, SousDomaine, Thematique
- 2.2.4 Types packages : PackageType, PackageAchete
- 2.2.5 Enums : Role, StatutFormateur, StatutCours, TypeCours, StatutFacture, NiveauScolaire

**2.3 `shared/auth.ts`**
- 2.3.1 `hashPassword()` via Web Crypto API (PBKDF2)
- 2.3.2 `verifyPassword()` comparaison securisee
- 2.3.3 `createSession()` → insert D1 + set cookie httpOnly
- 2.3.4 `validateSession()` → check D1 + expiration
- 2.3.5 `deleteSession()` → delete D1 + clear cookie
- 2.3.6 `requireAuth(request, env, roles?)` → middleware de protection
- 2.3.7 `getCurrentUser(request, env)` → User depuis la session

**2.4 `shared/pricing.ts`**
- 2.4.1 Constantes TARIFS par niveau et type
- 2.4.2 `calculateCreditImpot(montant, eligible)` → {brut, credit, resteACharge}
- 2.4.3 `calculatePackagePrice(type, heures)` → prix avec remise
- 2.4.4 `formatPrix(montant)` → "36,00 €"

**2.5 `shared/invoice.ts`** (module facturation)
- 2.5.1 `generateInvoiceNumber(env)` → "FAC-2026-0001" (incrementer compteur D1)
- 2.5.2 `generateInvoiceHTML(facture, lignes, parent)` → HTML complet avec toutes les mentions obligatoires SAP
- 2.5.3 `generateAttestationHTML(parent, annee, detail)` → attestation fiscale annuelle HTML
- 2.5.4 Mentions obligatoires integrees :
  - "TVA non applicable, art. 293 B du CGI"
  - Numero SAP + date declaration
  - Numero intervenant par ligne
  - Prix restant a charge
  - Taux horaire TTC
- 2.5.5 `htmlToPdf(html, env)` → utiliser Workers AI ou lib legere → stocker R2

**2.6 `shared/utils.ts`**
- 2.6.1 `generateId()` → hex random 16 bytes
- 2.6.2 `slugify(text)` → URL-safe slug
- 2.6.3 `paginationHTML(page, total, limit, baseUrl)` → liens pagination
- 2.6.4 `parseFormData(request)` → objet depuis FormData
- 2.6.5 `jsonResponse(data, status?)` → Response JSON
- 2.6.6 `htmlResponse(html)` → Response HTML
- 2.6.7 `redirectResponse(url)` → Response 302

---

### TACHE 3 : Migrations D1 & seed data

**3.1 `migrations/0001_schema.sql`**
- 3.1.1 Toutes les tables du schema ci-dessus
- 3.1.2 Tous les indexes

**3.2 `migrations/0002_seed_catalogue.sql`**
- 3.2.1 Insert 8 domaines (scolaire, langues, musique, informatique, arts, sport, pro, accompagnement)
- 3.2.2 Insert ~60 sous-domaines
- 3.2.3 Insert ~200 thematiques

**3.3 `migrations/0003_seed_packages.sql`**
- 3.3.1 Insert tous les package_types (decouverte, essentiel, confort, intensif, collectif)

**3.4 `migrations/0004_seed_demo.sql`**
- 3.4.1 Insert 1 admin user (s.dawaliby@caplogy.com)
- 3.4.2 Insert 3 formateurs de demo (valides)
- 3.4.3 Insert 2 familles + 3 eleves de demo
- 3.4.4 Insert quelques cours et factures de demo

**3.5 Executer les migrations**
- 3.5.1 Script `scripts/migrate.sh` pour appliquer toutes les migrations
- 3.5.2 `wrangler d1 execute soutien-scolaire-db --file migrations/0001_schema.sql`
- 3.5.3 Idem pour 0002, 0003, 0004

---

### TACHE 4 : Router principal & Auth

**4.1 `src/index.ts` - Router**
- 4.1.1 GET / → landing page publique
- 4.1.2 GET /login → page connexion
- 4.1.3 POST /login → traiter connexion
- 4.1.4 GET /logout → deconnexion
- 4.1.5 GET /onboarding → page onboarding formateur (publique)
- 4.1.6 POST /api/onboarding/* → API onboarding
- 4.1.7 GET /dashboard → requireAuth → dashboard admin
- 4.1.8 GET /formateurs → requireAuth → liste formateurs
- 4.1.9 ... (toutes les routes admin protegees)

**4.2 Page connexion `src/pages/login.ts`**
- 4.2.1 Formulaire email + mot de passe
- 4.2.2 Validation serveur
- 4.2.3 Creation session + redirect /dashboard
- 4.2.4 Message erreur si invalide
- 4.2.5 Design Caplogy (memes couleurs)

**4.3 Middleware auth**
- 4.3.1 Verifier cookie session sur chaque route admin
- 4.3.2 Redirect /login si non authentifie
- 4.3.3 Injecter user dans le contexte

---

### TACHE 5 : Dashboard admin

**5.1 `src/pages/dashboard.ts`**
- 5.1.1 Requetes SQL stats :
  - Nb formateurs (total, valides, en attente)
  - Nb familles / eleves
  - Nb cours cette semaine / ce mois
  - CA du mois (brut + marge)
  - Heures dispensees ce mois
  - Nb packages actifs
- 5.1.2 Stats cards en haut (6 cartes colorees, pattern Prospector)
- 5.1.3 Section "Actions urgentes" :
  - Formateurs en attente de validation (avec lien)
  - Factures impayees
  - Packages expirant bientot
- 5.1.4 Section "Derniers cours" (5 derniers)
- 5.1.5 Section "Derniers avis" (3 derniers)

---

### TACHE 6 : Gestion Formateurs (admin)

**6.1 Page liste formateurs `src/pages/formateurs-liste.ts`**
- 6.1.1 Tableau : photo, nom, ville, thematiques principales, statut, note, nb eleves, nb heures
- 6.1.2 Filtres : statut (select), ville (input), thematique (select par domaine)
- 6.1.3 Recherche par nom/email
- 6.1.4 Pagination
- 6.1.5 Boutons actions inline : Valider / Refuser / Suspendre / Voir profil
- 6.1.6 Badge couleur par statut (vert=valide, jaune=en_attente, rouge=refuse, gris=suspendu)

**6.2 Page detail formateur `src/pages/formateur-detail.ts`**
- 6.2.1 Header : photo, nom, statut, note, ville
- 6.2.2 Section infos personnelles (email, tel, adresse, SIRET)
- 6.2.3 Section competences (domaines, thematiques, niveaux)
- 6.2.4 Section documents (liens vers R2, statut verification)
- 6.2.5 Section historique cours (tableau)
- 6.2.6 Section avis recus
- 6.2.7 Section paiements (historique)
- 6.2.8 Zone admin : notes internes, boutons validation, historique actions

**6.3 API formateurs `src/api/formateurs.ts`**
- 6.3.1 GET /api/formateurs → liste filtrable JSON
- 6.3.2 GET /api/formateurs/:id → detail JSON
- 6.3.3 PUT /api/formateurs/:id/status → changer statut (valider/refuser/suspendre)
- 6.3.4 PUT /api/formateurs/:id → modifier infos
- 6.3.5 DELETE /api/formateurs/:id → soft delete (suspendu)

---

### TACHE 7 : Onboarding Formateur (publique, inspire site-factory)

**7.1 Page onboarding `src/pages/onboarding.ts`**
- 7.1.1 Progress bar 4 etapes (CSS identique site-factory)
- 7.1.2 Sections step-card cachees/visibles via JS
- 7.1.3 Navigation Back/Next avec validation
- 7.1.4 Draft auto-save localStorage

**7.2 Etape 1 : Lead capture + Infos perso**
- 7.2.1 Modal lead capture initial (prenom, nom, email, tel) → POST /api/onboarding/register
- 7.2.2 Formulaire complet : ville, code postal, rayon km
- 7.2.3 Upload photo profil (drag-drop zone, max 5MB, JPG/PNG)
- 7.2.4 Validation : tous champs requis, email format, tel format
- 7.2.5 POST vers /api/onboarding/:id → save etape 1

**7.3 Etape 2 : Competences**
- 7.3.1 Chargement dynamique des domaines depuis D1 (GET /api/catalogue/domaines)
- 7.3.2 Selection domaines → affiche sous-domaines → affiche thematiques (cascade)
- 7.3.3 Checkboxes thematiques selectionnees
- 7.3.4 Select niveaux enseignes par thematique
- 7.3.5 Input tarif horaire individuel + collectif
- 7.3.6 Textarea bio/presentation
- 7.3.7 Input experience (annees) + diplomes (liste dynamique)
- 7.3.8 POST vers /api/onboarding/:id → save etape 2

**7.4 Etape 3 : Documents**
- 7.4.1 Liste des 7 documents obligatoires avec statut (icone)
- 7.4.2 Zone upload par document (drag-drop ou click)
- 7.4.3 Upload vers R2 via POST /api/onboarding/:id/documents
- 7.4.4 Validation type/taille fichier (PDF, JPG, PNG, max 10MB)
- 7.4.5 Extraction IBAN automatique depuis RIB (Workers AI OCR)
- 7.4.6 Champ IBAN manuel si extraction echoue
- 7.4.7 Validation IBAN (format FR76...)
- 7.4.8 Input SIRET (14 chiffres, validation format)
- 7.4.9 Indicateur progression : X/7 documents uploades

**7.5 Etape 4 : Validation & Soumission**
- 7.5.1 Recapitulatif complet de toutes les infos
- 7.5.2 Checkbox acceptation CGV + Charte formateur
- 7.5.3 Canvas signature electronique (dessiner avec la souris/doigt)
- 7.5.4 Bouton "Soumettre ma candidature"
- 7.5.5 POST /api/onboarding/:id/submit → statut "en_attente"
- 7.5.6 Page confirmation "Merci ! Candidature en cours d'examen"

**7.6 API onboarding `src/api/onboarding.ts`**
- 7.6.1 POST /api/onboarding/register → creer formateur draft
- 7.6.2 PUT /api/onboarding/:id → update infos
- 7.6.3 POST /api/onboarding/:id/documents → upload R2
- 7.6.4 POST /api/onboarding/:id/extract-iban → OCR Workers AI
- 7.6.5 POST /api/onboarding/:id/submit → soumettre
- 7.6.6 GET /api/onboarding/:id → recuperer etat actuel
- 7.6.7 GET /api/catalogue/domaines → arbre domaines/sous-domaines/thematiques

---

### TACHE 8 : Gestion Eleves & Familles

**8.1 Page liste familles `src/pages/familles-liste.ts`**
- 8.1.1 Tableau : nom parent, ville, nb enfants, nb packages actifs, total depense
- 8.1.2 Filtres : ville, recherche nom/email
- 8.1.3 Pagination
- 8.1.4 Lien vers detail

**8.2 Page detail famille `src/pages/famille-detail.ts`**
- 8.2.1 Infos parent (nom, email, tel, adresse)
- 8.2.2 Liste enfants avec niveau, thematiques, profil
- 8.2.3 Packages achetes (actifs et expires)
- 8.2.4 Historique cours
- 8.2.5 Historique factures
- 8.2.6 Bouton "Ajouter enfant", "Creer package"

**8.3 Formulaire ajout famille `src/pages/famille-form.ts`**
- 8.3.1 Infos parent : nom, prenom, email, tel, adresse, ville, CP
- 8.3.2 Enfant(s) : prenom, niveau, thematiques (select cascade), profil specifique
- 8.3.3 Bouton "+ Ajouter un enfant"
- 8.3.4 Validation + insert D1

**8.4 API familles `src/api/familles.ts`**
- 8.4.1 GET /api/familles → liste JSON
- 8.4.2 GET /api/familles/:id → detail JSON
- 8.4.3 POST /api/familles → creer famille + enfants
- 8.4.4 PUT /api/familles/:id → modifier
- 8.4.5 POST /api/familles/:id/enfants → ajouter enfant
- 8.4.6 PUT /api/eleves/:id → modifier eleve

---

### TACHE 9 : Catalogue (Domaines, Thematiques)

**9.1 Page catalogue admin `src/pages/catalogue.ts`**
- 9.1.1 Vue arborescente : Domaines → Sous-domaines → Thematiques
- 9.1.2 Accordeons pour ouvrir/fermer chaque niveau
- 9.1.3 Compteur formateurs par thematique
- 9.1.4 Badge actif/inactif
- 9.1.5 Boutons : Ajouter domaine, Ajouter sous-domaine, Ajouter thematique

**9.2 Formulaires CRUD catalogue**
- 9.2.1 Modale ajout/edit domaine (nom, icone, description, ordre)
- 9.2.2 Modale ajout/edit sous-domaine (domaine parent, nom, icone)
- 9.2.3 Modale ajout/edit thematique (sous-domaine parent, nom, niveau_min)
- 9.2.4 Toggle actif/inactif

**9.3 API catalogue `src/api/catalogue.ts`**
- 9.3.1 GET /api/catalogue/domaines → arbre complet (domaines + sous-domaines + thematiques)
- 9.3.2 POST/PUT/DELETE /api/catalogue/domaines/:id
- 9.3.3 POST/PUT/DELETE /api/catalogue/sous-domaines/:id
- 9.3.4 POST/PUT/DELETE /api/catalogue/thematiques/:id

---

### TACHE 10 : Cours & Planning

**10.1 Page liste cours `src/pages/cours-liste.ts`**
- 10.1.1 Tableau : date, heure, formateur, thematique, type (indiv/collectif), nb eleves, statut
- 10.1.2 Filtres : date (range), formateur, thematique, type, statut
- 10.1.3 Vue liste et vue calendrier semaine (optionnel)
- 10.1.4 Stats : nb cours/semaine, taux annulation, repartition indiv/collectif

**10.2 Page detail cours `src/pages/cours-detail.ts`**
- 10.2.1 Infos cours : date, heure, duree, formateur, thematique, type, lieu
- 10.2.2 Liste eleves inscrits (avec presence)
- 10.2.3 Notes formateur / progression
- 10.2.4 Package debite par eleve
- 10.2.5 Boutons : Confirmer / Annuler / Marquer termine

**10.3 Formulaire creer cours `src/pages/cours-form.ts`**
- 10.3.1 Select formateur (filtre par thematique)
- 10.3.2 Select thematique
- 10.3.3 Type : individuel / collectif
- 10.3.4 Date, heure debut, duree
- 10.3.5 Lieu (domicile eleve / salle / visio)
- 10.3.6 Selectionner eleves (1 pour indiv, max 6 pour collectif)
- 10.3.7 Titre + description optionnels
- 10.3.8 Validation : formateur disponible, eleves ont packages actifs

**10.4 API cours `src/api/cours.ts`**
- 10.4.1 GET /api/cours → liste filtrable
- 10.4.2 GET /api/cours/:id → detail
- 10.4.3 POST /api/cours → creer cours + inscrire eleves
- 10.4.4 PUT /api/cours/:id → modifier
- 10.4.5 PUT /api/cours/:id/statut → changer statut
- 10.4.6 PUT /api/cours/:id/presence → marquer presence eleves
- 10.4.7 POST /api/cours/:id/terminer → marquer termine + debiter packages

---

### TACHE 11 : Packages

**11.1 Page packages `src/pages/packages.ts`**
- 11.1.1 Section "Types de packages" : tableau editable des offres
- 11.1.2 Section "Packages achetes" : liste des packages actifs/expires
- 11.1.3 Filtres : eleve, statut, type
- 11.1.4 Stats : nb actifs, heures consommees/restantes, CA total

**11.2 Formulaire vente package `src/pages/package-vente.ts`**
- 11.2.1 Select famille/eleve
- 11.2.2 Select type package
- 11.2.3 Select thematiques couvertes (checkboxes cascade)
- 11.2.4 Calcul automatique : prix, credit impot (si eligible), reste a charge
- 11.2.5 Date expiration auto (date achat + duree validite)
- 11.2.6 Bouton "Creer" → insert D1 + generer facture

**11.3 API packages `src/api/packages.ts`**
- 11.3.1 GET /api/packages → liste packages achetes
- 11.3.2 GET /api/packages/:id → detail avec heures restantes
- 11.3.3 POST /api/packages → creer package (+ facture auto)
- 11.3.4 PUT /api/package-types/:id → modifier types packages
- 11.3.5 POST /api/packages/:id/debiter → debiter heures manuellement

---

### TACHE 12 : Facturation

**12.1 Page factures `src/pages/factures-liste.ts`**
- 12.1.1 Tableau : reference, date, client, type, montant brut, credit impot, reste a charge, statut
- 12.1.2 Filtres : mois, statut, client
- 12.1.3 Stats : CA mois, nb factures, total impaye
- 12.1.4 Boutons : Voir PDF, Emettre, Marquer payee

**12.2 Page detail facture `src/pages/facture-detail.ts`**
- 12.2.1 En-tete facture complete (toutes mentions SAP)
- 12.2.2 Tableau lignes (cours, heures, tarif, montant)
- 12.2.3 Total + credit impot + reste a charge
- 12.2.4 Statut paiement
- 12.2.5 Lien PDF telecharger
- 12.2.6 Bouton "Emettre un avoir" si besoin

**12.3 Generation automatique de factures `src/api/factures.ts`**
- 12.3.1 `generateMonthlyInvoice(parentId, mois)` :
  - Recuperer tous les cours termines du mois pour cette famille
  - Grouper par formateur/thematique
  - Generer numero sequentiel via compteur_factures
  - Calculer credit impot (50% si cours individuels a domicile)
  - Inserer facture + lignes
  - Generer HTML avec toutes mentions obligatoires SAP
  - Convertir en PDF → stocker R2
  - Retourner facture_id
- 12.3.2 `generatePackageInvoice(packageId)` : facture immediate a l'achat d'un package
- 12.3.3 `generateAvoir(factureId, motif)` : facture d'avoir (annulation)
- 12.3.4 GET /api/factures → liste
- 12.3.5 GET /api/factures/:id → detail
- 12.3.6 GET /api/factures/:id/pdf → telecharger PDF depuis R2
- 12.3.7 POST /api/factures/generer-mensuelle → generer pour un mois donne
- 12.3.8 PUT /api/factures/:id/statut → marquer payee/echec

**12.4 Attestation fiscale annuelle**
- 12.4.1 Page admin "Attestations" avec bouton "Generer attestations [annee]"
- 12.4.2 `generateAttestation(parentId, annee)` :
  - Recapituler toutes les factures de l'annee
  - Lister tous les intervenants avec dates/durees
  - Calculer montant total + montant CESU + montant ouvrant droit
  - Generer HTML conforme (mentions obligatoires)
  - PDF → R2
  - Insert attestations_fiscales
- 12.4.3 GET /api/attestations/:parentId/:annee/pdf → telecharger

**12.5 Paiements formateurs**
- 12.5.1 Page "Paiements formateurs" : tableau mensuel par formateur
- 12.5.2 Calcul auto : somme heures x tarif pour chaque formateur du mois
- 12.5.3 Bouton "Generer paiements du mois"
- 12.5.4 Bouton "Marquer vire" par formateur
- 12.5.5 Export CSV des virements

---

### TACHE 13 : Avis & Messages

**13.1 Page avis `src/pages/avis.ts`**
- 13.1.1 Liste tous les avis (note, commentaire, eleve, formateur, date)
- 13.1.2 Filtres : formateur, note min
- 13.1.3 Toggle visibilite (masquer un avis)

**13.2 Page messages (optionnel, phase 2)**
- 13.2.1 Messagerie interne parent <-> formateur
- 13.2.2 Notification admin

---

### TACHE 14 : Landing page publique

**14.1 Page `src/pages/landing.ts`**
- 14.1.1 Hero : titre "Soutien Scolaire Caplogy" + accroche credit impot
- 14.1.2 Simulateur prix interactif (JS inline) : select niveau → prix brut barre → prix apres credit
- 14.1.3 Section "8 domaines" : grille de cartes domaines
- 14.1.4 Section "Comment ca marche" en 3 etapes
- 14.1.5 Section packages : tableau comparatif
- 14.1.6 Section temoignages (3 cartes)
- 14.1.7 CTA : "Trouver mon formateur" + "Devenir formateur"
- 14.1.8 Footer : mentions legales, contact, lien admin

---

### TACHE 15 : Statistiques

**15.1 Page stats `src/pages/statistiques.ts`**
- 15.1.1 CA par mois (tableau + mini graphique ASCII/SVG)
- 15.1.2 Heures par domaine (repartition)
- 15.1.3 Top formateurs (par heures, par note)
- 15.1.4 Repartition individuel vs collectif
- 15.1.5 Taux conversion packages (achetes vs expires)
- 15.1.6 Taux retention eleves

---

### TACHE 16 : Deploiement & Configuration

**16.1 Deployer le worker**
- 16.1.1 `wrangler deploy`
- 16.1.2 Verifier que toutes les bindings D1/R2/AI fonctionnent
- 16.1.3 Configurer les secrets (mot de passe admin initial, Stripe keys)

**16.2 Configurer le domaine**
- 16.2.1 Ajouter route custom ou sous-domaine dans wrangler.toml
- 16.2.2 Configurer DNS Cloudflare
- 16.2.3 Verifier HTTPS

**16.3 Tests de bout en bout**
- 16.3.1 Onboarding formateur complet (4 etapes)
- 16.3.2 Creer famille + eleve
- 16.3.3 Vendre package → generer facture
- 16.3.4 Creer cours → terminer → debiter package
- 16.3.5 Generer facture mensuelle → verifier PDF
- 16.3.6 Generer attestation fiscale annuelle
- 16.3.7 Test responsive mobile sidebar

---

## ORDRE D'EXECUTION RECOMMANDE

```
Tache 1 → Tache 2 → Tache 3 → Tache 4 → Tache 5
                                              ↓
                                         Tache 6 + 7 (en parallele)
                                              ↓
                                         Tache 8 + 9
                                              ↓
                                         Tache 10 + 11
                                              ↓
                                         Tache 12 (facturation = le plus complexe)
                                              ↓
                                         Tache 13 + 14 + 15
                                              ↓
                                         Tache 16 (deploiement)
```

Total estime : ~16 taches majeures, ~80 sous-taches, ~200 sous-sous-taches.
