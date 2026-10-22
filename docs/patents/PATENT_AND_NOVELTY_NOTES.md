# LIFELINK TECHNICAL NOVELTY & PRIOR-ART WORKING NOTES

**Status:** Confidential Internal Research Working Document  
**Student Researcher:** Arsh Vardhan Singh (Registration Number: 24BCE2119)  
**Institutional Context:** School of Computer Science and Engineering, Vellore Institute of Technology (VIT)  
**Course Context:** Database Systems Lab  
**Date:** October 2026  

---

> **Notice & Disclaimer:** This document contains engineering notes and technical analysis exploring novel architectural patterns implemented in the LifeLink prototype. It does **not** assert or represent that the system or its methods are legally patentable. Nothing herein should be construed as legal advice or an established legal patent claim.

---

## 1. Technical Field
Database Management Systems (DBMS), high-concurrency transactional resource allocation, cryptographic audit ledgers, and automated query performance telemetry.

---

## 2. Technical Contribution 1: Serialized Hash-Chained Audit Ledger with Merkle Tree Checkpointing (N1)

### Technical Description
A mechanism embedded within a relational database engine where every qualifying record mutation automatically computes a deterministic SHA-256 cryptographic digest binding:
1. Predecessor event digest $H_{i-1}$
2. Relation metadata (entity type, entity identifier, operation type, actor credentials)
3. Deterministically serialized canonical JSON representation of changed fields

Periodically, discrete sequence batches $[S_{\text{start}}, S_{\text{end}}]$ are compressed into a binary Merkle tree whose root hash is persisted in a separate checkpoints relation. A verification routine re-evaluates the continuous chain in $O(N)$ and verifies arbitrary subsets in $O(\log N)$.

### Design Alternatives Considered
- **Standard PostgreSQL Trigger Log (audit.logged_actions):** Records tabular changes without cryptographic predecessor links. Vulnerable to silent record deletion or row modification by anyone with `UPDATE`/`DELETE` permissions on the audit table.
- **External Blockchain Anchoring (Hyperledger / Ethereum):** Introduces extreme transaction latency ($> 2\text{ to } 15\text{ seconds}$) and transaction fees (gas), which are incompatible with sub-second clinical emergency dispatch.
- **LifeLink Hybrid Approach:** Native in-engine cryptographic hash-chaining provides sub-millisecond append latency with mathematical tamper-evidence, coupled with optional periodic external anchor hashes.

### Known Limitations & Threat Model
A hash chain stored within the same database instance is subject to the administrative trust boundary of the database superuser. An administrator with direct disk access could theoretically rewrite the table and recompute all hashes. LifeLink addresses this by clearly labeling the ledger as **tamper-evident** rather than absolutely tamper-proof, and recommending external checkpoint broadcasting.

---

## 3. Technical Contribution 2: Multi-Factor Priority Allocation with Two-Phase Locking Hierarchy (N2)

### Technical Description
An atomic allocation protocol that evaluates candidate inventory against a normalized multi-factor objective function:
$$\text{Priority Score} = w_u S_u + w_c S_c + w_s S_s + w_d S_d$$
subject to the invariant that biological compatibility is an absolute precondition filter ($S_c > 0$).

To prevent deadlock cycles under high concurrent multi-hospital contention, transactions enforce a strict global lock hierarchy:
$$\text{requests} \prec \text{inventory\_units}$$
Locks on requests are acquired first using row-level exclusive locks (`FOR UPDATE`), followed by inventory units in deterministic primary key order. Re-validation occurs under the acquired lock before any persistent allocation record is created.

### Design Alternatives Considered
- **Optimistic Concurrency Control (OCC) with Version Numbers:** Under high contention (e.g. 5 hospitals requesting 1 rare O- blood bag during a mass disaster), OCC causes high abort and retry rates, consuming network and database bandwidth.
- **Pessimistic Row Locking (`SELECT ... FOR UPDATE`):** Guarantees zero lost updates and prevents double-allocation with immediate deterministic serialization.

---

## 4. Technical Contribution 3: Application-Level Telemetry & Workload-Driven Self-Tuning Index Advisor (N3)

### Technical Description
A non-blocking database telemetry observer that intercepts queries, strips literals to generate sanitized fingerprints, records latency distributions, and generates candidate index definitions (B-Tree vs Hash) based on query predicates. Incorporates an administrative workflow to measure execution duration before and after index creation and supports instant rollback if performance degrades.

---

## 5. Prior-Art Research Questions for Future Exploration
1. What are the specific latency overheads of maintaining row-level hash chains during bulk ingestion ($> 10,000\text{ writes/sec}$)?
2. How does PostgreSQL 16's `SKIP LOCKED` interact with multi-resource lock ordering when batch allocating multiple blood units for massive transfusion protocols?
3. What are the legal standards in various jurisdictions regarding algorithmic medical resource dispatch versus human clinician decision authority?
