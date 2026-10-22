#!/usr/bin/env bash
# ==============================================================================
# LifeLink Database Backup Script (PostgreSQL / Local High-Fidelity)
# Student: Arsh Vardhan Singh (24BCE2119) | VIT DBMS Lab
# ==============================================================================

set -euo pipefail

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

echo "==> Creating LifeLink Database Backup at ${TIMESTAMP}..."

if command -v pg_dump >/dev/null 2>&1 && [ -n "${DATABASE_URL:-}" ]; then
  BACKUP_FILE="${BACKUP_DIR}/lifelink_pg_${TIMESTAMP}.dump"
  pg_dump -Fc "$DATABASE_URL" > "$BACKUP_FILE"
  echo "✓ PostgreSQL logical backup created: ${BACKUP_FILE}"
else
  # Local SQLite / file copy fallback
  if [ -f "data/lifelink.db" ]; then
    BACKUP_FILE="${BACKUP_DIR}/lifelink_local_${TIMESTAMP}.db"
    cp "data/lifelink.db" "$BACKUP_FILE"
    echo "✓ Local database snapshot saved: ${BACKUP_FILE}"
  else
    echo "⚠ No database file found in data/lifelink.db. Database has not been seeded yet."
  fi
fi

echo "==> Backup complete."
