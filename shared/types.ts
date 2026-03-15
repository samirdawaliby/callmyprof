/**
 * Soutien Scolaire Caplogy - Types TypeScript
 */

// ============================================
// Environment
// ============================================

export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  AI: Ai;
  ENVIRONMENT: string;
}

// ============================================
// Enums
// ============================================

export type Role = 'admin' | 'parent' | 'formateur' | 'eleve';

export type StatutFormateur = 'draft' | 'submitted' | 'en_attente' | 'valide' | 'refuse' | 'suspendu';

export type StatutCours = 'planifie' | 'confirme' | 'en_cours' | 'termine' | 'annule';

export type TypeCours = 'individuel' | 'collectif';

export type StatutFacture = 'brouillon' | 'emise' | 'payee' | 'echec' | 'remboursee' | 'avoir';

export type StatutPackage = 'actif' | 'expire' | 'epuise' | 'rembourse';

export type ProfilSpecifique = 'standard' | 'dys' | 'tdah' | 'hpi';

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
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Formateur {
  id: string;
  user_id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  ville: string;
  code_postal?: string;
  rayon_km: number;
  photo_url?: string;
  bio?: string;
  diplomes?: string; // JSON array
  experience_annees: number;
  tarif_horaire_individuel?: number;
  tarif_horaire_collectif?: number;
  accepte_domicile: number;
  accepte_collectif: number;
  accepte_visio: number;
  lieu_collectif?: string;
  r2_folder?: string;
  // Documents (step 3)
  doc_identite_url?: string;
  doc_diplomes_url?: string;
  doc_siret_url?: string;
  doc_urssaf_url?: string;
  doc_casier_url?: string;
  doc_rib_url?: string;
  doc_cv_url?: string;
  iban?: string;
  siret?: string;
  // Validation (step 4)
  signature_url?: string;
  cgv_acceptees?: number;
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

export interface Parent {
  id: string;
  user_id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  ville: string;
  code_postal: string;
  urssaf_compte_actif: number;
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
  notes_pedagogiques?: string;
  created_at: string;
}

export interface Domaine {
  id: string;
  nom: string;
  icone?: string;
  description?: string;
  ordre: number;
  actif: number;
}

export interface SousDomaine {
  id: string;
  domaine_id: string;
  nom: string;
  icone?: string;
  description?: string;
  ordre: number;
  actif: number;
}

export interface Thematique {
  id: string;
  sous_domaine_id: string;
  nom: string;
  description?: string;
  niveau_min?: string;
  ordre: number;
  actif: number;
}

export interface PackageType {
  id: string;
  nom: string;
  type_cours: TypeCours | 'mixte';
  nb_heures: number;
  prix: number;
  prix_par_heure: number;
  eligible_credit_impot: number;
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
  thematiques: string; // JSON array
  heures_total: number;
  heures_utilisees: number;
  heures_restantes: number;
  montant_paye: number;
  credit_impot: number;
  date_achat: string;
  date_expiration: string;
  statut: StatutPackage;
  stripe_payment_id?: string;
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
  statut: StatutCours;
  notes_formateur?: string;
  created_at: string;
}

export interface Facture {
  id: string;
  parent_id: string;
  reference: string;
  type: 'package' | 'mensuelle' | 'avoir';
  date_emission: string;
  date_realisation?: string;
  periode_mois?: string;
  montant_brut: number;
  credit_impot: number;
  reste_a_charge: number;
  numero_sap?: string;
  eligible_credit_impot: number;
  avance_immediate: number;
  statut: StatutFacture;
  mode_paiement?: string;
  stripe_payment_id?: string;
  pdf_url?: string;
  notes?: string;
  created_at: string;
}

export interface FactureLigne {
  id: string;
  facture_id: string;
  cours_id?: string;
  description: string;
  intervenant_id?: string;
  intervenant_numero?: string;
  date_prestation?: string;
  quantite: number;
  prix_unitaire: number;
  montant: number;
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
