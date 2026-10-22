-- ============================================================================
-- LIFELINK: A Tamper-Evident, Concurrency-Safe Blood and Organ Allocation Platform
-- Project Identifier: LIFELINK_24BCE2119
-- Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
-- DDL Migration 04: Database Triggers for Integrity & Append-Only Auditing
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Trigger 1: Strict Append-Only Enforcement on audit_ledger
-- Ensures audit records can NEVER be modified or deleted once written
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_enforce_append_only_audit()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'SECURITY VIOLATION: audit_ledger is strictly append-only. UPDATE and DELETE statements are prohibited by database security trigger.';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_ledger_immutable ON audit_ledger;
CREATE TRIGGER trg_audit_ledger_immutable
BEFORE UPDATE OR DELETE ON audit_ledger
FOR EACH ROW
EXECUTE FUNCTION fn_enforce_append_only_audit();


-- ----------------------------------------------------------------------------
-- Trigger 2: Auto-Audit for Inventory Status Transitions
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_audit_inventory_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_prev_hash VARCHAR(64);
    v_curr_hash VARCHAR(64);
    v_canonical_meta TEXT;
BEGIN
    -- Only trigger on meaningful mutations or status changes
    IF (TG_OP = 'UPDATE' AND OLD.status = NEW.status AND OLD.quarantine_reason IS NOT DISTINCT FROM NEW.quarantine_reason) THEN
        RETURN NEW;
    END IF;

    -- Retrieve latest ledger head with row lock
    SELECT current_event_hash 
    INTO v_prev_hash
    FROM audit_ledger
    ORDER BY sequence_number DESC
    LIMIT 1
    FOR UPDATE;

    IF v_prev_hash IS NULL THEN
        v_prev_hash := '0000000000000000000000000000000000000000000000000000000000000000';
    END IF;

    v_canonical_meta := json_build_object(
        'table', 'inventory_units',
        'operation', TG_OP,
        'unit_id', NEW.unit_id,
        'old_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
        'new_status', NEW.status,
        'resource_type', NEW.resource_type,
        'blood_type', NEW.blood_type,
        'hospital_id', NEW.hospital_id
    )::text;

    v_curr_hash := encode(digest(
        v_prev_hash || '|' || 'inventory_units' || '|' || NEW.unit_id || '|' || TG_OP || '|' || 'SYSTEM_TRIGGER' || '|' || v_canonical_meta,
        'sha256'
    ), 'hex');

    INSERT INTO audit_ledger (
        audit_id, entity_type, entity_id, operation_type,
        actor_id, actor_role, event_timestamp, change_metadata,
        previous_event_hash, current_event_hash
    ) VALUES (
        gen_random_uuid()::text, 'inventory_units', NEW.unit_id, TG_OP,
        'SYSTEM_TRIGGER', 'DATABASE_TRIGGER', CURRENT_TIMESTAMP, v_canonical_meta::jsonb,
        v_prev_hash, v_curr_hash
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_inventory_mutation_audit ON inventory_units;
CREATE TRIGGER trg_inventory_mutation_audit
AFTER INSERT OR UPDATE ON inventory_units
FOR EACH ROW
EXECUTE FUNCTION fn_audit_inventory_mutation();
