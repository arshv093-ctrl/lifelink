# LIFELINK TECHNICAL ARCHITECTURE SPECIFICATION

**System Name:** LifeLink — A Tamper-Evident, Concurrency-Safe Blood & Organ Allocation Platform  
**Student Developer:** Arsh Vardhan Singh (Registration Number: 24BCE2119)  
**Institutional Context:** School of Computer Science and Engineering, Vellore Institute of Technology (VIT)  
**Course Context:** Database Systems Lab  
**Project Identifier:** `LIFELINK_24BCE2119`  

---

## 1. System Overview & Monorepo Architecture

LifeLink is structured as a decoupled full-stack monorepo designed for high availability, relational data integrity, and strict separation of concerns.

```
lifelink/
├── apps/ (or subdirectories)
│   ├── backend/               # High-performance Node.js / Express / TypeScript API
│   │   ├── src/
│   │   │   ├── config/        # Student constants & global configurations
│   │   │   ├── db/            # Database schema, connections, and seeders
│   │   │   ├── middleware/    # Auth, RBAC, and hospital isolation middleware
│   │   │   ├── services/      # Allocation, Audit, Telemetry, and Emergency services
│   │   │   ├── tests/         # 20-Criteria automated DBMS test suite
│   │   │   └── server.ts      # REST API entrypoint (/api/v1)
│   ├── frontend/              # Modern React 18 / Vite / Tailwind CSS client
│   │   ├── src/
│   │   │   ├── components/    # Layout, Navbar, Sidebar, and UI primitives
│   │   │   ├── context/       # AuthContext & RBAC state
│   │   │   ├── pages/         # 13 Dedicated application and lab pages
│   │   │   └── services/      # Typed API client
│   └── database/
│       ├── migrations/        # DDL, Views, Procedures, Triggers (PostgreSQL 16)
│       └── lab/               # Standalone SQL experiment scripts
├── docs/                      # Comprehensive academic & engineering documentation
│   ├── architecture/          # Technical architecture (this document)
│   ├── database/              # ER Diagram, Schema, Normalization proofs
│   ├── gantt/                 # Development timeline & milestones
│   ├── lab/                   # Step-by-step DBMS demonstration lab guide
│   ├── patents/               # Novelty & prior-art technical notes
│   ├── proposal/              # 8-Point project proposal
│   ├── submission/            # Rubric assessment checklist
│   └── testing/               # Automated test execution report
├── scripts/                   # Automated shell scripts for tests, backup, restore
├── docker-compose.yml         # Containerized multi-service deployment
├── Dockerfile.backend         # Production backend container build
├── .env.example               # Sanitized environment template
└── README.md                  # Comprehensive project manual
```

---

## 2. Technical Novelty N1: Hash-Chained Audit Ledger With Merkle Checkpoints

### A. Mathematical Canonicalization Scheme
To ensure deterministic hashing across diverse programming runtimes, JavaScript JSON engines, and database triggers, all change metadata is serialized using a deterministic key-sorted canonicalization function:

$$\text{Canonical}(O) = \text{SerializeSortedKeys}(O)$$

All numbers are formatted consistently, nulls are preserved as literal `null`, strings are UTF-8 encoded, and whitespace outside string literals is stripped.

### B. Hash-Chain Induction
For every sequential event $i \ge 1$:
$$H_0 = \text{"0000000000000000000000000000000000000000000000000000000000000000"}$$
$$H_i = \text{SHA256}\Big(H_{i-1} \parallel \text{entity\_type} \parallel \text{entity\_id} \parallel \text{operation\_type} \parallel \text{actor\_id} \parallel \text{Canonical}(\text{metadata})\Big)$$

### C. Merkle Checkpointing Protocol
Periodic checkpoints group batches of consecutive audit hashes $[H_{from}, \dots, H_{to}]$ into a balanced binary Merkle tree:
- If the number of leaves at level $k$ is odd, the final leaf is promoted or duplicated deterministically: $\text{Node}_{\text{parent}} = \text{SHA256}(\text{Left} \parallel \text{Right})$.
- The resulting Merkle Root Hash is persisted in `ledger_checkpoints`.
- Verification of any individual event $H_k$ within a checkpoint requires only $O(\log N)$ sibling proof hashes.

