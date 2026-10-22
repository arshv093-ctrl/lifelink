/**
 * LifeLink - Tamper-Evident Hash-Chained Audit Ledger with Merkle Checkpoints (N1)
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 * 
 * Mandatory Identifiers:
 * - LifeLinkAuditService_24BCE2119_ArshVardhanSingh
 * - verify_ledger_24BCE2119_ArshVardhanSingh
 */

import crypto from "node:crypto";
import { sqliteDb, query, queryOne, execute, runInTransaction } from "../db/connection.js";
import {
  ARSH_VARDHAN_SINGH_24BCE2119,
  REGNO_24BCE2119,
  STUDENT_NAME_ArshVardhanSingh,
  LIFELINK_24BCE2119
} from "../config/constants.js";

export interface AuditRecord {
  audit_id: string;
  sequence_number: number;
  entity_type: string;
  entity_id: string;
  operation_type: string;
  actor_id: string;
  actor_role: string;
  event_timestamp: string;
  change_metadata: string;
  previous_event_hash: string;
  current_event_hash: string;
}

export interface CheckpointRecord {
  checkpoint_id: string;
  from_sequence: number;
  to_sequence: number;
  event_count: number;
  merkle_root_hash: string;
  created_at: string;
  status: "VERIFIED" | "COMPROMISED";
  external_anchor_ref: string | null;
}

export interface VerificationResult {
  verifiedCount: number;
  isValid: boolean;
  brokenSequence: number | null;
  errorReason: string | null;
  expectedHash: string | null;
  actualHash: string | null;
  checkpointStatus: {
    totalCheckpoints: number;
    verifiedCheckpoints: number;
    failedCheckpoints: number;
  };
}

export class LifeLinkAuditService_24BCE2119_ArshVardhanSingh {
  public static readonly STUDENT_ID = ARSH_VARDHAN_SINGH_24BCE2119;
  public static readonly REGISTRATION_NO = REGNO_24BCE2119;
  public static readonly STUDENT_NAME = STUDENT_NAME_ArshVardhanSingh;
  public static readonly PROJECT_ID = LIFELINK_24BCE2119;
  public static readonly GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

  /**
   * Deterministic JSON Canonicalizer
   * Sorts object keys recursively, normalizes nulls and timestamps
   */
  public static canonicalize(obj: any): string {
    if (obj === null || obj === undefined) return "null";
    if (typeof obj !== "object") return JSON.stringify(obj);
    if (Array.isArray(obj)) {
      return "[" + obj.map((item) => LifeLinkAuditService_24BCE2119_ArshVardhanSingh.canonicalize(item)).join(",") + "]";
    }
    const keys = Object.keys(obj).sort();
    const parts = keys.map(
      (k) => JSON.stringify(k) + ":" + LifeLinkAuditService_24BCE2119_ArshVardhanSingh.canonicalize(obj[k])
    );
    return "{" + parts.join(",") + "}";
  }

  /**
   * Compute Cryptographic SHA-256 for an audit event
   */
  public static computeEventHash(
    previousHash: string,
    entityType: string,
    entityId: string,
    operationType: string,
    actorId: string,
    canonicalMetadata: string
  ): string {
    const rawPayload = `${previousHash}|${entityType}|${entityId}|${operationType}|${actorId}|${canonicalMetadata}`;
    return crypto.createHash("sha256").update(rawPayload).digest("hex");
  }

  /**
   * Append-Only Audit Event Insertion with Serialized Ledger Head
   */
  public static recordEvent(params: {
    entityType: string;
    entityId: string;
    operationType: string;
    actorId: string;
    actorRole: string;
    metadata: Record<string, any>;
  }): AuditRecord {
    return runInTransaction(() => {
      // 1. Get latest record in sequence to obtain predecessor hash (serialized ledger head)
      const latest = queryOne<AuditRecord>(
        "SELECT * FROM audit_ledger ORDER BY sequence_number DESC LIMIT 1"
      );

      const previousHash = latest ? latest.current_event_hash : LifeLinkAuditService_24BCE2119_ArshVardhanSingh.GENESIS_HASH;
      const canonicalMeta = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.canonicalize(params.metadata);
      const currentHash = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.computeEventHash(
        previousHash,
        params.entityType,
        params.entityId,
        params.operationType,
        params.actorId,
        canonicalMeta
      );

      const auditId = crypto.randomUUID();
      const insertSql = `
        INSERT INTO audit_ledger (
          audit_id, entity_type, entity_id, operation_type,
          actor_id, actor_role, event_timestamp, change_metadata,
          previous_event_hash, current_event_hash
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?)
      `;

      execute(insertSql, [
        auditId,
        params.entityType,
        params.entityId,
        params.operationType,
        params.actorId,
        params.actorRole,
        canonicalMeta,
        previousHash,
        currentHash
      ]);

      return queryOne<AuditRecord>("SELECT * FROM audit_ledger WHERE audit_id = ?", [auditId])!;
    }, "AUDIT_LEDGER_APPEND");
  }

