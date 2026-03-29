#!/bin/bash
# Script de migration D1 - Soutien Scolaire Caplogy
# Usage: npm run migrate

DB_NAME="soutien-scolaire-db"

echo "=== Migration D1 : $DB_NAME ==="

for file in migrations/*.sql; do
  if [ -f "$file" ]; then
    echo "Applying: $file"
    wrangler d1 execute "$DB_NAME" --file="$file" --remote
    echo "Done: $file"
    echo "---"
  fi
done

echo "=== All migrations applied ==="
