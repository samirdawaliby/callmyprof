-- ============================================
-- SOUTIEN SCOLAIRE CAPLOGY - Seed Packages
-- Migration 0003 : Types de packages
-- INSERT OR IGNORE pour idempotence
-- ============================================

INSERT OR IGNORE INTO package_types (id, nom, type_cours, nb_heures, prix, prix_par_heure, eligible_credit_impot, duree_validite_jours, max_eleves_collectif, actif, ordre) VALUES
  ('decouverte',   'Decouverte 1h',    'individuel', 1,   36.00,  36.00, 1, 30,  1, 1, 1),
  ('essentiel',    'Essentiel 5h',     'individuel', 5,   170.00, 34.00, 1, 90,  1, 1, 2),
  ('confort',      'Confort 10h',      'individuel', 10,  320.00, 32.00, 1, 180, 1, 1, 3),
  ('intensif',     'Intensif 20h',     'individuel', 20,  600.00, 30.00, 1, 365, 1, 1, 4),
  ('collectif-10', 'Collectif 10h',    'collectif',  10,  120.00, 12.00, 0, 180, 6, 1, 5);
