# CallMyProf - Documentation Technique Complète

> **Version** : 0.1.0 | **Dernière mise à jour** : 15 Mars 2026
> **Entité légale** : Capleb SAL (Liban) | **Marque** : CallMyProf
> **URL** : https://callmyprof.com

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture technique](#2-architecture-technique)
3. [Structure du projet](#3-structure-du-projet)
4. [Configuration & déploiement](#4-configuration--déploiement)
5. [Base de données (D1)](#5-base-de-données-d1)
6. [Système i18n (EN/FR/AR)](#6-système-i18n-enfrar)
7. [Pages publiques](#7-pages-publiques)
8. [Back-office admin](#8-back-office-admin)
9. [API endpoints](#9-api-endpoints)
10. [Système de leads (CRM)](#10-système-de-leads-crm)
11. [Booking & emails (Resend)](#11-booking--emails-resend)
12. [Vidéo : Daily.co + Jitsi](#12-vidéo--dailyco--jitsi)
13. [Onboarding tuteur](#13-onboarding-tuteur)
14. [Chatbot IA (Workers AI)](#14-chatbot-ia-workers-ai)
15. [WhatsApp Business API](#15-whatsapp-business-api)
16. [Sécurité & authentification](#16-sécurité--authentification)
17. [Secrets & variables d'environnement](#17-secrets--variables-denvironnement)
18. [Roadmap](#18-roadmap)
19. [Commandes utiles](#19-commandes-utiles)

---

## 1. Vue d'ensemble

### Concept
CallMyProf est une plateforme internationale de mise en relation étudiants/tuteurs. Le parcours :
1. L'étudiant voit une pub (TikTok, Facebook, Instagram)
2. Il remplit le formulaire sur callmyprof.com
3. Un lead est créé dans le CRM
4. L'admin rappelle et qualifie le besoin
5. On envoie un email de booking → l'étudiant choisit un créneau
6. Paiement → lien visio auto-généré → cours

### Chiffres clés
- **24 204 lignes** de TypeScript
- **27 pages** (publiques + admin)
- **16 API endpoints**
- **6 migrations** SQL
- **3 langues** : Anglais, Français, Arabe (RTL)
- **8 domaines**, 61 sous-domaines, 223 thématiques dans le catalogue

### Tarification
| Type | Prix |
|------|------|
| Cours individuel | $15/h |
| Cours en ligne | $12/h |
| Cours collectif | $8/h par étudiant |

---

## 2. Architecture technique

### Stack
```
Cloudflare Workers (TypeScript)  ─── Serveur unique SSR
Cloudflare D1 (SQLite)           ─── Base de données distribuée
Cloudflare R2                    ─── Stockage fichiers (CV, diplômes)
Cloudflare Workers AI            ─── Chatbot IA (Llama 3.1)
Resend API                       ─── Emails transactionnels
Daily.co API                     ─── Visioconférence (primary)
Jitsi Meet                       ─── Visioconférence (fallback)
```

### Principes
- **UN SEUL Worker** qui sert tout : pages publiques + admin SSR
- **Zéro framework frontend** : HTML généré côté serveur, JavaScript vanilla inline
- **Pattern Sidebar** : toutes les pages admin utilisent `htmlPage()` de `html-utils.ts`
- **Nommage** : français pour le métier (`formateur`, `cours`), anglais pour le technique (`request`, `response`)

### Diagramme de flux
```
[Visiteur] ──→ [Landing Page] ──→ [Formulaire CTA]
                                        │
                                        ▼
                               [Lead créé en DB]
                                        │
                                        ▼
                              [Admin reçoit notif]
                                        │
                               ┌────────┴────────┐
                               ▼                  ▼
                     [Rappel téléphone]    [Email booking]
                                                  │
                                                  ▼
                                        [Page booking publique]
                                        [Étudiant choisit créneau]
                                                  │
                                                  ▼
                                    [Booking confirmé + Video room créé]
                                    [Email confirmation avec lien visio]
                                                  │
                               ┌──────────────────┴──────────────────┐
                               ▼                                      ▼
                    [Lien étudiant]                         [Lien admin/tuteur]
                    (permissions guest)                     (permissions owner)
```

---

## 3. Structure du projet

```
callmyprof/
├── src/
│   ├── index.ts                    # Router principal (toutes les routes)
│   ├── pages/                      # Pages HTML SSR (27 fichiers)
│   │   ├── landing.ts              # Landing page publique (hero + CTA)
│   │   ├── booking.ts              # Page booking publique (choix créneau)
│   │   ├── about.ts                # Page "À propos"
│   │   ├── contact.ts              # Page contact
│   │   ├── terms.ts                # CGU
│   │   ├── privacy.ts              # Politique de confidentialité
│   │   ├── faq.ts                  # FAQ
│   │   ├── login.ts                # Page de connexion admin
│   │   ├── onboarding.ts           # Inscription tuteur (4 étapes)
│   │   ├── dashboard.ts            # Tableau de bord admin
│   │   ├── leads-liste.ts          # Liste des leads
│   │   ├── lead-detail.ts          # Détail lead + vidéo
│   │   ├── formateurs-liste.ts     # Liste des tuteurs
│   │   ├── formateur-detail.ts     # Détail tuteur
│   │   ├── familles-liste.ts       # Liste familles/étudiants
│   │   ├── famille-detail.ts       # Détail famille
│   │   ├── famille-form.ts         # Formulaire famille
│   │   ├── catalogue.ts            # Gestion catalogue matières
│   │   ├── cours-liste.ts          # Liste des cours
│   │   ├── cours-detail.ts         # Détail cours
│   │   ├── cours-form.ts           # Formulaire cours
│   │   ├── calendar.ts             # Vue calendrier
│   │   ├── group-classes-liste.ts  # Cours collectifs
│   │   ├── packages.ts             # Gestion packages
│   │   ├── payments.ts             # Suivi paiements
│   │   ├── avis.ts                 # Gestion avis
│   │   └── statistiques.ts         # Statistiques
│   └── api/                        # Logique métier API (16 fichiers)
│       ├── leads.ts                # CRUD leads
│       ├── booking.ts              # Booking + envoi emails
│       ├── daily.ts                # API Daily.co (rooms, tokens)
│       ├── video.ts                # Service vidéo unifié (Daily + Jitsi)
│       ├── formateurs.ts           # Gestion tuteurs
│       ├── onboarding.ts           # Inscription tuteur
│       ├── familles.ts             # Gestion familles
│       ├── catalogue.ts            # CRUD catalogue
│       ├── cours.ts                # Gestion cours
│       ├── calendar.ts             # Créneaux calendrier
│       ├── group-classes.ts        # Cours collectifs
│       ├── packages.ts             # Packages/abonnements
│       ├── payments.ts             # Paiements
│       ├── avis.ts                 # Avis/notes
│       ├── chatbot.ts              # Chatbot Workers AI
│       └── whatsapp.ts             # Webhook WhatsApp
├── shared/                         # Code partagé (11 fichiers)
│   ├── types.ts                    # Interfaces TypeScript (tous les modèles)
│   ├── html-utils.ts               # Layout, sidebar, CSS design system
│   ├── public-layout.ts            # Template pages publiques
│   ├── auth.ts                     # Auth PBKDF2, sessions D1
│   ├── email.ts                    # Service email Resend API
│   ├── utils.ts                    # Utilitaires (ID, slug, pagination)
│   ├── pricing.ts                  # Calculs tarification
│   ├── i18n/
│   │   ├── index.ts                # t(), detectLocale(), htmlAttrs()
│   │   ├── en.ts                   # Traductions anglaises
│   │   ├── fr.ts                   # Traductions françaises
│   │   └── ar.ts                   # Traductions arabes (RTL)
├── migrations/                     # Migrations SQL D1
│   ├── 0001_callmyprof_schema.sql  # Schéma complet
│   ├── 0002_seed_catalogue.sql     # Données catalogue (8 domaines)
│   ├── 0003_missing_tables.sql     # Tables factures, paiements
│   ├── 0004_leads_preferred_language.sql
│   ├── 0005_bookings.sql           # Tokens, bookings, email log
│   └── 0006_video_rooms.sql        # Colonnes vidéo dans bookings
├── wrangler.toml                   # Config Cloudflare Workers
├── tsconfig.json                   # Config TypeScript strict
├── package.json                    # Dependencies
└── .claude/launch.json             # Config serveur de dev
```

---

## 4. Configuration & déploiement

### wrangler.toml
```toml
name = "callmyprof"
main = "src/index.ts"
compatibility_date = "2025-01-01"
account_id = "bc9bdfa814d313ad361e1120f2d57af9"
workers_dev = true

routes = [
  { pattern = "callmyprof.com/*", zone_name = "callmyprof.com" },
  { pattern = "www.callmyprof.com/*", zone_name = "callmyprof.com" }
]

[vars]
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB"
database_name = "callmyprof-db"
database_id = "2294dbe8-f898-4c8c-a8fd-0f62563e19a9"

[[r2_buckets]]
binding = "R2"
bucket_name = "callmyprof-docs"

[ai]
binding = "AI"
```

### Déploiement
```bash
# Dev local
npm run dev                    # wrangler dev → localhost:8787

# Déploiement production
npm run deploy                 # wrangler deploy → callmyprof.com

# Vérification types
npm run typecheck              # tsc --noEmit

# Appliquer une migration
npx wrangler d1 execute callmyprof-db --remote --file=migrations/0006_video_rooms.sql
```

### Premier setup (nouveau déploiement)
```bash
# 1. Installer les dépendances
npm install

# 2. Créer la base de données D1
npx wrangler d1 create callmyprof-db

# 3. Appliquer les migrations (dans l'ordre)
npx wrangler d1 execute callmyprof-db --remote --file=migrations/0001_callmyprof_schema.sql
npx wrangler d1 execute callmyprof-db --remote --file=migrations/0002_seed_catalogue.sql
npx wrangler d1 execute callmyprof-db --remote --file=migrations/0003_missing_tables.sql
npx wrangler d1 execute callmyprof-db --remote --file=migrations/0004_leads_preferred_language.sql
npx wrangler d1 execute callmyprof-db --remote --file=migrations/0005_bookings.sql
npx wrangler d1 execute callmyprof-db --remote --file=migrations/0006_video_rooms.sql

# 4. Créer le bucket R2
npx wrangler r2 bucket create callmyprof-docs

# 5. Configurer les secrets
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put DAILY_API_KEY

# 6. Déployer
npm run deploy

# 7. Créer l'admin (une seule fois)
curl https://callmyprof.com/setup
# → Login: admin@callmyprof.com / admin123
# ⚠️ CHANGER LE MOT DE PASSE IMMÉDIATEMENT
```

---

## 5. Base de données (D1)

### Schéma complet

#### Tables principales

| Table | Description | Colonnes clés |
|-------|-------------|---------------|
| `users` | Comptes admin/système | id, email, password_hash, role, nom, prenom |
| `sessions` | Sessions actives | id, user_id, expires_at |
| `leads` | Pipeline CRM | id, nom, prenom, email, telephone, statut, domaine_id, preferred_language |
| `booking_tokens` | Liens booking one-time | id, lead_id, token, expires_at, used |
| `bookings` | RDV confirmés | id, lead_id, booking_date, booking_time, video_provider, video_room_url |
| `lead_emails` | Log emails envoyés | id, lead_id, type, email_to, resend_id |
| `formateurs` | Profils tuteurs | id, nom, prenom, email, country, tarif_horaire, application_status |
| `parents` | Comptes parents | id, nom, prenom, email, country |
| `eleves` | Profils étudiants | id, parent_id, prenom, niveau, profil_specifique |
| `cours` | Séances de cours | id, formateur_id, thematique_id, date_cours, statut |

#### Tables catalogue

| Table | Description | Nombre |
|-------|-------------|--------|
| `domaines` | Catégories principales | 8 |
| `sous_domaines` | Sous-catégories | 61 |
| `thematiques` | Matières spécifiques | 223 |

Les 8 domaines :
1. Soutien Scolaire
2. Langues Étrangères
3. Musique & Arts
4. Informatique & Tech
5. Arts & Créativité
6. Sport & Bien-être
7. Préparation Concours
8. Accompagnement & Coaching

#### Tables additionnelles

| Table | Description |
|-------|-------------|
| `calendar_slots` | Disponibilités tuteurs |
| `group_classes` | Cours collectifs |
| `group_class_inscriptions` | Inscriptions groupes |
| `packages_types` | Types de packages |
| `packages_achetes` | Packages achetés |
| `contracts` | Contrats tuteurs (non-concurrence) |
| `payments` | Paiements Stripe/PayPal |
| `tutor_payouts` | Versements tuteurs |
| `avis` | Évaluations |
| `messages` | Messagerie interne |
| `chat_conversations` | Conversations chatbot |
| `chat_messages` | Messages chatbot |

### Colonnes vidéo (bookings)
```sql
video_provider TEXT        -- 'daily' ou 'jitsi'
video_room_url TEXT        -- Lien étudiant
video_host_url TEXT        -- Lien admin/tuteur (owner)
video_room_name TEXT       -- Identifiant room
```

---

## 6. Système i18n (EN/FR/AR)

### Architecture
```
shared/i18n/
├── index.ts     # t(), detectLocale(), htmlAttrs()
├── en.ts        # ~300 clés anglaises
├── fr.ts        # ~300 clés françaises
└── ar.ts        # ~300 clés arabes
```

### Détection de locale (priorité)
1. `?lang=fr` → paramètre URL
2. `Cookie: cmp_lang=fr` → cookie (1 an)
3. `request.cf.country` → géolocalisation Cloudflare
4. Défaut → `en`

### Pays par langue
- **Français** : FR, BE, CH, CA, LU, MC, SN, CI, CM, MA, TN, DZ, ML, BF, NE, TD, CG, CD, GA, BJ, TG, MG, HT, MU, RE, GP, MQ
- **Arabe** : LB, SA, AE, QA, KW, BH, OM, JO, IQ, EG, SY, PS, YE, LY, SD, MR
- **Anglais** : tout le reste

### Utilisation
```typescript
import { t, detectLocale, htmlAttrs } from '../shared/i18n/index';

const locale = detectLocale(request); // 'en' | 'fr' | 'ar'
const greeting = t(locale, 'hero.title'); // "Find Your Perfect Tutor"
const attrs = htmlAttrs(locale);  // { lang: 'ar', dir: 'rtl' }
```

### Support RTL (arabe)
```css
[dir="rtl"] .sidebar { right: 0; left: auto; }
[dir="rtl"] .content { margin-right: 260px; margin-left: 0; }
```

---

## 7. Pages publiques

| Route | Fichier | Description |
|-------|---------|-------------|
| `GET /` | `landing.ts` | Page d'accueil : hero rouge, formulaire CTA, "Comment ça marche", tarifs, témoignages |
| `GET /thanks` | `landing.ts` | Page de remerciement après soumission du formulaire |
| `GET /book/:token` | `booking.ts` | Page booking : grille de 7 jours ouvrés + créneaux 30 min (09h-18h) |
| `GET /about` | `about.ts` | Page "À propos" |
| `GET /contact` | `contact.ts` | Page contact |
| `GET /terms` | `terms.ts` | Conditions générales (mention Capleb SAL en section 10) |
| `GET /privacy` | `privacy.ts` | Politique de confidentialité |
| `GET /faq` | `faq.ts` | Questions fréquentes |
| `GET /login` | `login.ts` | Connexion admin |
| `GET /onboarding` | `onboarding.ts` | Inscription tuteur (4 étapes) |
| `GET /health` | `index.ts` | Health check JSON |
| `GET /setup` | `index.ts` | Création admin initial (une seule fois) |

### Landing page — Structure
```
NAVBAR (charcoal, fixe)
  Logo + liens + Switcher langue (EN|FR|AR)

HERO (gradient rouge)
  H1: "Find Your Perfect Tutor"
  H2: "From $15/hour - We call you back within 24h"
  FORMULAIRE CTA :
    Nom, Téléphone (+code pays), Email
    Matière, Niveau, Langue préférée
    Horaire, Type de service
    BOUTON "Request a Callback"

COMMENT ÇA MARCHE (4 étapes visuelles)
MATIÈRES (8 domaines)
TARIFS (3 tiers)
TÉMOIGNAGES
DEVENIR PROF (CTA secondaire)
FOOTER + CHATBOT IA (bulle)
```

---

## 8. Back-office admin

### Design System
```css
--primary: #DC2626       /* Rouge — CTA, accents */
--primary-dark: #B91C1C  /* Rouge foncé — hover */
--charcoal: #1E293B      /* Texte principal */
--charcoal-dark: #0F172A /* Sidebar */
--white: #FFFFFF         /* Fonds */
Font: Inter (Google Fonts)
Sidebar: 260px fixe, gradient charcoal
Cards: border-radius 12px, box-shadow subtil
```

### Sidebar Navigation

**Gestion :**
- 📊 Dashboard → `/dashboard`
- 📞 Leads → `/leads`
- 👨‍🏫 Tutors → `/formateurs`
- 👨‍👩‍👧‍👦 Students → `/familles`
- 📚 Catalogue → `/catalogue`

**Opérations :**
- 📅 Classes → `/cours`
- 👥 Group Classes → `/group-classes`
- 📦 Packages → `/packages`
- 💳 Payments → `/payments`

**Outils :**
- ⭐ Reviews → `/avis`
- 📈 Statistics → `/statistiques`

### Pattern de page admin
```typescript
export function renderMyPage(data: MyData, userName: string): string {
  return htmlPage({
    title: 'Mon titre',
    activePage: 'my-key',     // Highlight sidebar
    extraCss: MY_PAGE_CSS,     // CSS spécifique
    content: `<!-- HTML -->`,
    userName
  });
}
```

---

## 9. API endpoints

### Public (sans auth)

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| `POST` | `/api/leads` | `createLead()` | Créer un lead depuis le formulaire CTA |
| `POST` | `/api/booking` | `submitBooking()` | Confirmer un booking (crée video room) |
| `POST` | `/api/chat` | `handleChat()` | Message chatbot IA |
| `GET` | `/api/catalogue/domaines` | `getCatalogueTree()` | Arbre complet du catalogue |
| `POST` | `/api/onboarding/register` | `registerFormateur()` | Inscription tuteur étape 1 |
| `GET` | `/api/onboarding/:id` | `getOnboardingState()` | État onboarding |
| `PUT` | `/api/onboarding/:id` | `updateOnboarding()` | Mise à jour étape |
| `POST` | `/api/onboarding/:id/documents` | `uploadDocument()` | Upload CV/diplôme |
| `POST` | `/api/onboarding/:id/submit` | `submitOnboarding()` | Soumettre candidature |
| `GET` | `/api/webhooks/whatsapp` | `verifyWhatsAppWebhook()` | Vérification webhook |
| `POST` | `/api/webhooks/whatsapp` | `handleWhatsAppWebhook()` | Message WhatsApp |

### Admin (auth requise)

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| `PUT` | `/api/leads/:id/status` | `updateLeadStatus()` | Changer statut lead |
| `POST` | `/api/leads/:id/send-booking` | `sendBookingInvite()` | Envoyer email booking |
| `PUT` | `/api/formateurs/:id` | `updateFormateur()` | Modifier tuteur |
| `PUT` | `/api/formateurs/:id/status` | `updateFormateurStatus()` | Valider/refuser tuteur |
| `POST` | `/api/familles` | `createFamille()` | Créer famille |
| `POST` | `/api/familles/:id/enfants` | `createEnfant()` | Ajouter enfant |
| `POST` | `/api/catalogue/domaines` | `createDomaine()` | Créer domaine |
| `PUT` | `/api/catalogue/domaines/:id` | `updateDomaine()` | Modifier domaine |
| `POST` | `/api/catalogue/sous-domaines` | `createSousDomaine()` | Créer sous-domaine |
| `POST` | `/api/catalogue/thematiques` | `createThematique()` | Créer thématique |
| `POST` | `/api/catalogue/toggle/:type/:id` | `toggleActif()` | Activer/désactiver |
| `POST` | `/api/cours` | `createCours()` | Créer cours |
| `POST` | `/api/cours/:id/statut` | `updateCoursStatut()` | Changer statut cours |
| `POST` | `/api/cours/:id/terminer` | `terminerCours()` | Terminer cours |
| `POST` | `/api/calendar/slots` | `createSlot()` | Créer créneau |
| `PUT` | `/api/calendar/slots/:id` | `updateSlot()` | Modifier créneau |
| `DELETE` | `/api/calendar/slots/:id` | `deleteSlot()` | Supprimer créneau |
| `POST` | `/api/group-classes` | `createGroupClass()` | Créer cours collectif |
| `PUT` | `/api/group-classes/:id` | `updateGroupClassStatus()` | Modifier statut |
| `POST` | `/api/packages` | `createPackage()` | Créer package |
| `POST` | `/api/packages/types/:id` | `updatePackageType()` | Modifier type |
| `POST` | `/api/payments` | `createPayment()` | Créer paiement |
| `PUT` | `/api/payments/:id` | `updatePaymentStatus()` | Modifier statut |
| `POST` | `/api/avis/:id/toggle` | `toggleAvisVisibility()` | Afficher/masquer avis |

---

## 10. Système de leads (CRM)

### Pipeline
```
NEW → CONTACTED → QUALIFIED → CONVERTED
                                  │
                              ou LOST
```

| Statut | Signification | Action admin |
|--------|---------------|--------------|
| `new` | Formulaire soumis | Rappeler sous 24h |
| `contacted` | Email booking envoyé ou appel fait | Attendre réponse |
| `qualified` | Besoin identifié, RDV pris | Proposer un tuteur |
| `converted` | Paiement reçu, compte créé | Planifier les cours |
| `lost` | Pas de suite | Relance dans 1 mois |

### Création de lead
Le formulaire CTA envoie un `POST /api/leads` avec :
```json
{
  "nom": "Dupont",
  "prenom": "Marie",
  "email": "marie@example.com",
  "telephone": "612345678",
  "country_code": "+33",
  "domaine_id": "abc123",
  "level": "university",
  "preferred_schedule": "Weekday evenings",
  "service_type": "individual",
  "preferred_language": "fr",
  "detected_locale": "fr"
}
```

### Vue admin
- **Liste leads** (`/leads`) : filtres par statut, recherche, tri, pagination
- **Détail lead** (`/leads/:id`) : infos contact, historique, boutons statut, envoi email booking, vidéo sessions

---

## 11. Booking & emails (Resend)

### Configuration
```
Compte Resend   : Capleb SAL
Domaine vérifié : callmyprof.com (DKIM + SPF dans Cloudflare DNS)
Adresse FROM    : CallMyProf <noreply@callmyprof.com>
Reply-to        : contact@callmyprof.com
Secret          : RESEND_API_KEY (wrangler secret)
```

### Flux booking
```
1. Admin clique "Send Booking Invite" dans le CRM
   └→ POST /api/leads/:id/send-booking
      ├── Génère un token unique (UUID)
      ├── Sauvegarde dans booking_tokens (expire 7 jours)
      ├── Envoie email avec lien : callmyprof.com/book/{token}
      ├── Met à jour lead.statut → 'contacted'
      └── Log dans lead_emails

2. Étudiant ouvre le lien → GET /book/{token}
   └→ Affiche grille : 7 prochains jours ouvrés × créneaux 30 min (09h-18h)
      Dimanche exclus, UI adaptée à la langue

3. Étudiant choisit un créneau → POST /api/booking
   └→ Valide le token (non-utilisé, non-expiré)
      ├── Crée le booking en DB
      ├── Crée un video room (Daily.co ou Jitsi)
      ├── Marque le token comme utilisé
      ├── Met à jour lead.statut → 'qualified' + callback_date
      ├── Email confirmation → étudiant (avec lien visio)
      └── Email notification → admin (avec lien host)
```

### Templates email
| Email | Destinataire | Contenu |
|-------|--------------|---------|
| `bookingInviteEmail` | Étudiant | Invitation à prendre RDV (bouton CTA) |
| `bookingConfirmationEmail` | Étudiant | Confirmation RDV + bouton "Rejoindre la visio" |
| `adminBookingNotifEmail` | Admin | Notification nouveau RDV + lien host visio |

Tous les emails sont trilingues (EN/FR/AR) et utilisent un layout HTML responsive.

---

## 12. Vidéo : Daily.co + Jitsi

### Architecture

```
createVideoRoom()
  │
  ├── DAILY_API_KEY configuré ? → Daily.co (primary)
  │   ├── Crée room privée (meeting tokens)
  │   ├── Token étudiant (guest, permissions limitées)
  │   ├── Token admin/tuteur (owner, peut muter/enregistrer)
  │   └── Room auto-expire 2h après la fin du cours
  │
  └── Pas de clé ou erreur ? → Jitsi Meet (fallback)
      ├── Room name aléatoire (non-devinable)
      ├── Config inline (pas de compte requis)
      └── Liens séparés étudiant/admin
```

### Daily.co — Fichier `src/api/daily.ts`

| Fonction | Description |
|----------|-------------|
| `createDailyRoom()` | Crée une room privée avec expiration |
| `createDailyToken()` | Génère un meeting token (owner ou guest) |
| `deleteDailyRoom()` | Supprime une room |
| `getDailyUsage()` | Vérifie les minutes utilisées (free tier: 2000 min/mois) |

### Configuration Daily.co
```
API Key : pk_da67f5f7-08e7-4c22-8c78-65903cc73704
Secret  : DAILY_API_KEY (déjà configuré via wrangler secret)
Dashboard : https://dashboard.daily.co
Free tier : 2000 minutes/mois
```

### Room config (Daily.co)
```json
{
  "name": "cmp-{bookingId8}-{date}",
  "privacy": "private",
  "properties": {
    "nbf": "15 min avant le cours",
    "exp": "2h après la fin",
    "max_participants": 2,
    "enable_chat": true,
    "enable_screenshare": true
  }
}
```

### Anti-démarchage
| Mesure | Daily.co | Jitsi |
|--------|----------|-------|
| Room privée | ✅ Tokens obligatoires | ❌ Lien ouvert |
| Expiration auto | ✅ 2h après cours | ❌ Non |
| Noms masqués | ✅ Prénom uniquement | ✅ Prénom uniquement |
| Lien unique | ✅ Par session | ✅ Par session (aléatoire) |
| Enregistrement | ✅ Possible (owner) | ❌ Non |

### Base de données (bookings)
```sql
video_provider TEXT     -- 'daily' ou 'jitsi'
video_room_url TEXT     -- Lien pour l'étudiant
video_host_url TEXT     -- Lien pour l'admin/tuteur
video_room_name TEXT    -- Nom de la room
```

---

## 13. Onboarding tuteur

### 4 étapes

| Étape | Contenu | Route |
|-------|---------|-------|
| 1 | Informations personnelles (nom, email, téléphone, pays, ville) | `POST /api/onboarding/register` |
| 2 | Compétences (domaines, expérience, bio, tarifs) | `PUT /api/onboarding/:id` |
| 3 | Documents (CV, diplômes, photo) → upload R2 | `POST /api/onboarding/:id/documents` |
| 4 | Contrat de non-concurrence (signature électronique) | `POST /api/onboarding/:id/submit` |

### Statuts tuteur
```
draft → submitted → en_attente → valide
                               → refuse
                               → suspendu
```

---

## 14. Chatbot IA (Workers AI)

### Configuration
```
Binding  : AI (dans wrangler.toml)
Modèle   : @cf/meta/llama-3.1-8b-instruct
Endpoint : POST /api/chat
```

### Comportement
- Répond dans la langue du visiteur (détecté automatiquement)
- Contexte système : FAQ CallMyProf, tarifs, matières disponibles
- Fallback : "Un conseiller vous rappellera" si question trop complexe
- Historique de conversation stocké en DB (`chat_conversations` + `chat_messages`)

---

## 15. WhatsApp Business API

### Endpoints
| Route | Description |
|-------|-------------|
| `GET /api/webhooks/whatsapp` | Vérification webhook (Meta) |
| `POST /api/webhooks/whatsapp` | Réception messages entrants |

### Secrets nécessaires
```bash
npx wrangler secret put WHATSAPP_TOKEN
npx wrangler secret put WHATSAPP_PHONE_ID
```

---

## 16. Sécurité & authentification

### Auth admin
- **Hachage** : PBKDF2 avec Web Crypto API (salt 16 bytes, 100K itérations, SHA-256)
- **Sessions** : stockées en D1, cookie `cmp_session` (HttpOnly, Secure, SameSite=Strict)
- **Expiration** : session expire après 24h
- **Middleware** : `requireAuth()` vérifie la session avant chaque route admin

### Protection
- HTTPS forcé (Cloudflare)
- Protection DDoS native (Cloudflare)
- Tokens booking à usage unique + expiration 7 jours
- API keys en secrets Cloudflare (jamais dans le code)
- Rooms Daily.co privées (meeting tokens obligatoires)

### Admin par défaut
```
Email     : admin@callmyprof.com
Password  : admin123
⚠️ CHANGER IMMÉDIATEMENT APRÈS LE PREMIER LOGIN
```

---

## 17. Secrets & variables d'environnement

### Secrets Cloudflare (wrangler secret)

| Secret | Statut | Usage |
|--------|--------|-------|
| `RESEND_API_KEY` | ⏳ À configurer | Envoi d'emails (Resend API) |
| `DAILY_API_KEY` | ✅ Configuré | Visioconférence Daily.co |
| `STRIPE_SECRET_KEY` | ⏳ À configurer | Paiements Stripe |
| `STRIPE_WEBHOOK_SECRET` | ⏳ À configurer | Webhooks Stripe |
| `PAYPAL_CLIENT_ID` | ⏳ À configurer | Paiements PayPal |
| `PAYPAL_SECRET` | ⏳ À configurer | Paiements PayPal |
| `WHATSAPP_TOKEN` | ⏳ À configurer | WhatsApp Business API |
| `WHATSAPP_PHONE_ID` | ⏳ À configurer | WhatsApp Business API |

### Variables publiques (wrangler.toml [vars])

| Variable | Valeur |
|----------|--------|
| `ENVIRONMENT` | `production` |

---

## 18. Roadmap

### ✅ Terminé (MVP)
- [x] Landing page trilingue (EN/FR/AR) + détection géo
- [x] Formulaire CTA (8 domaines, 61 sous-domaines, 223 thématiques)
- [x] Support RTL arabe
- [x] CRM Admin complet (leads, détails, suivi)
- [x] Système de booking (tokens, page publique, emails)
- [x] Vidéo automatique (Daily.co + Jitsi fallback)
- [x] Onboarding tuteur 4 étapes
- [x] Gestion formateurs, familles, élèves, cours
- [x] Chatbot IA (Workers AI)
- [x] Catalogue matières complet
- [x] Pages légales (CGU avec Capleb SAL, Privacy)
- [x] Domaine callmyprof.com en ligne

### 🔜 Phase 1 — Paiements (priorité haute)
- [ ] Intégration Stripe Checkout
- [ ] Webhooks Stripe pour confirmation
- [ ] Intégration PayPal (alternatif)
- [ ] Page paiement admin

### 📋 Phase 2 — Factures
- [ ] Génération factures PDF
- [ ] Envoi automatique par email
- [ ] Numérotation séquentielle

### 📹 Phase 3 — Sessions améliorées
- [ ] Rappel automatique 1h avant le cours (email + WhatsApp)
- [ ] Enregistrement des sessions (Daily.co cloud recording)
- [ ] Feedback post-session automatique

### 👤 Phase 4 — Portail étudiant
- [ ] Espace étudiant `/student`
- [ ] Voir ses cours planifiés/passés
- [ ] Accéder aux factures
- [ ] Rejoindre la visio en un clic

### 👥 Phase 5 — Cours collectifs
- [ ] Inscription avec places limitées
- [ ] Tarification group ($8/h)
- [ ] Gestion des groupes dans le back-office

### 🔔 Phase 6 — Notifications
- [ ] Bot Discord pour notifications admin
- [ ] Widget WhatsApp sur landing page
- [ ] Webhook WhatsApp Business API

### 🔐 Phase 7 — Sécurité avancée
- [ ] MFA admin (TOTP — Google Authenticator)
- [ ] Rate limiting API
- [ ] Audit log des actions admin

---

## 19. Commandes utiles

```bash
# Développement
npm run dev                    # Serveur local → localhost:8787
npm run typecheck              # Vérification TypeScript
npm run deploy                 # Déployer en production

# Base de données
npx wrangler d1 execute callmyprof-db --remote --command "SELECT COUNT(*) FROM leads"
npx wrangler d1 execute callmyprof-db --remote --file=migrations/XXXX.sql
npx wrangler d1 execute callmyprof-db --local --command "SELECT * FROM users"

# Secrets
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put DAILY_API_KEY
npx wrangler secret list

# Logs production
npx wrangler tail                # Logs temps réel

# R2 Storage
npx wrangler r2 object list callmyprof-docs
npx wrangler r2 object get callmyprof-docs/path/to/file

# Tests rapides
curl https://callmyprof.com/health
curl -X POST https://callmyprof.com/api/leads -H "Content-Type: application/json" -d '{"nom":"Test","prenom":"Lead","email":"test@test.com","telephone":"123456","country_code":"+33"}'
```

---

> **Contacts**
> - Admin : admin@callmyprof.com
> - Emails sortants : noreply@callmyprof.com (via Resend / compte Capleb)
> - Reply-to : contact@callmyprof.com
> - Cloudflare Account : samirdawaliby@gmail.com (`bc9bdfa814d313ad361e1120f2d57af9`)
