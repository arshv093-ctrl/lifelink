#!/usr/bin/env bash
# ==============================================================================
# LifeLink Service Launcher Script
# Student: Arsh Vardhan Singh (24BCE2119) | VIT DBMS Lab
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "================================================================================"
echo " Starting LifeLink Full-Stack Platform"
echo " Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)"
echo " Course: Database Systems Lab | School of CSE, VIT"
echo "================================================================================"

# 1. Build backend
echo "==> Building backend..."
npm run build:backend

# 2. Build frontend
echo "==> Building frontend..."
npm run build:frontend

echo "✓ Full stack builds successfully compiled."
echo "Starting backend API server on http://localhost:4000..."
node backend/dist/server.js
