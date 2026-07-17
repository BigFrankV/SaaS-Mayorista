#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Uso: ./restore_postgres.sh <archivo.sql>"
  exit 1
fi

cat "$1" | docker exec -i mayorista_postgres psql -U "$POSTGRES_USER" "$POSTGRES_DB"
echo "Restore completado"