  /**
   * Comprehensive Hash-Chain & Checkpoint Integrity Verification
   * Mandatory method requirement: verify_ledger_24BCE2119_ArshVardhanSingh
   */
  public static verify_ledger_24BCE2119_ArshVardhanSingh(): VerificationResult {
    const records = query<AuditRecord>(
      "SELECT * FROM audit_ledger ORDER BY sequence_number ASC"
    );

    if (records.length === 0) {
      return {
        verifiedCount: 0,
        isValid: true,
        brokenSequence: null,
        errorReason: null,
        expectedHash: null,
        actualHash: null,
        checkpointStatus: { totalCheckpoints: 0, verifiedCheckpoints: 0, failedCheckpoints: 0 }
      };
    }

    let expectedPrevHash = records[0].previous_event_hash;
    let expectedSequence = records[0].sequence_number;
    let verifiedCount = 0;

    for (const record of records) {
      // 1. Check Sequence Number Continuity
      if (record.sequence_number !== expectedSequence) {
        return {
          verifiedCount,
          isValid: false,
          brokenSequence: record.sequence_number,
          errorReason: `Sequence gap detected: Expected sequence #${expectedSequence}, but found #${record.sequence_number}`,
          expectedHash: null,
          actualHash: null,
          checkpointStatus: { totalCheckpoints: 0, verifiedCheckpoints: 0, failedCheckpoints: 0 }
        };
      }

      // 2. Check Predecessor Hash Link
      if (record.previous_event_hash !== expectedPrevHash) {
        return {
          verifiedCount,
          isValid: false,
          brokenSequence: record.sequence_number,
          errorReason: `Broken predecessor link at sequence #${record.sequence_number}: previous_event_hash (${record.previous_event_hash.substring(0, 16)}...) does not match prior row hash (${expectedPrevHash.substring(0, 16)}...)`,
          expectedHash: expectedPrevHash,
          actualHash: record.previous_event_hash,
          checkpointStatus: { totalCheckpoints: 0, verifiedCheckpoints: 0, failedCheckpoints: 0 }
        };
      }

      // 3. Re-calculate Canonical Hash for current row
      let parsedMeta: any;
      try {
        parsedMeta = JSON.parse(record.change_metadata);
      } catch {
        parsedMeta = record.change_metadata;
      }
      const canonicalMeta = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.canonicalize(parsedMeta);
      const computedHash = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.computeEventHash(
        record.previous_event_hash,
        record.entity_type,
        record.entity_id,
        record.operation_type,
        record.actor_id,
        canonicalMeta
      );

      if (computedHash !== record.current_event_hash) {
        return {
          verifiedCount,
          isValid: false,
          brokenSequence: record.sequence_number,
          errorReason: `Tampered payload detected at sequence #${record.sequence_number}: Stored hash does not match cryptographic hash of row contents.`,
          expectedHash: computedHash,
          actualHash: record.current_event_hash,
          checkpointStatus: { totalCheckpoints: 0, verifiedCheckpoints: 0, failedCheckpoints: 0 }
        };
      }

      expectedPrevHash = record.current_event_hash;
      expectedSequence += 1;
      verifiedCount += 1;
    }

    // 4. Verify Merkle Checkpoints against database records
    const checkpoints = query<CheckpointRecord>(
      "SELECT * FROM ledger_checkpoints ORDER BY from_sequence ASC"
    );
    let verifiedCheckpoints = 0;
    let failedCheckpoints = 0;

    for (const cp of checkpoints) {
      const rangeRecords = query<AuditRecord>(
        "SELECT current_event_hash FROM audit_ledger WHERE sequence_number BETWEEN ? AND ? ORDER BY sequence_number ASC",
        [cp.from_sequence, cp.to_sequence]
      );

      const leafHashes = rangeRecords.map((r) => r.current_event_hash);
      const recomputedRoot = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.buildMerkleRoot(leafHashes);

      if (recomputedRoot === cp.merkle_root_hash) {
        verifiedCheckpoints++;
      } else {
        failedCheckpoints++;
      }
    }

    return {
      verifiedCount,
      isValid: failedCheckpoints === 0,
      brokenSequence: null,
      errorReason: failedCheckpoints > 0 ? "One or more Merkle Checkpoints failed integrity verification" : null,
      expectedHash: null,
      actualHash: null,
      checkpointStatus: {
        totalCheckpoints: checkpoints.length,
        verifiedCheckpoints,
        failedCheckpoints
      }
    };
  }

