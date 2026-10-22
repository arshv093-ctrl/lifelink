-- ============================================================================
-- LIFELINK: A Tamper-Evident, Concurrency-Safe Blood and Organ Allocation Platform
-- Project Identifier: LIFELINK_24BCE2119
-- Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
-- Course Context: Database Systems Lab | School of Computer Science and Engineering, VIT
-- DDL Migration 01: Core Relational Schema
-- ============================================================================

-- Extensions (when deployed on PostgreSQL 16)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    role_id VARCHAR(32) PRIMARY KEY,
    role_name VARCHAR(64) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
    hospital_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(16) NOT NULL UNIQUE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(32) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users Table (Single login entity with RBAC and Hospital Scope)
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role_id VARCHAR(32) NOT NULL REFERENCES roles(role_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    hospital_id VARCHAR(36) REFERENCES hospitals(hospital_id) ON UPDATE CASCADE ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Blood Types Domain
CREATE TABLE IF NOT EXISTS blood_types (
    blood_type VARCHAR(8) PRIMARY KEY,
    description VARCHAR(64) NOT NULL,
    is_rh_positive BOOLEAN NOT NULL
);

-- 5. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    patient_id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(128) NOT NULL,
    date_of_birth DATE NOT NULL,
    blood_type VARCHAR(8) NOT NULL REFERENCES blood_types(blood_type) ON UPDATE CASCADE ON DELETE RESTRICT,
    hospital_id VARCHAR(36) NOT NULL REFERENCES hospitals(hospital_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    urgency_level VARCHAR(16) NOT NULL CHECK (urgency_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    condition_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Donors Table (Clinical entity separated from login identities)
CREATE TABLE IF NOT EXISTS donors (
    donor_id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(128) NOT NULL,
    blood_type VARCHAR(8) NOT NULL REFERENCES blood_types(blood_type) ON UPDATE CASCADE ON DELETE RESTRICT,
    date_of_birth DATE NOT NULL,
    consent_verified BOOLEAN NOT NULL DEFAULT FALSE,
    consent_document_ref VARCHAR(128),
    hospital_id VARCHAR(36) NOT NULL REFERENCES hospitals(hospital_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Inventory Units Table
CREATE TABLE IF NOT EXISTS inventory_units (
    unit_id VARCHAR(36) PRIMARY KEY,
    resource_type VARCHAR(16) NOT NULL CHECK (resource_type IN ('BLOOD', 'ORGAN')),
    blood_type VARCHAR(8) NOT NULL REFERENCES blood_types(blood_type) ON UPDATE CASCADE ON DELETE RESTRICT,
    component_type VARCHAR(32) NOT NULL CHECK (component_type IN (
        'WHOLE_BLOOD', 'PACKED_RBC', 'PLATELETS', 'FRESH_FROZEN_PLASMA', 'CRYOPRECIPITATE',
        'KIDNEY', 'LIVER', 'HEART', 'LUNG', 'PANCREAS'
    )),
    donor_id VARCHAR(36) REFERENCES donors(donor_id) ON UPDATE CASCADE ON DELETE SET NULL,
    hospital_id VARCHAR(36) NOT NULL REFERENCES hospitals(hospital_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    collection_time TIMESTAMPTZ NOT NULL,
    expiry_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('AVAILABLE', 'ALLOCATED', 'QUARANTINED', 'EXPIRED', 'DISCARDED')),
    storage_location VARCHAR(64) NOT NULL,
    quarantine_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_expiry_after_collection CHECK (expiry_time > collection_time)
);

-- 8. Requests Table
CREATE TABLE IF NOT EXISTS requests (
    request_id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL REFERENCES patients(patient_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    hospital_id VARCHAR(36) NOT NULL REFERENCES hospitals(hospital_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    resource_type VARCHAR(16) NOT NULL CHECK (resource_type IN ('BLOOD', 'ORGAN')),
    required_blood_type VARCHAR(8) NOT NULL REFERENCES blood_types(blood_type) ON UPDATE CASCADE ON DELETE RESTRICT,
    required_component VARCHAR(32) NOT NULL,
    urgency_level VARCHAR(16) NOT NULL CHECK (urgency_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('OPEN', 'PENDING_MATCH', 'ALLOCATED', 'FULFILLED', 'CANCELLED')),
    justification TEXT NOT NULL,
    requested_by_user_id VARCHAR(36) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Allocations Table
CREATE TABLE IF NOT EXISTS allocations (
    allocation_id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL REFERENCES requests(request_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    unit_id VARCHAR(36) NOT NULL REFERENCES inventory_units(unit_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    allocated_by_user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    urgency_score DOUBLE PRECISION NOT NULL,
    compatibility_score DOUBLE PRECISION NOT NULL,
    shelf_life_score DOUBLE PRECISION NOT NULL,
    distance_score DOUBLE PRECISION NOT NULL,
    total_priority_score DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('RESERVED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED')),
    allocation_notes TEXT,
    allocated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- Unique index ensuring no active double-allocation on the same physical inventory unit
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_unit_allocation 
    ON allocations(unit_id) 
    WHERE status IN ('RESERVED', 'IN_TRANSIT', 'COMPLETED');

-- 10. Inventory Transfers Table
CREATE TABLE IF NOT EXISTS inventory_transfers (
    transfer_id VARCHAR(36) PRIMARY KEY,
    unit_id VARCHAR(36) NOT NULL REFERENCES inventory_units(unit_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    allocation_id VARCHAR(36) NOT NULL REFERENCES allocations(allocation_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    from_hospital_id VARCHAR(36) NOT NULL REFERENCES hospitals(hospital_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    to_hospital_id VARCHAR(36) NOT NULL REFERENCES hospitals(hospital_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    initiated_by_user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('DISPATCHED', 'IN_TRANSIT', 'RECEIVED', 'REJECTED')),
    tracking_notes TEXT,
    dispatched_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    received_at TIMESTAMPTZ
);

-- 11. Transactions Log Table (ACID tracking and telemetry)
CREATE TABLE IF NOT EXISTS transactions_log (
    tx_id VARCHAR(36) PRIMARY KEY,
    tx_type VARCHAR(32) NOT NULL,
    isolation_level VARCHAR(32) NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('COMMITTED', 'ROLLED_BACK', 'FAILED')),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    duration_ms DOUBLE PRECISION NOT NULL,
    details TEXT
);

-- 12. Audit Ledger Table (N1: Tamper-Evident Hash Chain)
CREATE TABLE IF NOT EXISTS audit_ledger (
    audit_id VARCHAR(36) PRIMARY KEY,
    sequence_number BIGSERIAL UNIQUE NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    operation_type VARCHAR(32) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    change_metadata JSONB NOT NULL,
    previous_event_hash VARCHAR(64) NOT NULL,
    current_event_hash VARCHAR(64) NOT NULL
);

-- 13. Ledger Checkpoints Table (N1: Merkle Root Checkpoints)
CREATE TABLE IF NOT EXISTS ledger_checkpoints (
    checkpoint_id VARCHAR(36) PRIMARY KEY,
    from_sequence BIGINT NOT NULL,
    to_sequence BIGINT NOT NULL,
    event_count INT NOT NULL,
    merkle_root_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(16) NOT NULL CHECK (status IN ('VERIFIED', 'COMPROMISED')),
    external_anchor_ref VARCHAR(128),
    CONSTRAINT chk_checkpoint_sequence CHECK (to_sequence >= from_sequence)
);

-- 14. Query Telemetry Table (N3: Query Telemetry)
CREATE TABLE IF NOT EXISTS query_telemetry (
    telemetry_id VARCHAR(36) PRIMARY KEY,
    query_fingerprint VARCHAR(255) NOT NULL,
    query_category VARCHAR(32) NOT NULL,
    duration_ms DOUBLE PRECISION NOT NULL,
    execution_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_status VARCHAR(16) NOT NULL CHECK (execution_status IN ('SUCCESS', 'ERROR')),
    application_operation VARCHAR(64) NOT NULL,
    result_count INT
);

-- 15. Index Recommendations Table (N3: Self-Tuning Advisor)
CREATE TABLE IF NOT EXISTS index_recommendations (
    recommendation_id VARCHAR(36) PRIMARY KEY,
    table_name VARCHAR(64) NOT NULL,
    column_names VARCHAR(128) NOT NULL,
    index_type VARCHAR(16) NOT NULL CHECK (index_type IN ('BTREE', 'HASH', 'GIN')),
    reason TEXT NOT NULL,
    estimated_improvement_pct DOUBLE PRECISION NOT NULL,
    measured_improvement_pct DOUBLE PRECISION,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'APPLIED', 'REJECTED', 'ROLLED_BACK')),
    applied_at TIMESTAMPTZ
);

-- 16. Emergency Grants Table (Bonus: Break-Glass Emergency Access)
CREATE TABLE IF NOT EXISTS emergency_grants (
    grant_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    requested_permissions VARCHAR(128) NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('ACTIVE', 'EXPIRED', 'REVOKED')),
    revoked_at TIMESTAMPTZ,
    revoked_by VARCHAR(36) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE SET NULL,
    audit_event_id VARCHAR(36) REFERENCES audit_ledger(audit_id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_grant_expiry CHECK (expires_at > granted_at)
);

-- Primary Performance Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_status_blood ON inventory_units(status, blood_type, expiry_time);
CREATE INDEX IF NOT EXISTS idx_inventory_hospital ON inventory_units(hospital_id, status);
CREATE INDEX IF NOT EXISTS idx_requests_status_urgency ON requests(status, urgency_level);
CREATE INDEX IF NOT EXISTS idx_allocations_request ON allocations(request_id);
CREATE INDEX IF NOT EXISTS idx_audit_sequence ON audit_ledger(sequence_number);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_ledger(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_fingerprint ON query_telemetry(query_fingerprint, duration_ms);
CREATE INDEX IF NOT EXISTS idx_emergency_user_status ON emergency_grants(user_id, status, expires_at);
