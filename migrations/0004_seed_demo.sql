-- ============================================
-- SOUTIEN SCOLAIRE CAPLOGY - Seed Demo Data
-- Migration 0004 : Donnees de demonstration
-- INSERT OR IGNORE pour idempotence
-- ============================================

-- ============================================
-- 1. ADMIN USER
-- ============================================
-- Password hash placeholder for "admin123" - will be set properly via auth module
-- Using a dummy PBKDF2 hash format as placeholder

INSERT OR IGNORE INTO users (id, email, password_hash, role, nom, prenom, telephone, created_at) VALUES
  ('admin-001',
   's.dawaliby@caplogy.com',
   '$pbkdf2$placeholder$admin123_hash_to_be_set_properly',
   'admin',
   'Dawaliby',
   'Sam',
   '+33612345678',
   '2026-01-01 00:00:00');


-- ============================================
-- 2. FORMATEURS (3 validated)
-- ============================================

-- Formateur users
INSERT OR IGNORE INTO users (id, email, password_hash, role, nom, prenom, telephone, created_at) VALUES
  ('user-fmt-001',
   'marie.dupont@email.com',
   '$pbkdf2$placeholder$demo_hash',
   'formateur',
   'Dupont',
   'Marie',
   '+33698765432',
   '2026-01-15 10:00:00'),
  ('user-fmt-002',
   'karim.benali@email.com',
   '$pbkdf2$placeholder$demo_hash',
   'formateur',
   'Benali',
   'Karim',
   '+33687654321',
   '2026-01-20 14:00:00'),
  ('user-fmt-003',
   'sophie.martin@email.com',
   '$pbkdf2$placeholder$demo_hash',
   'formateur',
   'Martin',
   'Sophie',
   '+33676543210',
   '2026-02-01 09:00:00');

-- Formateur profiles
INSERT OR IGNORE INTO formateurs (id, user_id, nom, prenom, email, telephone, ville, code_postal, rayon_km, bio, diplomes, experience_annees, tarif_horaire_individuel, tarif_horaire_collectif, accepte_domicile, accepte_collectif, accepte_visio, onboarding_step, application_status, note_moyenne, nb_avis, nb_heures_total, validated_by, validated_at, created_at) VALUES
  ('fmt-001',
   'user-fmt-001',
   'Dupont',
   'Marie',
   'marie.dupont@email.com',
   '+33698765432',
   'Paris',
   '75015',
   15,
   'Professeure agregee de mathematiques avec 12 ans d experience. Passionnee par la pedagogie, je m adapte a chaque eleve pour rendre les maths accessibles et plaisantes. Specialisee dans la preparation au baccalaureat et aux classes preparatoires.',
   '["Agregation de Mathematiques","Master Didactique des Sciences"]',
   12,
   36.00,
   15.00,
   1, 1, 1,
   4, 'valide',
   4.8, 45, 580,
   'admin-001', '2026-01-20 12:00:00',
   '2026-01-15 10:00:00'),

  ('fmt-002',
   'user-fmt-002',
   'Benali',
   'Karim',
   'karim.benali@email.com',
   '+33687654321',
   'Lyon',
   '69003',
   20,
   'Ingenieur en informatique reconverti dans l enseignement. J enseigne la programmation Python, JavaScript et les bases de l informatique. Mon approche pratique par projets motive les eleves a creer leurs propres applications.',
   '["Diplome Ingenieur INSA Lyon","Certification Google Cloud"]',
   8,
   36.00,
   12.00,
   1, 1, 1,
   4, 'valide',
   4.6, 28, 340,
   'admin-001', '2026-01-25 15:00:00',
   '2026-01-20 14:00:00'),

  ('fmt-003',
   'user-fmt-003',
   'Martin',
   'Sophie',
   'sophie.martin@email.com',
   '+33676543210',
   'Marseille',
   '13008',
   10,
   'Pianiste concertiste et pedagogue diplome du CNSM de Paris. J enseigne le piano classique et jazz a tous les niveaux, du debutant au conservatoire. Le solfege est integre de maniere ludique dans chaque cours.',
   '["DEM Piano CNSM Paris","Licence de Musicologie"]',
   15,
   36.00,
   15.00,
   1, 0, 1,
   4, 'valide',
   4.9, 62, 920,
   'admin-001', '2026-02-05 10:00:00',
   '2026-02-01 09:00:00');


