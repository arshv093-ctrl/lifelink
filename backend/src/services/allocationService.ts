/**
 * LifeLink - Urgency, Compatibility, Expiry, and Distance-Aware Allocation Service (N2)
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 * 
 * Mandatory Identifiers:
 * - LifeLinkAllocationService_24BCE2119_ArshVardhanSingh
 * - allocate_unit_24BCE2119_ArshVardhanSingh
 */

import crypto from "node:crypto";
import { sqliteDb, query, queryOne, execute, runInTransaction } from "../db/connection.js";
import {
  ARSH_VARDHAN_SINGH_24BCE2119,
  REGNO_24BCE2119,
  STUDENT_NAME_ArshVardhanSingh,
  LIFELINK_24BCE2119,
  BLOOD_COMPATIBILITY_MATRIX,
  ALLOCATION_WEIGHTS
} from "../config/constants.js";
import { LifeLinkAuditService_24BCE2119_ArshVardhanSingh } from "./auditService.js";

export interface CandidateEvaluation {
  unitId: string;
  resourceType: string;
  bloodType: string;
  componentType: string;
  hospitalId: string;
  hospitalName: string;
  distanceKm: number;
  remainingHours: number;
  status: string;
  isEligible: boolean;
  ineligibilityReason?: string;
  scoreBreakdown: {
    urgencyScore: number;
    compatibilityScore: number;
    shelfLifeScore: number;
    distanceScore: number;
    totalPriorityScore: number;
  };
}

export interface AllocationResult {
  allocationId: string;
  requestId: string;
  unitId: string;
  status: string;
  scoreBreakdown: CandidateEvaluation["scoreBreakdown"];
  allocatedAt: string;
  auditSequenceNumber: number;
  message: string;
}

export class LifeLinkAllocationService_24BCE2119_ArshVardhanSingh {
  public static readonly STUDENT_ID = ARSH_VARDHAN_SINGH_24BCE2119;
  public static readonly REGISTRATION_NO = REGNO_24BCE2119;
  public static readonly STUDENT_NAME = STUDENT_NAME_ArshVardhanSingh;
  public static readonly PROJECT_ID = LIFELINK_24BCE2119;

  /**
   * Haversine Distance Calculation (Synthetic Coordinates in km)
   */
  public static calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's mean radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  /**
   * Check Blood Compatibility (Hard Constraint)
   */
  public static isBloodCompatible(donorType: string, recipientType: string): boolean {
    const compatibleDonors = BLOOD_COMPATIBILITY_MATRIX[recipientType] || [];
    return compatibleDonors.includes(donorType);
  }

  /**
   * Score Candidate Inventory Units for a Request
   */
  public static evaluateCandidatesForRequest(requestId: string): CandidateEvaluation[] {
    const req = queryOne<any>(`
      SELECT r.*, h.latitude AS req_lat, h.longitude AS req_lon, h.name AS req_hospital_name
      FROM requests r
      JOIN hospitals h ON r.hospital_id = h.hospital_id
      WHERE r.request_id = ?
    `, [requestId]);

    if (!req) {
      throw new Error(`Request not found: ${requestId}`);
    }

    // Fetch candidate inventory
    const units = query<any>(`
      SELECT iu.*, h.name AS hospital_name, h.latitude AS unit_lat, h.longitude AS unit_lon
      FROM inventory_units iu
      JOIN hospitals h ON iu.hospital_id = h.hospital_id
      WHERE iu.resource_type = ?
    `, [req.resource_type]);

    const now = new Date();
    const results: CandidateEvaluation[] = [];

    for (const unit of units) {
      const expiry = new Date(unit.expiry_time);
      const remainingHours = (expiry.getTime() - now.getTime()) / (1000 * 3600);
      const distanceKm = LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.calculateDistanceKm(
        req.req_lat,
        req.req_lon,
        unit.unit_lat,
        unit.unit_lon
      );

      // Hard Eligibility Checks
      let isEligible = true;
      let ineligibilityReason = "";

      if (unit.status !== "AVAILABLE") {
        isEligible = false;
        ineligibilityReason = `Unit status is ${unit.status} (must be AVAILABLE)`;
      } else if (remainingHours <= 0) {
        isEligible = false;
        ineligibilityReason = "Unit has expired";
      } else if (unit.resource_type === "BLOOD" && !LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.isBloodCompatible(unit.blood_type, req.required_blood_type)) {
        isEligible = false;
        ineligibilityReason = `Blood type ${unit.blood_type} is incompatible with recipient ${req.required_blood_type}`;
      }

      // Priority Scoring Calculation
      // 1. Urgency Score
      let urgencyScore = 25;
      if (req.urgency_level === "CRITICAL") urgencyScore = 100;
      else if (req.urgency_level === "HIGH") urgencyScore = 75;
      else if (req.urgency_level === "MEDIUM") urgencyScore = 50;

      // 2. Compatibility Score (Exact match = 100, Universal/Compatible = 80)
      let compatibilityScore = 0;
      if (isEligible) {
        compatibilityScore = unit.blood_type === req.required_blood_type ? 100 : 80;
      }

      // 3. Shelf Life Score (FIFO / FEFO: units with less remaining time but > 6 hours are prioritized to reduce wastage)
      let shelfLifeScore = 0;
      if (isEligible) {
        if (remainingHours < 48) shelfLifeScore = 95;
        else if (remainingHours < 168) shelfLifeScore = 85;
        else if (remainingHours < 720) shelfLifeScore = 70;
        else shelfLifeScore = 50;
      }

      // 4. Distance Score (Closer = Higher)
      let distanceScore = 0;
      if (isEligible) {
        distanceScore = Math.max(10, Math.round(100 - distanceKm * 0.2));
      }

      const totalPriorityScore = isEligible
        ? Math.round(
            (urgencyScore * ALLOCATION_WEIGHTS.urgencyWeight +
              compatibilityScore * ALLOCATION_WEIGHTS.compatibilityWeight +
              shelfLifeScore * ALLOCATION_WEIGHTS.shelfLifeWeight +
              distanceScore * ALLOCATION_WEIGHTS.distanceWeight) *
              10
          ) / 10
        : 0;

      results.push({
        unitId: unit.unit_id,
        resourceType: unit.resource_type,
        bloodType: unit.blood_type,
        componentType: unit.component_type,
        hospitalId: unit.hospital_id,
        hospitalName: unit.hospital_name,
        distanceKm,
        remainingHours: Math.round(remainingHours * 10) / 10,
        status: unit.status,
        isEligible,
        ineligibilityReason: ineligibilityReason || undefined,
        scoreBreakdown: {
          urgencyScore,
          compatibilityScore,
          shelfLifeScore,
          distanceScore,
          totalPriorityScore
        }
      });
    }

    // Sort: Eligible first, then descending by totalPriorityScore
    return results.sort((a, b) => {
      if (a.isEligible && !b.isEligible) return -1;
      if (!a.isEligible && b.isEligible) return 1;
      return b.scoreBreakdown.totalPriorityScore - a.scoreBreakdown.totalPriorityScore;
    });
  }

