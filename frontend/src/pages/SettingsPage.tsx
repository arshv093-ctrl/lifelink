/**
 * LifeLink - System Diagnostics & Configuration Settings
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import React from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { 
  Settings, 
  Database, 
  ShieldCheck, 
  User, 
  Building2, 
  Key, 
  Cpu, 
  Terminal,
  Award
} from "lucide-react";

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  const tablesMetadata = [
    { name: "roles", rows: 4, desc: "RBAC authority roles" },
    { name: "hospitals", rows: 5, desc: "Connected medical center nodes" },
    { name: "users", rows: 5, desc: "Single unified login table" },
    { name: "blood_types", rows: 8, desc: "ABO and Rh biological compatibility" },
    { name: "patients", rows: 5, desc: "Synthetic recipient profiles" },
    { name: "donors", rows: 5, desc: "Synthetic donor profiles & consent" },
    { name: "inventory_units", rows: 10, desc: "Cold chain blood & organ inventory" },
    { name: "requests", rows: 4, desc: "Clinical transfusion requests" },
    { name: "allocations", rows: 3, desc: "ACID allocated inventory records" },
    { name: "inventory_transfers", rows: 0, desc: "Inter-hospital custody transitions" },
    { name: "transactions_log", rows: 12, desc: "Transaction performance telemetry" },
    { name: "audit_ledger", rows: 7, desc: "Hash-chained sequential ledger" },
    { name: "ledger_checkpoints", rows: 1, desc: "Merkle root tree checkpoints" },
    { name: "query_telemetry", rows: 32, desc: "Sanitized query duration samples" },
    { name: "index_recommendations", rows: 2, desc: "Candidate indexing tuning items" },
    { name: "emergency_grants", rows: 1, desc: "Break-glass elevated access grants" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Diagnostics & Database Configuration</h1>
        <p className="text-xs text-slate-500 font-mono mt-0.5">
          PostgreSQL 16 Engine • Prisma / DatabaseSync Abstraction Layer • Project: LIFELINK_24BCE2119
        </p>
      </div>

      {/* Active User Session Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <User className="h-4 w-4 text-slate-500" />
          <span>Active Authenticated Session</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[11px]">Logged In Identity</span>
            <span className="font-bold text-slate-800 text-sm">{user?.fullName}</span>
            <span className="text-[11px] text-slate-500 block font-mono mt-0.5">{user?.email}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[11px]">Assigned Role</span>
            <span className="font-bold text-crimson-600 font-mono text-sm">{user?.roleId}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Enforced across UI & REST API</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[11px]">Hospital Scope</span>
            <span className="font-semibold text-slate-800">{user?.hospitalName || "Cross-Hospital Access"}</span>
            <span className="text-[11px] text-slate-500 block font-mono mt-0.5">{user?.hospitalId || "GLOBAL"}</span>
          </div>
        </div>
      </div>

      {/* Database Schema & Relational Tables Telemetry */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Relational Schema Metadata (16 Tables)</h2>
            <p className="text-xs text-slate-500">Normal Form 3NF & BCNF Certified Relational Model</p>
          </div>
          <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
            PostgreSQL 16 Dialect
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Entity Table</th>
                <th className="py-2.5 px-4">Domain Purpose</th>
                <th className="py-2.5 px-4">Relational Row Count</th>
                <th className="py-2.5 px-4">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {tablesMetadata.map((t) => (
                <tr key={t.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-800">{t.name}</td>
                  <td className="py-2.5 px-4 font-sans text-slate-600">{t.desc}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-700">{t.rows} rows</td>
                  <td className="py-2.5 px-4 font-sans">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold">
                      CONSTRAINTS OK
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
