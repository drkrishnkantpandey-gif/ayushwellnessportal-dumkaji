import API from '../../config/api';
import axiosInstance from '../../config/axiosInstance';
import React, { useState, useEffect } from "react";
import { Users, Building, Calendar, DollarSign, AlertCircle, MapPin, FileText, TrendingUp, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, IndianRupee, Paperclip, X } from "lucide-react";
import { toast } from "react-toastify";



const fmt = (n) =>
  n != null ? `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

// Handle both Cloudinary full URLs and local /uploads paths
const docUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // strip leading slash if present to avoid double-slash
  return `${API}/${path.replace(/^\//, '')}`;
};

function DocList({ docs }) {
  const hasAny = docs.some(d => d.path);
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
      <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1 uppercase tracking-wide">
        <Paperclip size={12} /> Submitted Documents
      </p>
      {!hasAny ? (
        <p className="text-xs text-gray-400 italic">No documents uploaded by applicant.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {docs.map(({ label, path }) => (
            <div key={label} className="flex items-center gap-1.5 min-w-0">
              {path ? (
                <a
                  href={docUrl(path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1 truncate"
                  title={`View: ${label}`}
                >
                  <FileText size={11} className="shrink-0 text-blue-400" />
                  <span className="truncate">{label}</span>
                </a>
              ) : (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FileText size={11} className="shrink-0 text-gray-300" />
                  <span>{label}</span>
                  <em className="text-gray-300 text-xs">— not uploaded</em>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function YogaTCIncentiveReview() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]       = useState(null); // { id, decision }
  const [remarks, setRemarks]   = useState("");
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");


  const load = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get(`${API}/api/admin/incentives/district`);
      setApps(r.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (id, decision) => { setModal({ id, decision }); setRemarks(""); };

  const submitDecision = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      await axiosInstance.put(
        `${API}/api/admin/incentives/district/${modal.id}`,
        { decision: modal.decision, remarks }
      );
      setMsg(`Application ${modal.id} has been ${modal.decision === "APPROVED" ? "approved" : "disapproved"}.`);
      setModal(null);
      setExpanded(null);
      load();
    } catch (e) {
      alert(e.response?.data?.message || "Action failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow mb-8">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Yoga TC — Incentive Applications</h3>
          <p className="text-xs text-gray-500 mt-0.5">State Level Review Committee — District Stage</p>
        </div>
        <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
          {apps.length} Pending
        </span>
      </div>

      {msg && (
        <div className="mx-5 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle size={15} /> {msg}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading…</div>
      ) : apps.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <CheckCircle size={36} className="mx-auto mb-2 text-green-300" />
          No pending incentive applications.
        </div>
      ) : (
        <div className="divide-y">
          {apps.map((app) => {
            const open = expanded === app.id;
            const typeLabel = app.region === "HILLY" ? "Hilly Region (50%)" : "Plain Region (25%)";
            return (
              <div key={app.id} className="p-4">
                <button
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => setExpanded(open ? null : app.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2 mt-0.5">
                      <FileText size={16} className="text-blue-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">{app.centre_name}</p>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">{app.project_type || "Greenfield"}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        UPN: <strong className="text-slate-700">{app.upn || "—"}</strong> · {app.district} · {typeLabel} · {app.applicant_name || app.applicant_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Subsidy Amount</p>
                      <p className="font-bold text-emerald-700 text-sm">{fmt(app.subsidy_amount)}</p>
                    </div>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {open && (
                  <div className="mt-4 ml-11 space-y-4 text-xs">
                    <div className="grid grid-cols-4 gap-3 bg-white p-3 rounded-lg border">
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Total Investment</p>
                        <p className="font-semibold text-gray-800">{fmt(app.investment_amount)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Eligible Assets Amount</p>
                        <p className="font-semibold text-gray-800">{fmt(app.eligible_assets_amount || app.claim_amount)}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-2.5">
                        <p className="text-[10px] text-emerald-600 uppercase font-bold">Subsidy ({app.subsidy_percentage}%)</p>
                        <p className="font-bold text-emerald-700">{fmt(app.subsidy_amount)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2.5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Proposed Location</p>
                        <p className="font-semibold text-slate-800">{app.proposed_location || "—"}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Complete Site Address</span>
                        <span className="text-gray-700 font-medium">{app.address || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">GPS Coordinates</span>
                        <span className="text-gray-700 font-medium">{app.gps_coordinates || "—"}</span>
                      </div>
                    </div>

                    {/* Documents submitted by applicant */}
                    <DocList docs={[
                      { label: "Fire & Safety NOC",         path: app.doc_fire_safety },
                      { label: "Udyog Registration",        path: app.doc_udyog_reg },
                      { label: "GST Registration Certificate", path: app.doc_gst_reg },
                      { label: "Pollution Control Board NOC", path: app.doc_pollution_cert },
                      { label: "Detailed Project Report",   path: app.doc_dpr },
                      { label: "CA Project Cost Cert.",     path: app.doc_ca_project_cost },
                      { label: "CA Certified ECA",          path: app.doc_ca_eca },
                      { label: "Land Document",             path: app.doc_land_document },
                      { label: "Constitution of Firm/Society/MOA", path: app.doc_constitution },
                      { label: "Registration certificate of Entity", path: app.doc_entity_registration },
                      { label: "MAP Approved by Dev Authority", path: app.doc_map_approval },
                      { label: "Non-Agriculture Land Cert", path: app.doc_non_agri_land },
                      { label: "Land Possession / Lease Proof", path: app.doc_land_possession },
                      { label: "Affidavit (No construction started & no other state subsidy claimed)", path: app.doc_affidavit },
                      { label: "Others",                    path: app.doc_others },
                    ]} />

                    {/* State Level Review Committee Decision */}
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        State Level Review Committee — Decision
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => openModal(app.id, "APPROVED")}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                        >
                          <CheckCircle size={15} /> Approved
                        </button>
                        <button
                          onClick={() => openModal(app.id, "DISAPPROVED")}
                          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
                        >
                          <XCircle size={15} /> Disapproved
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h4 className="font-semibold text-gray-800 mb-1">
              {modal.decision === "APPROVED" ? "Approve" : "Disapprove"} Application #{modal.id}
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              State Level Review Committee — District Officer Decision
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (optional)</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any remarks or conditions..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">Cancel</button>
              <button
                onClick={submitDecision}
                disabled={saving}
                className={`px-5 py-2 text-sm text-white rounded-lg ${modal.decision === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"} disabled:opacity-60`}
              >
                {saving ? "Saving…" : `Confirm ${modal.decision === "APPROVED" ? "Approval" : "Disapproval"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DistrictOfficer = ({ activeTab }) => {
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedEntity, setSelectedEntity] = useState(null);

  const fetchPendingUsers = async (statusVal = filterStatus) => {
    setLoadingUsers(true);
    try {
      const res = await axiosInstance.get(`${API}/api/admin/pending-registrations?status=${statusVal}`);
      if (res.data.success) {
        setPendingUsers(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching pending users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "entity_approvals") {
      fetchPendingUsers(filterStatus);
    }
  }, [activeTab, filterStatus]);

  const handleAction = async (targetUserId, decision) => {
    if (!window.confirm(`Are you sure you want to ${decision} this registration?`)) return;
    try {
      const res = await axiosInstance.put(`${API}/api/admin/approve-user-registration/${targetUserId}`, {
        decision
      });
      if (res.data.success) {
        toast.success(res.data.message || `Registration request ${decision} successfully!`);
        fetchPendingUsers();
      }
    } catch (err) {
      console.error("Error during approval decision:", err);
      toast.error(err.response?.data?.message || "Action failed.");
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const r = await axiosInstance.get(`${API}/api/admin/dashboard-stats`);
        if (r.data.success) {
          setStats(r.data.data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  const topCards = [
    {
      title: "Total Registered Entities",
      value: stats ? stats.totalEntities : "0",
      desc: "Yoga professionals, centres, and institutions",
      icon: Building,
      color: "bg-blue-600"
    },
    {
      title: "Pending Verifications",
      value: stats ? stats.pendingVerifications : "0",
      desc: "Applications awaiting verification",
      icon: Clock,
      color: "bg-yellow-500"
    },
    {
      title: "Total Registered Users",
      value: stats ? stats.totalUsers : "0",
      desc: "All registered users in the platform",
      icon: Users,
      color: "bg-green-500"
    }
  ];

  const actionRequiredItems = [
    "Verify pending user registrations in Admin panel",
    "Review incoming NAAC and NABH incentive requests"
  ];

  const pendingVerifications = [];

  const entities = stats ? stats.roleStats : [];

  const incentives = (stats ? stats.schemesStats : []).map(s => ({
    scheme: s.scheme,
    applications: s.totalApplications,
    approved: s.approved,
    amount: s.amount,
    status: s.approved > 0 ? "Active" : "No Applications"
  }));

  const monthlyStats = [];

  if (activeTab === "entity_approvals") {
    const roleLabels = {
      wellness_centre: "Wellness Centre",
      yoga_centre: "Yoga Centre",
      yoga_professional: "Yoga Professional",
      ayush_hospital: "AYUSH Hospital"
    };

    return (
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle className="text-teal-600" size={32} />
            District Entity Approvals
          </h1>
          <p className="text-gray-500 mt-1">Review and approve registrations for wellness centres, professionals, training centres, and hospitals in your district</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-px">
          {["pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`pb-3 px-4 text-sm font-semibold capitalize border-b-2 transition-all ${
                filterStatus === status
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {status === "pending" ? "Pending Approvals" : status === "approved" ? "Approved History" : "Rejected History"}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {loadingUsers ? (
            <div className="p-8 text-center text-teal-600 font-medium">Loading applications...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium bg-gray-50 rounded-xl">
              No {filterStatus} registrations found for your district.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Entity Details</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Entity Type</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">District</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted On</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {pendingUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{u.full_name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                        <div className="text-sm text-gray-500">{u.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                          {roleLabels[u.role] || u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                        {u.district || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                       <td className="px-6 py-4 text-right space-x-2">
                        {filterStatus === "pending" ? (
                          <>
                            <button
                              onClick={() => setSelectedEntity(u)}
                              className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-lg text-xs transition"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleAction(u.id, "approved")}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(u.id, "rejected")}
                              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => setSelectedEntity(u)}
                              className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-lg text-xs transition"
                            >
                              View Details
                            </button>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                              filterStatus === "approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}>
                              {filterStatus === "approved" ? "Approved" : "Rejected"}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- Entity Profile Details Modal --- */}
        {selectedEntity && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden transform transition-all border border-slate-100 text-left">
              <div className="bg-gradient-to-r from-teal-700 to-teal-800 px-6 py-4 flex items-center justify-between text-white">
                <h3 className="text-lg font-bold">Review Registration Profile</h3>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {selectedEntity.role === "yoga_centre" ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b pb-2">Yoga Centre Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold text-gray-800 block">Applicant Name</span> 
                        <span className="text-gray-600">{selectedEntity.tc_applicant_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Designation</span> 
                        <span className="text-gray-600">{selectedEntity.tc_designation || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Entity Name</span> 
                        <span className="text-gray-600">{selectedEntity.full_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Entity Type</span> 
                        <span className="text-gray-600">{selectedEntity.tc_entity_type || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Existing Operational Business</span> 
                        <span className="text-gray-600">{selectedEntity.tc_already_operating || "N/A"}</span>
                      </div>
                      {selectedEntity.tc_already_operating === "Other" && (
                        <div>
                          <span className="font-semibold text-gray-800 block">Other Business</span> 
                          <span className="text-gray-600">{selectedEntity.tc_other_business || "N/A"}</span>
                        </div>
                      )}
                      
                      {selectedEntity.tc_already_operating && selectedEntity.tc_already_operating !== "None" && (
                        <div className="col-span-2 mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                          <div className="font-bold text-slate-700 text-xs uppercase tracking-wider">Operational Business Details</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="font-semibold text-gray-800 block text-xs">Name of Business</span>
                              <span className="text-sm text-gray-600">{selectedEntity.tc_operational_business_name || "N/A"}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800 block text-xs">Registration Number</span>
                              <span className="text-sm text-gray-600">{selectedEntity.tc_operational_business_reg_number || "N/A"}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="font-semibold text-gray-800 block text-xs mb-1">Registration Certificate</span>
                              {selectedEntity.tc_operational_business_certificate ? (
                                <a 
                                  href={`${API}/${selectedEntity.tc_operational_business_certificate}`} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-teal-600 font-semibold hover:underline inline-flex items-center gap-1 text-sm"
                                >
                                  <FileText size={14} /> View Document
                                </a>
                              ) : <span className="text-xs text-gray-400 italic">Not Uploaded</span>}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="col-span-2">
                        <span className="font-semibold text-gray-800 block mb-1">Entity Registration Certificate</span>
                        {selectedEntity.tc_entity_certificate ? (
                          <a 
                            href={`${API}/${selectedEntity.tc_entity_certificate}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-teal-600 font-semibold hover:underline inline-flex items-center gap-1 text-sm"
                          >
                            <FileText size={14} /> View Certificate
                          </a>
                        ) : <span className="text-xs text-gray-400 italic">Not Uploaded</span>}
                      </div>

                      <div>
                        <span className="font-semibold text-gray-800 block">Website</span>
                        {selectedEntity.tc_website ? (
                          <a href={selectedEntity.tc_website} target="_blank" rel="noreferrer" className="text-teal-600 font-semibold hover:underline text-sm break-all">
                            {selectedEntity.tc_website}
                          </a>
                        ) : <span className="text-gray-500">N/A</span>}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">GPS Coordinates</span> 
                        <span className="text-gray-600">{selectedEntity.tc_gps_coordinates || "N/A"}</span>
                      </div>

                      <div>
                        <span className="font-semibold text-gray-800 block">ID Proof Type</span> 
                        <span className="text-gray-600 capitalize">{selectedEntity.tc_id_proof_type || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">ID Number</span> 
                        <span className="text-gray-600">{selectedEntity.tc_id_proof_number || "N/A"}</span>
                      </div>

                      <div className="col-span-2">
                        <span className="font-semibold text-gray-800 block mb-1">Uploaded ID Proof</span>
                        {selectedEntity.tc_id_proof_path ? (
                          <a 
                            href={`${API}/${selectedEntity.tc_id_proof_path}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-teal-600 font-semibold hover:underline inline-flex items-center gap-1 text-sm"
                          >
                            <FileText size={14} /> View ID Proof File
                          </a>
                        ) : <span className="text-xs text-gray-400 italic">Not Uploaded</span>}
                      </div>

                      <div className="col-span-2">
                        <span className="font-semibold text-gray-800 block">Address of Business</span> 
                        <span className="text-gray-600 block bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedEntity.tc_address || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b pb-2">Profile Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold text-gray-800 block">Name</span> 
                        <span>{selectedEntity.full_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Role</span> 
                        <span className="uppercase text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">{selectedEntity.role}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Email</span> 
                        <span>{selectedEntity.email || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Mobile</span> 
                        <span>{selectedEntity.phone || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">District</span> 
                        <span>{selectedEntity.district || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">Submitted On</span> 
                        <span>{new Date(selectedEntity.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition text-sm"
                >
                  Close
                </button>
                {selectedEntity.registration_status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleAction(selectedEntity.id, "approved");
                        setSelectedEntity(null);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleAction(selectedEntity.id, "rejected");
                        setSelectedEntity(null);
                      }}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome Back, District Officer!
        </h1>
        <p className="text-gray-500">District Officer Dashboard - {"North District"}</p>
      </div>

      {/* Yoga TC Incentive Review */}
      <YogaTCIncentiveReview />

      {/* Top 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="text-white" size={24} />
              </div>
              <h3 className="text-sm text-gray-600 font-medium">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Action Required */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="text-yellow-600 mr-3 mt-1" size={20} />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-2">Action Required</h4>
            <ul className="space-y-1">
              {actionRequiredItems.map((item, index) => (
                <li key={index} className="text-sm text-gray-700">• {item}</li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
                Review Applications
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Verifications */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Verifications</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Application ID</th>
                <th className="text-left px-4 py-2">Submitted Date</th>
                <th className="text-left px-4 py-2">Priority</th>
                <th className="text-left px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingVerifications.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{item.type}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">{item.submittedDate}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.priority === 'High' 
                        ? 'bg-red-100 text-red-700' 
                        : item.priority === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entity Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Entity Overview</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Entity Type</th>
                <th className="text-left px-4 py-2">Registered</th>
                <th className="text-left px-4 py-2">Active</th>
                <th className="text-left px-4 py-2">Pending</th>
                <th className="text-left px-4 py-2">Activation Rate</th>
              </tr>
            </thead>
            <tbody>
              {entities.map((entity, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{entity.type}</td>
                  <td className="px-4 py-2">{entity.registered}</td>
                  <td className="px-4 py-2">{entity.active}</td>
                  <td className="px-4 py-2">{entity.pending}</td>
                  <td className="px-4 py-2">
                    <span className="font-medium">
                      {Math.round((entity.active / entity.registered) * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incentive Schemes Status */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Incentive Schemes Status</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Scheme Name</th>
                <th className="text-left px-4 py-2">Applications</th>
                <th className="text-left px-4 py-2">Approved</th>
                <th className="text-left px-4 py-2">Amount</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {incentives.map((incentive, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{incentive.scheme}</td>
                  <td className="px-4 py-2">{incentive.applications}</td>
                  <td className="px-4 py-2">{incentive.approved}</td>
                  <td className="px-4 py-2">{incentive.amount}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      incentive.status === 'Approved' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {incentive.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Statistics</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Month</th>
                <th className="text-left px-4 py-2">New Registrations</th>
                <th className="text-left px-4 py-2">Verifications Completed</th>
                <th className="text-left px-4 py-2">Incentives Disbursed</th>
              </tr>
            </thead>
            <tbody>
              {monthlyStats.map((stat, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{stat.month}</td>
                  <td className="px-4 py-2">{stat.registrations}</td>
                  <td className="px-4 py-2">{stat.verifications}</td>
                  <td className="px-4 py-2">{stat.incentives}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center">
          <FileText className="mr-2" size={16} />
          Review Applications
        </button>
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
          <CheckCircle className="mr-2" size={16} />
          Approve Verifications
        </button>
        <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
          <DollarSign className="mr-2" size={16} />
          Process Incentives
        </button>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm flex items-center">
          <TrendingUp className="mr-2" size={16} />
          Generate Reports
        </button>
      </div>
    </div>
  );
};

export default DistrictOfficer;