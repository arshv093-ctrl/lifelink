/**
 * LifeLink - Authentication Service & Session Token Handler
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import crypto from "node:crypto";
import { queryOne } from "../db/connection.js";
import { hashPassword } from "../db/seed.js";
import { APP_CONFIG } from "../config/constants.js";
import { AuthenticatedUser, RoleId } from "./rbacService.js";
import { EmergencyAccessService } from "./emergencyService.js";

// Fast cryptographically signed token mechanism (HMAC-SHA256)
export class AuthService {
  private static signPayload(payload: any): string {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = crypto
      .createHmac("sha256", APP_CONFIG.jwtSecret)
      .update(`${header}.${body}`)
      .digest("base64url");
    return `${header}.${body}.${signature}`;
  }

  public static verifyToken(token: string): AuthenticatedUser | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const [header, body, signature] = parts;
      const expectedSig = crypto
        .createHmac("sha256", APP_CONFIG.jwtSecret)
        .update(`${header}.${body}`)
        .digest("base64url");

      if (signature !== expectedSig) return null;

      const payload = JSON.parse(Buffer.from(body, "base64url").toString());
      if (payload.exp && Date.now() > payload.exp) {
        return null; // Expired
      }

      // Check if user has active break-glass emergency elevation
      const hasActiveEmergency = EmergencyAccessService.hasActiveEmergencyGrant(payload.userId);

      return {
        userId: payload.userId,
        email: payload.email,
        fullName: payload.fullName,
        roleId: payload.roleId as RoleId,
        hospitalId: payload.hospitalId,
        hasActiveEmergency
      };
    } catch {
      return null;
    }
  }

  public static authenticate(email: string, plainTextPass: string): { user: AuthenticatedUser; token: string } | null {
    const hashed = hashPassword(plainTextPass);
    const userRow = queryOne<any>(`
      SELECT u.*, h.name AS hospital_name
      FROM users u
      LEFT JOIN hospitals h ON u.hospital_id = h.hospital_id
      WHERE u.email = ? AND u.password_hash = ? AND u.is_active = 1
    `, [email.toLowerCase().trim(), hashed]);

    if (!userRow) {
      return null;
    }

    const authUser: AuthenticatedUser = {
      userId: userRow.user_id,
      email: userRow.email,
      fullName: userRow.full_name,
      roleId: userRow.role_id as RoleId,
      hospitalId: userRow.hospital_id,
      hospitalName: userRow.hospital_name,
      hasActiveEmergency: EmergencyAccessService.hasActiveEmergencyGrant(userRow.user_id)
    };

    const token = AuthService.signPayload({
      ...authUser,
      exp: Date.now() + APP_CONFIG.sessionTimeoutMinutes * 60 * 1000
    });

    return { user: authUser, token };
  }

  /**
   * Fast Demo Login Switcher (for Academic Evaluation & Defense Demonstration)
   */
  public static loginAsRole(roleId: RoleId): { user: AuthenticatedUser; token: string } {
    const userRow = queryOne<any>(`
      SELECT u.*, h.name AS hospital_name
      FROM users u
      LEFT JOIN hospitals h ON u.hospital_id = h.hospital_id
      WHERE u.role_id = ? AND u.is_active = 1
      LIMIT 1
    `, [roleId]);

    if (!userRow) {
      throw new Error(`No active user found with role ${roleId}`);
    }

    const authUser: AuthenticatedUser = {
      userId: userRow.user_id,
      email: userRow.email,
      fullName: userRow.full_name,
      roleId: userRow.role_id as RoleId,
      hospitalId: userRow.hospital_id,
      hospitalName: userRow.hospital_name,
      hasActiveEmergency: EmergencyAccessService.hasActiveEmergencyGrant(userRow.user_id)
    };

    const token = AuthService.signPayload({
      ...authUser,
      exp: Date.now() + APP_CONFIG.sessionTimeoutMinutes * 60 * 1000
    });

    return { user: authUser, token };
  }
}
