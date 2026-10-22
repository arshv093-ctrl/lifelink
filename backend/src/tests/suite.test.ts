/**
 * LifeLink - Comprehensive Automated Test Suite (20 Verification Criteria)
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 * Project Identifier: LIFELINK_24BCE2119
 */

import assert from "node:assert";
import { query, queryOne, execute, runInTransaction } from "../db/connection.js";
import { seedDatabase } from "../db/seed.js";
import { AuthService } from "../services/authService.js";
import { RbacService } from "../services/rbacService.js";
import { LifeLinkAllocationService_24BCE2119_ArshVardhanSingh } from "../services/allocationService.js";
import { LifeLinkAuditService_24BCE2119_ArshVardhanSingh } from "../services/auditService.js";
import { EmergencyAccessService } from "../services/emergencyService.js";
import { QueryTelemetryService } from "../services/telemetryService.js";
import { sanitizeQueryFingerprint } from "../db/connection.js";

let passedCount = 0;
let failedCount = 0;

function it(description: string, fn: () => void | Promise<void>) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${description}`);
    passedCount++;
  } catch (err: any) {
    console.error(`  ✗ [FAIL] ${description}`);
    console.error(`    Error: ${err.message}`);
    failedCount++;
  }
}

async function runAllTests() {
  console.log("================================================================================");
  console.log(" LIFELINK DBMS AUTOMATED TEST SUITE (20 MANDATORY CRITERIA)");
  console.log(" Student: Arsh Vardhan Singh | Reg No: 24BCE2119");
  console.log(" Course Context: Database Systems Lab, School of CSE, VIT");
  console.log("================================================================================\n");

  // Re-seed to fresh state
  seedDatabase(true);

  // Test 1: Authentication success and failure
  it("1. Authentication Success and Failure Handling", () => {
    const success = AuthService.authenticate("admin@lifelink.org", "Password123!");
    assert(success !== null, "Admin authentication should succeed with valid credentials");
    assert(success.user.roleId === "ADMIN", "Role must be ADMIN");
    assert(typeof success.token === "string" && success.token.length > 20, "JWT session token must be generated");

    const badPass = AuthService.authenticate("admin@lifelink.org", "WrongPassword123!");
    assert(badPass === null, "Authentication must fail on incorrect password");

    const badUser = AuthService.authenticate("nonexistent@domain.com", "SomePass123!");
    assert(badUser === null, "Authentication must fail on unregistered email without revealing account existence");
  });

  // Test 2: Role-based API access
  it("2. Role-Based Access Control (RBAC) Enforcement", () => {
    const adminUser = AuthService.loginAsRole("ADMIN").user;
    const staffUser = AuthService.loginAsRole("HOSPITAL_STAFF").user;
    const doctorUser = AuthService.loginAsRole("DOCTOR").user;

    assert(RbacService.canUserPerform(adminUser, "VERIFY_AUDIT_LEDGER"), "Admin must be authorized to verify audit ledger");
    assert(RbacService.canUserPerform(adminUser, "APPROVE_INDEX_RECOMMENDATIONS"), "Admin must be authorized to tune indexes");

    assert(!RbacService.canUserPerform(staffUser, "VERIFY_AUDIT_LEDGER"), "Hospital Staff must NOT have audit ledger verification privileges");
    assert(RbacService.canUserPerform(staffUser, "CREATE_REQUEST"), "Hospital Staff must have request creation permissions");

    assert(RbacService.canUserPerform(doctorUser, "REQUEST_EMERGENCY_ACCESS"), "Doctor must have permission to request break-glass access");
    assert(!RbacService.canUserPerform(doctorUser, "APPROVE_INDEX_RECOMMENDATIONS"), "Doctor must NOT be permitted to modify indexes");
  });

  // Test 3: Hospital-level data isolation
  it("3. Hospital-Level Data Isolation and Tenant Scoping", () => {
    const cmcStaff = AuthService.loginAsRole("HOSPITAL_STAFF").user; // assigned to CMC Vellore
    const apolloStaff = { ...cmcStaff, hospitalId: "hosp-apollo-chn" };

    const cmcAllowed = RbacService.assertHospitalAccess(cmcStaff, "hosp-cmc-vellore");
    assert(cmcAllowed === true, "Staff can access their assigned hospital");

    assert.throws(() => {
      RbacService.assertHospitalAccess(apolloStaff, "hosp-cmc-vellore");
    }, /Cross-hospital access prohibited/, "Staff must be blocked from accessing other hospital data");

    const adminUser = AuthService.loginAsRole("ADMIN").user;
    assert(RbacService.assertHospitalAccess(adminUser, "hosp-cmc-vellore") === true, "Admin has global cross-hospital jurisdiction");
  });

  // Test 4: Inventory CRUD
  it("4. Relational Inventory CRUD and State Validation", () => {
    const testUnitId = `test-unit-${Date.now()}`;
    const insertRes = execute(`
      INSERT INTO inventory_units (
        unit_id, resource_type, blood_type, component_type, donor_id,
        hospital_id, collection_time, expiry_time, status, storage_location
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now', '+30 days'), 'AVAILABLE', 'TEST-VAULT-01')
    `, [testUnitId, "BLOOD", "O+", "PACKED_RBC", "dnr-001", "hosp-cmc-vellore"]);

    assert(insertRes.changes === 1, "Inventory row must be successfully inserted");

    const fetched = queryOne("SELECT * FROM inventory_units WHERE unit_id = ?", [testUnitId]);
    assert(fetched && fetched.blood_type === "O+", "Inserted inventory must be retrievable");

    execute("UPDATE inventory_units SET storage_location = 'TEST-VAULT-02' WHERE unit_id = ?", [testUnitId]);
    const updated = queryOne("SELECT storage_location FROM inventory_units WHERE unit_id = ?", [testUnitId]);
    assert(updated.storage_location === "TEST-VAULT-02", "Inventory updates must persist");

    execute("DELETE FROM inventory_units WHERE unit_id = ?", [testUnitId]);
    const deleted = queryOne("SELECT * FROM inventory_units WHERE unit_id = ?", [testUnitId]);
    assert(deleted === null, "Inventory deletion/archival must succeed");
  });

  // Test 5: Request CRUD
  it("5. Clinical Request Lifecycle Management", () => {
    const testReqId = `test-req-${Date.now()}`;
    execute(`
      INSERT INTO requests (
        request_id, patient_id, hospital_id, resource_type, required_blood_type,
        required_component, urgency_level, status, justification, requested_by_user_id
      ) VALUES (?, 'pat-001', 'hosp-cmc-vellore', 'BLOOD', 'A+', 'PACKED_RBC', 'HIGH', 'OPEN', 'Unit testing request workflow', 'usr-doctor-cmc')
    `, [testReqId]);

    const req = queryOne("SELECT * FROM requests WHERE request_id = ?", [testReqId]);
    assert(req && req.status === "OPEN", "Request must be registered in OPEN state");

    execute("UPDATE requests SET status = 'CANCELLED' WHERE request_id = ?", [testReqId]);
    const cancelled = queryOne("SELECT status FROM requests WHERE request_id = ?", [testReqId]);
    assert(cancelled.status === "CANCELLED", "Request status transition must be recorded");

    execute("DELETE FROM requests WHERE request_id = ?", [testReqId]);
  });

  // Test 6: Blood compatibility rules
  it("6. Rigorous Blood Compatibility Matrix Enforcement", () => {
    // O- is universal donor
    assert(LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.isBloodCompatible("O-", "O+"), "O- donor compatible with O+ recipient");
    assert(LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.isBloodCompatible("O-", "AB+"), "O- donor compatible with AB+ recipient");
    assert(LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.isBloodCompatible("O-", "A-"), "O- donor compatible with A- recipient");

    // AB+ is universal recipient
    assert(LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.isBloodCompatible("A+", "AB+"), "A+ donor compatible with AB+ recipient");
    assert(LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.isBloodCompatible("B+", "AB+"), "B+ donor compatible with AB+ recipient");

    // Incompatible pairs must return FALSE
    assert(!LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.isBloodCompatible("A+", "O-"), "A+ donor MUST be incompatible with O- recipient");
    assert(!LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.isBloodCompatible("B+", "A+"), "B+ donor MUST be incompatible with A+ recipient");
    assert(!LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.isBloodCompatible("AB+", "O+"), "AB+ donor MUST be incompatible with O+ recipient");
  });

  // Test 7: Expiry rejection
  it("7. Automated Rejection of Expired Inventory Units", () => {
    const expiredUnit = queryOne("SELECT * FROM inventory_units WHERE status = 'EXPIRED'");
    assert(expiredUnit !== null, "Pre-seeded expired unit must exist in database");

    // Attempting allocation of expired unit must throw exception
    assert.throws(() => {
      LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.allocate_unit_24BCE2119_ArshVardhanSingh({
        requestId: "req-001",
        unitId: expiredUnit.unit_id,
        userId: "usr-admin-01",
        notes: "Test expired unit allocation"
      });
    }, /EXPIRED/, "Allocation service must strictly reject expired inventory");
  });

  // Test 8: Quarantine rejection
  it("8. Strict Rejection of Quarantined or Recalled Units", () => {
    const quarantinedUnit = queryOne("SELECT * FROM inventory_units WHERE status = 'QUARANTINED'");
    assert(quarantinedUnit !== null, "Pre-seeded quarantined unit must exist");

    assert.throws(() => {
      LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.allocate_unit_24BCE2119_ArshVardhanSingh({
        requestId: "req-001",
        unitId: quarantinedUnit.unit_id,
        userId: "usr-admin-01",
        notes: "Test quarantined unit allocation"
      });
    }, /QUARANTINED/, "Allocation service must strictly reject quarantined inventory");
  });

  // Test 9: Successful allocation
  it("9. Transaction-Safe Atomic Allocation Execution", () => {
    // Pick open request req-001 (Needs A+ blood for pat-001 at CMC Vellore)
    // Eligible unit: unit-bld-003 (A+ at CMC Vellore, AVAILABLE)
    const result = LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.allocate_unit_24BCE2119_ArshVardhanSingh({
      requestId: "req-001",
      unitId: "unit-bld-003",
      userId: "usr-admin-01",
      notes: "Urgent trauma allocation verified by test"
    });

    assert(result.status === "RESERVED" || result.status === "ALLOCATED", "Allocation status must be RESERVED or ALLOCATED");
    assert(typeof result.allocationId === "string", "Allocation record ID must be generated");
    assert(result.scoreBreakdown.totalPriorityScore > 0, "Score breakdown must be calculated and persisted");

    // Verify database state changes
    const updatedUnit = queryOne("SELECT status FROM inventory_units WHERE unit_id = ?", ["unit-bld-003"]);
    assert(updatedUnit.status === "ALLOCATED", "Inventory unit status must transition to ALLOCATED");

    const updatedReq = queryOne("SELECT status FROM requests WHERE request_id = ?", ["req-001"]);
    assert(updatedReq.status === "ALLOCATED", "Request status must transition to ALLOCATED");
  });

  // Test 10: Allocation rollback
  it("10. ACID Transaction Rollback on Mid-Operation Failure", () => {
    const initialAllocCount = queryOne("SELECT COUNT(*) as c FROM allocations").c;
    const initialReqStatus = queryOne("SELECT status FROM requests WHERE request_id = 'req-002'").status;

    // Trigger deliberate transaction rollback by attempting an allocation with an invalid constraint
    try {
      runInTransaction(() => {
        execute("UPDATE requests SET status = 'ALLOCATED' WHERE request_id = 'req-002'");
        // Deliberate error: violation of unique or not-null constraint
        execute("INSERT INTO allocations (allocation_id, request_id, unit_id, allocated_by_user_id) VALUES (null, 'req-002', 'unit-bld-001', 'usr-01')");
      }, "TEST_DELIBERATE_ROLLBACK");
      assert.fail("Transaction should have failed and rolled back");
    } catch (e) {
      // Expected rollback
    }

    const postReqStatus = queryOne("SELECT status FROM requests WHERE request_id = 'req-002'").status;
    const postAllocCount = queryOne("SELECT COUNT(*) as c FROM allocations").c;

    assert(postReqStatus === initialReqStatus, "Request status must revert to original after rollback");
    assert(postAllocCount === initialAllocCount, "Allocation records must remain unchanged after rollback");
  });

  // Test 11: Duplicate-allocation prevention
  it("11. Prevention of Duplicate Allocation on Already Allocated Inventory", () => {
    // unit-bld-003 is already allocated in Test 9
    assert.throws(() => {
      LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.allocate_unit_24BCE2119_ArshVardhanSingh({
        requestId: "req-002",
        unitId: "unit-bld-003",
        userId: "usr-admin-01",
        notes: "Attempt duplicate allocation"
      });
    }, /ALLOCATED/, "System must prevent allocating an already allocated unit");
  });

  // Test 12: Concurrent requests for one inventory unit
  it("12. Concurrency Simulation: Dual Competing Requests for Same Inventory", () => {
    // Create isolated test fixture
    const testUnitId = `test-race-unit-${Date.now()}`;
    const req1 = `test-race-req-1-${Date.now()}`;
    const req2 = `test-race-req-2-${Date.now()}`;

    execute(`
      INSERT INTO inventory_units (
        unit_id, resource_type, blood_type, component_type, donor_id,
        hospital_id, collection_time, expiry_time, status, storage_location
      ) VALUES (?, 'BLOOD', 'O-', 'PACKED_RBC', 'dnr-001', 'hosp-cmc-vellore', datetime('now'), datetime('now', '+20 days'), 'AVAILABLE', 'RACE-VAULT')
    `, [testUnitId]);

    execute(`
      INSERT INTO requests (request_id, patient_id, hospital_id, resource_type, required_blood_type, required_component, urgency_level, status, justification, requested_by_user_id)
      VALUES (?, 'pat-002', 'hosp-cmc-vellore', 'BLOOD', 'O-', 'PACKED_RBC', 'CRITICAL', 'OPEN', 'Race test hospital A', 'usr-staff-cmc')
    `, [req1]);

    execute(`
      INSERT INTO requests (request_id, patient_id, hospital_id, resource_type, required_blood_type, required_component, urgency_level, status, justification, requested_by_user_id)
      VALUES (?, 'pat-003', 'hosp-apollo-chennai', 'BLOOD', 'O-', 'PACKED_RBC', 'CRITICAL', 'OPEN', 'Race test hospital B', 'usr-staff-apollo')
    `, [req2]);

    const simResult = LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.runConcurrencySimulation(
      testUnitId,
      req1,
      req2,
      "usr-admin-01"
    );

    assert(simResult.safeOutcome.attemptA.success !== simResult.safeOutcome.attemptB.success, "Exactly one hospital must succeed");
    assert(simResult.safeOutcome.winner === "Request A", "Winner must be recorded deterministically");
    assert(simResult.safeOutcome.loserError.length > 0, "Atomic conflict error must be recorded for losing request");

    // Verify DB state: unit is allocated exactly once
    const finalUnit = queryOne("SELECT status FROM inventory_units WHERE unit_id = ?", [testUnitId]);
    assert(finalUnit.status === "ALLOCATED", "Final unit state must be ALLOCATED");

    const allocs = query("SELECT * FROM allocations WHERE unit_id = ?", [testUnitId]);
    assert(allocs.length === 1, "There must be exactly one persistent allocation record for this unit");
  });

  // Test 13: Audit-chain verification
  it("13. Cryptographic Hash-Chained Audit Ledger Integrity Verification", () => {
    const verification = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.verify_ledger_24BCE2119_ArshVardhanSingh();
    assert(verification.isValid === true, "Audit ledger hash chain must be 100% cryptographically valid");
    assert(verification.verifiedCount > 0, "Audit ledger must contain verified sequential events");
    assert(verification.brokenSequence === null, "No broken sequence links allowed in genuine ledger");
  });

  // Test 14: Audit modification detection (tampering demo)
  it("14. Tampering Detection on Forged Audit Payload", () => {
    // Record disposable audit event
    const dispEvent = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.recordEvent({
      entityType: "TEST_ENTITY",
      entityId: "test-tamper-01",
      operationType: "SYSTEM_CHECK",
      actorId: "usr-admin-01",
      actorRole: "ADMIN",
      metadata: { initial_check: true }
    });

    // Check verification passes before tampering
    const beforeTamper = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.verify_ledger_24BCE2119_ArshVardhanSingh();
    assert(beforeTamper.isValid === true, "Ledger must be valid prior to deliberate tampering");

    // Deliberately tamper with the disposable record's payload (bypassing normal app logic)
    const tampered = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.tamperRecordForDemo(
      dispEvent.sequence_number,
      JSON.stringify({ initial_check: false, forged_by: "ATTACKER_SIMULATION" })
    );
    assert(tampered === true, "Test environment successfully forged payload");

    // Verification MUST now flag the chain as compromised
    const afterTamper = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.verify_ledger_24BCE2119_ArshVardhanSingh();
    assert(afterTamper.isValid === false, "Verification algorithm MUST detect payload tampering");
    assert(afterTamper.brokenSequence === dispEvent.sequence_number, "Broken sequence must pinpoint exact tampered record");

    // Restore integrity by correcting or removing tampered test event
    execute("DELETE FROM audit_ledger WHERE sequence_number = ?", [dispEvent.sequenceNumber]);
  });

  // Test 15: Merkle checkpoint verification
  it("15. Merkle Root Checkpoint Generation and Algorithmic Proof", () => {
    const leaves = [
      "hash1_24bce2119_arshvardhansingh",
      "hash2_24bce2119_arshvardhansingh",
      "hash3_24bce2119_arshvardhansingh"
    ];

    const root = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.buildMerkleRoot(leaves);
    assert(typeof root === "string" && root.length === 64, "Merkle root must be a 64-character SHA-256 hex string");

    // Deterministic algorithm test: same leaves produce exact same root
    const root2 = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.buildMerkleRoot(leaves);
    assert(root === root2, "Merkle root calculation must be deterministic");

    const checkpoint = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.createMerkleCheckpoint();
    if (checkpoint) {
      assert(checkpoint.status === "VERIFIED", "Newly generated checkpoint must be verified");
    }
  });

  // Test 16: Emergency-access expiry
  it("16. Break-Glass Emergency Elevated Access Expiration Enforcement", () => {
    // Request emergency access for Doctor with 1 minute validity
    const grant = EmergencyAccessService.requestBreakGlass({
      userId: "usr-doctor-cmc",
      reason: "Patient in cardiac surgery hemorrhaging massively; immediate emergency inventory override required.",
      durationMinutes: 1
    });

    assert(grant.status === "ACTIVE", "Emergency grant must be ACTIVE upon generation");
    assert(EmergencyAccessService.hasActiveEmergencyGrant("usr-doctor-cmc") === true, "Active grant recognized");

    // Manually expire the grant in DB to simulate passage of time
    execute("UPDATE emergency_grants SET expires_at = datetime('now', '-5 minutes') WHERE grant_id = ?", [grant.grant_id]);

    // Check expiration enforcement on server
    const hasActive = EmergencyAccessService.hasActiveEmergencyGrant("usr-doctor-cmc");
    assert(hasActive === false, "Expired emergency grant must be immediately rejected by authorization engine");
  });

  // Test 17: Emergency-access audit logging
  it("17. Mandatory Append-Only Audit Logging of Emergency Access Events", () => {
    const recentAudit = queryOne(`
      SELECT * FROM audit_ledger 
      WHERE entity_type = 'emergency_grants' 
      ORDER BY sequence_number DESC LIMIT 1
    `);

    assert(recentAudit !== null, "Audit ledger must contain logged emergency_grants event");
    assert(recentAudit.operation_type === "BREAK_GLASS_ELEVATION", "Operation type must indicate break glass elevation");
    assert(recentAudit.actor_id === "usr-doctor-cmc", "Actor ID must be recorded accurately");
  });

  // Test 18: Query telemetry sanitization
  it("18. Query Telemetry Sanitization and Fingerprinting (N3)", () => {
    const rawSql = "SELECT * FROM users WHERE email = 'doctor@lifelink.org' AND user_id = 42;";
    const fingerprint = sanitizeQueryFingerprint(rawSql);

    assert(!fingerprint.includes("doctor@lifelink.org"), "PII/Emails must be stripped from telemetry fingerprint");
    assert(!fingerprint.includes("42"), "Numeric IDs must be parameterized into '?'");
    assert(fingerprint.includes("SELECT * FROM users WHERE email = ? AND user_id = ?"), "Sanitized template preserved");

    const telemetryEntries = query("SELECT * FROM query_telemetry LIMIT 5");
    assert(telemetryEntries.length > 0, "Query telemetry table must contain recorded query executions");
  });

  // Test 19: Index recommendation behavior
  it("19. Self-Tuning Index Advisor Generation and Lifecycle", () => {
    const recs = QueryTelemetryService.getIndexRecommendations();
    assert(recs.length > 0, "Self-tuning advisor must produce candidate index recommendations");

    const rec = recs[0];
    assert(rec.table_name && rec.table_name.length > 0, "Recommendation must target a valid table");
    assert(rec.estimated_improvement_pct > 0, "Estimated improvement percentage must be positive");

    // Test administrative approval/apply workflow
    const applyResult = QueryTelemetryService.applyRecommendation(rec.recommendation_id);
    assert(applyResult.recommendation.status === "APPLIED", "Index recommendation approval must create active index");

    // Test rollback capability
    const rolledBack = QueryTelemetryService.rollbackRecommendation(rec.recommendation_id);
    assert(rolledBack.status === "ROLLED_BACK", "Index must be rollback-capable if regressions occur");
  });

  // Test 20: Validation and error handling
  it("20. Comprehensive Input Validation and Structured Error Responses", () => {
    // Missing clinical reason for emergency access
    assert.throws(() => {
      EmergencyAccessService.requestBreakGlass({
        userId: "usr-doctor-cmc",
        reason: "short"
      });
    }, /Emergency justification mandatory/, "Must validate reason length and clinical justification");

    // Invalid coordinates for hospital distance calculation
    const dist = LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.calculateDistanceKm(12.92, 79.13, 12.92, 79.13);
    assert(Math.abs(dist) < 0.01, "Zero distance between identical coordinates");
  });

  console.log("\n================================================================================");
  console.log(` TEST SUMMARY: ${passedCount} PASSED / ${failedCount} FAILED (Total: ${passedCount + failedCount})`);
  console.log("================================================================================");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch((e) => {
  console.error("Unhandled test suite execution error:", e);
  process.exit(1);
});
