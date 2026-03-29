/**
 * CallMyProf - AI Matching Algorithm
 * Matches students with the best tutors based on subjects, location, availability, and AI compatibility
 */

import type { Env } from '../../shared/types';
import { jsonResponse, errorResponse } from '../../shared/utils';

// ============================================================================
// TYPES
// ============================================================================

interface MatchResult {
  formateur_id: string;
  nom: string;
  prenom: string;
  photo_url: string | null;
  ville: string;
  score: number;
  match_reasons: string[];
  shared_thematiques: string[];
  tarif_individuel: number | null;
  tarif_collectif: number | null;
  currency: string;
  note_moyenne: number;
  nb_avis: number;
  experience_annees: number;
  accepte_domicile: number;
  accepte_collectif: number;
  accepte_visio: number;
  bio: string | null;
  ai_explanation?: string;
}

interface StudentData {
  id: string;
  prenom: string;
  nom: string | null;
  niveau: string | null;
  profil_specifique: string;
  preferred_language: string;
  notes_pedagogiques: string | null;
  parent_ville: string | null;
  parent_cp: string | null;
  parent_language: string | null;
  thematique_ids: string[];
  thematique_noms: string[];
}

// ============================================================================
// WEIGHTS
// ============================================================================

const WEIGHTS = {
  thematiques: 30,
  rating: 20,
  experience: 15,
  price: 15,
  language: 10,
  availability: 10,
};

// ============================================================================
// MAIN MATCHING FUNCTION
// ============================================================================

export async function matchFormateurs(env: Env, eleveId: string): Promise<Response> {
  // 1. Fetch student data
  const student = await getStudentData(env, eleveId);
  if (!student) {
    return errorResponse('Student not found', 404);
  }

  if (student.thematique_ids.length === 0) {
    return jsonResponse({ matches: [], message: 'Student has no thematiques assigned. Please add subjects first.' });
  }

  // 2. Find candidate tutors (validated, with shared thematiques)
  const candidates = await findCandidates(env, student);

  if (candidates.length === 0) {
    return jsonResponse({ matches: [], message: 'No matching tutors found for these subjects.' });
  }

  // 3. Score candidates
  const scored = scoreCandidates(candidates, student);

  // 4. AI enhancement for top 10
  const top10 = scored.slice(0, 10);
  const enhanced = await aiEnhance(env, student, top10);

  return jsonResponse({
    student: {
      id: student.id,
      prenom: student.prenom,
      nom: student.nom,
      thematiques: student.thematique_noms,
      profil_specifique: student.profil_specifique,
    },
    matches: enhanced,
    total_candidates: candidates.length,
  });
}

// ============================================================================
// DATA FETCHING
// ============================================================================

async function getStudentData(env: Env, eleveId: string): Promise<StudentData | null> {
  const eleve = await env.DB.prepare(`
    SELECT e.id, e.prenom, e.nom, e.niveau, e.profil_specifique, e.preferred_language, e.notes_pedagogiques,
           p.ville as parent_ville, p.code_postal as parent_cp, p.preferred_language as parent_language
    FROM eleves e
    LEFT JOIN parents p ON p.id = e.parent_id
    WHERE e.id = ?
  `).bind(eleveId).first<any>();

  if (!eleve) return null;

  const thematiques = await env.DB.prepare(`
    SELECT et.thematique_id, t.nom
    FROM eleve_thematiques et
    JOIN thematiques t ON t.id = et.thematique_id
    WHERE et.eleve_id = ?
    ORDER BY et.priorite ASC
  `).bind(eleveId).all<{ thematique_id: string; nom: string }>();

  return {
    ...eleve,
    thematique_ids: thematiques.results.map(t => t.thematique_id),
    thematique_noms: thematiques.results.map(t => t.nom),
  };
}

interface CandidateRow {
  id: string;
  nom: string;
  prenom: string;
  photo_url: string | null;
  ville: string;
  bio: string | null;
  experience_annees: number;
  tarif_horaire_individuel: number | null;
  tarif_horaire_collectif: number | null;
  currency: string;
  note_moyenne: number;
  nb_avis: number;
  preferred_language: string;
  accepte_domicile: number;
  accepte_collectif: number;
  accepte_visio: number;
  shared_thematiques: string;
  shared_count: number;
}

async function findCandidates(env: Env, student: StudentData): Promise<CandidateRow[]> {
  const placeholders = student.thematique_ids.map(() => '?').join(',');

  const result = await env.DB.prepare(`
    SELECT f.id, f.nom, f.prenom, f.photo_url, f.ville, f.bio,
           f.experience_annees, f.tarif_horaire_individuel, f.tarif_horaire_collectif,
           f.currency, f.note_moyenne, f.nb_avis, f.preferred_language,
           f.accepte_domicile, f.accepte_collectif, f.accepte_visio,
           GROUP_CONCAT(DISTINCT t.nom) as shared_thematiques,
           COUNT(DISTINCT ft.thematique_id) as shared_count
    FROM formateurs f
    JOIN formateur_thematiques ft ON ft.formateur_id = f.id
    JOIN thematiques t ON t.id = ft.thematique_id
    WHERE f.application_status = 'valide'
      AND ft.thematique_id IN (${placeholders})
    GROUP BY f.id
    ORDER BY shared_count DESC, f.note_moyenne DESC
    LIMIT 50
  `).bind(...student.thematique_ids).all<CandidateRow>();

  return result.results;
}

// ============================================================================
// SCORING
// ============================================================================

