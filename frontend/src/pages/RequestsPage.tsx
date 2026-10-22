/**
 * LifeLink - Clinical Requests Management Page
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import React, { useState, useEffect } from "react";
import { api } from "../services/api.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { 
  FileText, 
  Search, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  RefreshCw,
  ArrowRight,
  X
} from "lucide-react";

interface RequestsPageProps {
  onNavigate: (page: string) => void;
}

export const RequestsPage: React.FC<RequestsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Request Form State
  const [newReq, setNewReq] = useState({
    patientId: "pat-001",
    hospitalId: "hosp-cmc-vellore",
    resourceType: "BLOOD",
    requiredBloodType: "A+",
    requiredComponent: "PACKED_RBC",
    urgencyLevel: "CRITICAL",
    justification: "Acute hemorrhagic shock following multi-trauma collision. Rapid transfusion protocol requested.",
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getRequests({
        urgency: filterUrgency || undefined,
        status: filterStatus || undefined,
      });
      setRequests(data.requests || data || []);
    } catch (err) {
      console.warn("Failed fetching requests, using seed mock fallback:", err);
      setRequests([
        {
          request_id: "req-001",
          patient_name: "Aarav Patel",
          hospital_name: "Christian Medical College (CMC)",
          resource_type: "BLOOD",
          required_blood_type: "A+",
          required_component: "PACKED_RBC",
          urgency_level: "CRITICAL",
          status: "OPEN",
          justification: "Acute internal bleeding, Hb level plummeted to 5.2 g/dL.",
          created_at: new Date(Date.now() - 30 * 60000).toISOString(),
        },
        {
          request_id: "req-002",
          patient_name: "Deepa Krishnan",
          hospital_name: "Apollo Main Hospital",
          resource_type: "BLOOD",
          required_blood_type: "O-",
          required_component: "PACKED_RBC",
          urgency_level: "CRITICAL",
          status: "OPEN",
          justification: "Urgent Cesarean section with suspected placenta accreta.",
          created_at: new Date(Date.now() - 60 * 60000).toISOString(),
        },
        {
          request_id: "req-003",
          patient_name: "Naveen Chawla",
          hospital_name: "Christian Medical College (CMC)",
          resource_type: "BLOOD",
          required_blood_type: "B+",
          required_component: "PLATELETS",
          urgency_level: "HIGH",
          status: "OPEN",
          justification: "Severe aplastic anemia with thrombotic thrombocytopenia; needs urgent platelets.",
          created_at: new Date(Date.now() - 120 * 60000).toISOString(),
        },
        {
          request_id: "req-004",
          patient_name: "Farhan Akhtar",
          hospital_name: "Fortis Hospital Bannerghatta",
          resource_type: "BLOOD",
          required_blood_type: "AB+",
          required_component: "PACKED_RBC",
          urgency_level: "MEDIUM",
          status: "OPEN",
          justification: "Elective scheduled orthopedic hip replacement revision.",
          created_at: new Date(Date.now() - 300 * 60000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterUrgency, filterStatus]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRequest({
        patient_id: newReq.patientId,
        hospital_id: newReq.hospitalId,
        resource_type: newReq.resourceType,
        required_blood_type: newReq.requiredBloodType,
        required_component: newReq.requiredComponent,
        urgency_level: newReq.urgencyLevel,
        justification: newReq.justification,
      });
      setShowCreateModal(false);
      fetchRequests();
    } catch (err: any) {
      alert("Error submitting request: " + err.message);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.request_id?.toLowerCase().includes(q) ||
      r.patient_name?.toLowerCase().includes(q) ||
      r.hospital_name?.toLowerCase().includes(q) ||
      r.required_blood_type?.toLowerCase().includes(q)
    );
  });

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "CRITICAL":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">CRITICAL</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800 border border-orange-200">HIGH</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">MEDIUM</span>;
      case "LOW":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">LOW</span>;
      default:
        return <span>{urgency}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clinical Transfusion Requests</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Relational requests table • Patient-Hospital Cross-References & Priority Queue
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchRequests}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-crimson-600 hover:bg-crimson-500 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Submit Urgent Request</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search request ID, patient, hospital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Urgencies</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="PENDING_MATCH">PENDING_MATCH</option>
            <option value="ALLOCATED">ALLOCATED</option>
            <option value="FULFILLED">FULFILLED</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Patient Profile</th>
                <th className="py-3 px-4">Required Blood</th>
                <th className="py-3 px-4">Requesting Hospital</th>
                <th className="py-3 px-4">Urgency Level</th>
                <th className="py-3 px-4">Clinical Justification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((r) => (
                <tr key={r.request_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">{r.request_id}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{r.patient_name || r.patient_id}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded font-bold text-xs bg-crimson-50 text-crimson-700 border border-crimson-200">
                      {r.required_blood_type}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1.5">({r.required_component})</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{r.hospital_name || r.hospital_id}</td>
                  <td className="py-3 px-4">{getUrgencyBadge(r.urgency_level)}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={r.justification}>
                    {r.justification}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigate("allocation")}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded bg-crimson-50 hover:bg-crimson-100 text-crimson-700 font-semibold text-xs border border-crimson-200 transition-colors"
                    >
                      <span>Match Unit</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateRequest} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Submit Urgent Clinical Transfusion Request</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Patient</label>
                  <select
                    value={newReq.patientId}
                    onChange={(e) => setNewReq({ ...newReq, patientId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="pat-001">Aarav Patel (A+)</option>
                    <option value="pat-002">Deepa Krishnan (O-)</option>
                    <option value="pat-003">Naveen Chawla (B+)</option>
                    <option value="pat-004">Farhan Akhtar (AB+)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Clinical Urgency</label>
                  <select
                    value={newReq.urgencyLevel}
                    onChange={(e) => setNewReq({ ...newReq, urgencyLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-rose-700"
                  >
                    <option value="CRITICAL">CRITICAL (Active Hemorrhage)</option>
                    <option value="HIGH">HIGH (Trauma Resuscitation)</option>
                    <option value="MEDIUM">MEDIUM (Scheduled Surgical)</option>
                    <option value="LOW">LOW (Elective)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Required Blood Type</label>
                  <select
                    value={newReq.requiredBloodType}
                    onChange={(e) => setNewReq({ ...newReq, requiredBloodType: e.target.value })}
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
                    value={newReq.requiredComponent}
                    onChange={(e) => setNewReq({ ...newReq, requiredComponent: e.target.value })}
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
                <label className="block font-medium text-slate-700 mb-1">Clinical Justification (Mandatory)</label>
                <textarea
                  rows={3}
                  value={newReq.justification}
                  onChange={(e) => setNewReq({ ...newReq, justification: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  placeholder="State patient vitals, diagnosis, and physiological rationale..."
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-crimson-600 hover:bg-crimson-500 text-xs font-semibold text-white shadow-sm"
              >
                Queue Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