  /**
   * Atomic Transactional Allocation Operation
   * Mandatory method requirement: allocate_unit_24BCE2119_ArshVardhanSingh
   */
  public static allocate_unit_24BCE2119_ArshVardhanSingh(params: {
    requestId: string;
    unitId: string;
    allocatedByUserId?: string;
    userId?: string;
    notes?: string;
  }): AllocationResult {
    const actorId = params.allocatedByUserId || params.userId || "usr-admin-01";
    return runInTransaction(() => {
      // 1. Lock and validate Request (Step 1 of Global Lock Hierarchy)
      const request = queryOne<any>(
        "SELECT * FROM requests WHERE request_id = ?",
        [params.requestId]
      );

      if (!request) {
        throw new Error(`Request not found: ${params.requestId}`);
      }

      if (!["OPEN", "PENDING_MATCH"].includes(request.status)) {
        throw new Error(`Request is not eligible for allocation (current status: ${request.status})`);
      }

      // 2. Lock and re-validate Inventory Unit (Step 2 of Global Lock Hierarchy)
      const unit = queryOne<any>(
        "SELECT * FROM inventory_units WHERE unit_id = ?",
        [params.unitId]
      );

      if (!unit) {
        throw new Error(`Inventory unit not found: ${params.unitId}`);
      }

      if (unit.status !== "AVAILABLE") {
        throw new Error(`Concurrency Conflict: Inventory unit ${params.unitId} is no longer available (current status: ${unit.status})`);
      }

      const expiry = new Date(unit.expiry_time);
      if (expiry.getTime() <= Date.now()) {
        throw new Error(`Integrity Violation: Inventory unit ${params.unitId} expired on ${unit.expiry_time}`);
      }

      if (unit.resource_type === "BLOOD" && !LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.isBloodCompatible(unit.blood_type, request.required_blood_type)) {
        throw new Error(`Biological Incompatibility: Donor ${unit.blood_type} is not compatible with Recipient ${request.required_blood_type}`);
      }

      // Check for any active allocation on this unit (Duplicate allocation guard)
      const activeAlloc = queryOne<any>(
        "SELECT * FROM allocations WHERE unit_id = ? AND status IN ('RESERVED', 'IN_TRANSIT', 'COMPLETED')",
        [params.unitId]
      );
      if (activeAlloc) {
        throw new Error(`Duplicate Allocation Prevented: Unit ${params.unitId} is already allocated in ${activeAlloc.allocation_id}`);
      }

      // 3. Compute scoring
      const candidates = LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.evaluateCandidatesForRequest(params.requestId);
      const evalMatch = candidates.find((c) => c.unitId === params.unitId);
      const scores = evalMatch?.scoreBreakdown || {
        urgencyScore: 50,
        compatibilityScore: 100,
        shelfLifeScore: 70,
        distanceScore: 80,
        totalPriorityScore: 75
      };

      // 4. Create Allocation record
      const allocationId = crypto.randomUUID();
      const insertAllocSql = `
        INSERT INTO allocations (
          allocation_id, request_id, unit_id, allocated_by_user_id,
          urgency_score, compatibility_score, shelf_life_score, distance_score,
          total_priority_score, status, allocation_notes, allocated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'RESERVED', ?, datetime('now'))
      `;

      execute(insertAllocSql, [
        allocationId,
        params.requestId,
        params.unitId,
        actorId,
        scores.urgencyScore,
        scores.compatibilityScore,
        scores.shelfLifeScore,
        scores.distanceScore,
        scores.totalPriorityScore,
        params.notes || `Allocated under ACID protocol by user ${actorId}`
      ]);

      // 5. Update inventory unit state to ALLOCATED
      execute("UPDATE inventory_units SET status = 'ALLOCATED', updated_at = datetime('now') WHERE unit_id = ?", [params.unitId]);

      // 6. Update request status to ALLOCATED
      execute("UPDATE requests SET status = 'ALLOCATED', updated_at = datetime('now') WHERE request_id = ?", [params.requestId]);

      // 7. Append audit event
      const auditEvent = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.recordEvent({
        entityType: "allocations",
        entityId: allocationId,
        operationType: "ALLOCATE_UNIT",
        actorId: actorId,
        actorRole: "ALLOCATOR",
        metadata: {
          allocation_id: allocationId,
          request_id: params.requestId,
          unit_id: params.unitId,
          total_score: scores.totalPriorityScore,
          method: "allocate_unit_24BCE2119_ArshVardhanSingh"
        }
      });

      return {
        allocationId,
        requestId: params.requestId,
        unitId: params.unitId,
        status: "RESERVED",
        scoreBreakdown: scores,
        allocatedAt: new Date().toISOString(),
        auditSequenceNumber: auditEvent.sequence_number,
        message: "Inventory unit allocated atomically and committed under ACID isolation."
      };
    }, "ATOMIC_ALLOCATION_OPERATION");
  }

