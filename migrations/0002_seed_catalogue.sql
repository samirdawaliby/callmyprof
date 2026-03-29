-- ============================================
-- SOUTIEN SCOLAIRE CAPLOGY - Seed Catalogue
-- Migration 0002 : Domaines, Sous-domaines, Thematiques
-- INSERT OR IGNORE pour idempotence
-- ============================================

-- ============================================
-- 8 DOMAINES
-- ============================================

INSERT OR IGNORE INTO domaines (id, nom, icone, description, ordre) VALUES
  ('scolaire',        'Soutien scolaire',           '📚', 'Accompagnement dans toutes les matieres scolaires du primaire au superieur', 1),
  ('langues',         'Langues vivantes',            '🌍', 'Apprentissage et perfectionnement des langues etrangeres', 2),
  ('musique',         'Musique & instruments',       '🎵', 'Cours de musique, instruments et theorie musicale', 3),
  ('informatique',    'Informatique & numerique',    '💻', 'Programmation, bureautique, creation numerique et culture digitale', 4),
  ('arts',            'Arts & creation',             '🎨', 'Arts plastiques, arts visuels, artisanat et creation', 5),
  ('sport',           'Sport & bien-etre',           '⚽', 'Coaching sportif, disciplines individuelles et bien-etre', 6),
  ('pro',             'Preparation concours & pro',  '🎓', 'Preparation aux concours, examens et formations professionnelles', 7),
  ('accompagnement',  'Accompagnement specifique',   '🧠', 'Soutien adapte aux besoins particuliers et methodologie', 8);


-- ============================================
-- DOMAINE 1 : SCOLAIRE (10 sous-domaines)
-- ============================================

INSERT OR IGNORE INTO sous_domaines (id, domaine_id, nom, description, ordre) VALUES
  ('scolaire-math',       'scolaire', 'Mathematiques',          'Algebre, geometrie, analyse, statistiques', 1),
  ('scolaire-francais',   'scolaire', 'Francais',               'Grammaire, conjugaison, redaction, litterature', 2),
  ('scolaire-physchim',   'scolaire', 'Physique-Chimie',        'Mecanique, electricite, optique, chimie', 3),
  ('scolaire-svt',        'scolaire', 'SVT',                    'Biologie, geologie, ecologie, genetique', 4),
  ('scolaire-histoire',   'scolaire', 'Histoire-Geographie',    'Histoire, geographie, geopolitique, EMC', 5),
  ('scolaire-philo',      'scolaire', 'Philosophie',            'Philosophie terminale et superieur', 6),
  ('scolaire-ses',        'scolaire', 'Sciences economiques',   'Economie, sociologie, science politique', 7),
  ('scolaire-primaire',   'scolaire', 'Primaire toutes matieres', 'Accompagnement global pour eleves du primaire', 8),
  ('scolaire-techno',     'scolaire', 'Technologie & SI',       'Technologie college et sciences de l ingenieur', 9),
  ('scolaire-nsi',        'scolaire', 'NSI',                    'Numerique et sciences informatiques (lycee)', 10);

