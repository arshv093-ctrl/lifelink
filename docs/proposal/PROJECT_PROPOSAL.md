# LIFELINK PROJECT PROPOSAL

**Course Context:** Database Systems Lab (DBMS Assessment)  
**Institutional Context:** School of Computer Science and Engineering, Vellore Institute of Technology (VIT)  
**Student Developer:** Arsh Vardhan Singh  
**Registration Number:** 24BCE2119  
**Project Identifier:** `LIFELINK_24BCE2119`  

---

## 1. Project Title
**LifeLink: A Tamper-Evident, Concurrency-Safe Blood and Organ Allocation Platform**

## 2. Problem Statement
In emergency hospital networks, blood and organ allocation is plagued by three fundamental database systems failure modes:
1. **Lost Updates & Double-Allocation:** Multiple regional hospitals requesting the same scarce unit simultaneously create race conditions, resulting in duplicate allocations of single physical biological units.
2. **Audit Invalidation & Data Tampering:** Conventional database audit logs can be covertly updated, reordered, or deleted by compromised credentials or malicious operators without cryptographic proof.
3. **Suboptimal Heuristics & Regressive Queries:** Real-time matching queries against thousands of inventory units degrade under emergency loads due to suboptimal indexing, causing life-critical dispatch latency.

## 3. Project Objectives
- Implement a **serializable, ACID-compliant transactional allocation engine** with deterministic multi-resource row-locking (`FOR UPDATE`) in PostgreSQL 16.
- Engineer an **append-only, cryptographic SHA-256 hash-chained audit ledger** with periodic **Merkle tree checkpoints** that detects payload modification or sequence gaps in $O(N)$ and verifies subtrees in $O(\log N)$.
- Build an autonomous **query telemetry and self-tuning index advisor** that extracts sanitized SQL fingerprints, evaluates execution latency, runs `EXPLAIN` query plans, and recommends targeted B-Tree or Hash indexes.
- Provide a controlled **Break-Glass Emergency Access workflow** with mandatory clinical justifications, short configurable expirations, and immutable audit logs.
- Demonstrate full **relational normalization up to Boyce-Codd Normal Form (BCNF)** across 16 well-structured tables.

## 4. Project Scope
### In Scope:
- 16 relational database tables covering roles, users, hospitals, patients, donors, blood types, inventory units, requests, allocations, transfers, transaction logs, audit ledgers, checkpoints, query telemetry, index recommendations, and emergency grants.
- Stored procedures: `allocate_unit_24BCE2119_ArshVardhanSingh()` and `verify_ledger_24BCE2119_ArshVardhanSingh()`.
- Four PostgreSQL database views (`v_available_inventory`, `v_open_requests`, `v_hospital_inventory_summary`, `v_allocation_history`).
- Four role-based access personas (Admin, Hospital Staff, Doctor, Donor Coordinator) with hospital-level multi-tenant data isolation.
- Comprehensive automated test suite validating 20 mandatory criteria.

### Out of Scope:
- Commercial clinical decision-making or regulated live medical diagnosis. LifeLink is an educational database engineering platform with synthetic records.

## 5. Team Members and Responsibilities
- **Individual Student Developer:** Arsh Vardhan Singh (Registration Number: 24BCE2119)
- **Role:** Sole Lead Full-Stack Architect, Database Systems Engineer, and Cryptographic Security Implementer.
- **Responsibilities:**
  - Relational schema architecture, DDL migrations, PostgreSQL views, triggers, and stored procedures.
  - Concurrency control, Two-Phase Locking (2PL), and deadlock prevention protocols.
  - Cryptographic canonical serialization, SHA-256 hash-chaining, and Merkle checkpoint tree algorithms.
  - REST API development, query telemetry middleware, and self-tuning index advisor.
  - React/TypeScript user interface, accessible design system, and DBMS lab test console.
  - Automated testing, documentation, and Docker containerization.

## 6. Technology Stack
- **Database Engine:** PostgreSQL 16 (with high-fidelity Node DatabaseSync runtime fallback)
- **Backend Runtime:** Node.js 22+ / 26+, TypeScript 5.4+, Native Cryptography
- **API Architecture:** RESTful `/api/v1` with Zod validation, JWT session handling, and RBAC middleware
- **Frontend Stack:** React 18, Vite 5, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **DevOps & Infrastructure:** Docker, Docker Compose, GitHub Actions CI, Shell backup/restore utilities

## 7. Major Deliverables
1. Production-style full-stack repository with monorepo structure (`backend`, `frontend`, `database`, `docs`, `scripts`).
2. Complete SQL migration scripts (`01_schema.sql`, `02_views.sql`, `03_procedures.sql`, `04_triggers.sql`).
3. 20-point automated DBMS test suite with passing status report.
4. Interactive DBMS Demonstration Lab (ACID rollback, 2-Hospital race test, 2PL, Lock modes, Index advisor).
5. Comprehensive documentation suite including ER Diagram, Normalization proofs, Architecture, and Demonstration Guide.

## 8. Project Timeline
See [Gantt Chart](../gantt/GANTT_CHART.md) for phased development milestones spanning planning, database design, backend implementation, frontend development, concurrency testing, and assessment verification.
