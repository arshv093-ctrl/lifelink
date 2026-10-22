# LIFELINK PROJECT GANTT CHART & DEVELOPMENT TIMELINE

**Student Developer:** Arsh Vardhan Singh (Registration Number: 24BCE2119)  
**Institutional Context:** VIT, School of Computer Science and Engineering  
**Course Context:** Database Systems Lab  

---

```mermaid
gantt
    title LifeLink Development Timeline (Arsh Vardhan Singh - 24BCE2119)
    dateFormat  YYYY-MM-DD
    section Phase 1: Planning & Modeling
    Requirements Analysis & Problem Formulation :done, p1_1, 2026-09-01, 4d
    ER Modeling & Functional Dependencies       :done, p1_2, 2026-09-05, 5d
    Relational Normalization (1NF to BCNF)      :done, p1_3, 2026-09-10, 3d

    section Phase 2: Database Schema & Migrations
    DDL Schema & Constraints (01_schema.sql)    :done, p2_1, 2026-09-13, 4d
    PostgreSQL Views & Aggregates (02_views.sql):done, p2_2, 2026-09-17, 3d
    Stored Procedures (03_procedures.sql)       :done, p2_3, 2026-09-20, 5d
    Triggers & Append-Only Audit (04_triggers)   :done, p2_4, 2026-09-25, 4d
    Deterministic Seed Dataset                  :done, p2_5, 2026-09-29, 3d

    section Phase 3: Core Backend & Novelties
    Auth, JWT Sessions & RBAC Engine            :done, p3_1, 2026-10-02, 4d
    N1: Hash-Chained Audit & Merkle Checkpoints :done, p3_2, 2026-10-06, 5d
    N2: Multi-Factor Allocation & 2PL Locks     :done, p3_3, 2026-10-11, 4d
    N3: Query Telemetry & Self-Tuning Advisor   :done, p3_4, 2026-10-15, 3d
    Bonus: Break-Glass Emergency Elevation      :done, p3_5, 2026-10-18, 2d

    section Phase 4: Frontend Application
    React Application Shell & Navbar/Sidebar    :done, p4_1, 2026-10-12, 3d
    Operations (Inventory, Requests, Allocate)  :done, p4_2, 2026-10-15, 4d
    DBMS Systems Lab & Demonstration Pages      :done, p4_3, 2026-10-19, 3d

    section Phase 5: Verification & Assessment
    20-Criteria Automated Test Suite Execution  :done, p5_1, 2026-10-21, 2d
    Documentation, Docker & Assessment Checklist:done, p5_2, 2026-10-22, 1d
```

## Milestone Summary

| Milestone | Deliverable | Status | Verification Criteria |
|---|---|---|---|
| **M1: Schema & Normalization** | 16 Normalized Tables, Views, Triggers | Completed | BCNF Certified, FK integrity enforced |
| **M2: Novelty N1 (Audit Ledger)** | `verify_ledger_24BCE2119_ArshVardhanSingh()` | Completed | SHA-256 chain verified, Merkle proof generated |
| **M3: Novelty N2 (Allocation)** | `allocate_unit_24BCE2119_ArshVardhanSingh()` | Completed | Atomic 2PL locks, race condition test passes |
| **M4: Novelty N3 (Telemetry)** | Query Telemetry & Index Advisor | Completed | Sanitized fingerprints, EXPLAIN plan benchmarking |
| **M5: Testing & Verification** | 20 Automated DBMS Criteria Suite | Completed | 20/20 Tests Passing |
| **M6: UI/UX & Demonstration Lab** | Responsive React/Tailwind Interface | Completed | 13 Interactive Pages |
