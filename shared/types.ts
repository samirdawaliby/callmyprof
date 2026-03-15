/**
 * CallMyProf - TypeScript types
 */

import type { Locale } from './i18n/index';

// ============================================
// Environment
// ============================================

export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  AI: Ai;
  ENVIRONMENT: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_SECRET?: string;
  WHATSAPP_TOKEN?: string;
  WHATSAPP_PHONE_ID?: string;
}

// ============================================
// Enums
// ============================================

export type Role = 'admin' | 'parent' | 'formateur' | 'eleve';

export type StatutFormateur = 'draft' | 'submitted' | 'en_attente' | 'valide' | 'refuse' | 'suspendu';

export type StatutCours = 'planifie' | 'confirme' | 'en_cours' | 'termine' | 'annule';

export type TypeCours = 'individuel' | 'collectif';

export type StatutPackage = 'actif' | 'expire' | 'epuise' | 'rembourse';

export type ProfilSpecifique = 'standard' | 'dys' | 'tdah' | 'hpi';

export type StatutLead = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export type ServiceType = 'individual' | 'group' | 'online';

export type PaymentMethod = 'stripe' | 'paypal' | 'cash' | 'bank_transfer';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type ContractStatus = 'pending' | 'signed' | 'expired' | 'terminated';

export type CalendarSlotType = 'available' | 'booked' | 'blocked';

export type GroupClassStatus = 'ouvert' | 'complet' | 'en_cours' | 'termine' | 'annule';

// ============================================
// Models
// ============================================

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: Role;
  nom: string;
  prenom: string;
  telephone?: string;
  avatar_url?: string;
  preferred_language?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Lead {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  country_code: string;
  domaine_id?: string;
  subject_description?: string;
  level?: string;
  preferred_schedule?: string;
  service_type: ServiceType;
  statut: StatutLead;
  callback_date?: string;
  callback_notes?: string;
  assigned_admin_id?: string;
  converted_parent_id?: string;
  country?: string;
  detected_locale: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  created_at: string;
  updated_at: string;
}

export interface Formateur {
  id: string;
  user_id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  ville: string;
  country: string;
  code_postal?: string;
  rayon_km: number;
  photo_url?: string;
  preferred_language: string;
  timezone: string;
  bio?: string;
  diplomes?: string;
  experience_annees: number;
  tarif_horaire_individuel?: number;
  tarif_horaire_collectif?: number;
  currency: string;
  accepte_domicile: number;
  accepte_collectif: number;
  accepte_visio: number;
  lieu_collectif?: string;
  r2_folder?: string;
  doc_identite_url?: string;
  doc_diplomes_url?: string;
  doc_cv_url?: string;
  doc_casier_url?: string;
  doc_rib_url?: string;
  iban?: string;
  contract_signed: number;
  non_compete_signed: number;
  contract_pdf_url?: string;
  signature_url?: string;
  date_signature?: string;
  onboarding_step: number;
  application_status: StatutFormateur;
  note_moyenne: number;
  nb_avis: number;
  nb_heures_total: number;
  admin_notes?: string;
  validated_by?: string;
  validated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  formateur_id: string;
  type: 'freelance' | 'employment';
  non_compete_clause: number;
  non_compete_duration_months: number;
  commission_rate: number;
  signed_at?: string;
  signature_url?: string;
  pdf_url?: string;
  ip_address?: string;
  statut: ContractStatus;
  expires_at?: string;
  created_at: string;
}

export interface Parent {
  id: string;
  user_id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  ville: string;
  country: string;
  code_postal?: string;
  preferred_language: string;
  source: string;
  created_at: string;
}

export interface Eleve {
  id: string;
  parent_id?: string;
  user_id?: string;
  prenom: string;
  nom?: string;
  date_naissance?: string;
  niveau?: string;
  profil_specifique: ProfilSpecifique;
  preferred_language: string;
  notes_pedagogiques?: string;
  created_at: string;
}

