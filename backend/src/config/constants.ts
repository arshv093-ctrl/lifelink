/**
 * LifeLink - Tamper-Evident, Concurrency-Safe Blood & Organ Allocation Platform
 * Academic Assessment Context:
 * Student Name: Arsh Vardhan Singh
 * Registration Number: 24BCE2119
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

export const ARSH_VARDHAN_SINGH_24BCE2119 = "ARSH_VARDHAN_SINGH_24BCE2119" as const;
export const REGNO_24BCE2119 = "24BCE2119" as const;
export const STUDENT_ARSH_VARDHAN_SINGH = "Arsh Vardhan Singh" as const;
export const LIFELINK_24BCE2119 = "LIFELINK_24BCE2119" as const;

export const STUDENT_REGISTRATION_24BCE2119: string = "24BCE2119";
export const STUDENT_NAME_ArshVardhanSingh: string = "Arsh Vardhan Singh";
export const INSTITUTIONAL_CONTEXT_VIT: string = "Vellore Institute of Technology, School of Computer Science and Engineering";
export const COURSE_CONTEXT_DBMS_LAB: string = "Database Systems Lab (DBMS Assessment)";

export const APP_CONFIG = {
  appName: "LifeLink",
  projectIdentifier: LIFELINK_24BCE2119,
  version: "1.0.0-production",
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  frontendPort: 3000,
  jwtSecret: process.env.JWT_SECRET || "lifelink-secret-key-24bce2119-arshvardhansingh",
  sessionTimeoutMinutes: 120,
  emergencyAccessMaxMinutes: 30, // 30 minutes max duration for break-glass emergency access
  telemetryThresholdMs: 15, // queries exceeding 15ms flagged for optimization review
} as const;

export const BLOOD_COMPATIBILITY_MATRIX: Record<string, string[]> = {
  // Key = Recipient Blood Type, Value = List of compatible Donor Blood Types (Packed RBCs / Whole Blood)
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // Universal Recipient
};

export const ORGAN_ISCHEMIA_LIMITS_HOURS: Record<string, number> = {
  Heart: 6,
  Lung: 8,
  Liver: 12,
  Pancreas: 12,
  Kidney: 30,
};

export const ALLOCATION_WEIGHTS = {
  urgencyWeight: 0.40,
  compatibilityWeight: 0.25,
  shelfLifeWeight: 0.20,
  distanceWeight: 0.15,
} as const;