  /**
   * Concurrency Demonstration Lab Helper:
   * Compares Unsafe Check-Then-Act vs Safe Transactional Execution
   */
  public static runConcurrencySimulation(unitId: string, reqA: string, reqB: string, userId: string) {
    // A. Unsafe Simulation (Illustrating Lost Update / Double Allocation)
    // In unsafe mode, both transactions check availability BEFORE locking, thus both think unit is AVAILABLE.
    let unsafeOutcome = {
      attemptA: { success: false, error: "" },
      attemptB: { success: false, error: "" },
      finalAllocationsCount: 0,
      doubleAllocated: false
    };

    // Check availability simultaneously
    const uStateBeforeA = queryOne<any>("SELECT status FROM inventory_units WHERE unit_id = ?", [unitId]);
    const uStateBeforeB = queryOne<any>("SELECT status FROM inventory_units WHERE unit_id = ?", [unitId]);

    if (uStateBeforeA?.status === "AVAILABLE" && uStateBeforeB?.status === "AVAILABLE") {
      // In unsafe non-isolated mode, both proceed to allocate!
      unsafeOutcome.attemptA = { success: true, error: "" };
      unsafeOutcome.attemptB = { success: true, error: "" };
      unsafeOutcome.doubleAllocated = true; // Two hospitals granted the same physical unit!
    }

    // B. Safe Transactional Execution
    let safeOutcome = {
      attemptA: { success: false, error: "" },
      attemptB: { success: false, error: "" },
      winner: "",
      loserError: ""
    };

    try {
      // First attempt executes atomically
      LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.allocate_unit_24BCE2119_ArshVardhanSingh({
        requestId: reqA,
        unitId: unitId,
        allocatedByUserId: userId,
        notes: "Concurrency Test Attempt A"
      });
      safeOutcome.attemptA = { success: true, error: "" };
      safeOutcome.winner = "Request A";
    } catch (err: any) {
      safeOutcome.attemptA = { success: false, error: err.message };
    }

    try {
      // Competing second attempt MUST fail atomically because status is now ALLOCATED
      LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.allocate_unit_24BCE2119_ArshVardhanSingh({
        requestId: reqB,
        unitId: unitId,
        allocatedByUserId: userId,
        notes: "Concurrency Test Attempt B"
      });
      safeOutcome.attemptB = { success: true, error: "" };
    } catch (err: any) {
      safeOutcome.attemptB = { success: false, error: err.message };
      safeOutcome.loserError = err.message;
    }

    return {
      unitId,
      unsafeOutcome,
      safeOutcome
    };
  }
}
