#!/usr/bin/env bash
# ==============================================================================
# LifeLink Automated Test Suite Execution Script
# Student: Arsh Vardhan Singh (Reg. No: 24BCE2119)
# Course Context: Database Systems Lab | School of CSE, VIT
# ==============================================================================

set -euo pipefail

echo "================================================================================"
echo " Starting LifeLink Test Suite (20 Verification Criteria)"
echo " Student Developer: Arsh Vardhan Singh (24BCE2119)"
echo "================================================================================"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# 1. Compile test bundle
echo "==> Compiling backend test bundle..."
./node_modules/.bin/esbuild backend/src/tests/suite.test.ts \
  --bundle \
  --platform=node \
  --format=esm \
  --target=node22 \
  --outfile=backend/dist/suite.test.js

# 2. Execute test suite
echo "==> Running 20 mandatory DBMS verification tests..."
node backend/dist/suite.test.js

echo "================================================================================"
echo " All tests passed successfully!"
echo "================================================================================"