export interface Domaine {
  id: string;
  nom: string;
  nom_en?: string;
  nom_ar?: string;
  icone?: string;
  description?: string;
  ordre: number;
  actif: number;
}

export interface SousDomaine {
  id: string;
  domaine_id: string;
  nom: string;
  nom_en?: string;
  nom_ar?: string;
  icone?: string;
  description?: string;
  ordre: number;
  actif: number;
}

export interface Thematique {
  id: string;
  sous_domaine_id: string;
  nom: string;
  nom_en?: string;
  nom_ar?: string;
  description?: string;
  niveau_min?: string;
  ordre: number;
  actif: number;
}

export interface PackageType {
  id: string;
  nom: string;
  nom_en?: string;
  nom_ar?: string;
  type_cours: TypeCours | 'mixte';
  nb_heures: number;
  prix: number;
  prix_par_heure: number;
  currency: string;
  duree_validite_jours: number;
  max_eleves_collectif: number;
  actif: number;
  ordre: number;
}

export interface PackageAchete {
  id: string;
  parent_id?: string;
  eleve_id: string;
  package_type_id: string;
  thematiques: string;
  heures_total: number;
  heures_utilisees: number;
  heures_restantes: number;
  montant_paye: number;
  currency: string;
  date_achat: string;
  date_expiration: string;
  statut: StatutPackage;
  stripe_payment_id?: string;
  paypal_payment_id?: string;
  created_at: string;
}

export interface Cours {
  id: string;
  formateur_id: string;
  thematique_id: string;
  type_cours: TypeCours;
  titre?: string;
  description?: string;
  date_cours: string;
  heure_debut: string;
  duree_minutes: number;
  max_eleves: number;
  lieu?: string;
  is_online: number;
  meeting_url?: string;
  statut: StatutCours;
  notes_formateur?: string;
  created_at: string;
}

export interface CalendarSlot {
  id: string;
  formateur_id: string;
  date_slot: string;
  heure_debut: string;
  heure_fin: string;
  type: CalendarSlotType;
  cours_id?: string;
  is_group_slot: number;
  max_students: number;
  current_students: number;
  recurring_rule?: string;
  created_at: string;
}

export interface GroupClass {
  id: string;
  formateur_id: string;
  thematique_id: string;
  titre: string;
  description?: string;
  date_debut: string;
  heure_debut: string;
  duree_minutes: number;
  recurrence: 'once' | 'weekly' | 'biweekly';
  nb_seances: number;
  max_eleves: number;
  min_eleves: number;
  inscrits: number;
  prix_par_eleve: number;
  prix_par_seance?: number;
  currency: string;
  statut: GroupClassStatus;
  lieu?: string;
  is_online: number;
  meeting_url?: string;
  niveau?: string;
  langue: string;
  created_at: string;
}

export interface Payment {
  id: string;
  parent_id?: string;
  lead_id?: string;
  amount: number;
  currency: string;
  description?: string;
  method: PaymentMethod;
  stripe_payment_id?: string;
  paypal_payment_id?: string;
  statut: PaymentStatus;
  created_at: string;
}

export interface TutorPayout {
  id: string;
  formateur_id: string;
  period_start: string;
  period_end: string;
  hours_worked: number;
  gross_amount: number;
  commission: number;
  net_amount: number;
  currency: string;
  statut: 'pending' | 'paid' | 'failed';
  paid_at?: string;
  created_at: string;
}

export interface Avis {
  id: string;
  eleve_id: string;
  formateur_id: string;
  cours_id?: string;
  note: number;
  commentaire?: string;
  visible: number;
  created_at: string;
}

export interface Message {
  id: string;
  expediteur_id: string;
  destinataire_id: string;
  sujet?: string;
  contenu: string;
  lu: number;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  lead_id?: string;
  visitor_ip?: string;
  locale: string;
  channel: 'web' | 'whatsapp';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}
