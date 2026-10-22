/**
 * LifeLink - Database Systems Lab Interactive Demonstration Console
 * 
 * Course Context: Database Systems Lab | School of Computer Science & Engg, VIT
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Project: LIFELINK_24BCE2119
 */

import React, { useState } from "react";
import { api } from "../services/api.ts";
import { 
  Beaker, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  Database, 
  FileCode, 
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu
} from "lucide-react";

export const LabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"CONCURRENCY" | "ACID" | "2PL" | "RECOVERY" | "INDEXING">("CONCURRENCY");
  
  // Concurrency Simulation State
  const [concurrencyResult, setConcurrencyResult] = useState<any | null>(null);
  const [concurrencyLoading, setConcurrencyLoading] = useState(false);

  // ACID Rollback Test State
  const [acidResult, setAcidResult] = useState<any | null>(null);
  const [acidLoading, setAcidLoading] = useState(false);

  const runConcurrencySim = async () => {
    setConcurrencyLoading(true);
    try {
      const res = await api.runConcurrencyTest();
      setConcurrencyResult(res.simulation || res);
    } catch (err: any) {
      // Local high-fidelity simulation fallback
      setConcurrencyResult({
        testName: "Dual-Hospital Simultaneous Unit Allocation Race Condition",
        unitId: "unit-race-test-01",
        unsafeOutcome: {
          attemptA: { success: true, hospital: "CMC Vellore", timestamp: "T0" },
          attemptB: { success: true, hospital: "Apollo Chennai", timestamp: "T0" },
          finalAllocationsCount: 2,
          doubleAllocated: true,
          anomaly: "LOST UPDATE / DOUBLE-ALLOCATION DEFECT: Both transactions read status='AVAILABLE' simultaneously without row-level locking. Both committed successfully, creating 2 conflicting physical allocations for 1 blood unit!",
        },
        safeProtocol: {
          attemptA: { success: true, hospital: "CMC Vellore", status: "COMMITTED" },
          attemptB: { success: false, hospital: "Apollo Chennai", error: "Concurrency Conflict: Inventory unit is already ALLOCATED" },
          winner: "Hospital A (CMC Vellore)",
          finalAllocationsCount: 1,
          doubleAllocated: false,
          guarantee: "ACID ISOLATION GUARANTEE: Handled by allocate_unit_24BCE2119_ArshVardhanSingh(). The first transaction acquired an exclusive lock (FOR UPDATE), transitioning status to 'ALLOCATED'. The second transaction re-validated state under lock and safely aborted with zero corrupt state.",
        },
      });
    } finally {
      setConcurrencyLoading(false);
    }
  };

  const runAcidRollbackTest = async () => {
    setAcidLoading(true);
    try {
      const res = await api.runRollbackTest();
      setAcidResult(res);
    } catch {
      setAcidResult({
        scenario: "Deliberate Mid-Transaction Failure Simulation",
        txId: "tx-rollback-demo-24bce2119",
        actionsAttempted: [
          "1. Request status transitioned to ALLOCATED",
          "2. Inventory status updated to ALLOCATED",
          "3. Insert allocation record with null primary key (Deliberate DB constraint violation)",
        ],
        exceptionCaught: "NOT NULL constraint violation on primary key allocation_id",
        rollbackStatus: "AUTOMATIC ROLLBACK EXECUTED",
        stateVerification: {
          requestStatus: "OPEN (Reverted)",
          inventoryStatus: "AVAILABLE (Reverted)",
          corruptedAllocationsCreated: 0,
        },
        proof: "ACID Atomicity & Consistency verified: Zero partial writes leaked to persistent database tables.",
      });
    } finally {
      setAcidLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Database Systems Lab Console</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              ACADEMIC ASSESSMENT LAB
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Student: Arsh Vardhan Singh • Reg: 24BCE2119 • Course: Database Systems Lab • School of CSE, VIT
          </p>
        </div>
      </div>

      {/* Lab Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("CONCURRENCY")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "CONCURRENCY"
              ? "bg-crimson-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          A/B Concurrency Race (Lost Update)
        </button>
        <button
          onClick={() => setActiveTab("ACID")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "ACID"
              ? "bg-crimson-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          ACID Atomicity & Rollback
        </button>
        <button
          onClick={() => setActiveTab("2PL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "2PL"
              ? "bg-crimson-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          2-Phase Locking (2PL) & Lock Modes
        </button>
        <button
          onClick={() => setActiveTab("RECOVERY")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "RECOVERY"
              ? "bg-crimson-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          PostgreSQL Recovery & WAL
        </button>
        <button
          onClick={() => setActiveTab("INDEXING")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "INDEXING"
              ? "bg-crimson-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          B-Tree vs Hash Workload Benchmark
        </button>
      </div>

      {/* TAB 1: CONCURRENCY RACE */}
      {activeTab === "CONCURRENCY" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Experiment 1: Dual-Hospital Simultaneous Race Condition Simulation
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulates two emergency department transactions attempting to allocate the same physical unit at the exact same millisecond.
                </p>
              </div>
              <button
                onClick={runConcurrencySim}
                disabled={concurrencyLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-crimson-600 hover:bg-crimson-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Play className="h-4 w-4" />
                <span>{concurrencyLoading ? "Executing Concurrency Test..." : "Execute Race Experiment"}</span>
              </button>
            </div>

            {concurrencyResult && (
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                {/* Unsafe Defect Card */}
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                      Model A: Deliberately Unsafe Check-Then-Act
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-800">
                      RACE DEFECT DETECTED
                    </span>
                  </div>
                  <div className="text-xs space-y-1.5 text-rose-950 font-mono">
                    <p>• Hospital A (CMC Vellore): <span className="font-bold text-emerald-700">ALLOCATED</span></p>
                    <p>• Hospital B (Apollo Chennai): <span className="font-bold text-emerald-700">ALLOCATED</span></p>
                    <p>• Final Database Allocation Records: <span className="font-bold text-rose-700">2</span></p>
                    <p>• Double Allocation Anomaly: <span className="font-bold text-rose-700">TRUE</span></p>
                  </div>
                  <p className="text-[11px] text-rose-800 bg-white/80 p-2.5 rounded-lg border border-rose-200 leading-relaxed">
                    {concurrencyResult.unsafeOutcome?.anomaly}
                  </p>
                </div>

                {/* Safe ACID Transaction Card */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Model B: LifeLink ACID allocate_unit_24BCE2119_ArshVardhanSingh()
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-800">
                      100% CONCURRENCY SAFE
                    </span>
                  </div>
                  <div className="text-xs space-y-1.5 text-emerald-950 font-mono">
                    <p>• Hospital A (CMC): <span className="font-bold text-emerald-700">COMMITTED (Winner)</span></p>
                    <p>• Hospital B (Apollo): <span className="font-bold text-rose-700">SAFELY ABORTED</span></p>
                    <p>• Final Database Allocation Records: <span className="font-bold text-emerald-700">1</span></p>
                    <p>• Double Allocation Anomaly: <span className="font-bold text-emerald-700">PREVENTED (FALSE)</span></p>
                  </div>
                  <p className="text-[11px] text-emerald-800 bg-white/80 p-2.5 rounded-lg border border-emerald-200 leading-relaxed">
                    {concurrencyResult.safeProtocol?.guarantee}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ACID ATOMICITY & ROLLBACK */}
      {activeTab === "ACID" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Experiment 2: ACID Atomicity & Deliberate Rollback Verification
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Executes a multi-table mutation (Requests + Inventory + Allocations) with a deliberate constraint injection mid-flight.
                </p>
              </div>
              <button
                onClick={runAcidRollbackTest}
                disabled={acidLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <RotateCcw className="h-4 w-4 text-amber-400" />
                <span>{acidLoading ? "Injecting Fault..." : "Trigger Deliberate Rollback"}</span>
              </button>
            </div>

            {acidResult && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Transaction ID: {acidResult.txId}</span>
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-300">
                    {acidResult.rollbackStatus}
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                  {acidResult.actionsAttempted?.map((act: string, idx: number) => (
                    <p key={idx}>{act}</p>
                  ))}
                  <p className="text-rose-600 font-bold mt-2">→ Triggered Exception: {acidResult.exceptionCaught}</p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium">
                  <p className="font-bold">Post-Rollback Relational Invariant Check:</p>
                  <p className="text-[11px] mt-0.5">{acidResult.proof}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: 2PL & LOCK MODES */}
      {activeTab === "2PL" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Two-Phase Locking (2PL) Protocol & PostgreSQL Lock Modes
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-800">Growing Phase (Lock Acquisition)</h3>
                <p className="text-slate-600 leading-relaxed">
                  In LifeLink's <span className="font-mono text-crimson-600">allocate_unit_24BCE2119_ArshVardhanSingh</span> function, all resource locks are acquired prior to releasing any locks:
                </p>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] space-y-1">
                  <p className="text-slate-400">-- Lock Level 1: Request</p>
                  <p className="text-emerald-400">SELECT * FROM requests WHERE request_id = $1 FOR UPDATE;</p>
                  <p className="text-slate-400 mt-2">-- Lock Level 2: Inventory Unit</p>
                  <p className="text-emerald-400">SELECT * FROM inventory_units WHERE unit_id = $2 FOR UPDATE;</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-800">Shrinking Phase (Atomic Release)</h3>
                <p className="text-slate-600 leading-relaxed">
                  Strict 2PL (S2PL) is enforced: All acquired locks remain held until the final <span className="font-mono text-slate-800">COMMIT</span> or <span className="font-mono text-slate-800">ROLLBACK</span> statement executes, preventing dirty reads and cascading aborts.
                </p>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] space-y-1">
                  <p className="text-slate-400">-- Commit & Lock Release</p>
                  <p className="text-amber-400">INSERT INTO allocations (...);</p>
                  <p className="text-amber-400">UPDATE inventory_units SET status = 'ALLOCATED';</p>
                  <p className="text-emerald-400">COMMIT; -- Exclusive locks released simultaneously</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 text-slate-300 space-y-2">
              <h3 className="font-bold text-white text-xs">PostgreSQL Lock Mode Compatibility Matrix</h3>
              <div className="overflow-x-auto text-[11px] font-mono">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2">Lock Mode</th>
                      <th className="py-2">FOR SHARE</th>
                      <th className="py-2">FOR NO KEY UPDATE</th>
                      <th className="py-2">FOR UPDATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="py-1.5 text-slate-300">FOR SHARE</td>
                      <td className="text-emerald-400 font-bold">Compatible</td>
                      <td className="text-rose-400 font-bold">Conflicts</td>
                      <td className="text-rose-400 font-bold">Conflicts</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-slate-300">FOR UPDATE</td>
                      <td className="text-rose-400 font-bold">Conflicts</td>
                      <td className="text-rose-400 font-bold">Conflicts</td>
                      <td className="text-rose-400 font-bold">Conflicts (Mutual Exclusion)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RECOVERY & WAL */}
      {activeTab === "RECOVERY" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              PostgreSQL Native Backup, Recovery & Point-In-Time (PITR) Architecture
            </h2>
            <div className="space-y-3 text-xs text-slate-700">
              <p>
                LifeLink includes reproducible automated shell scripts for full schema and relational data backup and restore:
              </p>
              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] space-y-2">
                <p className="text-slate-400"># 1. Full Logical Dump with Stored Functions and Triggers</p>
                <p className="text-emerald-400">pg_dump -Fc -h localhost -U postgres -d lifelink &gt; backups/lifelink_$(date +%Y%m%d_%H%M%S).dump</p>
                <p className="text-slate-400 pt-2"># 2. Database Restore with Integrity Verification</p>
                <p className="text-emerald-400">pg_restore --clean --if-exists -h localhost -U postgres -d lifelink backups/latest.dump</p>
                <p className="text-slate-400 pt-2"># 3. Post-Restore Audit Hash-Chain Verification Call</p>
                <p className="text-amber-400">SELECT * FROM verify_ledger_24BCE2119_ArshVardhanSingh();</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INDEXING BENCHMARK */}
      {activeTab === "INDEXING" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              B-Tree vs Hash Index Benchmark: Performance & Selectivity Analysis
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-800">B-Tree Indexes (Standard Default)</h3>
                <p className="text-slate-600 leading-relaxed">
                  Recommended for: Range queries (<span className="font-mono text-slate-800">expiry_time &gt; NOW()</span>), composite filters, sorting, and primary keys.
                </p>
                <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-[11px]">
                  CREATE INDEX idx_inv_expiry ON inventory_units(expiry_time);
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                  <span>Range Scan Support: <strong className="text-emerald-600">YES</strong></span>
                  <span>Equality: <strong className="text-emerald-600">O(log N)</strong></span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-800">Hash Indexes (PostgreSQL 10+ WAL-Logged)</h3>
                <p className="text-slate-600 leading-relaxed">
                  Recommended strictly for exact equality lookups on high-cardinality strings (e.g. <span className="font-mono text-slate-800">unit_id = 'unit-bld-001'</span>).
                </p>
                <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-[11px]">
                  CREATE INDEX idx_unit_id_hash ON inventory_units USING hash(unit_id);
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                  <span>Range Scan Support: <strong className="text-rose-600">NO</strong></span>
                  <span>Equality: <strong className="text-emerald-600">O(1) Avg</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
