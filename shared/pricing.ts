/**
 * CallMyProf - Pricing & Calculations
 * Tarifs, packages, credit d'impot, price formatting
 */

// ============================================================================
// TARIFS
// ============================================================================

export const TARIFS = {
  individuel: {
    tarif_horaire: 36,
    tarif_formateur: 22,
    eligible_credit_impot: true,
    taux_credit_impot: 0.5,
    description: 'Cours individuel a domicile',
  },
  collectif: {
    tarif_horaire_par_eleve: 15,
    tarif_formateur_horaire: 30,
    max_eleves: 6,
    eligible_credit_impot: false,
    taux_credit_impot: 0,
    description: 'Cours collectif (6 eleves max)',
  },
  marge: {
    individuel: 0.39, // 39% de marge sur individuel
    collectif: 0.67,  // 67% de marge sur collectif (a plein)
  },
} as const;

// ============================================================================
// PACKAGES
// ============================================================================

export interface PackageDefinition {
  id: string;
  nom: string;
  type_cours: 'individuel' | 'collectif' | 'mixte';
  nb_heures: number;
  prix: number;
  prix_par_heure: number;
  eligible_credit_impot: boolean;
  duree_validite_jours: number;
  max_eleves_collectif: number;
  description: string;
  tag?: string;
}

export const PACKAGES: PackageDefinition[] = [
  {
    id: 'decouverte',
    nom: 'D\u{00E9}couverte',
    type_cours: 'individuel',
    nb_heures: 1,
    prix: 36,
    prix_par_heure: 36,
    eligible_credit_impot: true,
    duree_validite_jours: 30,
    max_eleves_collectif: 1,
    description: 'S\u{00E9}ance d\u{00E9}couverte pour tester le service',
  },
  {
    id: 'essentiel',
    nom: 'Essentiel',
    type_cours: 'individuel',
    nb_heures: 5,
    prix: 170,
    prix_par_heure: 34,
    eligible_credit_impot: true,
    duree_validite_jours: 90,
    max_eleves_collectif: 1,
    description: 'Suivi r\u{00E9}gulier pour progresser',
  },
  {
    id: 'confort',
    nom: 'Confort',
    type_cours: 'individuel',
    nb_heures: 10,
    prix: 320,
    prix_par_heure: 32,
    eligible_credit_impot: true,
    duree_validite_jours: 180,
    max_eleves_collectif: 1,
    description: 'Accompagnement complet sur la dur\u{00E9}e',
    tag: 'Populaire',
  },
  {
    id: 'intensif',
    nom: 'Intensif',
    type_cours: 'individuel',
    nb_heures: 20,
    prix: 600,
    prix_par_heure: 30,
    eligible_credit_impot: true,
    duree_validite_jours: 365,
    max_eleves_collectif: 1,
    description: 'Pr\u{00E9}paration intensive examens ou rattrapage',
    tag: 'Meilleur prix',
  },
  {
    id: 'collectif-10h',
    nom: 'Collectif 10h',
    type_cours: 'collectif',
    nb_heures: 10,
    prix: 120,
    prix_par_heure: 12,
    eligible_credit_impot: false,
    duree_validite_jours: 180,
    max_eleves_collectif: 6,
    description: 'Cours en petit groupe (6 \u{00E9}l\u{00E8}ves max)',
  },
];

// ============================================================================
// CALCULATIONS
// ============================================================================

export interface CreditImpotResult {
  brut: number;
  credit: number;
  resteACharge: number;
}

/**
 * Calcule le credit d'impot 50% et le reste a charge
 */
export function calculateCreditImpot(
  montant: number,
  eligible: boolean
): CreditImpotResult {
  const credit = eligible ? Math.round(montant * 0.5 * 100) / 100 : 0;
  return {
    brut: Math.round(montant * 100) / 100,
    credit,
    resteACharge: Math.round((montant - credit) * 100) / 100,
  };
}

export interface PackagePriceResult {
  prix: number;
  prixParHeure: number;
  creditImpot: number;
  resteACharge: number;
  economie: number;
  economiePourcent: number;
}

/**
 * Calcule le prix complet d'un package avec credit d'impot
 */
export function calculatePackagePrice(packageId: string): PackagePriceResult {
  const pkg = PACKAGES.find(p => p.id === packageId);
  if (!pkg) {
    return {
      prix: 0,
      prixParHeure: 0,
      creditImpot: 0,
      resteACharge: 0,
      economie: 0,
      economiePourcent: 0,
    };
  }

  const { brut, credit, resteACharge } = calculateCreditImpot(
    pkg.prix,
    pkg.eligible_credit_impot
  );

  // Economie par rapport au tarif plein (36 EUR/h individuel)
  const tarifPlein = pkg.type_cours === 'collectif'
    ? pkg.nb_heures * TARIFS.collectif.tarif_horaire_par_eleve
    : pkg.nb_heures * TARIFS.individuel.tarif_horaire;
  const economie = Math.max(0, tarifPlein - pkg.prix);
  const economiePourcent = tarifPlein > 0 ? Math.round((economie / tarifPlein) * 100) : 0;

  return {
    prix: brut,
    prixParHeure: pkg.prix_par_heure,
    creditImpot: credit,
    resteACharge,
    economie,
    economiePourcent,
  };
}

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Formate un montant en euros format francais : "36,00 \u20AC"
 */
export function formatPrix(montant: number): string {
  return montant.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' \u20AC';
}

/**
 * Formate un taux horaire : "36,00 \u20AC/h"
 */
export function formatTarifHoraire(montant: number): string {
  return formatPrix(montant).replace(' \u20AC', ' \u20AC/h');
}

/**
 * Retourne le libelle lisible d'un type de cours
 */
export function labelTypeCours(type: string): string {
  switch (type) {
    case 'individuel': return 'Individuel';
    case 'collectif': return 'Collectif';
    case 'mixte': return 'Mixte';
    default: return type;
  }
}

/**
 * Retourne le package par son ID
 */
export function getPackageById(id: string): PackageDefinition | undefined {
  return PACKAGES.find(p => p.id === id);
}
