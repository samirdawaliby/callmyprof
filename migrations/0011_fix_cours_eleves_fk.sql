-- Fix cours_eleves: remove FK constraint on eleve_id that pointed to 'eleves' table.
-- Students are stored in 'users' (role='eleve'), not in the 'eleves' table.
PRAGMA foreign_keys = OFF;
CREATE TABLE cours_eleves_new (
  cours_id TEXT NOT NULL REFERENCES cours(id) ON DELETE CASCADE,
  eleve_id TEXT NOT NULL,
  package_id TEXT,
  heures_debitees REAL NOT NULL DEFAULT 1,
  present INTEGER DEFAULT 1,
  notes_progression TEXT,
  PRIMARY KEY (cours_id, eleve_id)
);
INSERT OR IGNORE INTO cours_eleves_new SELECT * FROM cours_eleves;
DROP TABLE cours_eleves;
ALTER TABLE cours_eleves_new RENAME TO cours_eleves;
PRAGMA foreign_keys = ON;
