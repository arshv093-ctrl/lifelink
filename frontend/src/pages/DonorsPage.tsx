/**
 * LifeLink - Donors & Legal Consent Registry
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import React, { useState, useEffect } from "react";
import { api } from "../services/api.ts";
import { 
  Users, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  ShieldCheck, 
  RefreshCw,
  Plus
} from "lucide-react";

export const DonorsPage: React.FC = () => {
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const data = await api.getDonors();
      setDonors(data.donors || data || []);
    } catch {
      setDonors([
        {
          donor_id: "dnr-001",
          full_name: "Rohan Verma",
          blood_type: "O-",
          date_of_birth: "1994-05-14",
          consent_verified: 1,
          consent_document_ref: "DOC-CONSENT-2026-001",
          hospital_name: "Christian Medical College (CMC)",
        },
        {
          donor_id: "dnr-002",
          full_name: "Pooja Hegde",
          blood_type: "A+",
          date_of_birth: "1998-11-20",
          consent_verified: 1,
          consent_document_ref: "DOC-CONSENT-2026-002",
          hospital_name: "Christian Medical College (CMC)",
        },
        {
          donor_id: "dnr-003",
          full_name: "Karthik Iyer",
          blood_type: "B+",
          date_of_birth: "1991-03-08",
          consent_verified: 1,
          consent_document_ref: "DOC-CONSENT-2026-003",
          hospital_name: "Apollo Main Hospital",
        },
        {
          donor_id: "dnr-004",
          full_name: "Meera Sen",
          blood_type: "AB+",
          date_of_birth: "1989-07-22",
          consent_verified: 1,
          consent_document_ref: "DOC-CONSENT-2026-004",
          hospital_name: "Fortis Hospital Bannerghatta",
        },
        {
          donor_id: "dnr-005",
          full_name: "Suresh Menon",
          blood_type: "O+",
          date_of_birth: "1995-09-12",
          consent_verified: 0,
          consent_document_ref: null,
          hospital_name: "Christian Medical College (CMC)",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const filtered = donors.filter(
    (d) =>
      d.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.donor_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.blood_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Donor Registry & Consent Management</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Relational donors table • Synthetic Profiles • Separate Entity From Login Users
          </p>
        </div>
        <button
          onClick={fetchDonors}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notice */}
      <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600">
        <span className="font-semibold text-slate-800">Domain Modeling Standard:</span> In accordance with healthcare DBMS normalization principles, medical donor identities are strictly isolated from application login accounts (<span className="font-mono text-slate-800">users</span> table).
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search donor by name, ID, or blood group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500"
          />
        </div>
      </div>

      {/* Donors Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Donor ID</th>
                <th className="py-3 px-4">Full Legal Name</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Registered Facility</th>
                <th className="py-3 px-4">Date of Birth</th>
                <th className="py-3 px-4">Consent Status</th>
                <th className="py-3 px-4">Legal Consent Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr key={d.donor_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{d.donor_id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{d.full_name}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded font-bold text-xs bg-crimson-50 text-crimson-700 border border-crimson-200">
                      {d.blood_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{d.hospital_name || "CMC Vellore"}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{d.date_of_birth}</td>
                  <td className="py-3 px-4">
                    {d.consent_verified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>VERIFIED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="h-3 w-3" />
                        <span>PENDING INTAKE</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {d.consent_document_ref || <span className="text-slate-400 italic">None</span>}
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
