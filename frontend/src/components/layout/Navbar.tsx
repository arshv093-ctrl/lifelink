/**
 * LifeLink - Navigation Bar with Hospital Scope & Quick Role Switcher
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import React, { useState } from "react";
import { useAuth, RoleId } from "../../context/AuthContext.tsx";
import { 
  ShieldAlert, 
  UserCheck, 
  Building2, 
  Activity, 
  ChevronDown, 
  Flame, 
  ExternalLink,
  Award
} from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, loginAsRole, isLoading } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { id: RoleId; label: string; desc: string }[] = [
    { id: "ADMIN", label: "Admin", desc: "Full Governance & Audit" },
    { id: "HOSPITAL_STAFF", label: "Hospital Staff", desc: "CMC Vellore Inventory" },
    { id: "DOCTOR", label: "Doctor / Clinician", desc: "Trauma Requests & Emergency" },
    { id: "DONOR_COORDINATOR", label: "Donor Coordinator", desc: "Intake & Consent" },
  ];

  const getRoleBadgeColor = (roleId?: string) => {
    switch (roleId) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DOCTOR":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "HOSPITAL_STAFF":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "DONOR_COORDINATOR":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-4 lg:px-8 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Branding & Course Lab Badge */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-crimson-600 to-crimson-700 flex items-center justify-center text-white shadow-sm shadow-crimson-200 group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-crimson-600 transition-colors">LifeLink</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">DBMS LAB</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono hidden sm:block">Reg: 24BCE2119 • Arsh Vardhan Singh</p>
            </div>
          </button>
        </div>

        {/* Center: System Status & Scope Badge */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium">ACID Engine Active</span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-[11px] text-slate-500">LIFELINK_24BCE2119</span>
          </div>

          {user?.hasActiveEmergency && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold animate-pulse">
              <Flame className="h-3.5 w-3.5 text-rose-600" />
              <span>Break-Glass Elevated</span>
            </div>
          )}
        </div>

        {/* Right: Hospital Scope & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Hospital Scope Tag */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-medium truncate max-w-[150px]">{user?.hospitalName || "Cross-Hospital Scope"}</span>
          </div>

          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${getRoleBadgeColor(user?.roleId)} hover:shadow-sm`}
              disabled={isLoading}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <div className="text-left">
                <span className="block font-semibold">{user?.fullName.split(" ")[0]} ({user?.roleId})</span>
              </div>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Simulate RBAC User Persona</p>
                  <p className="text-xs text-slate-600 mt-0.5">Switch role to test backend authorization enforcement</p>
                </div>
                <div className="p-1 space-y-0.5">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        loginAsRole(r.id);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        user?.roleId === r.id ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-slate-800">{r.label}</p>
                        <p className="text-[11px] text-slate-400">{r.desc}</p>
                      </div>
                      {user?.roleId === r.id && (
                        <span className="h-1.5 w-1.5 rounded-full bg-crimson-600"></span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="px-3 pt-2 pb-1 border-t border-slate-100 mt-1">
                  <button 
                    onClick={() => {
                      setShowRoleMenu(false);
                      onNavigate("emergency");
                    }}
                    className="w-full text-left text-[11px] text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1.5 py-1"
                  >
                    <Flame className="h-3 w-3" />
                    <span>Request Break-Glass Elevation</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Lab Shortcut */}
          <button
            onClick={() => onNavigate("lab")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Award className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">DBMS Lab</span>
          </button>
        </div>
      </div>
    </header>
  );
};
