-- ============================================================================
-- LIFELINK: A Tamper-Evident, Concurrency-Safe Blood and Organ Allocation Platform
-- Project Identifier: LIFELINK_24BCE2119
-- Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
-- DDL Migration 02: Analytical & Operational Views
-- ============================================================================

-- View 1: Currently Available, Non-Expired, Non-Quarantined Inventory Units
CREATE OR REPLACE VIEW v_available_inventory AS
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
    ROUND(EXTRACT(EPOCH FROM (iu.expiry_time - CURRENT_TIMESTAMP)) / 3600.0, 2) AS remaining_hours,
    iu.storage_location,
    iu.status
FROM inventory_units iu
JOIN hospitals h ON iu.hospital_id = h.hospital_id
WHERE iu.status = 'AVAILABLE'
  AND iu.expiry_time > CURRENT_TIMESTAMP;

-- View 2: Open Requests with Patient Demographics and Hospital Geographic Coordinates
CREATE OR REPLACE VIEW v_open_requests AS
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
    ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - r.created_at)) / 3600.0, 2) AS wait_time_hours
FROM requests r
JOIN patients p ON r.patient_id = p.patient_id
JOIN hospitals h ON r.hospital_id = h.hospital_id
WHERE r.status IN ('OPEN', 'PENDING_MATCH');

-- View 3: Hospital-Level Aggregated Inventory Summary
CREATE OR REPLACE VIEW v_hospital_inventory_summary AS
SELECT 
    h.hospital_id,
    h.name AS hospital_name,
    h.code AS hospital_code,
    COUNT(CASE WHEN iu.status = 'AVAILABLE' AND iu.expiry_time > CURRENT_TIMESTAMP THEN 1 END) AS total_available_units,
    COUNT(CASE WHEN iu.status = 'AVAILABLE' AND iu.expiry_time <= CURRENT_TIMESTAMP THEN 1 END) AS total_expired_units,
    COUNT(CASE WHEN iu.status = 'QUARANTINED' THEN 1 END) AS total_quarantined_units,
    COUNT(CASE WHEN iu.status = 'ALLOCATED' THEN 1 END) AS total_allocated_units,
    COUNT(CASE WHEN iu.resource_type = 'BLOOD' AND iu.status = 'AVAILABLE' AND iu.expiry_time > CURRENT_TIMESTAMP THEN 1 END) AS available_blood_units,
    COUNT(CASE WHEN iu.resource_type = 'ORGAN' AND iu.status = 'AVAILABLE' AND iu.expiry_time > CURRENT_TIMESTAMP THEN 1 END) AS available_organ_units,
    COUNT(iu.unit_id) AS total_units_recorded
FROM hospitals h
LEFT JOIN inventory_units iu ON h.hospital_id = iu.hospital_id
GROUP BY h.hospital_id, h.name, h.code;

-- View 4: Complete Allocation History with Patient, Donor, and Hospital Joins
CREATE OR REPLACE VIEW v_allocation_history AS
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
