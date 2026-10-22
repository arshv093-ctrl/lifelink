# LifeLink: A Tamper-Evident, Concurrency-Safe Blood & Organ Allocation Platform

[![DBMS Lab Assessment](https://img.shields.io/badge/Academic%20Context-VIT%20School%20of%20CSE-blue.svg)](https://vit.ac.in)
[![Student Identity](https://img.shields.io/badge/Developer-Arsh%20Vardhan%20Singh%20(24BCE2119)-red.svg)](#1-student--institutional-information)
[![Tests Passing](https://img.shields.io/badge/Automated%20Tests-20%2F20%20Passing-emerald.svg)](docs/testing/TEST_REPORT.md)
[![Database](https://img.shields.io/badge/PostgreSQL-16-navy.svg)](database/migrations/01_schema.sql)
[![License](https://img.shields.io/badge/License-Academic%20Evaluation%20Only-lightgrey.svg)](#)

---

## 1. Student & Institutional Information

* **Student Name:** Arsh Vardhan Singh
* **Registration Number:** `24BCE2119`
* **Institutional Context:** School of Computer Science and Engineering, Vellore Institute of Technology (VIT)
* **Course Context:** Database Systems Lab (DBMS Capstone Assessment)
* **Project Identifier:** `LIFELINK_24BCE2119`

### Assessment Mandatory Identifiers
* `allocate_unit_24BCE2119_ArshVardhanSingh()`
* `verify_ledger_24BCE2119_ArshVardhanSingh()`
* `LifeLinkAuditService_24BCE2119_ArshVardhanSingh`
* `LifeLinkAllocationService_24BCE2119_ArshVardhanSingh`
* `STUDENT_REGISTRATION_24BCE2119` = `"24BCE2119"`
* `STUDENT_NAME_ArshVardhanSingh` = `"Arsh Vardhan Singh"`

---

## 2. Executive Summary & Problem Statement

In distributed emergency healthcare networks, coordination of scarce blood and organ inventory suffers from three critical database failure modes:
1. **Lost Updates & Double-Allocation:** Multiple hospitals submitting simultaneous requests for the same scarce unit create race conditions, leading to physical double-allocation of single donor units.
2. **Audit Invalidation:** Traditional audit logs are vulnerable to silent tampering, backdating, or deletions by compromised database users without cryptographic proof.
3. **Query Degradation & Resource Inefficiency:** Real-time crossmatch queries across thousands of units degrade without adaptive indexing, increasing emergency dispatch latencies.

**LifeLink** is a centralized, PostgreSQL-backed allocation platform featuring an append-only SHA-256 hash-chained audit ledger with Merkle root checkpoints, an urgency- and shelf-life-aware allocation engine with strict Two-Phase Locking (2PL), non-blocking query telemetry with an autonomous index advisor, and break-glass emergency access.

---

## 3. Three Core Technical Novelties

### Novelty N1: PostgreSQL Hash-Chained Audit Ledger with Merkle Checkpoints
* Every inventory mutation, clinical request, allocation, and emergency access event writes to an append-only sequential ledger (`audit_ledger`).
* Each record cryptographically binds the previous record's hash ($H_{i-1}$) with the canonicalized event payload via SHA-256.
* Stored procedure `verify_ledger_24BCE2119_ArshVardhanSingh()` recalculates the chain in $O(N)$ and detects payload tampering or missing sequence numbers.
* Periodic batches are structured into a binary Merkle tree, persisting the root hash in `ledger_checkpoints` for $O(\log N)$ inclusion verification.
* Tamper-evident within the database instance; supports external trusted anchoring.

### Novelty N2: Multi-Factor Allocation Engine with Anti-Deadlock Locking Hierarchy
* Normalized scoring formula:
  $$\text{Priority Score} = 0.35 \times \text{Urgency} + 0.30 \times \text{Compatibility} + 0.20 \times \text{ShelfLife} + 0.15 \times \text{Proximity}$$
* **Hard Biological Constraint:** ABO/Rh compatibility is an absolute prerequisite filter before scoring. Incompatible pairs receive a score of $0$.
* First-Expired-First-Out (FEFO) shelf-life weighting prioritizes viable units nearing expiry to prevent wastage.
* Stored procedure `allocate_unit_24BCE2119_ArshVardhanSingh()` implements a global lock order (`requests` $\to$ `inventory_units` using `FOR UPDATE`), mathematically preventing circular deadlock cycles during concurrent multi-hospital contention.

### Novelty N3: Query Telemetry & Self-Tuning Index Advisor
* Non-blocking query observer intercepts queries and redacts parameters into sanitized fingerprints (e.g. `SELECT * FROM users WHERE email = ?`).
* Records execution duration, timestamp, and result count in `query_telemetry` without storing private medical or patient information.
* Evaluates workload access patterns and generates targeted B-Tree and Hash index recommendations with estimated improvement percentages.
* Integrates `EXPLAIN` query plan analysis, administrative approval workflows, and instant rollback capabilities.

### Bonus Feature: Break-Glass Emergency Elevated Access
* Authorized clinicians can request temporary elevated permissions to override hospital isolation during catastrophic emergencies.
* Requires a mandatory clinical justification ($\ge 10$ characters).
* Automatically expires on the server after a short duration (maximum 30 minutes).
* Every elevation event is sealed in the immutable audit ledger.

---

## 4. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, TypeScript 5.4, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Node.js 22/26, Express / HTTP, TypeScript, Zod, Native Cryptography |
| **Database** | PostgreSQL 16 (with Node DatabaseSync high-fidelity local runtime) |
| **ORM / Migration** | PostgreSQL DDL Migrations (`01_schema.sql` through `04_triggers.sql`) |
| **DevOps** | Docker, Docker Compose, GitHub Actions CI, POSIX Shell Scripts |

---

## 5. Relational Database Design (16 Normalized Tables)

LifeLink is normalized up to **Boyce-Codd Normal Form (BCNF)** and satisfies Fourth Normal Form (4NF). See [ER Diagram and Schema Documentation](docs/database/ER_DIAGRAM_AND_SCHEMA.md) for full proofs and functional dependency analysis.

1. `roles` (RBAC authority levels)
2. `hospitals` (Connected medical centers with synthetic GPS coordinates)
3. `users` (Single unified login table with role and hospital foreign keys)
4. `blood_types` (ABO & Rh biological compatibility matrix)
5. `patients` (Synthetic clinical patient profiles)
6. `donors` (Synthetic donor profiles with verified consent references)
7. `inventory_units` (Cold chain blood and organ inventory with expiry timestamps)
8. `requests` (Clinical transfusion requests with urgency levels and justifications)
9. `allocations` (ACID allocation records with multi-factor score breakdown)
10. `inventory_transfers` (Inter-hospital custody transfer records)
11. `transactions_log` (Transaction execution telemetry and rollback logs)
12. `audit_ledger` (Hash-chained append-only sequential ledger)
13. `ledger_checkpoints` (Merkle tree root checkpoints)
14. `query_telemetry` (Sanitized query latency and execution metrics)
15. `index_recommendations` (Autonomous index advisor tuning items)
16. `emergency_grants` (Break-glass elevated access grants)

### Implemented PostgreSQL Views
* `v_available_inventory`: Real-time unexpired, unquarantined, available units with hospital coordinates.
* `v_open_requests`: Active clinical requests ordered by physiological urgency.
* `v_hospital_inventory_summary`: Aggregated inventory counts by hospital node and component.
* `v_allocation_history`: Historical trace of allocations with full score breakdowns.

---

## 6. Demo Accounts for Local Development

| Role | Email | Password | Assigned Scope |
|---|---|---|---|
| **Admin** | `admin@lifelink.org` | `Password123!` | Global Platform Governance |
| **Hospital Staff** | `staff.cmc@lifelink.org` | `Password123!` | Christian Medical College (CMC Vellore) |
| **Hospital Staff** | `staff.apollo@lifelink.org` | `Password123!` | Apollo Main Hospital (Chennai) |
| **Doctor** | `dr.sharma@lifelink.org` | `Password123!` | CMC Vellore Clinical Trauma Service |
| **Donor Coordinator** | `coordinator@lifelink.org` | `Password123!` | CMC Vellore Donor Intake Desk |

---

## 7. Quickstart & Installation Instructions

### Prerequisites
* Node.js v22+ or v26+
* npm v10+
* (Optional) Docker & Docker Compose for containerized deployment

### Installation
```bash
# 1. Clone repository
git clone https://github.com/ArshVardhanSingh/lifelink.git
cd lifelink

# 2. Configure environment
cp .env.example .env

# 3. Build full stack (backend bundle + frontend assets)
npm run build
```

### Running the Application Locally
```bash
# Start backend API server (runs on http://localhost:4000)
npm start

# In a separate terminal, launch the frontend dev server (http://localhost:3000)
npm run dev:frontend
```

---

## 8. Running Automated Tests

LifeLink includes an automated test suite verifying all 20 mandatory rubric criteria:
```bash
# Execute complete 20-criteria DBMS test suite
npm run test:build

# Alternatively, execute the shell test script
./scripts/run_tests.sh
```

**Automated Test Summary:** 20 Passed / 0 Failed. See [Detailed Test Report](docs/testing/TEST_REPORT.md).

---

## 9. Backup and Recovery Demonstration

LifeLink provides automated scripts for PostgreSQL and local database backup and restoration:
```bash
# Create logical database snapshot
./scripts/backup_db.sh

# Restore database and verify audit ledger integrity
./scripts/restore_db.sh backups/<backup-filename>
```
See [Database Demonstration Guide](docs/lab/DATABASE_DEMONSTRATION_GUIDE.md) for full verification steps.

---

## 10. Docker Deployment

To launch the complete multi-service stack with PostgreSQL 16, Backend API, and Nginx Frontend:
```bash
docker compose up -d --build
```
* **Web UI:** http://localhost:3000
* **REST API:** http://localhost:4000/api/v1/health
* **PostgreSQL:** `localhost:5432` (User: `lifelink_user`, DB: `lifelink_db`)

---

## 11. REST API Specification Overview (`/api/v1`)

* `GET /api/v1/health`: Server health check, runtime status, and student credentials.
* `POST /api/v1/auth/login`: Email/password authentication and JWT session generation.
* `POST /api/v1/auth/demo-login`: Quick role-switching endpoint for assessment simulation.
* `GET /api/v1/dashboard/stats`: Relational aggregate statistics and recent audit stream.
* `GET /api/v1/inventory`: Filterable inventory list (blood type, component, status, hospital).
* `POST /api/v1/inventory`: Inventory intake endpoint with storage validation.
* `GET /api/v1/requests`: Clinical requests queue filterable by urgency and status.
* `POST /api/v1/requests`: Submit urgent transfusion request with clinical justification.
* `POST /api/v1/allocations/allocate`: Atomic multi-factor allocation execution.
* `GET /api/v1/allocations/history`: Audit trail of committed allocations.
* `GET /api/v1/audit/events`: Sequential hash-chained audit events.
* `POST /api/v1/audit/verify`: Stored procedure call verifying hash chain and Merkle roots.
* `POST /api/v1/audit/tamper-demo`: Deliberate tampering test simulation.
* `GET /api/v1/telemetry`: Query duration samples and slowest query patterns.
* `POST /api/v1/telemetry/explain`: Controlled `EXPLAIN` query plan inspector.
* `GET /api/v1/index-recommendations`: Candidate index recommendations.
* `POST /api/v1/emergency-access/request`: Request break-glass temporary elevation.
* `POST /api/v1/lab/concurrency-test`: Dual-hospital simultaneous race experiment.

---

## 12. Project Documentation Index

* [Project Proposal (8 Required Items)](docs/proposal/PROJECT_PROPOSAL.md)
* [Gantt Chart & Development Timeline](docs/gantt/GANTT_CHART.md)
* [Relational Schema, ER Diagram & Normalization Proofs](docs/database/ER_DIAGRAM_AND_SCHEMA.md)
* [Technical Architecture Specification](docs/architecture/TECHNICAL_ARCHITECTURE.md)
* [Automated Test Execution Report (20 Criteria)](docs/testing/TEST_REPORT.md)
* [Database Systems Lab Demonstration Guide](docs/lab/DATABASE_DEMONSTRATION_GUIDE.md)
* [Confidential Novelty & Prior-Art Working Notes](docs/patents/PATENT_AND_NOVELTY_NOTES.md)
* [Assessment Submission Rubric Checklist](docs/submission/ASSESSMENT_SUBMISSION_CHECKLIST.md)

---

## 13. Academic Disclaimer

LifeLink is an educational database engineering project developed for the Database Systems Lab at Vellore Institute of Technology (VIT). It is designed to demonstrate advanced concepts in concurrency control, transaction isolation, cryptographic audit logging, and query optimization. All patient, donor, and hospital records are synthetic. The system does not substitute for certified clinical decision-making or official transplant allocation protocols.