  /**
   * Deterministic Merkle Tree Root Calculation
   * Odd leaves are duplicated with deterministic delimiter
   */
  public static buildMerkleRoot(leaves: string[]): string {
    if (leaves.length === 0) {
      return LifeLinkAuditService_24BCE2119_ArshVardhanSingh.GENESIS_HASH;
    }
    if (leaves.length === 1) {
      return leaves[0];
    }

    let currentLayer = [...leaves];
    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          // Pairwise SHA-256
          const combined = currentLayer[i] + ":" + currentLayer[i + 1];
          nextLayer.push(crypto.createHash("sha256").update(combined).digest("hex"));
        } else {
          // Deterministic handling of odd leaves: duplicate the single leaf
          const oddCombined = currentLayer[i] + ":" + currentLayer[i];
          nextLayer.push(crypto.createHash("sha256").update(oddCombined).digest("hex"));
        }
      }
      currentLayer = nextLayer;
    }

    return currentLayer[0];
  }

  /**
   * Generate Merkle Checkpoint over an un-checkpointed range of events
   */
  public static createMerkleCheckpoint(): CheckpointRecord | null {
    return runInTransaction(() => {
      // Find highest checkpointed sequence
      const lastCheckpoint = queryOne<CheckpointRecord>(
        "SELECT * FROM ledger_checkpoints ORDER BY to_sequence DESC LIMIT 1"
      );

      const fromSeq = lastCheckpoint ? lastCheckpoint.to_sequence + 1 : 1;
      const latestEvent = queryOne<AuditRecord>(
        "SELECT * FROM audit_ledger ORDER BY sequence_number DESC LIMIT 1"
      );

      if (!latestEvent || latestEvent.sequence_number < fromSeq) {
        return null; // No new events to checkpoint
      }

      const toSeq = latestEvent.sequence_number;
      const events = query<AuditRecord>(
        "SELECT current_event_hash FROM audit_ledger WHERE sequence_number BETWEEN ? AND ? ORDER BY sequence_number ASC",
        [fromSeq, toSeq]
      );

      const leafHashes = events.map((e) => e.current_event_hash);
      const rootHash = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.buildMerkleRoot(leafHashes);

      const checkpointId = crypto.randomUUID();
      const insertSql = `
        INSERT INTO ledger_checkpoints (
          checkpoint_id, from_sequence, to_sequence, event_count,
          merkle_root_hash, created_at, status, external_anchor_ref
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), 'VERIFIED', ?)
      `;

      execute(insertSql, [
        checkpointId,
        fromSeq,
        toSeq,
        events.length,
        rootHash,
        `LOCAL_STORAGE_VIT_24BCE2119#${checkpointId.substring(0, 8)}`
      ]);

      return queryOne<CheckpointRecord>("SELECT * FROM ledger_checkpoints WHERE checkpoint_id = ?", [checkpointId]);
    }, "CREATE_MERKLE_CHECKPOINT");
  }

  /**
   * Developer-Only Tamper Demonstration Tool (Isolated test utility)
   * Modifies change_metadata of a record without updating the hash,
   * demonstrating that verify_ledger immediately detects the tampering!
   */
  public static tamperRecordForDemo(sequenceNumber: number, forgedPayload: string): boolean {
    const target = queryOne<AuditRecord>(
      "SELECT * FROM audit_ledger WHERE sequence_number = ?",
      [sequenceNumber]
    );
    if (!target) return false;

    // Direct SQLite update bypassing standard service hashing
    sqliteDb.prepare(`
      UPDATE audit_ledger 
      SET change_metadata = ? 
      WHERE sequence_number = ?
    `).run(forgedPayload, sequenceNumber);

    return true;
  }
}