-- ============================================
-- 3. FORMATEUR THEMATIQUES (liens formateurs <-> thematiques)
-- ============================================

-- Marie Dupont : Maths (algebre, analyse, stats, trigo, geometrie) + Bac maths + Prepa maths
INSERT OR IGNORE INTO formateur_thematiques (formateur_id, thematique_id, niveau_enseigne) VALUES
  ('fmt-001', 'scolaire-math-algebre',   'tous'),
  ('fmt-001', 'scolaire-math-analyse',   'tous'),
  ('fmt-001', 'scolaire-math-stats',     'tous'),
  ('fmt-001', 'scolaire-math-trigo',     'tous'),
  ('fmt-001', 'scolaire-math-geometrie', 'tous'),
  ('fmt-001', 'pro-bac-maths',           'avance'),
  ('fmt-001', 'pro-prepa-maths',         'avance');

-- Karim Benali : Programmation (Python, JavaScript, algo) + NSI + Data Science
INSERT OR IGNORE INTO formateur_thematiques (formateur_id, thematique_id, niveau_enseigne) VALUES
  ('fmt-002', 'info-prog-python',        'tous'),
  ('fmt-002', 'info-prog-javascript',    'tous'),
  ('fmt-002', 'info-prog-algo',          'tous'),
  ('fmt-002', 'scolaire-nsi-algo',       'tous'),
  ('fmt-002', 'scolaire-nsi-python',     'tous'),
  ('fmt-002', 'info-data-datascience',   'intermediaire');

-- Sophie Martin : Piano (classique, jazz, solfege, accomp) + Solfege (lecture, rythme, harmonie)
INSERT OR IGNORE INTO formateur_thematiques (formateur_id, thematique_id, niveau_enseigne) VALUES
  ('fmt-003', 'musique-piano-classique', 'tous'),
  ('fmt-003', 'musique-piano-jazz',      'tous'),
  ('fmt-003', 'musique-piano-solfege',   'tous'),
  ('fmt-003', 'musique-piano-accomp',    'tous'),
  ('fmt-003', 'musique-solf-lecture',    'tous'),
  ('fmt-003', 'musique-solf-rythme',     'tous'),
  ('fmt-003', 'musique-solf-harmonie',   'avance');


-- ============================================
-- 4. DISPONIBILITES
-- ============================================

-- Marie Dupont : lundi, mercredi, vendredi apres-midi + samedi matin
INSERT OR IGNORE INTO disponibilites (id, formateur_id, jour, heure_debut, heure_fin, type_cours) VALUES
  ('dispo-001', 'fmt-001', 1, '14:00', '19:00', 'tous'),
  ('dispo-002', 'fmt-001', 3, '14:00', '19:00', 'tous'),
  ('dispo-003', 'fmt-001', 5, '14:00', '19:00', 'tous'),
  ('dispo-004', 'fmt-001', 6, '09:00', '13:00', 'individuel');

-- Karim Benali : mardi, jeudi soir + samedi toute la journee
INSERT OR IGNORE INTO disponibilites (id, formateur_id, jour, heure_debut, heure_fin, type_cours) VALUES
  ('dispo-005', 'fmt-002', 2, '17:00', '21:00', 'tous'),
  ('dispo-006', 'fmt-002', 4, '17:00', '21:00', 'tous'),
  ('dispo-007', 'fmt-002', 6, '09:00', '18:00', 'tous');

-- Sophie Martin : lundi a vendredi apres-midi
INSERT OR IGNORE INTO disponibilites (id, formateur_id, jour, heure_debut, heure_fin, type_cours) VALUES
  ('dispo-008', 'fmt-003', 1, '13:00', '20:00', 'individuel'),
  ('dispo-009', 'fmt-003', 2, '13:00', '20:00', 'individuel'),
  ('dispo-010', 'fmt-003', 3, '13:00', '20:00', 'individuel'),
  ('dispo-011', 'fmt-003', 4, '13:00', '20:00', 'individuel'),
  ('dispo-012', 'fmt-003', 5, '13:00', '20:00', 'individuel');


