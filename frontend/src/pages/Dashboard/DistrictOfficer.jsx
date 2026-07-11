import API from '../../config/api';
import axiosInstance from '../../config/axiosInstance';
import React, { useState, useEffect } from "react";
import { Users, Building, Calendar, DollarSign, AlertCircle, MapPin, FileText, TrendingUp, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, IndianRupee, Paperclip } from "lucide-react";
import { toast } from "react-toastify";



const fmt = (n) =>
  n != null ? `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

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
                  href={`${API}/${path}`}
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
                      <p className="font-medium text-gray-800">{app.centre_name}</p>
                      <p className="text-xs text-gray-500">
                        {app.district} · {typeLabel} · {app.applicant_name || app.applicant_email}
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
                  <div className="mt-4 ml-11 space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Investment</p>
                        <p className="font-semibold">{fmt(app.investment_amount)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Claim Amount</p>
                        <p className="font-semibold">{fmt(app.claim_amount)}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <p className="text-xs text-emerald-500">Subsidy ({app.subsidy_percentage}%)</p>
                        <p className="font-bold text-emerald-700">{fmt(app.subsidy_amount)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(app.created_at).toLocaleDateString("en-IN")}
                    </p>

                    {/* Documents submitted by applicant */}
                    <DocList docs={[
                      { label: "Fire Safety Certificate",   path: app.doc_fire_safety },
                      { label: "Udyog Registration",        path: app.doc_udyog_reg },
                      { label: "GST Registration",          path: app.doc_gst_reg },
                      { label: "Pollution Certificate",     path: app.doc_pollution_cert },
                      { label: "Detailed Project Report",   path: app.doc_dpr },
                      { label: "CA Project Cost Cert.",     path: app.doc_ca_project_cost },
                      { label: "Land Document",             path: app.doc_land_document },
                      { label: "Constitution Document",     path: app.doc_constitution },
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

  const fetchPendingUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axiosInstance.get(`${API}/api/admin/pending-registrations`);
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
      fetchPendingUsers();
    }
  }, [activeTab]);

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

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {loadingUsers ? (
            <div className="p-8 text-center text-teal-600 font-medium">Loading pending applications...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium bg-gray-50 rounded-xl">
              No pending registrations found for your district.
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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