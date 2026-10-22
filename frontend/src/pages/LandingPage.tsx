/**
 * LifeLink - Marketing Landing Page
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import React from "react";
import { 
  Activity, 
  ShieldCheck, 
  Lock, 
  Zap, 
  GitMerge, 
  ArrowRight, 
  Cpu, 
  Database, 
  CheckCircle2, 
  Beaker,
  AlertCircle
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-crimson-600 selection:text-white">
      {/* Top Banner: Academic Identity */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 border-b border-slate-800 text-xs py-2 px-4 text-center">
        <span className="text-slate-400">DBMS Project: </span>
        <span className="font-semibold text-slate-200">LifeLink</span>
        <span className="mx-2 text-slate-600">•</span>
        <span className="text-slate-400">Developer: </span>
        <span className="font-semibold text-amber-400">Arsh Vardhan Singh</span>
        <span className="text-slate-400"> (Reg No: </span>
        <span className="font-mono text-amber-400 font-semibold">24BCE2119</span>
        <span className="text-slate-400">)</span>
        <span className="mx-2 text-slate-600">•</span>
        <span className="text-slate-400">School of Computer Science and Engineering, VIT</span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(225,29,72,0.15),rgba(255,255,255,0))]">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-crimson-950/60 border border-crimson-800/60 text-crimson-400 text-xs font-semibold">
            <Activity className="h-4 w-4" />
            <span>PostgreSQL 16 High-Concurrency Allocation Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            A Tamper-Evident, Concurrency-Safe <span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson-400 to-rose-300">Blood & Organ Allocation</span> Platform
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
            Eliminating race conditions in multi-hospital emergency inventory management with SHA-256 hash-chained audit ledgers, Merkle checkpoints, and ACID-isolated transactional locking.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate("dashboard")}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-semibold text-sm transition-all shadow-lg shadow-crimson-900/50 hover:shadow-crimson-900/70"
            >
              <span>Access Live Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate("lab")}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700"
            >
              <Beaker className="h-4 w-4 text-amber-400" />
              <span>Launch DBMS Systems Lab</span>
            </button>
          </div>

          {/* Quick Technical Proof Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 text-left">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <p className="text-xs text-slate-400 font-mono">NOVELTY 1</p>
              <p className="font-semibold text-sm text-slate-200 mt-1">Hash-Chained Audit</p>
              <p className="text-xs text-slate-500 mt-0.5">SHA-256 ledger with Merkle root checkpoints</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <p className="text-xs text-slate-400 font-mono">NOVELTY 2</p>
              <p className="font-semibold text-sm text-slate-200 mt-1">Race-Condition Safe</p>
              <p className="text-xs text-slate-500 mt-0.5">ACID row locking prevents double-allocation</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <p className="text-xs text-slate-400 font-mono">NOVELTY 3</p>
              <p className="font-semibold text-sm text-slate-200 mt-1">Self-Tuning Advisor</p>
              <p className="text-xs text-slate-500 mt-0.5">Telemetry with candidate index evaluation</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <p className="text-xs text-slate-400 font-mono">BONUS FEATURE</p>
              <p className="font-semibold text-sm text-slate-200 mt-1">Break-Glass Access</p>
              <p className="text-xs text-slate-500 mt-0.5">Audited temporary elevated emergency grants</p>
            </div>
          </div>
        </div>
      </section>

      {/* Novelties Deep Dive */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-crimson-400 font-mono">Engineering Novelties</h2>
          <p className="text-3xl font-bold text-white">Three Database Systems Inventions</p>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            Developed by Arsh Vardhan Singh (24BCE2119) to address real-world distributed healthcare resource contention.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card N1 */}
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/60 p-6 flex flex-col justify-between hover:border-slate-600 transition-colors">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center font-bold">
                N1
              </div>
              <h3 className="text-lg font-bold text-slate-100">PostgreSQL Hash-Chained Audit Ledger With Merkle Roots</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every mutation writes to an append-only audit ledger containing predecessor hash links. Merkle checkpoints commit root trees over sequence batches. Stored procedure <span className="font-mono text-emerald-400">verify_ledger_24BCE2119_ArshVardhanSingh()</span> detects forged entries in O(N).
              </p>
            </div>
            <button
              onClick={() => onNavigate("audit")}
              className="mt-6 flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <span>Explore Audit Ledger & Merkle Proofs</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Card N2 */}
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/60 p-6 flex flex-col justify-between hover:border-slate-600 transition-colors">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-crimson-950 border border-crimson-800 text-crimson-400 flex items-center justify-center font-bold">
                N2
              </div>
              <h3 className="text-lg font-bold text-slate-100">Multi-Factor Allocation Engine With Global Lock Hierarchy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scores urgency, biological compatibility, remaining shelf-life, and hospital haversine distance. Executes inside an atomic transaction with deterministic Request → Unit lock ordering, mathematically eliminating deadlocks.
              </p>
            </div>
            <button
              onClick={() => onNavigate("allocation")}
              className="mt-6 flex items-center gap-1.5 text-xs text-crimson-400 hover:text-crimson-300 font-semibold"
            >
              <span>View Allocation Algorithm</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Card N3 */}
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/60 p-6 flex flex-col justify-between hover:border-slate-600 transition-colors">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center font-bold">
                N3
              </div>
              <h3 className="text-lg font-bold text-slate-100">Query Telemetry & Self-Tuning Index Advisor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fingerprints queries with all PII and parameters sanitized. Monitors execution latency, runs EXPLAIN query plan analysis, recommends targeted B-Tree or Hash indexes, and benchmarks estimated vs measured improvements.
              </p>
            </div>
            <button
              onClick={() => onNavigate("telemetry")}
              className="mt-6 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              <span>View Query Telemetry & Advisor</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Academic Disclaimer & Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-semibold text-slate-300">LifeLink DBMS Research Platform (LIFELINK_24BCE2119)</p>
            <p className="font-mono text-[11px] text-slate-400">Student Developer: Arsh Vardhan Singh (Registration No: 24BCE2119)</p>
            <p className="text-[11px]">School of Computer Science and Engineering, Vellore Institute of Technology (VIT)</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 max-w-md text-[11px] leading-relaxed text-slate-400">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Educational Simulation Notice</span>
            </div>
            LifeLink is an educational DBMS prototype designed for Database Systems Lab demonstration. It does not replace certified transplant coordination or professional medical judgment. All patient and donor records are synthetic.
          </div>
        </div>
      </footer>
    </div>
  );
};