-- ============================================
-- 5. PARENTS (2 families)
-- ============================================

INSERT OR IGNORE INTO users (id, email, password_hash, role, nom, prenom, telephone, created_at) VALUES
  ('user-par-001',
   'laurent.moreau@email.com',
   '$pbkdf2$placeholder$demo_hash',
   'parent',
   'Moreau',
   'Laurent',
   '+33655443322',
   '2026-02-10 08:00:00'),
  ('user-par-002',
   'isabelle.petit@email.com',
   '$pbkdf2$placeholder$demo_hash',
   'parent',
   'Petit',
   'Isabelle',
   '+33644332211',
   '2026-02-15 11:00:00');

INSERT OR IGNORE INTO parents (id, user_id, nom, prenom, email, telephone, adresse, ville, code_postal, urssaf_compte_actif, created_at) VALUES
  ('par-001',
   'user-par-001',
   'Moreau',
   'Laurent',
   'laurent.moreau@email.com',
   '+33655443322',
   '12 rue de la Paix',
   'Paris',
   '75002',
   1,
   '2026-02-10 08:00:00'),
  ('par-002',
   'user-par-002',
   'Petit',
   'Isabelle',
   'isabelle.petit@email.com',
   '+33644332211',
   '45 avenue Jean Jaures',
   'Lyon',
   '69007',
   0,
   '2026-02-15 11:00:00');


-- ============================================
-- 6. ELEVES (3 total: 2 for Moreau, 1 for Petit)
-- ============================================

INSERT OR IGNORE INTO eleves (id, parent_id, prenom, nom, date_naissance, niveau, profil_specifique, notes_pedagogiques, created_at) VALUES
  ('elv-001',
   'par-001',
   'Emma',
   'Moreau',
   '2010-05-15',
   'Quatrieme',
   'standard',
   'Bonne eleve, quelques difficultes en algebre. Motivee et attentive.',
   '2026-02-10 08:00:00'),
  ('elv-002',
   'par-001',
   'Lucas',
   'Moreau',
   '2012-09-22',
   'Sixieme',
   'standard',
   'Tres curieux, aime la programmation. Souhaite apprendre Python.',
   '2026-02-10 08:00:00'),
  ('elv-003',
   'par-002',
   'Chloe',
   'Petit',
   '2008-03-10',
   'Seconde',
   'standard',
   'Passionnee de piano, joue depuis 5 ans. Souhaite preparer le conservatoire.',
   '2026-02-15 11:00:00');


-- ============================================
-- 7. ELEVE THEMATIQUES
-- ============================================

-- Emma Moreau : maths (algebre, geometrie)
INSERT OR IGNORE INTO eleve_thematiques (eleve_id, thematique_id, priorite) VALUES
  ('elv-001', 'scolaire-math-algebre',   1),
  ('elv-001', 'scolaire-math-geometrie', 2);

-- Lucas Moreau : Python NSI, algorithmique
INSERT OR IGNORE INTO eleve_thematiques (eleve_id, thematique_id, priorite) VALUES
  ('elv-002', 'info-prog-python',        1),
  ('elv-002', 'scolaire-nsi-python',     2);

-- Chloe Petit : piano classique, solfege
INSERT OR IGNORE INTO eleve_thematiques (eleve_id, thematique_id, priorite) VALUES
  ('elv-003', 'musique-piano-classique', 1),
  ('elv-003', 'musique-solf-lecture',    2);


-- ============================================
-- 8. PACKAGES ACHETES
-- ============================================

