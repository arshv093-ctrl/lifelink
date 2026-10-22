/**
 * LifeLink - Deterministic Synthetic Seed Data
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import crypto from "node:crypto";
import { sqliteDb, initializeDatabase, execute } from "./connection.js";
import { LifeLinkAuditService_24BCE2119_ArshVardhanSingh } from "../services/auditService.js";

export function hashPassword(plainText: string): string {
  return crypto.createHash("sha256").update(plainText + "lifelink_salt_24bce2119").digest("hex");
}

export function seedDatabase(force: boolean = false) {
  initializeDatabase();

  if (force) {
    sqliteDb.exec(`
      PRAGMA foreign_keys = OFF;
      DELETE FROM index_recommendations;
      DELETE FROM query_telemetry;
      DELETE FROM ledger_checkpoints;
      DELETE FROM audit_ledger;
      DELETE FROM emergency_grants;
      DELETE FROM transactions_log;
      DELETE FROM inventory_transfers;
      DELETE FROM allocations;
      DELETE FROM requests;
      DELETE FROM inventory_units;
      DELETE FROM donors;
      DELETE FROM patients;
      DELETE FROM users;
      DELETE FROM blood_types;
      DELETE FROM hospitals;
      DELETE FROM roles;
      DELETE FROM sqlite_sequence WHERE name = 'audit_ledger';
      PRAGMA foreign_keys = ON;
    `);
  } else {
    // Check if already seeded
    const userCheck = sqliteDb.prepare("SELECT COUNT(*) AS count FROM users").get() as { count: number };
    if (userCheck.count > 0) {
      return;
    }
  }

  sqliteDb.exec("BEGIN TRANSACTION;");
  try {
    // 1. Roles
    const roleStmt = sqliteDb.prepare("INSERT INTO roles (role_id, role_name, description) VALUES (?, ?, ?)");
    roleStmt.run("ADMIN", "Administrator", "Full system governance, audit ledger verification, telemetry and index advisor control.");
    roleStmt.run("HOSPITAL_STAFF", "Hospital Staff", "Hospital-scoped inventory management, patient request submission and dispatch.");
    roleStmt.run("DOCTOR", "Clinician / Doctor", "Patient request creation, urgent allocation reviews, break-glass emergency access.");
    roleStmt.run("DONOR_COORDINATOR", "Donor Coordinator", "Donor intake, consent verification, and organ availability coordination.");

    // 2. Blood Types
    const bloodStmt = sqliteDb.prepare("INSERT INTO blood_types (blood_type, description, is_rh_positive) VALUES (?, ?, ?)");
    bloodStmt.run("O-", "O Negative (Universal Red Blood Cell Donor)", 0);
    bloodStmt.run("O+", "O Positive (Most common compatible blood)", 1);
    bloodStmt.run("A-", "A Negative", 0);
    bloodStmt.run("A+", "A Positive", 1);
    bloodStmt.run("B-", "B Negative", 0);
    bloodStmt.run("B+", "B Positive", 1);
    bloodStmt.run("AB-", "AB Negative", 0);
    bloodStmt.run("AB+", "AB Positive (Universal Recipient)", 1);

    // 3. Hospitals
    const hospStmt = sqliteDb.prepare(`
      INSERT INTO hospitals (hospital_id, name, code, latitude, longitude, address, phone, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);
    const h1 = "hosp-cmc-vellore";
    const h2 = "hosp-apollo-chennai";
    const h3 = "hosp-fortis-blr";
    const h4 = "hosp-aiims-delhi";
    const h5 = "hosp-manipal-blr";

    hospStmt.run(h1, "Christian Medical College (CMC)", "CMC-VEL", 12.9165, 79.1325, "Ida Scudder Rd, Vellore, Tamil Nadu 632004", "+91 416 228 1000");
    hospStmt.run(h2, "Apollo Main Hospital", "APO-CHN", 13.0827, 80.2707, "21 Greams Lane, Thousand Lights, Chennai 600006", "+91 44 2829 0200");
    hospStmt.run(h3, "Fortis Hospital Bannerghatta", "FOR-BLR", 12.9716, 77.5946, "154/9 Bannerghatta Rd, Bengaluru 560076", "+91 80 6621 4444");
    hospStmt.run(h4, "AIIMS New Delhi", "AIIMS-DEL", 28.6139, 77.2090, "Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029", "+91 11 2658 8500");
    hospStmt.run(h5, "Manipal Hospital Old Airport Rd", "MAN-BLR", 12.9592, 77.6499, "98 HAL Old Airport Rd, Kodihalli, Bengaluru 560017", "+91 80 2502 4444");

    // 4. Users
    const userStmt = sqliteDb.prepare(`
      INSERT INTO users (user_id, email, password_hash, full_name, role_id, hospital_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    const defaultPass = hashPassword("Password123!");

    userStmt.run("usr-admin-01", "admin@lifelink.org", defaultPass, "Arsh Vardhan Singh (Admin)", "ADMIN", null);
    userStmt.run("usr-staff-cmc", "staff.cmc@lifelink.org", defaultPass, "Kavita Raman (CMC Staff)", "HOSPITAL_STAFF", h1);
    userStmt.run("usr-staff-apollo", "staff.apollo@lifelink.org", defaultPass, "Rajesh Nair (Apollo Staff)", "HOSPITAL_STAFF", h2);
    userStmt.run("usr-doctor-cmc", "dr.sharma@lifelink.org", defaultPass, "Dr. Vikram Sharma, MD", "DOCTOR", h1);
    userStmt.run("usr-coord-cmc", "coordinator@lifelink.org", defaultPass, "Ananya Sundaram", "DONOR_COORDINATOR", h1);

    // 5. Donors
    const donorStmt = sqliteDb.prepare(`
      INSERT INTO donors (donor_id, full_name, blood_type, date_of_birth, consent_verified, consent_document_ref, hospital_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    donorStmt.run("dnr-001", "Rohan Verma", "O-", "1994-05-14", 1, "DOC-CONSENT-2026-001", h1);
    donorStmt.run("dnr-002", "Pooja Hegde", "A+", "1998-11-20", 1, "DOC-CONSENT-2026-002", h1);
    donorStmt.run("dnr-003", "Karthik Iyer", "B+", "1991-03-08", 1, "DOC-CONSENT-2026-003", h2);
    donorStmt.run("dnr-004", "Meera Sen", "AB+", "1989-07-22", 1, "DOC-CONSENT-2026-004", h3);
    donorStmt.run("dnr-005", "Suresh Menon", "O+", "1995-09-12", 0, null, h1);

    // 6. Patients
    const patientStmt = sqliteDb.prepare(`
      INSERT INTO patients (patient_id, full_name, date_of_birth, blood_type, hospital_id, urgency_level, condition_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    patientStmt.run("pat-001", "Aarav Patel", "1985-02-17", "A+", h1, "CRITICAL", "Acute post-trauma severe hemorrhage; requires immediate packed RBCs.");
    patientStmt.run("pat-002", "Deepa Krishnan", "1992-06-14", "O-", h2, "CRITICAL", "Emergency obstetric massive transfusion protocol initiated.");
    patientStmt.run("pat-003", "Naveen Chawla", "1978-11-23", "B+", h1, "HIGH", "Severe aplastic anemia with thrombotic thrombocytopenia; needs urgent platelets.");
    patientStmt.run("pat-004", "Farhan Akhtar", "1988-04-30", "AB+", h3, "MEDIUM", "Elective scheduled orthopedic hip replacement revision.");
    patientStmt.run("pat-005", "Sunita Rao", "1996-09-05", "O+", h4, "LOW", "Chronic sickle cell disease scheduled transfusion.");

    // 7. Inventory Units
    const now = new Date();
    const plusDays = (days: number) => new Date(now.getTime() + days * 86400000).toISOString();
    const minusDays = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();
    const plusHours = (hours: number) => new Date(now.getTime() + hours * 3600000).toISOString();

    const invStmt = sqliteDb.prepare(`
      INSERT INTO inventory_units (
        unit_id, resource_type, blood_type, component_type, donor_id,
        hospital_id, collection_time, expiry_time, status, storage_location, quarantine_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Available units
    invStmt.run("unit-bld-001", "BLOOD", "O-", "PACKED_RBC", "dnr-001", h1, minusDays(2), plusDays(33), "AVAILABLE", "CMC-CRYO-VAULT-A1", null);
    invStmt.run("unit-bld-002", "BLOOD", "O-", "WHOLE_BLOOD", "dnr-001", h2, minusDays(5), plusDays(25), "AVAILABLE", "APO-BANK-SHELF-04", null);
    invStmt.run("unit-bld-003", "BLOOD", "A+", "PACKED_RBC", "dnr-002", h1, minusDays(10), plusDays(25), "AVAILABLE", "CMC-CRYO-VAULT-A2", null);
    invStmt.run("unit-bld-004", "BLOOD", "A+", "PLATELETS", "dnr-002", h1, minusDays(1), plusHours(48), "AVAILABLE", "CMC-AGITATOR-01", null); // Expiring soon!
    invStmt.run("unit-bld-005", "BLOOD", "B+", "FRESH_FROZEN_PLASMA", "dnr-003", h2, minusDays(20), plusDays(300), "AVAILABLE", "APO-DEEP-FREEZE-C", null);
    invStmt.run("unit-bld-006", "BLOOD", "AB+", "PACKED_RBC", "dnr-004", h3, minusDays(3), plusDays(32), "AVAILABLE", "FOR-COLD-ROOM-02", null);

    // Units with non-available states for testing and UI
    invStmt.run("unit-bld-007", "BLOOD", "O+", "PACKED_RBC", "dnr-005", h1, minusDays(45), minusDays(3), "EXPIRED", "CMC-DISCARD-HOLDING", "Exceeded 42-day RBC shelf life");
    invStmt.run("unit-bld-008", "BLOOD", "B-", "WHOLE_BLOOD", null, h1, minusDays(4), plusDays(28), "QUARANTINED", "CMC-QUARANTINE-ZONE", "Reactive serology re-test pending confirmation");
    invStmt.run("unit-bld-009", "BLOOD", "A-", "PACKED_RBC", null, h2, minusDays(8), plusDays(27), "ALLOCATED", "APO-TRANSIT-LOCKER", null);

    // Educational Organ inventory
    invStmt.run("unit-org-001", "ORGAN", "O-", "KIDNEY", "dnr-001", h1, minusDays(0.5), plusHours(18), "AVAILABLE", "CMC-ORGAN-PERFUSION-K1", null);

    // 8. Requests
    const reqStmt = sqliteDb.prepare(`
      INSERT INTO requests (
        request_id, patient_id, hospital_id, resource_type, required_blood_type,
        required_component, urgency_level, status, justification, requested_by_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    reqStmt.run("req-hist-001", "pat-005", h1, "BLOOD", "O+", "PACKED_RBC", "MEDIUM", "FULFILLED", "Resolved historical transfusion.", "usr-doctor-cmc");
    reqStmt.run("req-001", "pat-001", h1, "BLOOD", "A+", "PACKED_RBC", "CRITICAL", "OPEN", "Acute internal bleeding, Hb level plummeted to 5.2 g/dL.", "usr-doctor-cmc");
    reqStmt.run("req-002", "pat-002", h2, "BLOOD", "O-", "PACKED_RBC", "CRITICAL", "OPEN", "Urgent Cesarean section with suspected placenta accreta.", "usr-staff-apollo");
    reqStmt.run("req-003", "pat-003", h1, "BLOOD", "B+", "PLATELETS", "HIGH", "OPEN", "Platelet count < 10,000/uL with mucosal petechiae.", "usr-doctor-cmc");
    reqStmt.run("req-004", "pat-004", h3, "BLOOD", "AB+", "PACKED_RBC", "MEDIUM", "OPEN", "Pre-op blood reservation for complex arthroplasty.", "usr-staff-apollo");

    // 9. Allocations (One historical allocation)
    const allocStmt = sqliteDb.prepare(`
      INSERT INTO allocations (
        allocation_id, request_id, unit_id, allocated_by_user_id,
        urgency_score, compatibility_score, shelf_life_score, distance_score,
        total_priority_score, status, allocation_notes, allocated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    allocStmt.run(
      "alloc-hist-001", "req-hist-001", "unit-bld-009", "usr-admin-01",
      40.0, 25.0, 18.5, 15.0,
      98.5, "COMPLETED", "Standard rapid crossmatch verified, safely transfused.", minusDays(1)
    );

    // 10. Index Recommendations (Initial advisor seeds)
    const idxStmt = sqliteDb.prepare(`
      INSERT INTO index_recommendations (
        recommendation_id, table_name, column_names, index_type,
        reason, estimated_improvement_pct, measured_improvement_pct, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    idxStmt.run(
      "idx-rec-001", "inventory_units", "status, blood_type, expiry_time", "BTREE",
      "Accelerates allocation candidate filtering by filtering status=AVAILABLE and matching blood types in one index range scan.",
      68.5, null, "PENDING"
    );
    idxStmt.run(
      "idx-rec-002", "requests", "hospital_id, status", "BTREE",
      "Speeds up hospital-isolated dashboard and request queue lookups.",
      44.0, null, "PENDING"
    );

    sqliteDb.exec("COMMIT;");
  } catch (err) {
    sqliteDb.exec("ROLLBACK;");
    throw err;
  }

  // Generate initial audit ledger hash chain and checkpoint
  LifeLinkAuditService_24BCE2119_ArshVardhanSingh.recordEvent({
    entityType: "system",
    entityId: "SYSTEM_INITIALIZATION",
    operationType: "SYSTEM_SEED",
    actorId: "usr-admin-01",
    actorRole: "ADMIN",
    metadata: {
      action: "DATABASE_INITIAL_SEEDING",
      student: "Arsh Vardhan Singh",
      regNo: "24BCE2119",
      project: "LIFELINK_24BCE2119",
      timestamp: new Date().toISOString()
    }
  });

  LifeLinkAuditService_24BCE2119_ArshVardhanSingh.recordEvent({
    entityType: "inventory_units",
    entityId: "unit-bld-001",
    operationType: "STOCK_INTAKE",
    actorId: "usr-staff-cmc",
    actorRole: "HOSPITAL_STAFF",
    metadata: {
      unit_id: "unit-bld-001",
      blood_type: "O-",
      component: "PACKED_RBC",
      hospital: "hosp-cmc-vellore"
    }
  });

  LifeLinkAuditService_24BCE2119_ArshVardhanSingh.recordEvent({
    entityType: "requests",
    entityId: "req-001",
    operationType: "SUBMIT_REQUEST",
    actorId: "usr-doctor-cmc",
    actorRole: "DOCTOR",
    metadata: {
      request_id: "req-001",
      urgency: "CRITICAL",
      blood_type: "A+",
      patient_id: "pat-001"
    }
  });

  // Generate initial Merkle checkpoint over the first 3 events
  LifeLinkAuditService_24BCE2119_ArshVardhanSingh.createMerkleCheckpoint();
}