### D. Named Verification Stored Procedure
The stored function `verify_ledger_24BCE2119_ArshVardhanSingh()`:
1. Validates strictly consecutive `sequence_number` values ($S_{i} = S_{i-1} + 1$).
2. Validates that row $i$'s `previous_event_hash` matches row $i-1$'s `current_event_hash`.
3. Re-computes the SHA-256 hash from canonical row columns and compares it with `current_event_hash`. Any payload tampering immediately flags the exact sequence number where the cryptographic hash diverges.

---

## 3. Technical Novelty N2: Urgency-, Compatibility-, Shelf-Life-, and Distance-Aware Allocation

### A. Normalized Multi-Factor Priority Formula
$$\text{Priority Score} = w_u \cdot S_{\text{urgency}} + w_c \cdot S_{\text{compatibility}} + w_s \cdot S_{\text{shelflife}} + w_d \cdot S_{\text{distance}}$$

Configured weights:
- $w_u = 0.35$ (Clinical Urgency: CRITICAL = 100, HIGH = 80, MEDIUM = 50, LOW = 20)
- $w_c = 0.30$ (Biological Compatibility: Exact match = 100, Universal compatible = 90)
- $w_s = 0.20$ (First-Expired-First-Out Shelf Life: Prioritizes viable units nearing expiry to minimize wastage)
- $w_d = 0.15$ (Geographic Proximity: Haversine distance penalty $S_d = \max(10, 100 - 0.2 \cdot \text{distance\_km})$)

**Hard Constraint Invariant:** Biological ABO/Rh incompatibility is an absolute disqualifier ($S_{\text{compatibility}} = 0 \implies \text{Total Score} = 0$).

### B. Global Resource Lock Hierarchy & Anti-Deadlock Guarantee
To eliminate circular wait deadlocks in concurrent multi-hospital allocation transactions:
1. **Resource Order 1:** The `requests` record is locked first:
   ```sql
   SELECT * FROM requests WHERE request_id = $1 FOR UPDATE;
   ```
2. **Resource Order 2:** The selected `inventory_units` row is locked second:
   ```sql
   SELECT * FROM inventory_units WHERE unit_id = $2 FOR UPDATE;
   ```
3. **Condition Re-Validation Under Exclusive Lock:** The transaction asserts that `requests.status = 'OPEN'` and `inventory_units.status = 'AVAILABLE'` and `expiry_time > NOW()`.
4. **Atomic Commit:** The allocation record is inserted, statuses are updated, and the audit event is appended simultaneously within the single ACID transaction boundary.

---

## 4. Technical Novelty N3: Query Telemetry & Self-Tuning Index Advisor

### A. Non-Blocking Query Telemetry Middleware
- Captures query execution start and end timestamps via high-resolution performance counters.
- Sanitizes SQL queries into parameterized fingerprints (e.g., `SELECT * FROM users WHERE email = ? AND user_id = ?`). All PII, tokens, and numeric parameters are redacted.
- Flags queries exceeding $15\text{ ms}$ for indexing review.

### B. Index Recommendation & Controlled Benchmarking
- Analyzes candidate table columns against high-frequency equality and range query filters.
- Recommends B-Tree for range/sorting workloads and Hash indexes for strictly equality workloads.
- Benchmarks execution time before and after index creation.
- Provides one-click administrative approval and instant rollback if performance regresses.

---

## 5. Security & Role-Based Access Control (RBAC)

| Role | Domain Scope | Permitted Actions |
|---|---|---|
| `ADMIN` | Global (Cross-Hospital) | User & hospital administration, audit ledger verification, telemetry review, index tuning approval |
| `HOSPITAL_STAFF` | Tenant Hospital Only | Hospital inventory intake, request creation, local dispatch management |
| `DOCTOR` | Clinical / Patient Scope | Patient request submission, urgent allocation review, break-glass emergency elevation |
| `DONOR_COORDINATOR` | Donor Management | Donor intake, consent document verification, organ availability coordination |

### Hospital Data Isolation & Break-Glass Elevation
- Hospital staff and clinicians are strictly restricted to accessing records belonging to their assigned `hospital_id`.
- The Break-Glass Emergency workflow temporarily elevates a clinician's permissions to access cross-hospital inventory when justified by an acute life-threatening emergency.
- Expiration (default 15 minutes, maximum 30 minutes) is enforced server-side on every request. Every elevation event is sealed in the immutable audit ledger.