-- Emma Moreau : Confort 10h maths (individuel, credit impot)
INSERT OR IGNORE INTO packages_achetes (id, parent_id, eleve_id, package_type_id, thematiques, heures_total, heures_utilisees, montant_paye, credit_impot, date_achat, date_expiration, statut) VALUES
  ('pkg-001',
   'par-001',
   'elv-001',
   'confort',
   '["scolaire-math-algebre","scolaire-math-geometrie"]',
   10.0,
   4.0,
   320.00,
   160.00,
   '2026-02-15 10:00:00',
   '2026-08-15 10:00:00',
   'actif');

-- Lucas Moreau : Essentiel 5h Python (individuel, credit impot)
INSERT OR IGNORE INTO packages_achetes (id, parent_id, eleve_id, package_type_id, thematiques, heures_total, heures_utilisees, montant_paye, credit_impot, date_achat, date_expiration, statut) VALUES
  ('pkg-002',
   'par-001',
   'elv-002',
   'essentiel',
   '["info-prog-python"]',
   5.0,
   2.0,
   170.00,
   85.00,
   '2026-02-20 14:00:00',
   '2026-05-20 14:00:00',
   'actif');

-- Chloe Petit : Intensif 20h piano (individuel, credit impot)
INSERT OR IGNORE INTO packages_achetes (id, parent_id, eleve_id, package_type_id, thematiques, heures_total, heures_utilisees, montant_paye, credit_impot, date_achat, date_expiration, statut) VALUES
  ('pkg-003',
   'par-002',
   'elv-003',
   'intensif',
   '["musique-piano-classique","musique-solf-lecture"]',
   20.0,
   8.0,
   600.00,
   300.00,
   '2026-02-18 09:00:00',
   '2027-02-18 09:00:00',
   'actif');


-- ============================================
-- 9. COURS (mix of termine and planifie)
-- ============================================

-- Emma Moreau : 4 cours de maths avec Marie Dupont (termines)
INSERT OR IGNORE INTO cours (id, formateur_id, thematique_id, type_cours, titre, description, date_cours, heure_debut, duree_minutes, max_eleves, lieu, statut, notes_formateur, created_at) VALUES
  ('cours-001',
   'fmt-001',
   'scolaire-math-algebre',
   'individuel',
   'Algebre - Equations du 1er degre',
   'Revision des equations du premier degre, mise en equation de problemes',
   '2026-02-17',
   '15:00',
   60, 1,
   'Domicile - 12 rue de la Paix, Paris 75002',
   'termine',
   'Emma a bien progresse sur les equations simples. Encore des difficultes avec la mise en equation de problemes concrets.',
   '2026-02-14 10:00:00'),
  ('cours-002',
   'fmt-001',
   'scolaire-math-algebre',
   'individuel',
   'Algebre - Equations du 2nd degre',
   'Introduction aux equations du second degre, discriminant',
   '2026-02-24',
   '15:00',
   60, 1,
   'Domicile - 12 rue de la Paix, Paris 75002',
   'termine',
   'Bonne comprehension du discriminant. A revoir la factorisation.',
   '2026-02-20 10:00:00'),
  ('cours-003',
   'fmt-001',
   'scolaire-math-geometrie',
   'individuel',
   'Geometrie - Theoreme de Pythagore',
   'Applications du theoreme de Pythagore, problemes geometriques',
   '2026-03-03',
   '15:00',
   60, 1,
   'Domicile - 12 rue de la Paix, Paris 75002',
   'termine',
   'Pythagore bien maitrise. Passage a Thales la prochaine fois.',
   '2026-02-28 10:00:00'),
  ('cours-004',
   'fmt-001',
   'scolaire-math-geometrie',
   'individuel',
   'Geometrie - Theoreme de Thales',
   'Theoreme de Thales, reciproque, applications',
   '2026-03-10',
   '15:00',
   60, 1,
   'Domicile - 12 rue de la Paix, Paris 75002',
   'termine',
   'Bon cours. Emma commence a faire les liens entre Pythagore et Thales.',
   '2026-03-06 10:00:00');

