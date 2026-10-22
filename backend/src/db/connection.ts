/**
 * LifeLink - Database Connection & Abstraction Layer
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { RELATIONAL_SCHEMA_SQL } from "./schema.js";

const DB_DIR = process.env.VERCEL ? "/tmp" : path.resolve(process.cwd(), "data");
if (!fs.existsSync(DB_DIR)) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
  } catch {
    // fallback for environments where mkdir fails
  }
}

const DB_PATH = process.env.NODE_ENV === "test" 
  ? ":memory:" 
  : (process.env.VERCEL ? path.join("/tmp", "lifelink.db") : path.join(DB_DIR, "lifelink.db"));

// Singleton connection
export const sqliteDb = new DatabaseSync(DB_PATH);

// Configure WAL mode and busy timeout for concurrent read safety
try {
  sqliteDb.exec("PRAGMA journal_mode = WAL;");
  sqliteDb.exec("PRAGMA foreign_keys = ON;");
  sqliteDb.exec("PRAGMA busy_timeout = 5000;");
} catch (e) {
  // in-memory mode might skip some pragmas
}

// Initialize tables and views
export function initializeDatabase() {
  sqliteDb.exec(RELATIONAL_SCHEMA_SQL);
}

// Sanitized Query Fingerprinter for Telemetry (N3)
export function sanitizeQueryFingerprint(rawSql: string): string {
  return rawSql
    .replace(/--.*$/gm, "") // remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // remove multi-line comments
    .replace(/'[^']*'/g, "?") // replace string literals
    .replace(/\b\d+\b/g, "?") // replace numeric literals
    .replace(/\s+/g, " ") // normalize whitespace
    .trim();
}

// Categorize SQL query
export function categorizeQuery(sql: string): string {
  const upper = sql.trim().toUpperCase();
  if (upper.startsWith("SELECT")) return "READ";
  if (upper.startsWith("INSERT")) return "INSERT";
  if (upper.startsWith("UPDATE")) return "UPDATE";
  if (upper.startsWith("DELETE")) return "DELETE";
  if (upper.startsWith("CREATE") || upper.startsWith("DROP") || upper.startsWith("ALTER")) return "DDL";
  return "OTHER";
}

// Query helper with telemetry
export function query<T = any>(sql: string, params: any[] = []): T[] {
  const start = performance.now();
  let status = "SUCCESS";
  let rows: T[] = [];
  try {
    const stmt = sqliteDb.prepare(sql);
    rows = stmt.all(...params) as T[];
    return rows;
  } catch (err) {
    status = "ERROR";
    throw err;
  } finally {
    const durationMs = performance.now() - start;
    // Record telemetry asynchronously / non-blocking (skip recording telemetry about telemetry itself)
    if (!sql.includes("query_telemetry")) {
      try {
        const fingerprint = sanitizeQueryFingerprint(sql);
        const category = categorizeQuery(sql);
        const teleSql = `
          INSERT INTO query_telemetry (
            telemetry_id, query_fingerprint, query_category, duration_ms,
            execution_timestamp, execution_status, application_operation, result_count
          ) VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?)
        `;
        const teleStmt = sqliteDb.prepare(teleSql);
        teleStmt.run(
          crypto.randomUUID(),
          fingerprint,
          category,
          durationMs,
          status,
          "SYSTEM_QUERY",
          rows.length
        );
      } catch (teleErr) {
        // Telemetry must never crash application
      }
    }
  }
}

// Query single row
export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const rows = query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Execute statement (INSERT / UPDATE / DELETE)
export function execute(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number | bigint } {
  const start = performance.now();
  let status = "SUCCESS";
  try {
    const stmt = sqliteDb.prepare(sql);
    const result = stmt.run(...params);
    return {
      changes: Number(result.changes),
      lastInsertRowid: result.lastInsertRowid
    };
  } catch (err) {
    status = "ERROR";
    throw err;
  } finally {
    const durationMs = performance.now() - start;
    if (!sql.includes("query_telemetry") && !sql.includes("audit_ledger")) {
      try {
        const fingerprint = sanitizeQueryFingerprint(sql);
        const category = categorizeQuery(sql);
        const teleSql = `
          INSERT INTO query_telemetry (
            telemetry_id, query_fingerprint, query_category, duration_ms,
            execution_timestamp, execution_status, application_operation, result_count
          ) VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?)
        `;
        const teleStmt = sqliteDb.prepare(teleSql);
        teleStmt.run(
          crypto.randomUUID(),
          fingerprint,
          category,
          durationMs,
          status,
          "SYSTEM_EXECUTE",
          1
        );
      } catch (teleErr) {
        // silently ignore telemetry write errors
      }
    }
  }
}

let transactionNestingLevel = 0;

// Transaction execution wrapper with ACID rollback
export function runInTransaction<T>(callback: () => T, txType: string = "APPLICATION_MUTATION"): T {
  if (transactionNestingLevel > 0) {
    return callback();
  }

  transactionNestingLevel++;
  const txId = crypto.randomUUID();
  const startTime = new Date();
  const perfStart = performance.now();
  let status: "COMMITTED" | "ROLLED_BACK" | "FAILED" = "COMMITTED";
  let errorDetails: string | null = null;

  sqliteDb.exec("BEGIN IMMEDIATE TRANSACTION;");
  try {
    const result = callback();
    sqliteDb.exec("COMMIT;");
    return result;
  } catch (err: any) {
    status = "ROLLED_BACK";
    errorDetails = err?.message || String(err);
    try {
      sqliteDb.exec("ROLLBACK;");
    } catch (rbErr) {
      // rollback error
    }
    throw err;
  } finally {
    transactionNestingLevel--;
    const perfEnd = performance.now();
    const completedTime = new Date();
    try {
      const logStmt = sqliteDb.prepare(`
        INSERT INTO transactions_log (
          tx_id, tx_type, isolation_level, status,
          started_at, completed_at, duration_ms, details
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      logStmt.run(
        txId,
        txType,
        "SERIALIZABLE",
        status,
        startTime.toISOString(),
        completedTime.toISOString(),
        perfEnd - perfStart,
        errorDetails
      );
    } catch (logErr) {
      // transaction log non-fatal
    }
  }
}