-- Mathematiques (5 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('scolaire-math-algebre',      'scolaire-math', 'Algebre',           'Equations, inequations, polynomes, systemes', 1),
  ('scolaire-math-geometrie',    'scolaire-math', 'Geometrie',         'Geometrie plane, dans l espace, trigonometrie', 2),
  ('scolaire-math-analyse',      'scolaire-math', 'Analyse',           'Fonctions, derivees, integrales, suites', 3),
  ('scolaire-math-stats',        'scolaire-math', 'Statistiques & Probabilites', 'Probabilites, stats descriptives, lois', 4),
  ('scolaire-math-trigo',        'scolaire-math', 'Trigonometrie',     'Cercle trigonometrique, formules, equations trigo', 5);

-- Francais (5 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('scolaire-fran-grammaire',    'scolaire-francais', 'Grammaire',            'Syntaxe, accords, ponctuation, analyse grammaticale', 1),
  ('scolaire-fran-conjugaison',  'scolaire-francais', 'Conjugaison',          'Tous les temps et modes de conjugaison', 2),
  ('scolaire-fran-redaction',    'scolaire-francais', 'Redaction',            'Expression ecrite, narration, argumentation', 3),
  ('scolaire-fran-dissertation', 'scolaire-francais', 'Dissertation',         'Methode de la dissertation, plans, argumentation', 4),
  ('scolaire-fran-commentaire',  'scolaire-francais', 'Commentaire de texte', 'Analyse litteraire, commentaire compose, explication', 5);

-- Physique-Chimie (5 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('scolaire-phys-mecanique',    'scolaire-physchim', 'Mecanique',          'Forces, mouvement, energie, gravitation', 1),
  ('scolaire-phys-electricite',  'scolaire-physchim', 'Electricite',        'Circuits, lois, electronique, electromagnetisme', 2),
  ('scolaire-phys-optique',      'scolaire-physchim', 'Optique',            'Lumiere, lentilles, ondes, spectroscopie', 3),
  ('scolaire-phys-chimorg',      'scolaire-physchim', 'Chimie organique',   'Molecules organiques, reactions, nomenclature', 4),
  ('scolaire-phys-thermo',       'scolaire-physchim', 'Thermodynamique',    'Chaleur, temperature, transferts thermiques', 5);

-- SVT (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('scolaire-svt-biologie',      'scolaire-svt', 'Biologie cellulaire',  'Cellule, ADN, genetique, evolution', 1),
  ('scolaire-svt-geologie',      'scolaire-svt', 'Geologie',             'Roches, tectonique, volcans, seismes', 2),
  ('scolaire-svt-ecologie',      'scolaire-svt', 'Ecologie',             'Ecosystemes, biodiversite, environnement', 3),
  ('scolaire-svt-corps',         'scolaire-svt', 'Corps humain',         'Anatomie, physiologie, systemes du corps', 4);

-- Histoire-Geographie (5 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('scolaire-hist-antiquite',    'scolaire-histoire', 'Histoire ancienne',     'Antiquite, Moyen Age, civilisations', 1),
  ('scolaire-hist-moderne',      'scolaire-histoire', 'Histoire moderne',      'Renaissance, Lumieres, revolutions', 2),
  ('scolaire-hist-contemp',      'scolaire-histoire', 'Histoire contemporaine','Guerres mondiales, decolonisation, monde actuel', 3),
  ('scolaire-hist-geofrance',    'scolaire-histoire', 'Geographie France',     'Territoire, amenagement, regions', 4),
  ('scolaire-hist-geomonde',     'scolaire-histoire', 'Geographie mondiale',   'Mondialisation, geopolitique, developpement', 5);

-- Philosophie (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('scolaire-philo-morale',      'scolaire-philo', 'Morale & ethique',      'Bien, mal, devoir, liberte, justice', 1),
  ('scolaire-philo-politique',   'scolaire-philo', 'Philosophie politique',  'Etat, societe, pouvoir, droit', 2),
  ('scolaire-philo-connaissance','scolaire-philo', 'Theorie connaissance',  'Verite, raison, science, perception', 3),
  ('scolaire-philo-existence',   'scolaire-philo', 'Existence & conscience','Sujet, conscience, inconscient, autrui', 4);

-- Sciences economiques (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('scolaire-ses-micro',         'scolaire-ses', 'Microeconomie',        'Marche, offre/demande, concurrence, entreprise', 1),
  ('scolaire-ses-macro',         'scolaire-ses', 'Macroeconomie',        'Croissance, chomage, inflation, politiques eco', 2),
  ('scolaire-ses-socio',         'scolaire-ses', 'Sociologie',           'Socialisation, stratification, mobilite sociale', 3),
  ('scolaire-ses-scpol',         'scolaire-ses', 'Science politique',    'Vote, partis, opinion publique, medias', 4);

-- Primaire toutes matieres (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('scolaire-prim-lecture',      'scolaire-primaire', 'Lecture & ecriture', 'Apprentissage lecture, ecriture, comprehension', 1),
  ('scolaire-prim-calcul',       'scolaire-primaire', 'Calcul & nombres',   'Numeration, operations, problemes', 2),
  ('scolaire-prim-eveil',        'scolaire-primaire', 'Eveil & decouverte', 'Sciences, histoire, geographie niveau primaire', 3),
  ('scolaire-prim-methodo',      'scolaire-primaire', 'Methodologie primaire', 'Apprendre a apprendre, organisation, autonomie', 4);

-- Technologie & SI (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('scolaire-tech-mecanismes',   'scolaire-techno', 'Mecanismes & systemes', 'Engrenages, leviers, systemes techniques', 1),
  ('scolaire-tech-electronique', 'scolaire-techno', 'Electronique',          'Composants, circuits, Arduino, capteurs', 2),
  ('scolaire-tech-cao',          'scolaire-techno', 'CAO & impression 3D',   'Conception assistee, modelisation, prototypage', 3);

-- NSI (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('scolaire-nsi-algo',          'scolaire-nsi', 'Algorithmique',          'Algorithmes, complexite, structures de donnees', 1),
  ('scolaire-nsi-python',        'scolaire-nsi', 'Python NSI',             'Programmation Python niveau lycee', 2),
  ('scolaire-nsi-web',           'scolaire-nsi', 'Web & reseaux',          'HTML/CSS, protocoles, architecture web', 3),
  ('scolaire-nsi-bdd',           'scolaire-nsi', 'Bases de donnees',       'SQL, modele relationnel, requetes', 4);


-- ============================================
-- DOMAINE 2 : LANGUES (8 sous-domaines)
-- ============================================

INSERT OR IGNORE INTO sous_domaines (id, domaine_id, nom, description, ordre) VALUES
  ('langues-anglais',    'langues', 'Anglais',              'Anglais general, professionnel, examens', 1),
  ('langues-espagnol',   'langues', 'Espagnol',             'Espagnol tous niveaux', 2),
  ('langues-allemand',   'langues', 'Allemand',             'Allemand tous niveaux', 3),
  ('langues-italien',    'langues', 'Italien',              'Italien tous niveaux', 4),
  ('langues-arabe',      'langues', 'Arabe',                'Arabe litteraire et dialectal', 5),
  ('langues-chinois',    'langues', 'Chinois mandarin',     'Chinois mandarin, caracteres, oral', 6),
  ('langues-japonais',   'langues', 'Japonais',             'Japonais, hiragana, katakana, kanji', 7),
  ('langues-fle',        'langues', 'FLE (Francais langue etrangere)', 'Francais pour non-francophones', 8);

-- Anglais (5 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('langues-ang-conversation',   'langues-anglais', 'Conversation',       'Expression orale, aisance, debats', 1),
  ('langues-ang-grammaire',      'langues-anglais', 'Grammaire anglaise', 'Temps, syntaxe, regles grammaticales', 2),
  ('langues-ang-toefl',          'langues-anglais', 'TOEFL / IELTS',     'Preparation aux examens internationaux', 3),
  ('langues-ang-business',       'langues-anglais', 'Business English',   'Anglais professionnel, reunions, presentations', 4),
  ('langues-ang-phonetique',     'langues-anglais', 'Phonetique',         'Prononciation, accent, intonation', 5);

-- Espagnol (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('langues-esp-conversation',   'langues-espagnol', 'Conversation espagnol',  'Expression orale, dialogues, debats', 1),
  ('langues-esp-grammaire',      'langues-espagnol', 'Grammaire espagnole',    'Conjugaison, syntaxe, accords', 2),
  ('langues-esp-dele',           'langues-espagnol', 'DELE',                   'Preparation examen DELE (A1 a C2)', 3),
  ('langues-esp-litterature',    'langues-espagnol', 'Litterature hispanique', 'Textes, auteurs, civilisation', 4);

-- Allemand (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('langues-all-conversation',   'langues-allemand', 'Conversation allemand',  'Expression orale, echanges quotidiens', 1),
  ('langues-all-grammaire',      'langues-allemand', 'Grammaire allemande',    'Declinaisons, verbes, syntaxe', 2),
  ('langues-all-goethe',         'langues-allemand', 'Goethe-Zertifikat',      'Preparation examens Goethe Institut', 3),
  ('langues-all-business',       'langues-allemand', 'Allemand professionnel', 'Allemand des affaires, correspondance', 4);

-- Italien (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('langues-ita-conversation',   'langues-italien', 'Conversation italien',   'Expression orale, vie quotidienne', 1),
  ('langues-ita-grammaire',      'langues-italien', 'Grammaire italienne',    'Conjugaison, prepositions, syntaxe', 2),
  ('langues-ita-culture',        'langues-italien', 'Culture & civilisation', 'Art, cuisine, histoire italienne', 3);

-- Arabe (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('langues-arb-litteraire',     'langues-arabe', 'Arabe litteraire',     'Arabe standard moderne, grammaire, syntaxe', 1),
  ('langues-arb-dialectal',      'langues-arabe', 'Arabe dialectal',      'Dialectes maghrebin, egyptien, levantin', 2),
  ('langues-arb-ecriture',       'langues-arabe', 'Calligraphie & ecriture', 'Alphabet, calligraphie, lecture', 3),
  ('langues-arb-coranique',      'langues-arabe', 'Arabe coranique',      'Lecture et comprehension des textes religieux', 4);

-- Chinois (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('langues-chi-oral',           'langues-chinois', 'Chinois oral',       'Conversation, tons, prononciation pinyin', 1),
  ('langues-chi-caracteres',     'langues-chinois', 'Caracteres chinois', 'Ecriture, radix, ordre des traits', 2),
  ('langues-chi-hsk',            'langues-chinois', 'HSK',                'Preparation examen HSK (1 a 6)', 3);

-- Japonais (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('langues-jap-oral',           'langues-japonais', 'Japonais oral',     'Conversation, politesse, expressions', 1),
  ('langues-jap-ecriture',       'langues-japonais', 'Ecriture japonaise','Hiragana, katakana, kanji de base', 2),
  ('langues-jap-jlpt',           'langues-japonais', 'JLPT',             'Preparation Japanese Language Proficiency Test', 3);

-- FLE (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('langues-fle-debutant',       'langues-fle', 'FLE debutant',         'Premiers pas en francais, A1/A2', 1),
  ('langues-fle-intermediaire',  'langues-fle', 'FLE intermediaire',    'Perfectionnement B1/B2', 2),
  ('langues-fle-delf',           'langues-fle', 'DELF / DALF',         'Preparation examens DELF B1/B2, DALF C1/C2', 3),
  ('langues-fle-pro',            'langues-fle', 'Francais professionnel', 'Francais des affaires, correspondance pro', 4);


-- ============================================
-- DOMAINE 3 : MUSIQUE (8 sous-domaines)
-- ============================================

INSERT OR IGNORE INTO sous_domaines (id, domaine_id, nom, description, ordre) VALUES
  ('musique-piano',     'musique', 'Piano',            'Piano classique, jazz, accompagnement', 1),
  ('musique-guitare',   'musique', 'Guitare',          'Guitare classique, electrique, acoustique', 2),
  ('musique-chant',     'musique', 'Chant',            'Technique vocale, chorale, coaching vocal', 3),
  ('musique-violon',    'musique', 'Violon & cordes',  'Violon, violoncelle, alto', 4),
  ('musique-batterie',  'musique', 'Batterie & percussions', 'Batterie, djembe, percussions', 5),
  ('musique-sax',       'musique', 'Saxophone & vents','Saxophone, flute, clarinette, trompette', 6),
  ('musique-solfege',   'musique', 'Solfege & theorie','Lecture de notes, rythme, harmonie', 7),
  ('musique-mao',       'musique', 'MAO & production', 'Musique assistee par ordinateur, mixage', 8);

-- Piano (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('musique-piano-classique',    'musique-piano', 'Piano classique',     'Repertoire classique, technique, interpretation', 1),
  ('musique-piano-jazz',         'musique-piano', 'Piano jazz',          'Improvisation, grilles, standards jazz', 2),
  ('musique-piano-solfege',      'musique-piano', 'Solfege piano',       'Lecture de notes, dechiffrage, theorie appliquee', 3),
  ('musique-piano-accomp',       'musique-piano', 'Accompagnement',      'Accompagnement chansons, variete, pop', 4);

-- Guitare (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('musique-guit-classique',     'musique-guitare', 'Guitare classique',   'Technique classique, repertoire, arpegos', 1),
  ('musique-guit-electrique',    'musique-guitare', 'Guitare electrique',  'Rock, blues, metal, effets, solos', 2),
  ('musique-guit-acoustique',    'musique-guitare', 'Guitare acoustique',  'Folk, fingerpicking, strumming', 3),
  ('musique-guit-basse',         'musique-guitare', 'Guitare basse',       'Technique basse, groove, slap', 4);

-- Chant (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('musique-chant-technique',    'musique-chant', 'Technique vocale',    'Respiration, placement, projection', 1),
  ('musique-chant-lyrique',      'musique-chant', 'Chant lyrique',       'Opera, melodies, repertoire lyrique', 2),
  ('musique-chant-moderne',      'musique-chant', 'Chant moderne',       'Pop, rock, variete, R&B', 3);

-- Violon & cordes (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('musique-violon-classique',   'musique-violon', 'Violon classique',    'Technique, repertoire, orchestre', 1),
  ('musique-violon-cello',       'musique-violon', 'Violoncelle',         'Technique, repertoire violoncelle', 2),
  ('musique-violon-alto',        'musique-violon', 'Alto',                'Technique, repertoire alto', 3);

-- Batterie (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('musique-batt-rock',          'musique-batterie', 'Batterie rock/pop',  'Rythmes rock, pop, fills, coordination', 1),
  ('musique-batt-jazz',          'musique-batterie', 'Batterie jazz',      'Swing, brush, comping, independance', 2),
  ('musique-batt-percussions',   'musique-batterie', 'Percussions monde',  'Djembe, congas, cajon, percussions africaines', 3);

-- Saxophone & vents (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('musique-sax-saxophone',      'musique-sax', 'Saxophone',            'Alto, tenor, soprano, technique, jazz', 1),
  ('musique-sax-flute',          'musique-sax', 'Flute traversiere',    'Technique, repertoire classique, jazz', 2),
  ('musique-sax-clarinette',     'musique-sax', 'Clarinette & trompette', 'Instruments a vent, embouchure, souffle', 3);

-- Solfege & theorie (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('musique-solf-lecture',       'musique-solfege', 'Lecture de notes',   'Cles de sol et fa, dechiffrage, lecture a vue', 1),
  ('musique-solf-rythme',        'musique-solfege', 'Rythme',             'Mesures, syncopes, contretemps, dictees', 2),
  ('musique-solf-harmonie',      'musique-solfege', 'Harmonie',           'Accords, progressions, analyse harmonique', 3);

-- MAO & production (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('musique-mao-ableton',        'musique-mao', 'Ableton / Logic',     'Production musicale, DAW, arrangement', 1),
  ('musique-mao-mixage',         'musique-mao', 'Mixage & mastering',  'Equilibre, EQ, compression, master', 2),
  ('musique-mao-beatmaking',     'musique-mao', 'Beatmaking',          'Creation de beats, sampling, sound design', 3);


-- ============================================
-- DOMAINE 4 : INFORMATIQUE (7 sous-domaines)
-- ============================================

INSERT OR IGNORE INTO sous_domaines (id, domaine_id, nom, description, ordre) VALUES
  ('info-prog',         'informatique', 'Programmation',         'Langages de programmation et algorithmique', 1),
  ('info-web',          'informatique', 'Developpement web',     'Frontend, backend, fullstack', 2),
  ('info-data',         'informatique', 'Data & IA',             'Science des donnees, machine learning, IA', 3),
  ('info-bureautique',  'informatique', 'Bureautique',           'Word, Excel, PowerPoint, Google Workspace', 4),
  ('info-graphisme',    'informatique', 'Graphisme & design',    'Photoshop, Illustrator, Figma, Canva', 5),
  ('info-systeme',      'informatique', 'Systeme & reseaux',     'Linux, Windows, reseaux, securite', 6),
  ('info-mobile',       'informatique', 'Developpement mobile',  'iOS, Android, React Native, Flutter', 7);

-- Programmation (5 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('info-prog-python',       'info-prog', 'Python',             'Python general, scripts, automation', 1),
  ('info-prog-javascript',   'info-prog', 'JavaScript',         'JavaScript, TypeScript, ES6+', 2),
  ('info-prog-java',         'info-prog', 'Java',               'Java SE, POO, frameworks Java', 3),
  ('info-prog-c',            'info-prog', 'C / C++',            'Programmation systeme, C, C++', 4),
  ('info-prog-algo',         'info-prog', 'Algorithmique',      'Structures de donnees, complexite, problemes', 5);

-- Developpement web (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('info-web-html',          'info-web', 'HTML / CSS',          'Bases du web, mise en page, responsive', 1),
  ('info-web-react',         'info-web', 'React / Vue / Angular','Frameworks frontend modernes', 2),
  ('info-web-backend',       'info-web', 'Backend (Node, PHP)',  'Serveur, API REST, bases de donnees', 3),
  ('info-web-wordpress',     'info-web', 'WordPress',            'Creation sites, themes, plugins', 4);

-- Data & IA (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('info-data-datascience',  'info-data', 'Data Science',       'Pandas, NumPy, visualisation, analyse', 1),
  ('info-data-ml',           'info-data', 'Machine Learning',    'Scikit-learn, TensorFlow, modeles ML', 2),
  ('info-data-sql',          'info-data', 'SQL & bases de donnees', 'SQL, modelisation, NoSQL, BigQuery', 3),
  ('info-data-ia',           'info-data', 'Intelligence artificielle', 'Deep learning, NLP, vision, LLM', 4);

-- Bureautique (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('info-bur-excel',         'info-bureautique', 'Excel avance',       'Formules, TCD, macros VBA, dashboards', 1),
  ('info-bur-word',          'info-bureautique', 'Word & redaction',   'Mise en forme, styles, documents longs', 2),
  ('info-bur-powerpoint',    'info-bureautique', 'PowerPoint',         'Presentations, animations, design slides', 3),
  ('info-bur-google',        'info-bureautique', 'Google Workspace',   'Sheets, Docs, Slides, Drive, collaboration', 4);

-- Graphisme & design (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('info-graph-photoshop',   'info-graphisme', 'Photoshop',          'Retouche photo, montage, compositing', 1),
  ('info-graph-illustrator', 'info-graphisme', 'Illustrator',        'Illustration vectorielle, logo, print', 2),
  ('info-graph-figma',       'info-graphisme', 'Figma / UX Design',  'Interface, prototypage, design system', 3),
  ('info-graph-canva',       'info-graphisme', 'Canva & outils en ligne', 'Design rapide, reseaux sociaux, flyers', 4);

-- Systeme & reseaux (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('info-sys-linux',         'info-systeme', 'Linux',               'Administration Linux, ligne de commande, scripts', 1),
  ('info-sys-reseaux',       'info-systeme', 'Reseaux',             'TCP/IP, DNS, DHCP, routage, Wi-Fi', 2),
  ('info-sys-securite',      'info-systeme', 'Cybersecurite',       'Securite informatique, pentest, firewall', 3);

-- Developpement mobile (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('info-mob-ios',           'info-mobile', 'iOS (Swift)',           'Developpement iPhone/iPad, SwiftUI', 1),
  ('info-mob-android',       'info-mobile', 'Android (Kotlin)',      'Developpement Android, Jetpack Compose', 2),
  ('info-mob-crossplatform', 'info-mobile', 'React Native / Flutter','Applications multiplateforme', 3);


-- ============================================
-- DOMAINE 5 : ARTS (7 sous-domaines)
-- ============================================

INSERT OR IGNORE INTO sous_domaines (id, domaine_id, nom, description, ordre) VALUES
  ('arts-dessin',       'arts', 'Dessin',                'Dessin academique, technique, croquis', 1),
  ('arts-peinture',     'arts', 'Peinture',              'Huile, acrylique, aquarelle', 2),
  ('arts-sculpture',    'arts', 'Sculpture & modelage',  'Terre, argile, platre, modelage', 3),
  ('arts-photo',        'arts', 'Photographie',          'Technique photo, retouche, composition', 4),
  ('arts-video',        'arts', 'Video & cinema',        'Tournage, montage, scenario', 5),
  ('arts-ecriture',     'arts', 'Ecriture creative',     'Roman, poesie, nouvelles, scenarisation', 6),
  ('arts-artisanat',    'arts', 'Artisanat',             'Couture, broderie, poterie, bijoux', 7);

-- Dessin (5 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('arts-dess-academique',   'arts-dessin', 'Dessin academique',   'Anatomie, perspective, ombres, proportions', 1),
  ('arts-dess-aquarelle',    'arts-dessin', 'Aquarelle',           'Technique aquarelle, lavis, transparence', 2),
  ('arts-dess-pastel',       'arts-dessin', 'Pastel',              'Pastel sec, pastel gras, techniques', 3),
  ('arts-dess-illustration', 'arts-dessin', 'Illustration',        'Illustration editoriale, jeunesse, BD', 4),
  ('arts-dess-croquis',      'arts-dessin', 'Croquis & carnet',    'Croquis rapide, carnet de voyage, urban sketching', 5);

-- Peinture (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('arts-peint-huile',       'arts-peinture', 'Peinture a l huile', 'Technique classique, glacis, empattement', 1),
  ('arts-peint-acrylique',   'arts-peinture', 'Acrylique',          'Technique acrylique, mixed media', 2),
  ('arts-peint-abstraite',   'arts-peinture', 'Art abstrait',       'Expression, couleur, composition abstraite', 3),
  ('arts-peint-numerique',   'arts-peinture', 'Peinture numerique', 'Procreate, Photoshop painting, digital art', 4);

-- Sculpture & modelage (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('arts-sculpt-argile',     'arts-sculpture', 'Modelage argile',    'Terre, argile, faconnage, cuisson', 1),
  ('arts-sculpt-platre',     'arts-sculpture', 'Sculpture platre',   'Moulage, taille, bas-relief', 2),
  ('arts-sculpt-ceramique',  'arts-sculpture', 'Ceramique',          'Tournage, emaillage, cuisson ceramique', 3);

-- Photographie (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('arts-photo-technique',   'arts-photo', 'Technique photo',     'Exposition, composition, lumiere, objectifs', 1),
  ('arts-photo-retouche',    'arts-photo', 'Retouche Lightroom',  'Lightroom, post-traitement, flux de travail', 2),
  ('arts-photo-portrait',    'arts-photo', 'Portrait & studio',   'Eclairage studio, portrait, posing', 3);

-- Video & cinema (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('arts-video-tournage',    'arts-video', 'Tournage',           'Cadrage, lumiere, son, camera', 1),
  ('arts-video-montage',     'arts-video', 'Montage video',      'Premiere Pro, DaVinci, Final Cut', 2),
  ('arts-video-scenario',    'arts-video', 'Scenario & script',  'Ecriture scenario, storyboard, narration', 3);

-- Ecriture creative (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('arts-ecrit-roman',       'arts-ecriture', 'Ecriture romanesque', 'Construction roman, personnages, intrigue', 1),
  ('arts-ecrit-poesie',      'arts-ecriture', 'Poesie',              'Vers, rimes, formes poetiques, slam', 2),
  ('arts-ecrit-nouvelles',   'arts-ecriture', 'Nouvelles & recits',  'Recits courts, nouvelles, contes', 3);

-- Artisanat (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('arts-artis-couture',     'arts-artisanat', 'Couture',           'Patron, machine a coudre, retouche', 1),
  ('arts-artis-broderie',    'arts-artisanat', 'Broderie',          'Points de broderie, motifs, creation', 2),
  ('arts-artis-bijoux',      'arts-artisanat', 'Creation bijoux',   'Perles, fil, resine, techniques bijoux', 3);


-- ============================================
-- DOMAINE 6 : SPORT (7 sous-domaines)
-- ============================================

INSERT OR IGNORE INTO sous_domaines (id, domaine_id, nom, description, ordre) VALUES
  ('sport-fitness',     'sport', 'Fitness & musculation',  'Coaching sportif, musculation, remise en forme', 1),
  ('sport-yoga',        'sport', 'Yoga & meditation',      'Yoga, meditation, relaxation', 2),
  ('sport-tennis',      'sport', 'Tennis & raquettes',     'Tennis, badminton, tennis de table', 3),
  ('sport-natation',    'sport', 'Natation',               'Apprentissage natation, perfectionnement', 4),
  ('sport-martial',     'sport', 'Arts martiaux',          'Judo, karate, boxe, MMA, self-defense', 5),
  ('sport-danse',       'sport', 'Danse',                  'Danse classique, moderne, contemporaine, hip-hop', 6),
  ('sport-collectif',   'sport', 'Sports collectifs',      'Football, basket, handball, coaching', 7);

-- Fitness (5 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('sport-fit-musculation',  'sport-fitness', 'Musculation',      'Programme musculation, technique, progression', 1),
  ('sport-fit-yoga',         'sport-fitness', 'Yoga',              'Hatha, vinyasa, ashtanga, yin yoga', 2),
  ('sport-fit-pilates',      'sport-fitness', 'Pilates',           'Renforcement profond, posture, souplesse', 3),
  ('sport-fit-crossfit',     'sport-fitness', 'Cross-training',    'HIIT, circuit training, fonctionnel', 4),
  ('sport-fit-stretching',   'sport-fitness', 'Stretching',        'Souplesse, etirements, mobilite', 5);

-- Yoga & meditation (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('sport-yoga-hatha',       'sport-yoga', 'Hatha Yoga',        'Postures, respiration, meditation douce', 1),
  ('sport-yoga-vinyasa',     'sport-yoga', 'Vinyasa Flow',      'Enchainements dynamiques, fluidite', 2),
  ('sport-yoga-meditation',  'sport-yoga', 'Meditation',         'Pleine conscience, relaxation, gestion stress', 3);

-- Tennis (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('sport-tennis-debutant',  'sport-tennis', 'Tennis debutant',    'Bases, coups droits, revers, service', 1),
  ('sport-tennis-perf',      'sport-tennis', 'Perfectionnement',   'Tactique, jeu avance, competition', 2),
  ('sport-tennis-badminton',  'sport-tennis', 'Badminton',         'Technique badminton, smash, deplacement', 3);

-- Natation (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('sport-nat-apprentissage', 'sport-natation', 'Apprentissage',     'Vaincre la peur, premieres nages', 1),
  ('sport-nat-technique',     'sport-natation', 'Technique 4 nages', 'Crawl, dos, brasse, papillon', 2),
  ('sport-nat-bebe',          'sport-natation', 'Bebe nageur',       'Eveil aquatique, familiarisation', 3);

-- Arts martiaux (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('sport-mart-judo',         'sport-martial', 'Judo',             'Techniques, katas, competition', 1),
  ('sport-mart-karate',       'sport-martial', 'Karate',           'Katas, kumite, self-defense', 2),
  ('sport-mart-boxe',         'sport-martial', 'Boxe',             'Boxe anglaise, francaise, kick-boxing', 3),
  ('sport-mart-selfdefense',  'sport-martial', 'Self-defense',     'Krav Maga, techniques de defense', 4);

-- Danse (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('sport-danse-classique',   'sport-danse', 'Danse classique',   'Ballet, technique, barre, repertoire', 1),
  ('sport-danse-moderne',     'sport-danse', 'Danse moderne',     'Contemporain, jazz, modern', 2),
  ('sport-danse-hiphop',      'sport-danse', 'Hip-hop & street',  'Breakdance, popping, locking, house', 3),
  ('sport-danse-salon',       'sport-danse', 'Danse de salon',    'Valse, tango, salsa, rock', 4);

-- Sports collectifs (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('sport-coll-football',     'sport-collectif', 'Football',         'Technique, tactique, coaching football', 1),
  ('sport-coll-basket',       'sport-collectif', 'Basketball',       'Dribble, tir, jeu collectif', 2),
  ('sport-coll-handball',     'sport-collectif', 'Handball',         'Technique, coordination, strategie', 3);


-- ============================================
-- DOMAINE 7 : PRO / CONCOURS (8 sous-domaines)
-- ============================================

INSERT OR IGNORE INTO sous_domaines (id, domaine_id, nom, description, ordre) VALUES
  ('pro-brevet',        'pro', 'Brevet des colleges',    'Preparation au brevet (3eme)', 1),
  ('pro-bac',           'pro', 'Baccalaureat',           'Preparation bac general, techno, pro', 2),
  ('pro-prepa',         'pro', 'Classes preparatoires',  'CPGE scientifiques, litteraires, commerciales', 3),
  ('pro-medecine',      'pro', 'Medecine & sante',       'PASS, LAS, ECN, pharmacie', 4),
  ('pro-droit',         'pro', 'Droit',                  'Licence droit, CRFPA, concours juridiques', 5),
  ('pro-commerce',      'pro', 'Commerce & management',  'Ecoles de commerce, MBA, concours', 6),
  ('pro-fonction',      'pro', 'Fonction publique',      'Concours administratifs, categorie A/B/C', 7),
  ('pro-orientation',   'pro', 'Orientation & Parcoursup', 'Aide a l orientation, dossier Parcoursup', 8);

-- Brevet (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('pro-brevet-maths',      'pro-brevet', 'Maths brevet',        'Revision mathematiques DNB, exercices types', 1),
  ('pro-brevet-francais',   'pro-brevet', 'Francais brevet',     'Dictee, grammaire, redaction, oral DNB', 2),
  ('pro-brevet-histgeo',    'pro-brevet', 'Histoire-geo brevet', 'Reperes, analyse documents, EMC', 3);

-- Baccalaureat (5 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('pro-bac-maths',         'pro-bac', 'Maths bac',            'Specialite maths, maths complementaires', 1),
  ('pro-bac-francais',      'pro-bac', 'Francais bac (1ere)',  'Commentaire, dissertation, oral blanc', 2),
  ('pro-bac-philo',         'pro-bac', 'Philo bac',            'Dissertation, explication de texte', 3),
  ('pro-bac-grandoral',     'pro-bac', 'Grand Oral',           'Preparation Grand Oral, prise de parole', 4),
  ('pro-bac-specialites',   'pro-bac', 'Specialites bac',      'Revision toutes specialites, methodologie', 5);

-- Classes preparatoires (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('pro-prepa-maths',       'pro-prepa', 'Maths sup/spe',        'Algebre, analyse, probabilites niveau CPGE', 1),
  ('pro-prepa-physique',    'pro-prepa', 'Physique prepa',        'Mecanique, thermodynamique, electromagnetisme', 2),
  ('pro-prepa-lettres',     'pro-prepa', 'Lettres & philo prepa', 'Khagne, hypokhagne, culture generale', 3),
  ('pro-prepa-ecs',         'pro-prepa', 'ECG / ECT',             'Maths, ESH, culture G ecoles de commerce', 4);

-- Medecine & sante (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('pro-med-pass',           'pro-medecine', 'PASS / LAS',         'Premiere annee medecine, UE fondamentales', 1),
  ('pro-med-ecn',            'pro-medecine', 'ECN / EDN',          'Preparation concours national medecine', 2),
  ('pro-med-anatomie',       'pro-medecine', 'Anatomie',           'Anatomie descriptive, fonctionnelle', 3),
  ('pro-med-biochimie',      'pro-medecine', 'Biochimie',          'Biochimie structurale, metabolique, moleculaire', 4);

-- Droit (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('pro-droit-civil',        'pro-droit', 'Droit civil',          'Obligations, contrats, responsabilite', 1),
  ('pro-droit-constit',      'pro-droit', 'Droit constitutionnel','Institutions, Constitution, jurisprudence', 2),
  ('pro-droit-crfpa',        'pro-droit', 'CRFPA (barreau)',      'Preparation examen avocat, cas pratiques', 3);

-- Commerce & management (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('pro-com-marketing',      'pro-commerce', 'Marketing',           'Strategie marketing, digital, etude marche', 1),
  ('pro-com-finance',        'pro-commerce', 'Finance entreprise',  'Comptabilite, analyse financiere, gestion', 2),
  ('pro-com-management',     'pro-commerce', 'Management',          'Leadership, gestion equipe, RH', 3);

-- Fonction publique (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('pro-fonc-cultg',         'pro-fonction', 'Culture generale',    'Culture G concours, synthese, dissertation', 1),
  ('pro-fonc-droit',         'pro-fonction', 'Droit public',        'Droit administratif, droit public concours', 2),
  ('pro-fonc-note',          'pro-fonction', 'Note de synthese',    'Methodologie note, rapport, cas pratique', 3);

-- Orientation & Parcoursup (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('pro-orient-parcoursup',  'pro-orientation', 'Dossier Parcoursup',   'Lettre motivation, projet formation, voeux', 1),
  ('pro-orient-orientation', 'pro-orientation', 'Bilan d orientation',  'Tests, coaching orientation, projet professionnel', 2),
  ('pro-orient-cv',          'pro-orientation', 'CV & entretiens',      'Preparation CV, lettre, entretien admission', 3);


-- ============================================
-- DOMAINE 8 : ACCOMPAGNEMENT SPECIFIQUE (6 sous-domaines)
-- ============================================

INSERT OR IGNORE INTO sous_domaines (id, domaine_id, nom, description, ordre) VALUES
  ('accom-dys',          'accompagnement', 'Troubles DYS',              'Dyslexie, dyscalculie, dyspraxie, dysorthographie', 1),
  ('accom-tdah',         'accompagnement', 'TDAH',                      'Trouble Deficit Attention avec/sans Hyperactivite', 2),
  ('accom-hpi',          'accompagnement', 'Haut Potentiel (HPI)',      'Precocite intellectuelle, ennui scolaire, adaptation', 3),
  ('accom-methodo',      'accompagnement', 'Methodologie',              'Apprendre a apprendre, organisation, memoire', 4),
  ('accom-confiance',    'accompagnement', 'Confiance & motivation',    'Gestion du stress, confiance en soi, motivation', 5),
  ('accom-autisme',      'accompagnement', 'Spectre autistique (TSA)',  'Accompagnement adapte troubles du spectre autistique', 6);

-- Troubles DYS (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('accom-dys-dyslexie',       'accom-dys', 'Dyslexie',            'Difficultes lecture, strategies compensatoires', 1),
  ('accom-dys-dyscalculie',    'accom-dys', 'Dyscalculie',         'Difficultes en calcul et raisonnement logique', 2),
  ('accom-dys-dyspraxie',      'accom-dys', 'Dyspraxie',           'Troubles de la coordination, graphisme, motricite', 3),
  ('accom-dys-dysorthographie', 'accom-dys', 'Dysorthographie',    'Difficultes orthographe, dictees adaptees', 4);

-- TDAH (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('accom-tdah-concentration',  'accom-tdah', 'Aide a la concentration', 'Techniques pour maintenir l attention', 1),
  ('accom-tdah-organisation',   'accom-tdah', 'Organisation scolaire',   'Planning, outils, gestion du temps', 2),
  ('accom-tdah-gestion',        'accom-tdah', 'Gestion des emotions',    'Regulation emotionnelle, impulsivite', 3);

-- HPI (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('accom-hpi-enrichissement',  'accom-hpi', 'Enrichissement',         'Approfondissement, projets stimulants, defis', 1),
  ('accom-hpi-socialisation',   'accom-hpi', 'Socialisation',          'Relations sociales, integration, decalage', 2),
  ('accom-hpi-methodologie',    'accom-hpi', 'Methodologie HPI',       'Apprendre a travailler, gerer la facilite', 3);

-- Methodologie (4 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('accom-meth-apprendre',      'accom-methodo', 'Apprendre a apprendre',   'Techniques memorisation, mind mapping, revision', 1),
  ('accom-meth-organisation',   'accom-methodo', 'Organisation & planning',  'Agenda, planification, gestion des devoirs', 2),
  ('accom-meth-prise-notes',    'accom-methodo', 'Prise de notes',           'Techniques de prise de notes efficaces', 3),
  ('accom-meth-examens',        'accom-methodo', 'Preparation examens',      'Strategies revision, gestion temps examen', 4);

-- Confiance & motivation (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('accom-conf-estime',         'accom-confiance', 'Estime de soi',         'Renforcement confiance, valorisation, autonomie', 1),
  ('accom-conf-stress',         'accom-confiance', 'Gestion du stress',     'Techniques relaxation, respiration, examens', 2),
  ('accom-conf-motivation',     'accom-confiance', 'Remotivation scolaire', 'Retrouver le plaisir d apprendre, objectifs', 3);

-- TSA (3 thematiques)
INSERT OR IGNORE INTO thematiques (id, sous_domaine_id, nom, description, ordre) VALUES
  ('accom-tsa-scolaire',        'accom-autisme', 'Soutien scolaire adapte TSA',  'Apprentissage adapte, supports visuels', 1),
  ('accom-tsa-habiletes',       'accom-autisme', 'Habiletes sociales',           'Communication, interaction, comprehension sociale', 2),
  ('accom-tsa-autonomie',       'accom-autisme', 'Autonomie quotidienne',        'Routines, organisation, vie quotidienne', 3);
