/**
 * LifeLink - Role-Based Access Control & Hospital Isolation
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import { EmergencyAccessService } from "./emergencyService.js";

export type RoleId = "ADMIN" | "HOSPITAL_STAFF" | "DOCTOR" | "DONOR_COORDINATOR";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  fullName: string;
  roleId: RoleId;
  hospitalId: string | null;
  hospitalName?: string | null;
  hasActiveEmergency?: boolean;
}

export class RbacService {
  /**
   * Check if user's role is permitted for a set of allowed roles
   */
  public static isRoleAuthorized(user: AuthenticatedUser, allowedRoles: RoleId[]): boolean {
    if (user.roleId === "ADMIN") return true; // Admin has full platform access
    return allowedRoles.includes(user.roleId);
  }

  /**
   * Check if user is permitted for a specific high-level action
   */
  public static canUserPerform(user: AuthenticatedUser, action: string): boolean {
    if (user.roleId === "ADMIN") return true;

    switch (action) {
      case "VERIFY_AUDIT_LEDGER":
      case "APPROVE_INDEX_RECOMMENDATIONS":
      case "MANAGE_HOSPITALS":
      case "MANAGE_USERS":
        return user.roleId === "ADMIN";

      case "CREATE_REQUEST":
      case "MANAGE_INVENTORY":
        return user.roleId === "ADMIN" || user.roleId === "HOSPITAL_STAFF";

      case "REQUEST_EMERGENCY_ACCESS":
      case "REVIEW_PATIENT_REQUESTS":
        return user.roleId === "ADMIN" || user.roleId === "DOCTOR";

      case "MANAGE_DONORS":
        return user.roleId === "ADMIN" || user.roleId === "DONOR_COORDINATOR";

      default:
        return false;
    }
  }

  /**
   * Assert hospital access or throw an authorization error
   */
  public static assertHospitalAccess(user: AuthenticatedUser, targetHospitalId: string): boolean {
    if (this.canAccessHospital(user, targetHospitalId)) {
      return true;
    }
    throw new Error(`Cross-hospital access prohibited: User hospital (${user.hospitalId || 'NONE'}) cannot access target hospital (${targetHospitalId}).`);
  }

  /**
   * Check Hospital Data Isolation
   * Returns true if user can access records for the given hospitalId:
   * 1. ADMIN users can access all hospitals.
   * 2. Users with an active Break-Glass Emergency grant can access all hospitals.
   * 3. Hospital-scoped users can only access their assigned hospital.
   */
  public static canAccessHospital(user: AuthenticatedUser, targetHospitalId: string): boolean {
    if (user.roleId === "ADMIN") return true;

    // Check emergency break-glass elevation
    if (EmergencyAccessService.hasActiveEmergencyGrant(user.userId)) {
      return true;
    }

    return user.hospitalId === targetHospitalId;
  }
}