-- Lucas Moreau : 2 cours Python avec Karim Benali (termines)
INSERT OR IGNORE INTO cours (id, formateur_id, thematique_id, type_cours, titre, description, date_cours, heure_debut, duree_minutes, max_eleves, lieu, statut, notes_formateur, created_at) VALUES
  ('cours-005',
   'fmt-002',
   'info-prog-python',
   'individuel',
   'Python - Premiers pas',
   'Introduction a Python, variables, types de donnees, premiers scripts',
   '2026-02-25',
   '17:30',
   60, 1,
   'Visio',
   'termine',
   'Lucas est tres motive ! Il a deja installe Python chez lui. Bonne comprehension des variables.',
   '2026-02-22 14:00:00'),
  ('cours-006',
   'fmt-002',
   'info-prog-python',
   'individuel',
   'Python - Boucles et conditions',
   'Structures conditionnelles if/else, boucles for/while',
   '2026-03-04',
   '17:30',
   60, 1,
   'Visio',
   'termine',
   'Bien compris les conditions. Les boucles while necessitent un peu plus de pratique.',
   '2026-03-01 14:00:00');

-- Chloe Petit : 8 cours piano avec Sophie Martin (6 termines, 2 planifies)
INSERT OR IGNORE INTO cours (id, formateur_id, thematique_id, type_cours, titre, description, date_cours, heure_debut, duree_minutes, max_eleves, lieu, statut, notes_formateur, created_at) VALUES
  ('cours-007',
   'fmt-003',
   'musique-piano-classique',
   'individuel',
   'Inventions de Bach - Partie 1',
   'Travail sur l Invention n°1 en Do majeur, main droite',
   '2026-02-19',
   '14:00',
   60, 1,
   'Domicile - 45 avenue Jean Jaures, Lyon 69007',
   'termine',
   'Chloe a un bon toucher. Le phrasé de Bach demande encore du travail sur la main droite.',
   '2026-02-16 09:00:00'),
  ('cours-008',
   'fmt-003',
   'musique-piano-classique',
   'individuel',
   'Inventions de Bach - Partie 2',
   'Invention n°1, mains ensemble, tempo lent',
   '2026-02-26',
   '14:00',
   60, 1,
   'Domicile - 45 avenue Jean Jaures, Lyon 69007',
   'termine',
   'Progres remarquables en une semaine. Les deux mains ensemble commencent a etre fluides.',
   '2026-02-23 09:00:00'),
  ('cours-009',
   'fmt-003',
   'musique-solf-lecture',
   'individuel',
   'Solfege - Lecture cle de sol & fa',
   'Exercices de lecture a vue en cle de sol et fa',
   '2026-03-05',
   '14:00',
   60, 1,
   'Domicile - 45 avenue Jean Jaures, Lyon 69007',
   'termine',
   'Cle de sol excellente. La cle de fa necessite plus de pratique quotidienne.',
   '2026-03-02 09:00:00'),
  ('cours-010',
   'fmt-003',
   'musique-piano-classique',
   'individuel',
   'Sonatine de Clementi',
   'Debut de la Sonatine Op.36 n°1, premier mouvement',
   '2026-03-12',
   '14:00',
   60, 1,
   'Domicile - 45 avenue Jean Jaures, Lyon 69007',
   'termine',
   'Bonne lecture a vue de la sonatine. Articulation et dynamiques a travailler.',
   '2026-03-09 09:00:00');

-- Cours planifies (futurs)
INSERT OR IGNORE INTO cours (id, formateur_id, thematique_id, type_cours, titre, description, date_cours, heure_debut, duree_minutes, max_eleves, lieu, statut, created_at) VALUES
  ('cours-011',
   'fmt-001',
   'scolaire-math-algebre',
   'individuel',
   'Algebre - Systemes d equations',
   'Resolution de systemes a 2 inconnues, methode de substitution et combinaison',
   '2026-03-17',
   '15:00',
   60, 1,
   'Domicile - 12 rue de la Paix, Paris 75002',
   'planifie',
   '2026-03-12 10:00:00'),
  ('cours-012',
   'fmt-002',
   'info-prog-python',
   'individuel',
   'Python - Fonctions',
   'Definition et appel de fonctions, parametres, retour',
   '2026-03-18',
   '17:30',
   60, 1,
   'Visio',
   'planifie',
   '2026-03-12 14:00:00'),
  ('cours-013',
   'fmt-003',
   'musique-piano-classique',
   'individuel',
   'Sonatine de Clementi - Suite',
   'Sonatine Op.36 n°1, deuxieme et troisieme mouvements',
   '2026-03-19',
   '14:00',
   60, 1,
   'Domicile - 45 avenue Jean Jaures, Lyon 69007',
   'planifie',
   '2026-03-12 09:00:00');


