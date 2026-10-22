/**
 * LifeLink - About Project & Academic Attribution Page
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import React from "react";
import { 
  Award, 
  BookOpen, 
  Database, 
  ShieldCheck, 
  Cpu, 
  GitBranch, 
  CheckCircle2, 
  Layers,
  FileCode,
  Lock
} from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Student Identity Hero Header */}
      <div className="bg-gradient-to-br from-navy-900 via-slate-900 to-navy-950 text-white p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-600/30 border border-crimson-500/40 text-crimson-400 text-xs font-semibold">
            <Award className="h-4 w-4" />
            <span>Academic Capstone & DBMS Lab Assessment</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">
            LifeLink: A Tamper-Evident, Concurrency-Safe Blood & Organ Allocation Platform
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Student Developer</span>
              <span className="font-bold text-amber-400 text-sm">Arsh Vardhan Singh</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Registration Number</span>
              <span className="font-mono font-bold text-amber-400 text-sm">24BCE2119</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Institutional Context</span>
              <span className="font-semibold text-slate-200">School of CSE, VIT</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Course Context</span>
              <span className="font-semibold text-slate-200">Database Systems Lab</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Identifiers Display */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileCode className="h-4 w-4 text-crimson-600" />
          <span>Mandatory Codebase Assessment Identifiers</span>
        </h2>
        <p className="text-xs text-slate-500">
          Implemented across backend stored procedures, TypeScript services, and test suites:
        </p>
        <div className="grid sm:grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
            <span className="text-slate-400 block text-[10px]">Stored Allocation Procedure:</span>
            <span className="font-bold text-crimson-600">allocate_unit_24BCE2119_ArshVardhanSingh()</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
            <span className="text-slate-400 block text-[10px]">Stored Ledger Verification:</span>
            <span className="font-bold text-emerald-600">verify_ledger_24BCE2119_ArshVardhanSingh()</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
            <span className="text-slate-400 block text-[10px]">Audit Service Class:</span>
            <span className="font-bold text-purple-600">LifeLinkAuditService_24BCE2119_ArshVardhanSingh</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
            <span className="text-slate-400 block text-[10px]">Allocation Service Class:</span>
            <span className="font-bold text-blue-600">LifeLinkAllocationService_24BCE2119_ArshVardhanSingh</span>
          </div>
        </div>
      </div>

      {/* Database Systems Concepts Demonstrated */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-slate-700" />
          <span>Core Database Engineering Concepts Demonstrated</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900">1. Normalization & Relational Integrity</h3>
            <p className="text-slate-600 leading-relaxed">
              16 normalized tables designed up to BCNF. Medical identities (patients, donors) are strictly separated from user login credentials. Foreign key cascades and checks prevent inconsistent states.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900">2. Concurrency Safety & Lost Update Elimination</h3>
            <p className="text-slate-600 leading-relaxed">
              PostgreSQL row-level locking (<span className="font-mono">FOR UPDATE</span>) with deterministic Request → Inventory resource ordering prevents the double-allocation race condition under heavy hospital contention.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900">3. Cryptographic Hash-Chain & Merkle Proofs</h3>
            <p className="text-slate-600 leading-relaxed">
              Append-only audit ledger where each row seals the previous row's SHA-256 hash. Periodic Merkle tree checkpoints provide O(log N) verification proofs against unauthorized modifications.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900">4. Telemetry & Self-Tuning Index Advisor</h3>
            <p className="text-slate-600 leading-relaxed">
              Non-blocking query telemetry engine sanitizes SQL fingerprints, analyzes execution latency, runs EXPLAIN query plans, and recommends targeted B-Tree indexes with estimated vs measured speedup.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="h-4 w-4 text-slate-600" />
          <span>Implemented Technology Stack</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px]">Frontend</span>
            <span className="font-bold text-slate-800">React 18 / Vite / TS</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px]">Styling</span>
            <span className="font-bold text-slate-800">Tailwind CSS</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px]">Backend</span>
            <span className="font-bold text-slate-800">Node 26 / TypeScript</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px]">Database</span>
            <span className="font-bold text-slate-800">PostgreSQL 16 Dialect</span>
          </div>
        </div>
      </div>
    </div>
  );
};
