#!/usr/bin/env bash
# ==============================================================================
# LifeLink Database Restore & Verification Script
# Student: Arsh Vardhan Singh (24BCE2119) | VIT DBMS Lab
# ==============================================================================

set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <path-to-backup-file>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file '$BACKUP_FILE' does not exist."
  exit 1
fi

echo "==> Restoring LifeLink Database from ${BACKUP_FILE}..."

if [[ "$BACKUP_FILE" == *.dump ]] && command -v pg_restore >/dev/null 2>&1; then
  pg_restore --clean --if-exists -d "${DATABASE_URL:-postgresql://localhost:5432/lifelink_db}" "$BACKUP_FILE"
  echo "✓ PostgreSQL backup restored."
elif [[ "$BACKUP_FILE" == *.db ]]; then
  mkdir -p data
  cp "$BACKUP_FILE" "data/lifelink.db"
  echo "✓ Local database restored to data/lifelink.db."
else
  echo "Unrecognized backup format. Supported: .dump, .db"
  exit 1
fi

echo "==> Running post-restore audit ledger verification..."
npm run test
echo "✓ Verification complete. Relational state restored cleanly."