-- ============================================
-- 10. COURS_ELEVES (inscription eleves aux cours)
-- ============================================

-- Emma Moreau dans ses 4 cours + 1 planifie
INSERT OR IGNORE INTO cours_eleves (cours_id, eleve_id, package_id, heures_debitees, present, notes_progression) VALUES
  ('cours-001', 'elv-001', 'pkg-001', 1.0, 1, 'A compris les equations du 1er degre'),
  ('cours-002', 'elv-001', 'pkg-001', 1.0, 1, 'Discriminant compris, factorisation a revoir'),
  ('cours-003', 'elv-001', 'pkg-001', 1.0, 1, 'Pythagore maitrise'),
  ('cours-004', 'elv-001', 'pkg-001', 1.0, 1, 'Thales en bonne voie'),
  ('cours-011', 'elv-001', 'pkg-001', 1.0, 1, NULL);

-- Lucas Moreau dans ses 2 cours + 1 planifie
INSERT OR IGNORE INTO cours_eleves (cours_id, eleve_id, package_id, heures_debitees, present, notes_progression) VALUES
  ('cours-005', 'elv-002', 'pkg-002', 1.0, 1, 'Tres motive, variables OK'),
  ('cours-006', 'elv-002', 'pkg-002', 1.0, 1, 'Boucles while a retravailler'),
  ('cours-012', 'elv-002', 'pkg-002', 1.0, 1, NULL);

-- Chloe Petit dans ses cours piano/solfege + planifies
INSERT OR IGNORE INTO cours_eleves (cours_id, eleve_id, package_id, heures_debitees, present, notes_progression) VALUES
  ('cours-007', 'elv-003', 'pkg-003', 1.0, 1, 'Bach Invention 1 - main droite OK'),
  ('cours-008', 'elv-003', 'pkg-003', 1.0, 1, 'Mains ensemble en progres'),
  ('cours-009', 'elv-003', 'pkg-003', 1.0, 1, 'Cle de fa a pratiquer'),
  ('cours-010', 'elv-003', 'pkg-003', 1.0, 1, 'Sonatine commencee'),
  ('cours-013', 'elv-003', 'pkg-003', 1.0, 1, NULL);


-- ============================================
-- 11. COMPTEUR FACTURES (pour 2026)
-- ============================================

INSERT OR IGNORE INTO compteur_factures (annee, dernier_numero) VALUES
  (2026, 3);


-- ============================================
-- 12. FACTURE SAMPLE (facture mensuelle mars pour famille Moreau)
-- ============================================

INSERT OR IGNORE INTO factures (id, parent_id, reference, type, date_emission, date_realisation, periode_mois, montant_brut, credit_impot, reste_a_charge, numero_sap, eligible_credit_impot, avance_immediate, statut, mode_paiement, created_at) VALUES
  ('fac-001',
   'par-001',
   'FAC-2026-0001',
   'mensuelle',
   '2026-03-01 00:00:00',
   '2026-02-17',
   '2026-02',
   72.00,
   36.00,
   36.00,
   'SAP/123456789',
   1,
   0,
   'payee',
   'stripe',
   '2026-03-01 00:00:00');

INSERT OR IGNORE INTO facture_lignes (id, facture_id, cours_id, description, intervenant_id, intervenant_numero, date_prestation, quantite, prix_unitaire, montant) VALUES
  ('flig-001',
   'fac-001',
   'cours-001',
   'Cours Maths Algebre (4eme) - 17/02/2026 (1h)',
   'fmt-001',
   '#INT001',
   '2026-02-17',
   1.0,
   36.00,
   36.00),
  ('flig-002',
   'fac-001',
   'cours-002',
   'Cours Maths Algebre (4eme) - 24/02/2026 (1h)',
   'fmt-001',
   '#INT001',
   '2026-02-24',
   1.0,
   36.00,
   36.00);

