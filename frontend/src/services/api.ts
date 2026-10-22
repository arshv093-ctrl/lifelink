/**
 * LifeLink - API Client Service (/api/v1)
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

export const API_BASE = "/api/v1";

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  statusCode: number;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("lifelink_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMessage = `HTTP error ${res.status}`;
    try {
      const errJson = await res.json();
      errMessage = errJson.error || errJson.message || errMessage;
    } catch {
      // fallback
    }
    throw new Error(errMessage);
  }

  return res.json();
}

export const api = {
  // System Health
  getHealth: () => request<any>("/health"),

  // Authentication
  login: (email: string, password: string) =>
    request<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  loginAsRole: (roleId: string) =>
    request<any>("/auth/demo-login", {
      method: "POST",
      body: JSON.stringify({ roleId }),
    }),

  getMe: () => request<any>("/auth/me"),

  // Dashboard
  getDashboardStats: () => request<any>("/dashboard/stats"),

  // Inventory
  getInventory: (params: { blood_type?: string; resource_type?: string; status?: string; hospital_id?: string; page?: number; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.blood_type) qs.append("blood_type", params.blood_type);
    if (params.resource_type) qs.append("resource_type", params.resource_type);
    if (params.status) qs.append("status", params.status);
    if (params.hospital_id) qs.append("hospital_id", params.hospital_id);
    if (params.page) qs.append("page", String(params.page));
    if (params.limit) qs.append("limit", String(params.limit));
    return request<any>(`/inventory?${qs.toString()}`);
  },

  createInventoryUnit: (unitData: any) =>
    request<any>("/inventory", {
      method: "POST",
      body: JSON.stringify(unitData),
    }),

  // Requests
  getRequests: (params: { urgency?: string; status?: string; hospital_id?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.urgency) qs.append("urgency", params.urgency);
    if (params.status) qs.append("status", params.status);
    if (params.hospital_id) qs.append("hospital_id", params.hospital_id);
    return request<any>(`/requests?${qs.toString()}`);
  },

  createRequest: (reqData: any) =>
    request<any>("/requests", {
      method: "POST",
      body: JSON.stringify(reqData),
    }),

  // Allocation Center
  allocateUnit: (requestId: string, unitId: string, notes?: string) =>
    request<any>("/allocations/allocate", {
      method: "POST",
      body: JSON.stringify({ requestId, unitId, notes }),
    }),

  getAllocationHistory: () => request<any>("/allocations/history"),

  // Hospitals & Donors
  getHospitals: () => request<any>("/hospitals"),
  getDonors: () => request<any>("/donors"),
  createDonor: (donorData: any) =>
    request<any>("/donors", {
      method: "POST",
      body: JSON.stringify(donorData),
    }),

  // Audit Ledger (N1)
  getAuditEvents: (page: number = 1, limit: number = 20) =>
    request<any>(`/audit/events?page=${page}&limit=${limit}`),

  getCheckpoints: () => request<any>("/audit/checkpoints"),

  verifyLedger: () =>
    request<any>("/audit/verify", {
      method: "POST",
    }),

  createCheckpoint: () =>
    request<any>("/audit/checkpoint", {
      method: "POST",
    }),

  triggerTamperDemo: () =>
    request<any>("/audit/tamper-demo", {
      method: "POST",
    }),

  // Query Telemetry & Index Advisor (N3)
  getTelemetrySummary: () => request<any>("/telemetry"),

  explainQuery: (sql: string) =>
    request<any>("/telemetry/explain", {
      method: "POST",
      body: JSON.stringify({ sql }),
    }),

  getIndexRecommendations: () => request<any>("/index-recommendations"),

  applyIndexRecommendation: (recId: string) =>
    request<any>(`/index-recommendations/${recId}/apply`, {
      method: "POST",
    }),

  rollbackIndexRecommendation: (recId: string) =>
    request<any>(`/index-recommendations/${recId}/rollback`, {
      method: "POST",
    }),

  // Emergency Access (Break-Glass)
  getEmergencyGrants: () => request<any>("/emergency-access"),

  requestEmergencyAccess: (reason: string, durationMinutes?: number) =>
    request<any>("/emergency-access/request", {
      method: "POST",
      body: JSON.stringify({ reason, durationMinutes }),
    }),

  revokeEmergencyAccess: (grantId: string) =>
    request<any>(`/emergency-access/${grantId}/revoke`, {
      method: "POST",
    }),

  // DBMS Lab Demos
  runRollbackTest: () =>
    request<any>("/lab/rollback-test", {
      method: "POST",
    }),

  runConcurrencyTest: (unitId?: string) =>
    request<any>("/lab/concurrency-test", {
      method: "POST",
      body: JSON.stringify({ unitId }),
    }),
};