function scoreCandidates(candidates: CandidateRow[], student: StudentData): MatchResult[] {
  const totalThematiques = student.thematique_ids.length;

  // Compute averages for normalization
  const avgTarif = candidates.reduce((sum, c) => sum + (c.tarif_horaire_individuel || 0), 0) / candidates.length || 1;
  const maxExp = Math.max(...candidates.map(c => c.experience_annees), 1);

  const results: MatchResult[] = candidates.map(c => {
    const reasons: string[] = [];

    // 1. Thematiques overlap (30%)
    const thematiquesScore = (c.shared_count / totalThematiques) * 100;
    if (c.shared_count === totalThematiques) reasons.push(`All ${totalThematiques} subjects matched`);
    else reasons.push(`${c.shared_count}/${totalThematiques} subjects matched`);

    // 2. Rating (20%) - weighted by review count for credibility
    const credibility = Math.min(c.nb_avis / 10, 1); // Full credibility at 10+ reviews
    const ratingScore = c.note_moyenne > 0 ? (c.note_moyenne / 5) * 100 * credibility : 50; // Default 50 if no reviews
    if (c.note_moyenne >= 4.5 && c.nb_avis >= 5) reasons.push(`Top rated (${c.note_moyenne}/5, ${c.nb_avis} reviews)`);

    // 3. Experience (15%)
    const expScore = (Math.min(c.experience_annees, maxExp) / maxExp) * 100;
    if (c.experience_annees >= 5) reasons.push(`${c.experience_annees} years experience`);

    // 4. Price competitiveness (15%) - lower = better relative to average
    const tarif = c.tarif_horaire_individuel || avgTarif;
    const priceScore = Math.max(0, Math.min(100, (1 - (tarif - avgTarif * 0.5) / (avgTarif * 1.5)) * 100));

    // 5. Language match (10%)
    const studentLang = student.preferred_language || student.parent_language || 'fr';
    const langScore = c.preferred_language === studentLang ? 100 : 30;
    if (c.preferred_language === studentLang) reasons.push(`Speaks ${studentLang.toUpperCase()}`);

    // 6. Availability placeholder (10%) - could be enhanced with schedule matching
    const availScore = 60; // Base score, enhanced later if we have student schedule preferences

    // Weighted total
    const score = Math.round(
      (thematiquesScore * WEIGHTS.thematiques +
       ratingScore * WEIGHTS.rating +
       expScore * WEIGHTS.experience +
       priceScore * WEIGHTS.price +
       langScore * WEIGHTS.language +
       availScore * WEIGHTS.availability) / 100
    );

    return {
      formateur_id: c.id,
      nom: c.nom,
      prenom: c.prenom,
      photo_url: c.photo_url,
      ville: c.ville,
      score: Math.min(score, 100),
      match_reasons: reasons,
      shared_thematiques: c.shared_thematiques ? c.shared_thematiques.split(',') : [],
      tarif_individuel: c.tarif_horaire_individuel,
      tarif_collectif: c.tarif_horaire_collectif,
      currency: c.currency,
      note_moyenne: c.note_moyenne,
      nb_avis: c.nb_avis,
      experience_annees: c.experience_annees,
      accepte_domicile: c.accepte_domicile,
      accepte_collectif: c.accepte_collectif,
      accepte_visio: c.accepte_visio,
      bio: c.bio,
    };
  });

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results;
}

// ============================================================================
// AI ENHANCEMENT
// ============================================================================

async function aiEnhance(env: Env, student: StudentData, candidates: MatchResult[]): Promise<MatchResult[]> {
  if (candidates.length === 0) return candidates;

  // Build context for AI
  const studentDesc = [
    `Student: ${student.prenom}`,
    student.niveau ? `Level: ${student.niveau}` : null,
    student.profil_specifique !== 'standard' ? `Special profile: ${student.profil_specifique.toUpperCase()}` : null,
    student.notes_pedagogiques ? `Pedagogical notes: ${student.notes_pedagogiques}` : null,
    `Subjects needed: ${student.thematique_noms.join(', ')}`,
  ].filter(Boolean).join('. ');

  const tutorsDesc = candidates.map((c, i) =>
    `${i + 1}. ${c.prenom} ${c.nom} (Score: ${c.score}) - Bio: ${c.bio || 'No bio'} - Exp: ${c.experience_annees}y - Subjects: ${c.shared_thematiques.join(', ')}`
  ).join('\n');

  try {
    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8' as any, {
      messages: [
        {
          role: 'system',
          content: `You are a tutoring matching assistant. Given a student profile and ranked tutor candidates, provide a brief 1-sentence explanation for each tutor about why they are a good match. Focus on pedagogical fit, especially for students with special profiles (DYS, TDAH, HPI). Respond ONLY with a JSON array of objects: [{"index": 0, "explanation": "..."}]. No markdown, no extra text.`
        },
        {
          role: 'user',
          content: `${studentDesc}\n\nTutor candidates:\n${tutorsDesc}`
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    }) as { response?: string };

    if (result.response) {
      // Extract JSON from response
      const jsonMatch = result.response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const explanations = JSON.parse(jsonMatch[0]) as Array<{ index: number; explanation: string }>;
        for (const exp of explanations) {
          if (exp.index >= 0 && exp.index < candidates.length && exp.explanation) {
            candidates[exp.index].ai_explanation = exp.explanation;
          }
        }
      }
    }
  } catch (e) {
    // AI enhancement is optional - don't fail the whole matching
    console.error('AI matching enhancement error:', e);
  }

  return candidates;
}