-- Second facture for Petit family (piano)
INSERT OR IGNORE INTO factures (id, parent_id, reference, type, date_emission, date_realisation, periode_mois, montant_brut, credit_impot, reste_a_charge, numero_sap, eligible_credit_impot, avance_immediate, statut, mode_paiement, created_at) VALUES
  ('fac-002',
   'par-002',
   'FAC-2026-0002',
   'mensuelle',
   '2026-03-01 00:00:00',
   '2026-02-19',
   '2026-02',
   72.00,
   36.00,
   36.00,
   'SAP/123456789',
   1,
   0,
   'payee',
   'virement',
   '2026-03-01 00:00:00');

INSERT OR IGNORE INTO facture_lignes (id, facture_id, cours_id, description, intervenant_id, intervenant_numero, date_prestation, quantite, prix_unitaire, montant) VALUES
  ('flig-003',
   'fac-002',
   'cours-007',
   'Cours Piano Classique - 19/02/2026 (1h)',
   'fmt-003',
   '#INT003',
   '2026-02-19',
   1.0,
   36.00,
   36.00),
  ('flig-004',
   'fac-002',
   'cours-008',
   'Cours Piano Classique - 26/02/2026 (1h)',
   'fmt-003',
   '#INT003',
   '2026-02-26',
   1.0,
   36.00,
   36.00);

-- March invoice (brouillon)
INSERT OR IGNORE INTO factures (id, parent_id, reference, type, date_emission, date_realisation, periode_mois, montant_brut, credit_impot, reste_a_charge, numero_sap, eligible_credit_impot, avance_immediate, statut, created_at) VALUES
  ('fac-003',
   'par-001',
   'FAC-2026-0003',
   'mensuelle',
   '2026-03-12 00:00:00',
   '2026-03-03',
   '2026-03',
   72.00,
   36.00,
   36.00,
   'SAP/123456789',
   1,
   0,
   'brouillon',
   '2026-03-12 00:00:00');

INSERT OR IGNORE INTO facture_lignes (id, facture_id, cours_id, description, intervenant_id, intervenant_numero, date_prestation, quantite, prix_unitaire, montant) VALUES
  ('flig-005',
   'fac-003',
   'cours-003',
   'Cours Maths Geometrie (4eme) - 03/03/2026 (1h)',
   'fmt-001',
   '#INT001',
   '2026-03-03',
   1.0,
   36.00,
   36.00),
  ('flig-006',
   'fac-003',
   'cours-004',
   'Cours Maths Geometrie (4eme) - 10/03/2026 (1h)',
   'fmt-001',
   '#INT001',
   '2026-03-10',
   1.0,
   36.00,
   36.00);


-- ============================================
-- 13. AVIS (quelques avis de demo)
-- ============================================

INSERT OR IGNORE INTO avis (id, eleve_id, formateur_id, cours_id, note, commentaire, visible, created_at) VALUES
  ('avis-001',
   'elv-001',
   'fmt-001',
   'cours-001',
   5,
   'Marie est tres patiente et explique tres bien. Emma a enfin compris les equations !',
   1,
   '2026-02-18 19:00:00'),
  ('avis-002',
   'elv-002',
   'fmt-002',
   'cours-005',
   5,
   'Lucas est ravi de ses premiers pas en Python. Karim rend la programmation amusante et accessible.',
   1,
   '2026-02-26 20:00:00'),
  ('avis-003',
   'elv-003',
   'fmt-003',
   'cours-007',
   5,
   'Sophie est une excellente pedagogue. Chloe progresse enormement en piano classique.',
   1,
   '2026-02-20 18:00:00'),
  ('avis-004',
   'elv-001',
   'fmt-001',
   'cours-004',
   4,
   'Tres bon cours sur Thales, peut-etre un rythme un peu rapide mais dans l ensemble tres bien.',
   1,
   '2026-03-11 19:00:00');
