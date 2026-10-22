/**
 * LifeLink - Collapsible Sidebar Navigation
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import React from "react";
import { 
  LayoutDashboard, 
  Droplet, 
  FileText, 
  GitPullRequest, 
  ShieldCheck, 
  Gauge, 
  AlertTriangle, 
  Building2, 
  Users, 
  BarChart3, 
  Settings, 
  Info, 
  Beaker,
  Home
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const navSections = [
    {
      title: "OVERVIEW",
      items: [
        { id: "landing", label: "Public Portal", icon: Home },
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "OPERATIONS",
      items: [
        { id: "inventory", label: "Inventory Bank", icon: Droplet },
        { id: "requests", label: "Clinical Requests", icon: FileText },
        { id: "allocation", label: "Allocation Center", icon: GitPullRequest },
      ],
    },
    {
      title: "DBMS NOVELTIES & LAB",
      items: [
        { id: "lab", label: "DBMS Systems Lab", icon: Beaker, badge: "N2 Test" },
        { id: "audit", label: "Audit Ledger", icon: ShieldCheck, badge: "N1 Merkle" },
        { id: "telemetry", label: "Query Telemetry", icon: Gauge, badge: "N3 Tuning" },
        { id: "emergency", label: "Emergency Access", icon: AlertTriangle, badge: "Break-Glass" },
      ],
    },
    {
      title: "NETWORK & ENTITIES",
      items: [
        { id: "hospitals", label: "Hospitals Network", icon: Building2 },
        { id: "donors", label: "Donors & Consent", icon: Users },
        { id: "reports", label: "Analytical Reports", icon: BarChart3 },
      ],
    },
    {
      title: "METADATA & SYSTEM",
      items: [
        { id: "settings", label: "System Diagnostic", icon: Settings },
        { id: "about", label: "About LifeLink", icon: Info, badge: "24BCE2119" },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between border-r border-slate-800 min-h-[calc(100vh-57px)]">
      <div className="p-3 space-y-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-crimson-600/90 text-white shadow-sm shadow-crimson-900/40"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Student Identity Bottom Card */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 m-2 rounded-xl">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
            AV
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">Arsh Vardhan Singh</p>
            <p className="text-[10px] text-slate-400 font-mono">Reg: 24BCE2119</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 font-mono leading-tight">
          Database Systems Lab • School of Computer Science & Engg, VIT
        </p>
      </div>
    </aside>
  );
};
