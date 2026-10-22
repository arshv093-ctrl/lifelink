-- ============================================================================
-- LIFELINK: A Tamper-Evident, Concurrency-Safe Blood and Organ Allocation Platform
-- Project Identifier: LIFELINK_24BCE2119
-- Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
-- DDL Migration 03: Stored Procedures & Functions
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROCEDURE 1: Transaction-Safe Atomic Allocation
-- Named requirement: allocate_unit_24BCE2119_ArshVardhanSingh
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION allocate_unit_24BCE2119_ArshVardhanSingh(
    p_request_id VARCHAR(36),
    p_unit_id VARCHAR(36),
    p_user_id VARCHAR(36),
    p_urgency_score DOUBLE PRECISION,
    p_compat_score DOUBLE PRECISION,
    p_shelf_score DOUBLE PRECISION,
    p_dist_score DOUBLE PRECISION,
    p_total_score DOUBLE PRECISION,
    p_notes TEXT
)
RETURNS TABLE (
    out_allocation_id VARCHAR(36),
    out_status VARCHAR(20),
    out_message TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_req_status VARCHAR(20);
    v_req_blood VARCHAR(8);
    v_unit_status VARCHAR(20);
    v_unit_blood VARCHAR(8);
    v_unit_expiry TIMESTAMPTZ;
    v_alloc_id VARCHAR(36);
    v_prev_hash VARCHAR(64);
    v_curr_hash VARCHAR(64);
    v_audit_id VARCHAR(36);
    v_canonical_meta TEXT;
BEGIN
    -- Global Lock Ordering: Always lock in deterministic resource hierarchy
    -- 1. Lock Requests record first
    SELECT status, required_blood_type 
    INTO v_req_status, v_req_blood
    FROM requests 
    WHERE request_id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request % does not exist', p_request_id;
    END IF;

    IF v_req_status NOT IN ('OPEN', 'PENDING_MATCH') THEN
        RAISE EXCEPTION 'Request % is not open for allocation (current status: %)', p_request_id, v_req_status;
    END IF;

    -- 2. Lock Inventory Unit second (Deterministic resource order prevents cross-resource deadlocks)
    SELECT status, blood_type, expiry_time
    INTO v_unit_status, v_unit_blood, v_unit_expiry
    FROM inventory_units
    WHERE unit_id = p_unit_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory unit % does not exist', p_unit_id;
    END IF;

    -- Concurrency Guard: Check if unit was already claimed or moved
    IF v_unit_status <> 'AVAILABLE' THEN
        RAISE EXCEPTION 'Inventory unit % is no longer available (current status: %)', p_unit_id, v_unit_status;
    END IF;

    -- Expiry Guard: Never allocate expired inventory
    IF v_unit_expiry <= CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Inventory unit % has expired at %', p_unit_id, v_unit_expiry;
    END IF;

    -- Create Unique Allocation ID
    v_alloc_id := gen_random_uuid()::text;

    -- Insert Allocation record
    INSERT INTO allocations (
        allocation_id, request_id, unit_id, allocated_by_user_id,
        urgency_score, compatibility_score, shelf_life_score, distance_score,
        total_priority_score, status, allocation_notes, allocated_at
    ) VALUES (
        v_alloc_id, p_request_id, p_unit_id, p_user_id,
        p_urgency_score, p_compat_score, p_shelf_score, p_dist_score,
        p_total_score, 'RESERVED', p_notes, CURRENT_TIMESTAMP
    );

    -- Transition Inventory Unit Status
    UPDATE inventory_units
    SET status = 'ALLOCATED', updated_at = CURRENT_TIMESTAMP
    WHERE unit_id = p_unit_id;

    -- Transition Request Status
    UPDATE requests
    SET status = 'ALLOCATED', updated_at = CURRENT_TIMESTAMP
    WHERE request_id = p_request_id;

    -- Hash-Chained Audit Ledger Serialization:
    -- Lock ledger head to prevent concurrent chain forks
    SELECT current_event_hash 
    INTO v_prev_hash
    FROM audit_ledger
    ORDER BY sequence_number DESC
    LIMIT 1
    FOR UPDATE;

    IF v_prev_hash IS NULL THEN
        v_prev_hash := '0000000000000000000000000000000000000000000000000000000000000000'; -- Genesis hash
    END IF;

    v_audit_id := gen_random_uuid()::text;
    v_canonical_meta := json_build_object(
        'action', 'ATOMIC_ALLOCATION_24BCE2119',
        'allocation_id', v_alloc_id,
        'request_id', p_request_id,
        'unit_id', p_unit_id,
        'allocated_by', p_user_id,
        'total_score', p_total_score
    )::text;

    -- Compute SHA-256 for current event
    v_curr_hash := encode(digest(
        v_prev_hash || '|' || 'allocations' || '|' || v_alloc_id || '|' || 'ALLOCATE' || '|' || p_user_id || '|' || v_canonical_meta,
        'sha256'
    ), 'hex');

    INSERT INTO audit_ledger (
        audit_id, entity_type, entity_id, operation_type,
        actor_id, actor_role, event_timestamp, change_metadata,
        previous_event_hash, current_event_hash
    ) VALUES (
        v_audit_id, 'allocations', v_alloc_id, 'ALLOCATE',
        p_user_id, 'ALLOCATOR', CURRENT_TIMESTAMP, v_canonical_meta::jsonb,
        v_prev_hash, v_curr_hash
    );

    RETURN QUERY SELECT v_alloc_id, 'RESERVED'::VARCHAR(20), 'Unit allocated successfully under ACID isolation.'::TEXT;
END;
$$;


-- ----------------------------------------------------------------------------
-- PROCEDURE 2: Hash-Chain Ledger Verification
-- Named requirement: verify_ledger_24BCE2119_ArshVardhanSingh
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION verify_ledger_24BCE2119_ArshVardhanSingh()
RETURNS TABLE (
    verified_events_count BIGINT,
    is_valid BOOLEAN,
    first_broken_sequence BIGINT,
    error_reason TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
    v_prev_hash VARCHAR(64) := '0000000000000000000000000000000000000000000000000000000000000000';
    v_computed_hash VARCHAR(64);
    v_count BIGINT := 0;
    v_expected_seq BIGINT := 1;
BEGIN
    FOR r IN 
        SELECT sequence_number, audit_id, entity_type, entity_id, operation_type,
               actor_id, change_metadata, previous_event_hash, current_event_hash
        FROM audit_ledger
        ORDER BY sequence_number ASC
    LOOP
        -- Check 1: Sequence number continuity
        IF r.sequence_number <> v_expected_seq THEN
            RETURN QUERY SELECT v_count, FALSE, r.sequence_number, 
                format('Sequence gap detected. Expected %s, found %s', v_expected_seq, r.sequence_number);
            RETURN;
        END IF;

        -- Check 2: Predecessor hash link
        IF r.previous_event_hash <> v_prev_hash THEN
            RETURN QUERY SELECT v_count, FALSE, r.sequence_number, 
                format('Broken predecessor link at sequence %s. Stored prev: %s, expected: %s', 
                       r.sequence_number, r.previous_event_hash, v_prev_hash);
            RETURN;
        END IF;

        -- Check 3: Current row cryptographic hash integrity
        v_computed_hash := encode(digest(
            r.previous_event_hash || '|' || r.entity_type || '|' || r.entity_id || '|' || 
            r.operation_type || '|' || r.actor_id || '|' || (r.change_metadata::text),
            'sha256'
        ), 'hex');

        IF v_computed_hash <> r.current_event_hash THEN
            RETURN QUERY SELECT v_count, FALSE, r.sequence_number, 
                format('Tampered event payload at sequence %s. Stored hash: %s, recomputed: %s', 
                       r.sequence_number, r.current_event_hash, v_computed_hash);
            RETURN;
        END IF;

        v_prev_hash := r.current_event_hash;
        v_expected_seq := v_expected_seq + 1;
        v_count := v_count + 1;
    END LOOP;

    RETURN QUERY SELECT v_count, TRUE, NULL::BIGINT, 'Ledger hash-chain integrity fully verified.'::TEXT;
END;
$$;
