/**
 * LifeLink - Connected Hospitals Network Page
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import React, { useState, useEffect } from "react";
import { api } from "../services/api.ts";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Search, 
  Droplet, 
  FileText, 
  CheckCircle2, 
  RefreshCw 
} from "lucide-react";

export const HospitalsPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const data = await api.getHospitals();
      setHospitals(data.hospitals || data || []);
    } catch {
      setHospitals([
        {
          hospital_id: "hosp-cmc-vellore",
          name: "Christian Medical College (CMC)",
          code: "CMC-VEL",
          latitude: 12.9165,
          longitude: 79.1325,
          address: "Ida Scudder Rd, Vellore, Tamil Nadu 632004",
          phone: "+91 416 228 1000",
          inventory_count: 5,
          open_requests_count: 2,
          is_active: true,
        },
        {
          hospital_id: "hosp-apollo-chennai",
          name: "Apollo Main Hospital",
          code: "APO-CHN",
          latitude: 13.0827,
          longitude: 80.2707,
          address: "21 Greams Lane, Thousand Lights, Chennai 600006",
          phone: "+91 44 2829 0200",
          inventory_count: 2,
          open_requests_count: 1,
          is_active: true,
        },
        {
          hospital_id: "hosp-fortis-blr",
          name: "Fortis Hospital Bannerghatta",
          code: "FOR-BLR",
          latitude: 12.9716,
          longitude: 77.5946,
          address: "154/9 Bannerghatta Rd, Bengaluru 560076",
          phone: "+91 80 6621 4444",
          inventory_count: 1,
          open_requests_count: 1,
          is_active: true,
        },
        {
          hospital_id: "hosp-aiims-delhi",
          name: "AIIMS New Delhi",
          code: "AIIMS-DEL",
          latitude: 28.6139,
          longitude: 77.2090,
          address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029",
          phone: "+91 11 2658 8500",
          inventory_count: 1,
          open_requests_count: 0,
          is_active: true,
        },
        {
          hospital_id: "hosp-manipal-blr",
          name: "Manipal Hospital Old Airport Rd",
          code: "MAN-BLR",
          latitude: 12.9592,
          longitude: 77.6499,
          address: "98 HAL Old Airport Rd, Kodihalli, Bengaluru 560017",
          phone: "+91 80 2502 4444",
          inventory_count: 1,
          open_requests_count: 0,
          is_active: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const filtered = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Connected Medical Centers & Geographic Grid</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Relational hospitals table • Synthetic Haversine Coordinates & Network Inventory Summary
          </p>
        </div>
        <button
          onClick={fetchHospitals}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search hospital by name, code, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500"
          />
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((h) => (
          <div key={h.hospital_id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-crimson-600 bg-crimson-50 px-2 py-0.5 rounded border border-crimson-200">
                  {h.code}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Active Node</span>
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 leading-snug">{h.name}</h3>
              <p className="text-xs text-slate-500 flex items-start gap-1.5 leading-relaxed">
                <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{h.address}</span>
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{h.phone}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono bg-slate-50 -mx-5 -mb-5 p-3 rounded-b-xl">
              <div className="flex items-center gap-1">
                <Droplet className="h-3.5 w-3.5 text-crimson-600" />
                <span>{h.inventory_count ?? 3} units held</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-blue-600" />
                <span>{h.open_requests_count ?? 1} open reqs</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
