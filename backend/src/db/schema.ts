/**
 * LifeLink - High-Fidelity Local Relational Database Schema
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 * 
 * Provides relational table DDL, views, and indexes matching PostgreSQL 16.
 */

export const RELATIONAL_SCHEMA_SQL = `
-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
    role_id TEXT PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
    hospital_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Users
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role_id TEXT NOT NULL,
    hospital_id TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(role_id) REFERENCES roles(role_id),
    FOREIGN KEY(hospital_id) REFERENCES hospitals(hospital_id)
);

-- 4. Blood Types
CREATE TABLE IF NOT EXISTS blood_types (
    blood_type TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    is_rh_positive INTEGER NOT NULL
);

-- 5. Patients
CREATE TABLE IF NOT EXISTS patients (
    patient_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    blood_type TEXT NOT NULL,
    hospital_id TEXT NOT NULL,
    urgency_level TEXT NOT NULL CHECK (urgency_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    condition_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(blood_type) REFERENCES blood_types(blood_type),
    FOREIGN KEY(hospital_id) REFERENCES hospitals(hospital_id)
);

-- 6. Donors
CREATE TABLE IF NOT EXISTS donors (
    donor_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    blood_type TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    consent_verified INTEGER NOT NULL DEFAULT 0,
    consent_document_ref TEXT,
    hospital_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(blood_type) REFERENCES blood_types(blood_type),
    FOREIGN KEY(hospital_id) REFERENCES hospitals(hospital_id)
);

-- 7. Inventory Units
CREATE TABLE IF NOT EXISTS inventory_units (
    unit_id TEXT PRIMARY KEY,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('BLOOD', 'ORGAN')),
    blood_type TEXT NOT NULL,
    component_type TEXT NOT NULL,
    donor_id TEXT,
    hospital_id TEXT NOT NULL,
    collection_time TEXT NOT NULL,
    expiry_time TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('AVAILABLE', 'ALLOCATED', 'QUARANTINED', 'EXPIRED', 'DISCARDED')),
    storage_location TEXT NOT NULL,
    quarantine_reason TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(blood_type) REFERENCES blood_types(blood_type),
    FOREIGN KEY(donor_id) REFERENCES donors(donor_id),
    FOREIGN KEY(hospital_id) REFERENCES hospitals(hospital_id)
);

-- 8. Requests
CREATE TABLE IF NOT EXISTS requests (
    request_id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    hospital_id TEXT NOT NULL,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('BLOOD', 'ORGAN')),
    required_blood_type TEXT NOT NULL,
    required_component TEXT NOT NULL,
    urgency_level TEXT NOT NULL CHECK (urgency_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'PENDING_MATCH', 'ALLOCATED', 'FULFILLED', 'CANCELLED')),
    justification TEXT NOT NULL,
    requested_by_user_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY(hospital_id) REFERENCES hospitals(hospital_id),
    FOREIGN KEY(required_blood_type) REFERENCES blood_types(blood_type),
    FOREIGN KEY(requested_by_user_id) REFERENCES users(user_id)
);

-- 9. Allocations
CREATE TABLE IF NOT EXISTS allocations (
    allocation_id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    unit_id TEXT NOT NULL,
    allocated_by_user_id TEXT NOT NULL,
    urgency_score REAL NOT NULL,
    compatibility_score REAL NOT NULL,
    shelf_life_score REAL NOT NULL,
    distance_score REAL NOT NULL,
    total_priority_score REAL NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('RESERVED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED')),
    allocation_notes TEXT,
    allocated_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    FOREIGN KEY(request_id) REFERENCES requests(request_id),
    FOREIGN KEY(unit_id) REFERENCES inventory_units(unit_id),
    FOREIGN KEY(allocated_by_user_id) REFERENCES users(user_id)
);

-- Active allocation unique index preventing double allocation on unit
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_unit_allocation 
ON allocations(unit_id) 
WHERE status IN ('RESERVED', 'IN_TRANSIT', 'COMPLETED');

-- 10. Inventory Transfers
CREATE TABLE IF NOT EXISTS inventory_transfers (
    transfer_id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL,
    allocation_id TEXT NOT NULL,
    from_hospital_id TEXT NOT NULL,
    to_hospital_id TEXT NOT NULL,
    initiated_by_user_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('DISPATCHED', 'IN_TRANSIT', 'RECEIVED', 'REJECTED')),
    tracking_notes TEXT,
    dispatched_at TEXT NOT NULL DEFAULT (datetime('now')),
    received_at TEXT,
    FOREIGN KEY(unit_id) REFERENCES inventory_units(unit_id),
    FOREIGN KEY(allocation_id) REFERENCES allocations(allocation_id),
    FOREIGN KEY(from_hospital_id) REFERENCES hospitals(hospital_id),
    FOREIGN KEY(to_hospital_id) REFERENCES hospitals(hospital_id),
    FOREIGN KEY(initiated_by_user_id) REFERENCES users(user_id)
);

-- 11. Transactions Log
CREATE TABLE IF NOT EXISTS transactions_log (
    tx_id TEXT PRIMARY KEY,
    tx_type TEXT NOT NULL,
    isolation_level TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('COMMITTED', 'ROLLED_BACK', 'FAILED')),
    started_at TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    duration_ms REAL NOT NULL,
    details TEXT
);

-- 12. Audit Ledger (Hash-Chained Sequential Ledger)
CREATE TABLE IF NOT EXISTS audit_ledger (
    sequence_number INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_id TEXT UNIQUE NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    event_timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    change_metadata TEXT NOT NULL,
    previous_event_hash TEXT NOT NULL,
    current_event_hash TEXT NOT NULL
);

-- 13. Ledger Checkpoints (Merkle Checkpoints)
CREATE TABLE IF NOT EXISTS ledger_checkpoints (
    checkpoint_id TEXT PRIMARY KEY,
    from_sequence INTEGER NOT NULL,
    to_sequence INTEGER NOT NULL,
    event_count INTEGER NOT NULL,
    merkle_root_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    status TEXT NOT NULL CHECK (status IN ('VERIFIED', 'COMPROMISED')),
    external_anchor_ref TEXT
);

-- 14. Query Telemetry
CREATE TABLE IF NOT EXISTS query_telemetry (
    telemetry_id TEXT PRIMARY KEY,
    query_fingerprint TEXT NOT NULL,
    query_category TEXT NOT NULL,
    duration_ms REAL NOT NULL,
    execution_timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    execution_status TEXT NOT NULL CHECK (execution_status IN ('SUCCESS', 'ERROR')),
    application_operation TEXT NOT NULL,
    result_count INTEGER
);

-- 15. Index Recommendations
CREATE TABLE IF NOT EXISTS index_recommendations (
    recommendation_id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    column_names TEXT NOT NULL,
    index_type TEXT NOT NULL CHECK (index_type IN ('BTREE', 'HASH', 'GIN')),
    reason TEXT NOT NULL,
    estimated_improvement_pct REAL NOT NULL,
    measured_improvement_pct REAL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'APPLIED', 'REJECTED', 'ROLLED_BACK')),
    applied_at TEXT
);

-- 16. Emergency Grants (Break-Glass Access)
CREATE TABLE IF NOT EXISTS emergency_grants (
    grant_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    requested_permissions TEXT NOT NULL,
    granted_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'EXPIRED', 'REVOKED')),
    revoked_at TEXT,
    revoked_by TEXT,
    audit_event_id TEXT,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(revoked_by) REFERENCES users(user_id),
    FOREIGN KEY(audit_event_id) REFERENCES audit_ledger(audit_id)
);

-- Views
CREATE VIEW IF NOT EXISTS v_available_inventory AS
SELECT 
    iu.unit_id,
    iu.resource_type,
    iu.blood_type,
    iu.component_type,
    iu.hospital_id,
    h.name AS hospital_name,
    h.code AS hospital_code,
    h.latitude,
    h.longitude,
    iu.collection_time,
    iu.expiry_time,
    ROUND((julianday(iu.expiry_time) - julianday('now')) * 24.0, 2) AS remaining_hours,
    iu.storage_location,
    iu.status
FROM inventory_units iu
JOIN hospitals h ON iu.hospital_id = h.hospital_id
WHERE iu.status = 'AVAILABLE'
  AND datetime(iu.expiry_time) > datetime('now');

CREATE VIEW IF NOT EXISTS v_open_requests AS
SELECT 
    r.request_id,
    r.patient_id,
    p.full_name AS patient_name,
    r.hospital_id,
    h.name AS hospital_name,
    h.latitude,
    h.longitude,
    r.resource_type,
    r.required_blood_type,
    r.required_component,
    r.urgency_level,
    CASE 
        WHEN r.urgency_level = 'CRITICAL' THEN 1
        WHEN r.urgency_level = 'HIGH' THEN 2
        WHEN r.urgency_level = 'MEDIUM' THEN 3
        WHEN r.urgency_level = 'LOW' THEN 4
        ELSE 5
    END AS urgency_rank,
    r.status,
    r.justification,
    r.created_at,
    ROUND((julianday('now') - julianday(r.created_at)) * 24.0, 2) AS wait_time_hours
FROM requests r
JOIN patients p ON r.patient_id = p.patient_id
JOIN hospitals h ON r.hospital_id = h.hospital_id
WHERE r.status IN ('OPEN', 'PENDING_MATCH');

CREATE VIEW IF NOT EXISTS v_hospital_inventory_summary AS
SELECT 
    h.hospital_id,
    h.name AS hospital_name,
    h.code AS hospital_code,
    COUNT(CASE WHEN iu.status = 'AVAILABLE' AND datetime(iu.expiry_time) > datetime('now') THEN 1 END) AS total_available_units,
    COUNT(CASE WHEN iu.status = 'AVAILABLE' AND datetime(iu.expiry_time) <= datetime('now') THEN 1 END) AS total_expired_units,
    COUNT(CASE WHEN iu.status = 'QUARANTINED' THEN 1 END) AS total_quarantined_units,
    COUNT(CASE WHEN iu.status = 'ALLOCATED' THEN 1 END) AS total_allocated_units,
    COUNT(CASE WHEN iu.resource_type = 'BLOOD' AND iu.status = 'AVAILABLE' AND datetime(iu.expiry_time) > datetime('now') THEN 1 END) AS available_blood_units,
    COUNT(CASE WHEN iu.resource_type = 'ORGAN' AND iu.status = 'AVAILABLE' AND datetime(iu.expiry_time) > datetime('now') THEN 1 END) AS available_organ_units,
    COUNT(iu.unit_id) AS total_units_recorded
FROM hospitals h
LEFT JOIN inventory_units iu ON h.hospital_id = iu.hospital_id
GROUP BY h.hospital_id, h.name, h.code;

CREATE VIEW IF NOT EXISTS v_allocation_history AS
SELECT 
    a.allocation_id,
    a.request_id,
    r.urgency_level,
    r.patient_id,
    p.full_name AS patient_name,
    p.blood_type AS patient_blood_type,
    req_h.name AS requesting_hospital,
    a.unit_id,
    iu.blood_type AS unit_blood_type,
    iu.component_type,
    inv_h.name AS origin_hospital,
    u.full_name AS allocated_by,
    a.urgency_score,
    a.compatibility_score,
    a.shelf_life_score,
    a.distance_score,
    a.total_priority_score,
    a.status AS allocation_status,
    a.allocated_at,
    a.completed_at
FROM allocations a
JOIN requests r ON a.request_id = r.request_id
JOIN patients p ON r.patient_id = p.patient_id
JOIN hospitals req_h ON r.hospital_id = req_h.hospital_id
JOIN inventory_units iu ON a.unit_id = iu.unit_id
JOIN hospitals inv_h ON iu.hospital_id = inv_h.hospital_id
JOIN users u ON a.allocated_by_user_id = u.user_id;
`;
