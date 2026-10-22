# LIFELINK ASSESSMENT SUBMISSION CHECKLIST & RUBRIC MAPPING

**Student Name:** Arsh Vardhan Singh  
**Registration Number:** 24BCE2119  
**Course Context:** Database Systems Lab (DBMS Assessment)  
**Institutional Context:** School of Computer Science and Engineering, Vellore Institute of Technology (VIT)  
**Project Name:** LifeLink (`LIFELINK_24BCE2119`)  

---

## Rubric Compliance Mapping Matrix

| Rubric Requirement | Implemented Feature | Source Code Location | Database Object | Test / Lab Verification | Documentation Reference |
|---|---|---|---|---|---|
| **1. Student Identity** | Arsh Vardhan Singh & 24BCE2119 in identifiers | `backend/src/config/constants.ts`, `auditService.ts` | Stored procedures & metadata | Test 1, About Page, README | [README.md](../../README.md), [AboutPage.tsx](../../frontend/src/pages/AboutPage.tsx) |
| **2. Relational Schema** | 16 Normalized relational tables (1NF-BCNF) | `backend/src/db/schema.ts`, `database/migrations/` | `users`, `hospitals`, `inventory_units`, etc. | Test 4, Database Inspector | [ER_DIAGRAM_AND_SCHEMA.md](../database/ER_DIAGRAM_AND_SCHEMA.md) |
| **3. Database Views** | 4 PostgreSQL aggregate views | `database/migrations/02_views.sql` | `v_available_inventory`, `v_allocation_history`, etc. | Reports Page, Seed Script | [DATABASE_DEMONSTRATION_GUIDE.md](../lab/DATABASE_DEMONSTRATION_GUIDE.md) |
| **4. Stored Procedures** | Atomic allocation & ledger verification | `backend/src/services/allocationService.ts`, `auditService.ts` | `allocate_unit_24BCE2119_ArshVardhanSingh()`, `verify_ledger_24BCE2119_ArshVardhanSingh()` | Tests 9, 13 | [TECHNICAL_ARCHITECTURE.md](../architecture/TECHNICAL_ARCHITECTURE.md) |
| **5. Database Triggers** | Append-only audit security triggers | `database/migrations/04_triggers.sql` | `trg_audit_ledger_immutable`, `fn_audit_inventory_mutation` | Trigger migration script | [ER_DIAGRAM_AND_SCHEMA.md](../database/ER_DIAGRAM_AND_SCHEMA.md) |
| **6. Novelty N1 (Audit Ledger)** | Hash-chained ledger + Merkle root checkpoints | `backend/src/services/auditService.ts`, `AuditLedgerPage.tsx` | `audit_ledger`, `ledger_checkpoints` | Tests 13, 14, 15 | [TECHNICAL_ARCHITECTURE.md](../architecture/TECHNICAL_ARCHITECTURE.md), [PATENT_AND_NOVELTY_NOTES.md](../patents/PATENT_AND_NOVELTY_NOTES.md) |
| **7. Novelty N2 (Allocation)** | Concurrency-safe multi-factor allocation | `backend/src/services/allocationService.ts`, `AllocationCenterPage.tsx` | `allocations`, `requests` | Tests 6, 7, 8, 9, 11, 12 | [TECHNICAL_ARCHITECTURE.md](../architecture/TECHNICAL_ARCHITECTURE.md) |
| **8. Novelty N3 (Telemetry)** | Query telemetry & self-tuning index advisor | `backend/src/services/telemetryService.ts`, `TelemetryPage.tsx` | `query_telemetry`, `index_recommendations` | Tests 18, 19 | [TECHNICAL_ARCHITECTURE.md](../architecture/TECHNICAL_ARCHITECTURE.md) |
| **9. Bonus Feature (Emergency)** | Break-glass elevated access with auto-expiry | `backend/src/services/emergencyService.ts`, `EmergencyAccessPage.tsx` | `emergency_grants` | Tests 16, 17 | [TECHNICAL_ARCHITECTURE.md](../architecture/TECHNICAL_ARCHITECTURE.md) |
| **10. Concurrency Testing** | Dual-hospital simultaneous race experiment | `backend/src/services/allocationService.ts`, `LabPage.tsx` | Row-level locking (`FOR UPDATE`) | Test 12, Lab UI | [DATABASE_DEMONSTRATION_GUIDE.md](../lab/DATABASE_DEMONSTRATION_GUIDE.md) |
| **11. ACID Rollback** | Deliberate mid-transaction failure rollback | `backend/src/db/connection.ts`, `LabPage.tsx` | `transactions_log` | Test 10, Lab UI | [DATABASE_DEMONSTRATION_GUIDE.md](../lab/DATABASE_DEMONSTRATION_GUIDE.md) |
| **12. RBAC & Multi-Tenancy** | 4 Roles & Hospital-level isolation | `backend/src/services/rbacService.ts` | `roles`, `users.hospital_id` | Tests 2, 3 | [TECHNICAL_ARCHITECTURE.md](../architecture/TECHNICAL_ARCHITECTURE.md) |
| **13. Database Recovery** | Automated backup & restore shell scripts | `scripts/backup_db.sh`, `scripts/restore_db.sh` | Logical dumps / snapshots | Restore script execution | [DATABASE_DEMONSTRATION_GUIDE.md](../lab/DATABASE_DEMONSTRATION_GUIDE.md) |
| **14. User Interface** | Responsive healthcare SaaS web app | `frontend/src/` | 13 Interactive Pages | Vite build output | [README.md](../../README.md) |
| **15. Automated Testing** | 20 Mandatory criteria test suite | `backend/src/tests/suite.test.ts` | Complete database suite | 20/20 Passing | [TEST_REPORT.md](../testing/TEST_REPORT.md) |
| **16. DevOps & Docker** | Docker Compose & GitHub Actions CI | `docker-compose.yml`, `.github/workflows/ci.yml` | Multi-container setup | CI workflow configuration | [README.md](../../README.md) |
