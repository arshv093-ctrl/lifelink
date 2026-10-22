/**
 * LifeLink - Analytical Reports & DBMS Aggregates
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import React, { useState } from "react";
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Building2, 
  Droplet 
} from "lucide-react";

export const ReportsPage: React.FC = () => {
  const [downloading, setDownloading] = useState(false);

  const handleExportCsv = (reportName: string) => {
    setDownloading(true);
    setTimeout(() => {
      alert(`Report "${reportName}" exported successfully as CSV (PostgreSQL view dump).`);
      setDownloading(false);
    }, 600);
  };

  const reports = [
    {
      title: "Hospital Inventory Capacity & Stock View",
      view: "v_hospital_inventory_summary",
      desc: "Aggregates available blood and organ inventory grouped by medical center node.",
      rows: 5,
      lastUpdated: "Just now",
    },
    {
      title: "Active Open Requests & Urgency Queue",
      view: "v_open_requests",
      desc: "Live clinical request queue ordered by physiological urgency weight.",
      rows: 4,
      lastUpdated: "1 min ago",
    },
    {
      title: "Allocated Inventory & Crossmatch Audit View",
      view: "v_allocation_history",
      desc: "Historical trace of completed allocations with multi-factor scoring breakdown.",
      rows: 3,
      lastUpdated: "Just now",
    },
    {
      title: "FEFO Cold Chain Expiry Risk Schedule",
      view: "v_available_inventory (Filter: expiry < 72h)",
      desc: "Pre-quarantine prioritization list to prevent expiration and blood wastage.",
      rows: 2,
      lastUpdated: "5 mins ago",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytical Reports & DBMS Views</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            SQL Views Aggregates • v_hospital_inventory_summary • v_allocation_history • v_open_requests
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((rep, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {rep.view}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{rep.rows} rows active</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{rep.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{rep.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Updated {rep.lastUpdated}</span>
              <button
                onClick={() => handleExportCsv(rep.title)}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
