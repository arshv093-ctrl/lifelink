/**
 * LifeLink - Break-Glass Emergency Access Service (Bonus Feature)
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import crypto from "node:crypto";
import { query, queryOne, execute, runInTransaction } from "../db/connection.js";
import { APP_CONFIG } from "../config/constants.js";
import { LifeLinkAuditService_24BCE2119_ArshVardhanSingh } from "./auditService.js";

export interface EmergencyGrantRecord {
  grant_id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  reason: string;
  requested_permissions: string;
  granted_at: string;
  expires_at: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  revoked_at: string | null;
  revoked_by: string | null;
  audit_event_id: string | null;
  remaining_minutes?: number;
}

export class EmergencyAccessService {
  /**
   * Request a Break-Glass Emergency Elevated Permission
   */
  public static requestBreakGlass(params: {
    userId: string;
    reason: string;
    requestedPermissions?: string;
    durationMinutes?: number;
  }): EmergencyGrantRecord {
    if (!params.reason || params.reason.trim().length < 10) {
      throw new Error("Emergency justification mandatory: Please specify clinical emergency details (minimum 10 characters).");
    }

    const duration = Math.min(
      params.durationMinutes || APP_CONFIG.emergencyAccessMaxMinutes,
      APP_CONFIG.emergencyAccessMaxMinutes
    );

    return runInTransaction(() => {
      // Invalidate any existing active grants for this user
      execute(`
        UPDATE emergency_grants
        SET status = 'EXPIRED'
        WHERE user_id = ? AND status = 'ACTIVE' AND datetime(expires_at) <= datetime('now')
      `, [params.userId]);

      const grantId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + duration * 60 * 1000).toISOString();
      const permissions = params.requestedPermissions || "EMERGENCY_OVERRIDE_ALL_HOSPITALS";

      // 1. Record in audit ledger first
      const auditEvent = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.recordEvent({
        entityType: "emergency_grants",
        entityId: grantId,
        operationType: "BREAK_GLASS_ELEVATION",
        actorId: params.userId,
        actorRole: "DOCTOR_EMERGENCY",
        metadata: {
          grant_id: grantId,
          reason: params.reason,
          permissions,
          duration_minutes: duration,
          expires_at: expiresAt
        }
      });

      // 2. Insert emergency grant record
      const insertSql = `
        INSERT INTO emergency_grants (
          grant_id, user_id, reason, requested_permissions,
          granted_at, expires_at, status, audit_event_id
        ) VALUES (?, ?, ?, ?, datetime('now'), ?, 'ACTIVE', ?)
      `;

      execute(insertSql, [
        grantId,
        params.userId,
        params.reason,
        permissions,
        expiresAt,
        auditEvent.audit_id
      ]);

      return queryOne<EmergencyGrantRecord>(`
        SELECT eg.*, u.full_name AS user_name, u.email AS user_email
        FROM emergency_grants eg
        JOIN users u ON eg.user_id = u.user_id
        WHERE eg.grant_id = ?
      `, [grantId])!;
    }, "BREAK_GLASS_GRANT");
  }

  /**
   * Check if user has an active, non-expired emergency grant
   */
  public static hasActiveEmergencyGrant(userId: string): boolean {
    // Automatically update expired records
    execute(`
      UPDATE emergency_grants
      SET status = 'EXPIRED'
      WHERE status = 'ACTIVE' AND datetime(expires_at) <= datetime('now')
    `);

    const grant = queryOne<any>(`
      SELECT * FROM emergency_grants
      WHERE user_id = ? 
        AND status = 'ACTIVE' 
        AND datetime(expires_at) > datetime('now')
      LIMIT 1
    `, [userId]);

    return !!grant;
  }

  /**
   * List all emergency grants (with auto-computed remaining minutes)
   */
  public static getAllGrants(): EmergencyGrantRecord[] {
    // Auto-expire past grants
    execute(`
      UPDATE emergency_grants
      SET status = 'EXPIRED'
      WHERE status = 'ACTIVE' AND datetime(expires_at) <= datetime('now')
    `);

    const grants = query<any>(`
      SELECT 
        eg.*, 
        u.full_name AS user_name, 
        u.email AS user_email,
        ROUND((julianday(eg.expires_at) - julianday('now')) * 1440.0, 1) AS remaining_minutes
      FROM emergency_grants eg
      JOIN users u ON eg.user_id = u.user_id
      ORDER BY eg.granted_at DESC
    `);

    return grants.map((g) => ({
      ...g,
      remaining_minutes: g.status === "ACTIVE" ? Math.max(0, g.remaining_minutes) : 0
    }));
  }

  /**
   * Manually revoke an active emergency grant
   */
  public static revokeGrant(grantId: string, revokedByUserId: string): EmergencyGrantRecord {
    return runInTransaction(() => {
      const grant = queryOne<EmergencyGrantRecord>(
        "SELECT * FROM emergency_grants WHERE grant_id = ?",
        [grantId]
      );

      if (!grant) {
        throw new Error(`Emergency grant not found: ${grantId}`);
      }

      execute(`
        UPDATE emergency_grants
        SET status = 'REVOKED', revoked_at = datetime('now'), revoked_by = ?
        WHERE grant_id = ?
      `, [revokedByUserId, grantId]);

      // Audit the revocation
      LifeLinkAuditService_24BCE2119_ArshVardhanSingh.recordEvent({
        entityType: "emergency_grants",
        entityId: grantId,
        operationType: "REVOKE_EMERGENCY_ACCESS",
        actorId: revokedByUserId,
        actorRole: "ADMIN",
        metadata: {
          grant_id: grantId,
          original_user_id: grant.user_id,
          revoked_at: new Date().toISOString()
        }
      });

      return queryOne<EmergencyGrantRecord>(
        "SELECT * FROM emergency_grants WHERE grant_id = ?",
        [grantId]
      )!;
    }, "REVOKE_EMERGENCY_GRANT");
  }
}
