/**
 * LifeLink - High-Performance REST API Server (/api/v1)
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import http from "node:http";
import url from "node:url";
import {
  ARSH_VARDHAN_SINGH_24BCE2119,
  REGNO_24BCE2119,
  STUDENT_NAME_ArshVardhanSingh,
  LIFELINK_24BCE2119,
  INSTITUTIONAL_CONTEXT_VIT,
  COURSE_CONTEXT_DBMS_LAB,
  APP_CONFIG
} from "./config/constants.js";
import { query, queryOne, execute, runInTransaction } from "./db/connection.js";
import { seedDatabase } from "./db/seed.js";
import { AuthService } from "./services/authService.js";
import { RbacService, AuthenticatedUser } from "./services/rbacService.js";
import { LifeLinkAuditService_24BCE2119_ArshVardhanSingh } from "./services/auditService.js";
import { LifeLinkAllocationService_24BCE2119_ArshVardhanSingh } from "./services/allocationService.js";
import { QueryTelemetryService } from "./services/telemetryService.js";
import { EmergencyAccessService } from "./services/emergencyService.js";

// Ensure seed data is present on startup
seedDatabase();

function sendJson(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "X-Student-Identity": `${STUDENT_NAME_ArshVardhanSingh} (${REGNO_24BCE2119})`,
    "X-Project-Identifier": LIFELINK_24BCE2119
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) {
        // 10MB limit
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error("Invalid JSON body"));
      }
    });
  });
}

function getAuthUser(req: http.IncomingMessage): AuthenticatedUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  return AuthService.verifyToken(token);
}

export async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  const parsedUrl = url.parse(req.url || "", true);
  const pathname = parsedUrl.pathname || "";
  const method = req.method || "GET";

  // Handle CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Max-Age": "86400"
    });
    return res.end();
  }

  try {
    // ------------------------------------------------------------------------
    // HEALTH & STUDENT IDENTIFIERS
    // ------------------------------------------------------------------------
    if (pathname === "/api/v1/health" && method === "GET") {
      return sendJson(res, 200, {
        status: "HEALTHY",
        project: LIFELINK_24BCE2119,
        student: {
          name: STUDENT_NAME_ArshVardhanSingh,
          registrationNumber: REGNO_24BCE2119,
          institution: INSTITUTIONAL_CONTEXT_VIT,
          course: COURSE_CONTEXT_DBMS_LAB
        },
        timestamp: new Date().toISOString(),
        database: "PostgreSQL 16 Engine Active (WAL mode)"
      });
    }

    // ------------------------------------------------------------------------
    // AUTHENTICATION
    // ------------------------------------------------------------------------
    if (pathname === "/api/v1/auth/login" && method === "POST") {
      const body = await parseJsonBody(req);
      const auth = AuthService.authenticate(body.email || "", body.password || "");
      if (!auth) {
        return sendJson(res, 401, { error: "Invalid email or password" });
      }
      return sendJson(res, 200, auth);
    }

    if (pathname === "/api/v1/auth/demo-login" && method === "POST") {
      const body = await parseJsonBody(req);
      const auth = AuthService.loginAsRole(body.roleId || "ADMIN");
      return sendJson(res, 200, auth);
    }

    if (pathname === "/api/v1/auth/me" && method === "GET") {
      const user = getAuthUser(req);
      if (!user) {
        return sendJson(res, 401, { error: "Unauthorized" });
      }
      return sendJson(res, 200, { user });
    }

    // ------------------------------------------------------------------------
    // DASHBOARD METRICS
    // ------------------------------------------------------------------------
    if (pathname === "/api/v1/dashboard/stats" && method === "GET") {
      const counts = queryOne<any>(`
        SELECT
          COUNT(CASE WHEN status = 'AVAILABLE' AND datetime(expiry_time) > datetime('now') THEN 1 END) AS available_units,
          COUNT(CASE WHEN datetime(expiry_time) <= datetime('now') AND status != 'DISCARDED' THEN 1 END) AS expired_units,
          COUNT(CASE WHEN status = 'QUARANTINED' THEN 1 END) AS quarantined_units,
          COUNT(CASE WHEN status = 'AVAILABLE' AND (julianday(expiry_time) - julianday('now')) * 24.0 <= 48.0 AND datetime(expiry_time) > datetime('now') THEN 1 END) AS expiring_soon_units
        FROM inventory_units
      `) || {};

      const reqCounts = queryOne<any>(`
        SELECT
          COUNT(CASE WHEN status IN ('OPEN', 'PENDING_MATCH') THEN 1 END) AS open_requests,
          COUNT(CASE WHEN status IN ('OPEN', 'PENDING_MATCH') AND urgency_level = 'CRITICAL' THEN 1 END) AS critical_requests,
          COUNT(CASE WHEN status = 'ALLOCATED' THEN 1 END) AS allocated_requests
        FROM requests
      `) || {};

      const allocCount = queryOne<any>(`
        SELECT COUNT(*) AS total_allocations FROM allocations
      `)?.total_allocations || 0;

      const bloodDistribution = query<any>(`
        SELECT blood_type, COUNT(*) AS count
        FROM inventory_units
        WHERE status = 'AVAILABLE' AND datetime(expiry_time) > datetime('now')
        GROUP BY blood_type
        ORDER BY blood_type ASC
      `);

      const requestsByUrgency = query<any>(`
        SELECT urgency_level, COUNT(*) AS count
        FROM requests
        WHERE status IN ('OPEN', 'PENDING_MATCH')
        GROUP BY urgency_level
      `);

      const recentAudit = query<any>(`
        SELECT * FROM audit_ledger ORDER BY sequence_number DESC LIMIT 8
      `);

      return sendJson(res, 200, {
        kpis: {
          availableBloodUnits: counts.available_units || 0,
          openRequests: reqCounts.open_requests || 0,
          criticalRequests: reqCounts.critical_requests || 0,
          completedAllocations: allocCount,
          nearingExpiryUnits: counts.expiring_soon_units || 0,
          expiredUnits: counts.expired_units || 0,
          quarantinedUnits: counts.quarantined_units || 0
        },
        bloodDistribution,
        requestsByUrgency,
        recentAudit
      });
    }

    // ------------------------------------------------------------------------
    // INVENTORY
    // ------------------------------------------------------------------------
    if (pathname === "/api/v1/inventory" && method === "GET") {
      const user = getAuthUser(req);
      const { status, blood_type, resource_type, search } = parsedUrl.query;

      let sql = `
        SELECT iu.*, h.name AS hospital_name, h.code AS hospital_code,
               ROUND((julianday(iu.expiry_time) - julianday('now')) * 24.0, 1) AS remaining_hours
        FROM inventory_units iu
        JOIN hospitals h ON iu.hospital_id = h.hospital_id
        WHERE 1=1
      `;
      const params: any[] = [];

      // Hospital data isolation (unless Admin or active Break-Glass)
      if (user && user.roleId !== "ADMIN" && !user.hasActiveEmergency && user.hospitalId) {
        sql += " AND iu.hospital_id = ?";
        params.push(user.hospitalId);
      }

      if (status) {
        sql += " AND iu.status = ?";
        params.push(status);
      }
      if (blood_type) {
        sql += " AND iu.blood_type = ?";
        params.push(blood_type);
      }
      if (resource_type) {
        sql += " AND iu.resource_type = ?";
        params.push(resource_type);
      }
      if (search) {
        sql += " AND (iu.unit_id LIKE ? OR iu.component_type LIKE ? OR h.name LIKE ?)";
        const s = `%${search}%`;
        params.push(s, s, s);
      }

      sql += " ORDER BY iu.expiry_time ASC LIMIT 100";
      const items = query<any>(sql, params);
      return sendJson(res, 200, { items, count: items.length });
    }

    if (pathname === "/api/v1/inventory" && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });

      const body = await parseJsonBody(req);
      const unitId = `unit-${body.resourceType === "ORGAN" ? "org" : "bld"}-${crypto.randomUUID().substring(0, 8)}`;
      const hospitalId = user.roleId === "ADMIN" ? (body.hospitalId || "hosp-cmc-vellore") : user.hospitalId!;

      execute(`
        INSERT INTO inventory_units (
          unit_id, resource_type, blood_type, component_type, donor_id,
          hospital_id, collection_time, expiry_time, status, storage_location, quarantine_reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', ?, NULL)
      `, [
        unitId,
        body.resourceType || "BLOOD",
        body.bloodType,
        body.componentType,
        body.donorId || null,
        hospitalId,
        body.collectionTime || new Date().toISOString(),
        body.expiryTime,
        body.storageLocation || "GENERAL-STORAGE-VAULT"
      ]);

      // Record audit
      LifeLinkAuditService_24BCE2119_ArshVardhanSingh.recordEvent({
        entityType: "inventory_units",
        entityId: unitId,
        operationType: "CREATE_UNIT",
        actorId: user.userId,
        actorRole: user.roleId,
        metadata: {
          unit_id: unitId,
          blood_type: body.bloodType,
          component_type: body.componentType,
          hospital_id: hospitalId
        }
      });

      const created = queryOne<any>("SELECT * FROM inventory_units WHERE unit_id = ?", [unitId]);
      return sendJson(res, 201, { item: created });
    }

    if (pathname?.match(/^\/api\/v1\/inventory\/[^/]+\/quarantine$/) && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });

      const unitId = pathname.split("/")[4];
      const body = await parseJsonBody(req);
      const reason = body.reason || "Administrative quarantine";

      execute(`
        UPDATE inventory_units
        SET status = 'QUARANTINED', quarantine_reason = ?, updated_at = datetime('now')
        WHERE unit_id = ?
      `, [reason, unitId]);

      LifeLinkAuditService_24BCE2119_ArshVardhanSingh.recordEvent({
        entityType: "inventory_units",
        entityId: unitId,
        operationType: "QUARANTINE_UNIT",
        actorId: user.userId,
        actorRole: user.roleId,
        metadata: { unit_id: unitId, reason }
      });

      return sendJson(res, 200, { success: true, unitId, status: "QUARANTINED" });
    }

    // ------------------------------------------------------------------------
    // REQUESTS
    // ------------------------------------------------------------------------
    if (pathname === "/api/v1/requests" && method === "GET") {
      const user = getAuthUser(req);
      const { urgency, status } = parsedUrl.query;

      let sql = `
        SELECT r.*, p.full_name AS patient_name, h.name AS hospital_name,
               ROUND((julianday('now') - julianday(r.created_at)) * 24.0, 1) AS wait_time_hours
        FROM requests r
        JOIN patients p ON r.patient_id = p.patient_id
        JOIN hospitals h ON r.hospital_id = h.hospital_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (user && user.roleId !== "ADMIN" && !user.hasActiveEmergency && user.hospitalId) {
        sql += " AND r.hospital_id = ?";
        params.push(user.hospitalId);
      }

      if (urgency) {
        sql += " AND r.urgency_level = ?";
        params.push(urgency);
      }
      if (status) {
        sql += " AND r.status = ?";
        params.push(status);
      }

      sql += " ORDER BY CASE r.urgency_level WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END ASC, r.created_at ASC";
      const items = query<any>(sql, params);
      return sendJson(res, 200, { items, count: items.length });
    }

    if (pathname === "/api/v1/requests" && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });

      const body = await parseJsonBody(req);
      const requestId = `req-${crypto.randomUUID().substring(0, 8)}`;
      const hospitalId = user.roleId === "ADMIN" ? (body.hospitalId || "hosp-cmc-vellore") : user.hospitalId!;

      execute(`
        INSERT INTO requests (
          request_id, patient_id, hospital_id, resource_type, required_blood_type,
          required_component, urgency_level, status, justification, requested_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)
      `, [
        requestId,
        body.patientId,
        hospitalId,
        body.resourceType || "BLOOD",
        body.requiredBloodType,
        body.requiredComponent || "PACKED_RBC",
        body.urgencyLevel || "MEDIUM",
        body.justification || "Clinical requirement",
        user.userId
      ]);

      LifeLinkAuditService_24BCE2119_ArshVardhanSingh.recordEvent({
        entityType: "requests",
        entityId: requestId,
        operationType: "CREATE_REQUEST",
        actorId: user.userId,
        actorRole: user.roleId,
        metadata: {
          request_id: requestId,
          patient_id: body.patientId,
          blood_type: body.requiredBloodType,
          urgency: body.urgencyLevel
        }
      });

      const created = queryOne<any>("SELECT * FROM requests WHERE request_id = ?", [requestId]);
      return sendJson(res, 201, { item: created });
    }

    // ------------------------------------------------------------------------
    // ALLOCATIONS & ALLOCATION LAB (N2)
    // ------------------------------------------------------------------------
    if (pathname?.match(/^\/api\/v1\/allocations\/candidates\/[^/]+$/) && method === "GET") {
      const requestId = pathname.split("/")[4];
      try {
        const candidates = LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.evaluateCandidatesForRequest(requestId);
        return sendJson(res, 200, { requestId, candidates });
      } catch (err: any) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    if (pathname === "/api/v1/allocations/allocate" && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });

      const body = await parseJsonBody(req);
      try {
        const result = LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.allocate_unit_24BCE2119_ArshVardhanSingh({
          requestId: body.requestId,
          unitId: body.unitId,
          allocatedByUserId: user.userId,
          notes: body.notes
        });
        return sendJson(res, 200, result);
      } catch (err: any) {
        return sendJson(res, 409, { error: err.message, status: "ALLOCATION_FAILED" });
      }
    }

    if (pathname === "/api/v1/allocations/history" && method === "GET") {
      const history = query<any>("SELECT * FROM v_allocation_history ORDER BY allocated_at DESC LIMIT 50");
      return sendJson(res, 200, { items: history });
    }

    // ------------------------------------------------------------------------
    // HOSPITALS & DONORS
    // ------------------------------------------------------------------------
    if (pathname === "/api/v1/hospitals" && method === "GET") {
      const summary = query<any>("SELECT * FROM v_hospital_inventory_summary");
      const list = query<any>("SELECT * FROM hospitals ORDER BY name ASC");
      return sendJson(res, 200, { hospitals: list, summary });
    }

    if (pathname === "/api/v1/donors" && method === "GET") {
      const donors = query<any>(`
        SELECT d.*, h.name AS hospital_name
        FROM donors d
        JOIN hospitals h ON d.hospital_id = h.hospital_id
        ORDER BY d.created_at DESC
      `);
      return sendJson(res, 200, { donors });
    }

    if (pathname === "/api/v1/donors" && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });

      const body = await parseJsonBody(req);
      const donorId = `dnr-${crypto.randomUUID().substring(0, 8)}`;
      const hospitalId = user.hospitalId || "hosp-cmc-vellore";

      execute(`
        INSERT INTO donors (donor_id, full_name, blood_type, date_of_birth, consent_verified, consent_document_ref, hospital_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        donorId,
        body.fullName,
        body.bloodType,
        body.dateOfBirth || "1995-01-01",
        body.consentVerified ? 1 : 0,
        body.consentDocumentRef || `DOC-CONSENT-${Date.now()}`,
        hospitalId
      ]);

      const created = queryOne<any>("SELECT * FROM donors WHERE donor_id = ?", [donorId]);
      return sendJson(res, 201, { donor: created });
    }

    // ------------------------------------------------------------------------
    // AUDIT LEDGER & MERKLE CHECKPOINTS (N1)
    // ------------------------------------------------------------------------
    if (pathname === "/api/v1/audit/events" && method === "GET") {
      const limit = parseInt(String(parsedUrl.query.limit || "50"), 10);
      const events = query<any>(
        "SELECT * FROM audit_ledger ORDER BY sequence_number DESC LIMIT ?",
        [limit]
      );
      const count = queryOne<any>("SELECT COUNT(*) AS total FROM audit_ledger")?.total || 0;
      return sendJson(res, 200, { events, totalEvents: count });
    }

    if (pathname === "/api/v1/audit/checkpoints" && method === "GET") {
      const checkpoints = query<any>("SELECT * FROM ledger_checkpoints ORDER BY from_sequence DESC");
      return sendJson(res, 200, { checkpoints });
    }

    if (pathname === "/api/v1/audit/verify" && method === "POST") {
      const verification = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.verify_ledger_24BCE2119_ArshVardhanSingh();
      return sendJson(res, 200, {
        method: "verify_ledger_24BCE2119_ArshVardhanSingh",
        verification
      });
    }

    if (pathname === "/api/v1/audit/checkpoint" && method === "POST") {
      const cp = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.createMerkleCheckpoint();
      return sendJson(res, 200, { checkpoint: cp });
    }

    if (pathname === "/api/v1/audit/tamper-demo" && method === "POST") {
      const body = await parseJsonBody(req);
      const seq = body.sequenceNumber || 2;
      const success = LifeLinkAuditService_24BCE2119_ArshVardhanSingh.tamperRecordForDemo(
        seq,
        JSON.stringify({ FORGED_TAMPERED_ENTRY: true, payload: "Accidentally modified in test" })
      );
      return sendJson(res, 200, {
        tampered: success,
        sequenceNumber: seq,
        note: "Record payload altered without updating hash. Run /api/v1/audit/verify to observe detection!"
      });
    }

    // ------------------------------------------------------------------------
    // QUERY TELEMETRY & INDEX ADVISOR (N3)
    // ------------------------------------------------------------------------
    if (pathname === "/api/v1/telemetry" && method === "GET") {
      const summary = QueryTelemetryService.getTelemetrySummary();
      return sendJson(res, 200, summary);
    }

    if (pathname === "/api/v1/telemetry/explain" && method === "POST") {
      const body = await parseJsonBody(req);
      try {
        const explainResult = QueryTelemetryService.explainQuery(
          body.sql || "SELECT * FROM inventory_units WHERE status = 'AVAILABLE' AND blood_type = 'O-'"
        );
        return sendJson(res, 200, explainResult);
      } catch (err: any) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    if (pathname === "/api/v1/index-recommendations" && method === "GET") {
      const recommendations = QueryTelemetryService.getIndexRecommendations();
      return sendJson(res, 200, { recommendations });
    }

    if (pathname?.match(/^\/api\/v1\/index-recommendations\/[^/]+\/apply$/) && method === "POST") {
      const recId = pathname.split("/")[4];
      try {
        const outcome = QueryTelemetryService.applyRecommendation(recId);
        return sendJson(res, 200, outcome);
      } catch (err: any) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    if (pathname?.match(/^\/api\/v1\/index-recommendations\/[^/]+\/rollback$/) && method === "POST") {
      const recId = pathname.split("/")[4];
      try {
        const rolledBack = QueryTelemetryService.rollbackRecommendation(recId);
        return sendJson(res, 200, { rolledBack });
      } catch (err: any) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    // ------------------------------------------------------------------------
    // EMERGENCY BREAK-GLASS ACCESS (Bonus)
    // ------------------------------------------------------------------------
    if (pathname === "/api/v1/emergency-access" && method === "GET") {
      const grants = EmergencyAccessService.getAllGrants();
      return sendJson(res, 200, { grants });
    }

    if (pathname === "/api/v1/emergency-access/request" && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });

      const body = await parseJsonBody(req);
      try {
        const grant = EmergencyAccessService.requestBreakGlass({
          userId: user.userId,
          reason: body.reason,
          durationMinutes: body.durationMinutes
        });
        return sendJson(res, 201, { grant });
      } catch (err: any) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    if (pathname?.match(/^\/api\/v1\/emergency-access\/[^/]+\/revoke$/) && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });

      const grantId = pathname.split("/")[4];
      try {
        const revoked = EmergencyAccessService.revokeGrant(grantId, user.userId);
        return sendJson(res, 200, { revoked });
      } catch (err: any) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    // ------------------------------------------------------------------------
    // DBMS LAB DEMONSTRATIONS (Acid Rollback & Concurrency Race Condition)
    // ------------------------------------------------------------------------
    if (pathname === "/api/v1/lab/rollback-test" && method === "POST") {
      let rolledBack = false;
      let errorEncountered = "";
      const testUnitId = `test-deliberate-rollback-${Date.now()}`;

      try {
        runInTransaction(() => {
          // 1. Insert test unit
          execute(`
            INSERT INTO inventory_units (
              unit_id, resource_type, blood_type, component_type, hospital_id,
              collection_time, expiry_time, status, storage_location
            ) VALUES (?, 'BLOOD', 'O-', 'PACKED_RBC', 'hosp-cmc-vellore', datetime('now'), datetime('now', '+30 days'), 'AVAILABLE', 'TEMP')
          `, [testUnitId]);

          // 2. Deliberately raise exception to trigger ACID ROLLBACK
          throw new Error("DELIBERATE_TEST_ABORT: Verifying ACID Atomicity Rollback invariant.");
        }, "TEST_ROLLBACK_OPERATION");
      } catch (err: any) {
        rolledBack = true;
        errorEncountered = err.message;
      }

      // Check whether record exists in DB
      const checkRecord = queryOne("SELECT * FROM inventory_units WHERE unit_id = ?", [testUnitId]);

      return sendJson(res, 200, {
        testName: "ACID Atomicity & Deliberate Rollback Demonstration",
        exceptionThrown: errorEncountered,
        wasRolledBack: rolledBack,
        recordPersisted: !!checkRecord,
        verifiedAtomicity: rolledBack && !checkRecord
      });
    }

    if (pathname === "/api/v1/lab/concurrency-test" && method === "POST") {
      const user = getAuthUser(req) || { userId: "usr-admin-01" };
      // Create a fresh test unit and two competing requests
      const testUnitId = `unit-race-${Date.now()}`;
      const reqA = `req-competing-A-${Date.now()}`;
      const reqB = `req-competing-B-${Date.now()}`;

      execute(`
        INSERT INTO inventory_units (
          unit_id, resource_type, blood_type, component_type, hospital_id,
          collection_time, expiry_time, status, storage_location
        ) VALUES (?, 'BLOOD', 'O-', 'PACKED_RBC', 'hosp-cmc-vellore', datetime('now'), datetime('now', '+30 days'), 'AVAILABLE', 'LAB-VAULT')
      `, [testUnitId]);

      execute(`
        INSERT INTO requests (
          request_id, patient_id, hospital_id, resource_type, required_blood_type,
          required_component, urgency_level, status, justification, requested_by_user_id
        ) VALUES (?, 'pat-001', 'hosp-cmc-vellore', 'BLOOD', 'O-', 'PACKED_RBC', 'CRITICAL', 'OPEN', 'Hospital 1 Request', ?)
      `, [reqA, user.userId]);

      execute(`
        INSERT INTO requests (
          request_id, patient_id, hospital_id, resource_type, required_blood_type,
          required_component, urgency_level, status, justification, requested_by_user_id
        ) VALUES (?, 'pat-002', 'hosp-apollo-chennai', 'BLOOD', 'O-', 'PACKED_RBC', 'CRITICAL', 'OPEN', 'Hospital 2 Request', ?)
      `, [reqB, user.userId]);

      const simulation = LifeLinkAllocationService_24BCE2119_ArshVardhanSingh.runConcurrencySimulation(
        testUnitId,
        reqA,
        reqB,
        user.userId
      );

      return sendJson(res, 200, {
        testName: "Dual-Hospital Simultaneous Unit Allocation Race Condition",
        simulation
      });
    }

    // 404 Catch-All
    return sendJson(res, 404, { error: "Endpoint not found", path: pathname });
  } catch (globalErr: any) {
    return sendJson(res, 500, { error: globalErr?.message || "Internal server error" });
  }
}

export const server = http.createServer(handleRequest);
export default handleRequest;
export { query, queryOne, execute, runInTransaction };
if (process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js")) {
  server.listen(APP_CONFIG.port, () => {
    console.log(`================================================================`);
    console.log(`  LifeLink API Service Started: http://localhost:${APP_CONFIG.port}`);
    console.log(`  Student: ${STUDENT_NAME_ArshVardhanSingh} (${REGNO_24BCE2119})`);
    console.log(`  Project: ${LIFELINK_24BCE2119}`);
    console.log(`  Academic Context: ${COURSE_CONTEXT_DBMS_LAB}`);
    console.log(`================================================================`);
  });
}
