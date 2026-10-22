/**
 * LifeLink - Inventory Management Page
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import React, { useState, useEffect } from "react";
import { api } from "../services/api.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { 
  Droplet, 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  X, 
  Building2,
  RefreshCw,
  Archive
} from "lucide-react";

export const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBlood, setFilterBlood] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterResource, setFilterResource] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any | null>(null);

  // New Unit Form State
  const [newUnit, setNewUnit] = useState({
    resourceType: "BLOOD",
    bloodType: "O-",
    componentType: "PACKED_RBC",
    donorId: "dnr-001",
    hospitalId: "hosp-cmc-vellore",
    storageLocation: "CMC-CRYO-VAULT-B2",
    expiryDays: 35,
  });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await api.getInventory({
        blood_type: filterBlood || undefined,
        status: filterStatus || undefined,
        resource_type: filterResource || undefined,
      });
      setUnits(data.units || data || []);
    } catch (err) {
      console.warn("Failed fetching inventory, using seed mock fallback:", err);
      setUnits([
        {
          unit_id: "unit-bld-001",
          resource_type: "BLOOD",
          blood_type: "O-",
          component_type: "PACKED_RBC",
          donor_name: "Rohan Verma",
          hospital_name: "Christian Medical College (CMC)",
          status: "AVAILABLE",
          storage_location: "CMC-CRYO-VAULT-A1",
          expiry_time: new Date(Date.now() + 30 * 86400000).toISOString(),
          collection_time: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
          unit_id: "unit-bld-002",
          resource_type: "BLOOD",
          blood_type: "O-",
          component_type: "WHOLE_BLOOD",
          donor_name: "Rohan Verma",
          hospital_name: "Apollo Main Hospital",
          status: "AVAILABLE",
          storage_location: "APO-BANK-SHELF-04",
          expiry_time: new Date(Date.now() + 25 * 86400000).toISOString(),
          collection_time: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
        {
          unit_id: "unit-bld-003",
          resource_type: "BLOOD",
          blood_type: "A+",
          component_type: "PACKED_RBC",
          donor_name: "Pooja Hegde",
          hospital_name: "Christian Medical College (CMC)",
          status: "AVAILABLE",
          storage_location: "CMC-CRYO-VAULT-A2",
          expiry_time: new Date(Date.now() + 25 * 86400000).toISOString(),
          collection_time: new Date(Date.now() - 10 * 86400000).toISOString(),
        },
        {
          unit_id: "unit-bld-004",
          resource_type: "BLOOD",
          blood_type: "A+",
          component_type: "PLATELETS",
          donor_name: "Pooja Hegde",
          hospital_name: "Christian Medical College (CMC)",
          status: "AVAILABLE",
          storage_location: "CMC-AGITATOR-01",
          expiry_time: new Date(Date.now() + 2 * 86400000).toISOString(),
          collection_time: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
        {
          unit_id: "unit-bld-007",
          resource_type: "BLOOD",
          blood_type: "O-",
          component_type: "PACKED_RBC",
          donor_name: "Rohan Verma",
          hospital_name: "Christian Medical College (CMC)",
          status: "EXPIRED",
          storage_location: "CMC-DISPOSAL-BIN-01",
          expiry_time: new Date(Date.now() - 2 * 86400000).toISOString(),
          collection_time: new Date(Date.now() - 40 * 86400000).toISOString(),
        },
        {
          unit_id: "unit-bld-008",
          resource_type: "BLOOD",
          blood_type: "A+",
          component_type: "WHOLE_BLOOD",
          donor_name: "Pooja Hegde",
          hospital_name: "Christian Medical College (CMC)",
          status: "QUARANTINED",
          quarantine_reason: "Serological screening flagged reactive antibody; awaiting confirmatory PCR.",
          storage_location: "CMC-QUARANTINE-VAULT-Q1",
          expiry_time: new Date(Date.now() + 15 * 86400000).toISOString(),
          collection_time: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filterBlood, filterStatus, filterResource]);

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const now = new Date();
      const expiry = new Date(now.getTime() + newUnit.expiryDays * 86400000);
      await api.createInventoryUnit({
        resource_type: newUnit.resourceType,
        blood_type: newUnit.bloodType,
        component_type: newUnit.componentType,
        donor_id: newUnit.donorId,
        hospital_id: newUnit.hospitalId,
        collection_time: now.toISOString(),
        expiry_time: expiry.toISOString(),
        storage_location: newUnit.storageLocation,
      });
      setShowAddModal(false);
      fetchInventory();
    } catch (err: any) {
      alert("Error creating inventory unit: " + err.message);
    }
  };

  const filteredUnits = units.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      u.unit_id?.toLowerCase().includes(q) ||
      u.blood_type?.toLowerCase().includes(q) ||
      u.component_type?.toLowerCase().includes(q) ||
      u.hospital_name?.toLowerCase().includes(q);
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">AVAILABLE</span>;
      case "ALLOCATED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">ALLOCATED</span>;
      case "EXPIRED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-300">EXPIRED</span>;
      case "QUARANTINED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">QUARANTINED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Bank & Cold Chain</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Relational inventory_units table • Expiry & Quarantine Validation Enforced
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchInventory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-crimson-600 hover:bg-crimson-500 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Intake Unit</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search unit ID, component, hospital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Blood Type Filter */}
          <select
            value={filterBlood}
            onChange={(e) => setFilterBlood(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Blood Types</option>
            {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"].map((bt) => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="ALLOCATED">ALLOCATED</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="QUARANTINED">QUARANTINED</option>
          </select>

          {/* Resource Type */}
          <select
            value={filterResource}
            onChange={(e) => setFilterResource(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Resources</option>
            <option value="BLOOD">BLOOD</option>
            <option value="ORGAN">ORGAN</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Unit Identifier</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Component / Organ</th>
                <th className="py-3 px-4">Holding Hospital</th>
                <th className="py-3 px-4">Storage Location</th>
                <th className="py-3 px-4">Remaining Shelf Life</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No inventory records match the current filters.
                  </td>
                </tr>
              ) : (
                filteredUnits.map((u) => {
                  const expiryDate = new Date(u.expiry_time);
                  const hoursRemaining = Math.round((expiryDate.getTime() - Date.now()) / 3600000);
                  const isExpiringSoon = hoursRemaining > 0 && hoursRemaining < 48;
                  const isExpired = hoursRemaining <= 0;

                  return (
                    <tr key={u.unit_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{u.unit_id}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded font-bold text-xs bg-crimson-50 text-crimson-700 border border-crimson-200">
                          {u.blood_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{u.component_type || u.resource_type}</td>
                      <td className="py-3 px-4 text-slate-600">{u.hospital_name || u.hospital_id}</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{u.storage_location}</td>
                      <td className="py-3 px-4">
                        {isExpired ? (
                          <span className="text-slate-500 font-semibold flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Expired</span>
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="text-amber-600 font-semibold flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{hoursRemaining}h (FEFO Priority)</span>
                          </span>
                        ) : (
                          <span className="text-slate-600">
                            {Math.round(hoursRemaining / 24)} days ({hoursRemaining}h)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(u.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedUnit(u)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unit Detail Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-crimson-600" />
                <h3 className="font-bold text-base text-slate-900">Inventory Unit Details</h3>
              </div>
              <button onClick={() => setSelectedUnit(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Unit ID</span>
                <span className="font-mono font-semibold text-slate-800">{selectedUnit.unit_id}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Blood Group</span>
                <span className="font-bold text-crimson-600">{selectedUnit.blood_type} ({selectedUnit.component_type})</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Status</span>
                <span>{getStatusBadge(selectedUnit.status)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Storage Vault</span>
                <span className="font-mono text-slate-700">{selectedUnit.storage_location}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg col-span-2">
                <span className="text-slate-400 block">Hospital Custody</span>
                <span className="font-medium text-slate-800">{selectedUnit.hospital_name || selectedUnit.hospital_id}</span>
              </div>
              {selectedUnit.quarantine_reason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg col-span-2 text-rose-800">
                  <span className="font-semibold block">Quarantine Advisory:</span>
                  <span>{selectedUnit.quarantine_reason}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedUnit(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateUnit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Intake Inventory Unit</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Resource Category</label>
                <select
                  value={newUnit.resourceType}
                  onChange={(e) => setNewUnit({ ...newUnit, resourceType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="BLOOD">BLOOD</option>
                  <option value="ORGAN">ORGAN (Simulation)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={newUnit.bloodType}
                    onChange={(e) => setNewUnit({ ...newUnit, bloodType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold"
                  >
                    {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"].map((bt) => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Component</label>
                  <select
                    value={newUnit.componentType}
                    onChange={(e) => setNewUnit({ ...newUnit, componentType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="PACKED_RBC">PACKED_RBC</option>
                    <option value="WHOLE_BLOOD">WHOLE_BLOOD</option>
                    <option value="PLATELETS">PLATELETS</option>
                    <option value="FRESH_FROZEN_PLASMA">FFP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Storage Location Vault</label>
                <input
                  type="text"
                  value={newUnit.storageLocation}
                  onChange={(e) => setNewUnit({ ...newUnit, storageLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Shelf Life (Days from intake)</label>
                <input
                  type="number"
                  value={newUnit.expiryDays}
                  onChange={(e) => setNewUnit({ ...newUnit, expiryDays: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  min="1"
                  max="365"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-crimson-600 hover:bg-crimson-500 text-xs font-semibold text-white shadow-sm"
              >
                Commit Unit to Database
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
