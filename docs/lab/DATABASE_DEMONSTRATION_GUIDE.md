# LIFELINK DATABASE SYSTEMS LAB DEMONSTRATION GUIDE

**Academic Context:** Database Systems Lab (DBMS Assessment)  
**Student Developer:** Arsh Vardhan Singh (Registration Number: 24BCE2119)  
**Institutional Context:** School of Computer Science and Engineering, Vellore Institute of Technology (VIT)  
**Project Identifier:** `LIFELINK_24BCE2119`  

---

## Laboratory Demonstration Overview

This guide provides faculty, evaluators, and students with reproducible SQL scripts, commands, and expected terminal outputs to demonstrate advanced DBMS concepts implemented in LifeLink.

---

## Demonstration 1: ACID Atomicity & Deliberate Transaction Rollback

### Concept Demonstrated
Atomicity ensures all database modifications within a transaction succeed, or all are rolled back. Consistency guarantees that the database transitions from one valid state to another without violating constraints.

### SQL Source Code
```sql
-- Begin transaction block
BEGIN;

-- Step 1: Update request status
UPDATE requests 
SET status = 'ALLOCATED', updated_at = CURRENT_TIMESTAMP
WHERE request_id = 'req-002';

-- Step 2: Attempt deliberate constraint violation (NULL primary key)
INSERT INTO allocations (
    allocation_id, request_id, unit_id, allocated_by_user_id,
    urgency_score, compatibility_score, shelf_life_score, distance_score,
    total_priority_score, status, allocation_notes, allocated_at
) VALUES (
    NULL, -- VIOLATION: Primary Key cannot be NULL
    'req-002',
    'unit-bld-001',
    'usr-admin-01',
    100.0, 90.0, 70.0, 100.0, 91.0, 'RESERVED',
    'Deliberate rollback experiment', CURRENT_TIMESTAMP
);

-- If error occurs, automatic ROLLBACK:
ROLLBACK;
```

### Execution Command
```bash
# Execute via LifeLink test suite:
npm run test:build -- --grep "ACID"
```

### Expected Output
```
✓ [PASS] 10. ACID Transaction Rollback on Mid-Operation Failure
  Pre-transaction request status: OPEN
  Error caught: NOT NULL constraint failed: allocations.allocation_id
  Post-rollback request status: OPEN (Unchanged)
  Post-rollback allocations count: 1 (Unchanged)
```

> **[Screenshot Placeholder: Terminal output showing ACID rollback execution and preserved database invariants]**

---

## Demonstration 2: Concurrency Control & The Lost Update Problem

### Concept Demonstrated
Two competing transactions concurrently read the same inventory unit in an `AVAILABLE` state. Without row-level locking, both transactions proceed to allocate the unit, causing a physical double-allocation anomaly.

### Unsafe Check-Then-Act (Anomaly Reproduction)
```sql
-- Transaction A (Hospital 1)
SELECT status FROM inventory_units WHERE unit_id = 'unit-bld-001'; -- Returns 'AVAILABLE'

-- Transaction B (Hospital 2, simultaneously)
SELECT status FROM inventory_units WHERE unit_id = 'unit-bld-001'; -- Returns 'AVAILABLE'

-- Both transactions proceed to write:
UPDATE inventory_units SET status = 'ALLOCATED' WHERE unit_id = 'unit-bld-001'; -- Tx A commits
UPDATE inventory_units SET status = 'ALLOCATED' WHERE unit_id = 'unit-bld-001'; -- Tx B commits
-- DEFECT: Two hospitals allocated the same single physical blood bag!
```

### Safe LifeLink Transactional Protocol
```sql
-- Named Stored Function Execution
SELECT * FROM allocate_unit_24BCE2119_ArshVardhanSingh(
    'req-001',          -- p_request_id
    'unit-bld-003',     -- p_unit_id
    'usr-admin-01',     -- p_user_id
    100.0,              -- p_urgency_score
    100.0,              -- p_compat_score
    70.0,               -- p_shelf_score
    100.0,              -- p_dist_score
    94.0,               -- p_total_score
    'Lab Concurrency Demonstration'
);
```

### Expected Output
```
✓ [PASS] 12. Concurrency Simulation: Dual Competing Requests for Same Inventory
  Attempt A (CMC Vellore): COMMITTED (Winner)
  Attempt B (Apollo Chennai): ABORTED (Concurrency Conflict: Unit is already ALLOCATED)
  Final Allocated Count for Unit: Exactly 1
```

> **[Screenshot Placeholder: Concurrency Race Experiment from LifeLink DBMS Systems Lab UI]**

---

## Demonstration 3: Cryptographic Audit Ledger & Merkle Verification

### Concept Demonstrated
Every database state transition calculates a SHA-256 hash incorporating the previous row's hash. A stored procedure recalculates the hash chain and pinpoints any row whose contents have been modified.

### SQL Source Code
```sql
-- Stored Function Call for Hash-Chain & Merkle Verification
SELECT * FROM verify_ledger_24BCE2119_ArshVardhanSingh();
```

### Verification Failure Demonstration
```bash
# Step 1: Run verification on pristine ledger
# Output: isValid = true, verifiedCount = 4, brokenSequence = null

# Step 2: Simulate malicious DBA modifying row payload without hash recomputation
UPDATE audit_ledger 
SET change_metadata = '{"forged": true, "attacker": "SIMULATION"}' 
WHERE sequence_number = 2;

# Step 3: Run verification again
# Output:
# isValid = false
# brokenSequence = 2
# errorReason = "Tampered payload detected at sequence #2: Stored hash does not match cryptographic hash of row contents."
```

### Expected Output
```
✓ [PASS] 13. Cryptographic Hash-Chained Audit Ledger Integrity Verification
✓ [PASS] 14. Tampering Detection on Forged Audit Payload
```

> **[Screenshot Placeholder: Audit Ledger verification interface showing green verified status and red tampered detection]**

---

## Demonstration 4: Database Recovery with Logical Dumps & Restores

### Backup Command
```bash
./scripts/backup_db.sh
```
**Output:**
```
==> Creating LifeLink Database Backup at 20261022_200000...
✓ Local database snapshot saved: backups/lifelink_local_20261022_200000.db
==> Backup complete.
```

### Restore & Verification Command
```bash
./scripts/restore_db.sh backups/lifelink_local_20261022_200000.db
```
**Output:**
```
==> Restoring LifeLink Database from backups/lifelink_local_20261022_200000.db...
✓ Local database restored to data/lifelink.db.
==> Running post-restore audit ledger verification...
✓ [PASS] 13. Cryptographic Hash-Chained Audit Ledger Integrity Verification
✓ Verification complete. Relational state restored cleanly.
```

> **[Screenshot Placeholder: Terminal window showing backup generation and post-restore cryptographic verification passing]**
