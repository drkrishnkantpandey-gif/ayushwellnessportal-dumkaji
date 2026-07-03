import API from '../../config/api';
import axiosInstance from '../../config/axiosInstance';
import React, { useState, useEffect } from "react";
import { Building, Users, DollarSign, AlertCircle, MapPin, FileText, TrendingUp, CheckCircle, Award, BarChart3, XCircle, ChevronDown, ChevronUp, Clock, BookOpen, IndianRupee, Paperclip } from "lucide-react";


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

const WINDOW_LABELS = { APR_MAY: "April–May", OCT_NOV: "October–November" };
const REVIEW_MONTHS = { APR_MAY: "June", OCT_NOV: "December" };
function getCurrentReviewWindow() {
  const m = new Date().getMonth() + 1;
  if (m === 6)  return "APR_MAY";
  if (m === 12) return "OCT_NOV";
  return null;
}

function ResearchGrantReview() {
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]     = useState(null);
  const [remarks, setRemarks] = useState("");
  const [approvedAmt, setApprovedAmt] = useState("");
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");
  const reviewWindow = getCurrentReviewWindow();


  const load = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get(`${API}/api/research-grants/admin/pending`);
      setApps(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (id, decision) => { setModal({ id, decision }); setRemarks(""); setApprovedAmt(""); };

  const submitDecision = async () => {
    if (!modal) return;
    if (modal.decision === "APPROVED" && !approvedAmt)
      return alert("Please enter the approved grant amount.");
    setSaving(true);
    try {
      await axiosInstance.put(`${API}/api/research-grants/admin/${modal.id}`, {
        decision: modal.decision, remarks,
        approved_amount: modal.decision === "APPROVED" ? approvedAmt : null,
      });
      setMsg(`Research grant #${modal.id} has been ${modal.decision === "APPROVED" ? "approved" : "rejected"}.`);
      setModal(null);
      setExpanded(null);
      load();
    } catch (e) { alert(e.response?.data?.message || "Action failed."); }
    finally { setSaving(false); }
  };

  const pendingForReview = reviewWindow
    ? apps.filter(a => a.application_window === reviewWindow)
    : apps;

  return (
    <div className="bg-white rounded-xl shadow mb-8">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BookOpen size={18} className="text-blue-600" /> Research Grant Applications
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Research Project Approval Committee
            {reviewWindow && ` — Currently reviewing ${WINDOW_LABELS[reviewWindow]} applications`}
          </p>
        </div>
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
          {apps.length} Pending
        </span>
      </div>

      {reviewWindow && (
        <div className="mx-5 mt-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-700">
          It is <strong>{REVIEW_MONTHS[reviewWindow]}</strong> — review period for <strong>{WINDOW_LABELS[reviewWindow]}</strong> applications is active.
        </div>
      )}

      {msg && (
        <div className="mx-5 mt-3 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle size={15} /> {msg}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading…</div>
      ) : apps.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <CheckCircle size={36} className="mx-auto mb-2 text-green-300" />
          No pending research grant applications.
        </div>
      ) : (
        <div className="divide-y">
          {apps.map((app) => {
            const open = expanded === app.id;
            const isCurrentWindow = app.application_window === reviewWindow;
            return (
              <div key={app.id} className="p-4">
                <button className="w-full flex items-center justify-between text-left"
                  onClick={() => setExpanded(open ? null : app.id)}>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2 mt-0.5">
                      <BookOpen size={16} className="text-blue-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{app.title}</p>
                      <p className="text-xs text-gray-500">
                        {app.organization_name} · {WINDOW_LABELS[app.application_window]} {app.application_year}
                        {" · "}{app.applicant_name || app.applicant_email}
                      </p>
                      {isCurrentWindow && (
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Due for review this month
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Requested</p>
                      <p className="font-bold text-gray-800 text-sm">{fmt(app.requested_amount)}</p>
                    </div>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {open && (
                  <div className="mt-4 ml-11 space-y-4">
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      {[
                        ["Organisation", app.organization_name],
                        ["Org Type", app.organization_type?.replace(/_/g, " ")],
                        ["PI Name", app.pi_name],
                        ["PI Designation", app.pi_designation || "—"],
                        ["Keywords", app.keywords || "—"],
                        ["Submitted", new Date(app.created_at).toLocaleDateString("en-IN")],
                      ].map(([lbl, val]) => (
                        <div key={lbl} className="bg-gray-50 rounded-lg p-2.5">
                          <p className="text-xs text-gray-400">{lbl}</p>
                          <p className="font-medium text-gray-700 text-xs mt-0.5">{val}</p>
                        </div>
                      ))}
                    </div>
                    {app.abstract && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-gray-700">
                        <p className="font-semibold text-blue-700 mb-1">Abstract</p>
                        <p className="leading-relaxed line-clamp-4">{app.abstract}</p>
                      </div>
                    )}

                    {/* Research proposal document */}
                    <DocList docs={[
                      { label: "Research Proposal Document", path: app.doc_proposal },
                    ]} />

                    {/* Research Project Approval Committee Decision */}
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        Research Project Approval Committee — Decision
                      </p>
                      <div className="flex gap-3">
                        <button onClick={() => openModal(app.id, "APPROVED")}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                          <CheckCircle size={15} /> Approve
                        </button>
                        <button onClick={() => openModal(app.id, "REJECTED")}
                          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
                          <XCircle size={15} /> Reject
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h4 className="font-semibold text-gray-800">
              {modal.decision === "APPROVED" ? "Approve" : "Reject"} Research Grant #{modal.id}
            </h4>
            <p className="text-xs text-gray-500">Research Project Approval Committee — Directorate Decision</p>

            {modal.decision === "APPROVED" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approved Grant Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input type="number" min="0" max="1000000"
                    value={approvedAmt} onChange={(e) => setApprovedAmt(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm"
                    placeholder="Max ₹10,00,000" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Committee remarks or conditions..." />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">Cancel</button>
              <button onClick={submitDecision} disabled={saving}
                className={`px-5 py-2 text-sm text-white rounded-lg disabled:opacity-60 ${modal.decision === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}>
                {saving ? "Saving…" : `Confirm ${modal.decision === "APPROVED" ? "Approval" : "Rejection"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function YogaTCDirectorateReview() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]       = useState(null);
  const [remarks, setRemarks]   = useState("");
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");


  const load = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get(`${API}/api/admin/incentives/directorate`);
      setApps(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (id, decision) => { setModal({ id, decision }); setRemarks(""); };

  const submitDecision = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      await axiosInstance.put(
        `${API}/api/admin/incentives/directorate/${modal.id}`,
        { decision: modal.decision, remarks }
      );
      setMsg(`Application ${modal.id} has been ${modal.decision === "APPROVED" ? "approved" : "rejected"} by Directorate.`);
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
          <p className="text-xs text-gray-500 mt-0.5">State Level Review Committee — Directorate Stage (District Approved)</p>
        </div>
        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
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
          No district-approved applications awaiting directorate review.
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
                    <div className="bg-purple-100 rounded-full p-2 mt-0.5">
                      <FileText size={16} className="text-purple-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{app.centre_name}</p>
                      <p className="text-xs text-gray-500">
                        {app.district} · {typeLabel} · {app.applicant_name || app.applicant_email}
                      </p>
                      {app.district_remarks && (
                        <p className="text-xs text-blue-600 mt-0.5">District note: {app.district_remarks}</p>
                      )}
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                      <p className="font-semibold text-blue-700">District Officer Decision</p>
                      <p className="text-blue-600 mt-1">
                        {app.district_decision} on {app.district_reviewed_at ? new Date(app.district_reviewed_at).toLocaleDateString("en-IN") : "—"}
                        {app.district_remarks && ` — "${app.district_remarks}"`}
                      </p>
                    </div>

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

                    {/* Directorate SLRC Decision */}
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        State Level Review Committee — Directorate Decision
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => openModal(app.id, "APPROVED")}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                        >
                          <CheckCircle size={15} /> Approved
                        </button>
                        <button
                          onClick={() => openModal(app.id, "REJECTED")}
                          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
                        >
                          <XCircle size={15} /> Rejected
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

      {/* Directorate Decision Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h4 className="font-semibold text-gray-800 mb-1">
              {modal.decision === "APPROVED" ? "Approve" : "Reject"} Application #{modal.id}
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              State Level Review Committee — Directorate Final Decision
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (optional)</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Add any remarks or conditions..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">Cancel</button>
              <button
                onClick={submitDecision}
                disabled={saving}
                className={`px-5 py-2 text-sm text-white rounded-lg ${modal.decision === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"} disabled:opacity-60`}
              >
                {saving ? "Saving…" : `Confirm ${modal.decision === "APPROVED" ? "Approval" : "Rejection"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const NAAC_GRADE_LABELS = { 'B++': { label: 'NAAC B++', badge: 'bg-amber-100 text-amber-700' }, 'A': { label: 'NAAC A', badge: 'bg-blue-100 text-blue-700' }, 'A+': { label: 'NAAC A+', badge: 'bg-purple-100 text-purple-700' }, 'A++': { label: 'NAAC A++', badge: 'bg-emerald-100 text-emerald-700' } };

function NAACReimbursementReview() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]       = useState(null);
  const [remarks, setRemarks]   = useState("");
  const [approvedAmt, setApprovedAmt] = useState("");
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");

  const fmtAmt  = (n) => n != null ? `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

  const load = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get(`${API}/api/admin/naac-reimbursement/pending`);
      setApps(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (id, decision, claimed) => {
    setModal({ id, decision });
    setRemarks("");
    setApprovedAmt(decision === "APPROVED" ? String(claimed) : "");
  };

  const submitDecision = async () => {
    if (!modal) return;
    if (modal.decision === "APPROVED" && !approvedAmt) return alert("Please enter approved amount.");
    setSaving(true);
    try {
      await axiosInstance.put(`${API}/api/admin/naac-reimbursement/${modal.id}`, {
        decision: modal.decision, remarks,
        approved_amount: modal.decision === "APPROVED" ? approvedAmt : null,
      });
      setMsg(`NAAC reimbursement #${modal.id} ${modal.decision === "APPROVED" ? "approved" : "rejected"}.`);
      setModal(null); setExpanded(null); load();
    } catch (e) { alert(e.response?.data?.message || "Action failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl shadow mb-8">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Award size={18} className="text-purple-600" /> NAAC Accreditation Reimbursement — AYUSH Colleges
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Grade-based reimbursement claims awaiting directorate approval (max ₹15 lakh)</p>
        </div>
        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">{apps.length} Pending</span>
      </div>

      {msg && (
        <div className="mx-5 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle size={15} /> {msg}
        </div>
      )}

      {loading ? <div className="p-8 text-center text-gray-400">Loading…</div>
      : apps.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <CheckCircle size={36} className="mx-auto mb-2 text-green-300" />
          No pending NAAC reimbursement claims.
        </div>
      ) : (
        <div className="divide-y">
          {apps.map((app) => {
            const open  = expanded === app.id;
            const grade = NAAC_GRADE_LABELS[app.naac_grade] || {};
            return (
              <div key={app.id} className="p-4">
                <button className="w-full flex items-center justify-between text-left"
                  onClick={() => setExpanded(open ? null : app.id)}>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 rounded-full p-2 mt-0.5">
                      <Award size={16} className="text-purple-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">{app.college_name}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${grade.badge}`}>{grade.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Accreditation Year: {app.accreditation_year} · {app.applicant_user_name || app.applicant_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Claim</p>
                      <p className="font-bold text-gray-800 text-sm">{fmtAmt(app.reimbursement_amount)}</p>
                    </div>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {open && (
                  <div className="mt-4 ml-11 space-y-4">
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      {[
                        ["NAAC Grade",       app.naac_grade],
                        ["Accred. Year",     app.accreditation_year],
                        ["Valid Until",      app.accreditation_valid_until || "—"],
                        ["Certificate No.",  app.naac_certificate_number  || "—"],
                        ["Claim Amount",     fmtAmt(app.reimbursement_amount)],
                        ["Submitted",        new Date(app.created_at).toLocaleDateString("en-IN")],
                      ].map(([lbl, val]) => (
                        <div key={lbl} className="bg-gray-50 rounded-lg p-2.5">
                          <p className="text-xs text-gray-400">{lbl}</p>
                          <p className="font-medium text-xs mt-0.5">{val}</p>
                        </div>
                      ))}
                    </div>
                    {app.bank_account_number && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs">
                        <p className="font-semibold text-blue-700 mb-1">Bank Details</p>
                        <p>A/C: {app.bank_account_number} · IFSC: {app.ifsc_code} · Branch: {app.branch_name}</p>
                        <p>Beneficiary: {app.beneficiary_name}</p>
                      </div>
                    )}

                    {/* Documents submitted by applicant */}
                    <DocList docs={[
                      { label: "NAAC Certificate",      path: app.doc_naac_certificate },
                      { label: "Grade Sheet",           path: app.doc_grade_sheet },
                      { label: "Fee Receipt",           path: app.doc_fee_receipt },
                      { label: "Bank Details Document", path: app.doc_bank_details },
                      { label: "Others",                path: app.doc_others },
                    ]} />

                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Directorate Decision</p>
                      <div className="flex gap-3">
                        <button onClick={() => openModal(app.id, "APPROVED", app.reimbursement_amount)}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                          <CheckCircle size={15} /> Approve
                        </button>
                        <button onClick={() => openModal(app.id, "REJECTED", 0)}
                          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
                          <XCircle size={15} /> Reject
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

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h4 className="font-semibold text-gray-800">{modal.decision === "APPROVED" ? "Approve" : "Reject"} NAAC Claim #{modal.id}</h4>
            <p className="text-xs text-gray-500">Directorate — NAAC Accreditation Reimbursement Decision</p>
            {modal.decision === "APPROVED" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approved Amount (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input type="number" min="0" max="1500000" value={approvedAmt}
                    onChange={(e) => setApprovedAmt(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Maximum cap: ₹15,00,000</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Add remarks..." />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">Cancel</button>
              <button onClick={submitDecision} disabled={saving}
                className={`px-5 py-2 text-sm text-white rounded-lg disabled:opacity-60 ${modal.decision === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}>
                {saving ? "Saving…" : `Confirm ${modal.decision === "APPROVED" ? "Approval" : "Rejection"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NABHReimbursementReview() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]       = useState(null);
  const [remarks, setRemarks]   = useState("");
  const [approvedAmt, setApprovedAmt] = useState("");
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");

  const fmtAmt = (n) => n != null ? `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

  const load = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get(`${API}/api/admin/nabh-reimbursement/pending`);
      setApps(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (id, decision, claimed) => {
    setModal({ id, decision });
    setRemarks("");
    setApprovedAmt(decision === "APPROVED" ? String(claimed) : "");
  };

  const submitDecision = async () => {
    if (!modal) return;
    if (modal.decision === "APPROVED" && !approvedAmt) return alert("Please enter approved amount.");
    setSaving(true);
    try {
      await axiosInstance.put(`${API}/api/admin/nabh-reimbursement/${modal.id}`, {
        decision: modal.decision, remarks,
        approved_amount: modal.decision === "APPROVED" ? approvedAmt : null,
      });
      setMsg(`NABH reimbursement #${modal.id} ${modal.decision === "APPROVED" ? "approved" : "rejected"}.`);
      setModal(null); setExpanded(null); load();
    } catch (e) { alert(e.response?.data?.message || "Action failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl shadow mb-8">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Award size={18} className="text-emerald-600" /> NABH Accreditation Fee Reimbursement — AYUSH Hospitals
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Reimbursement claims for NABH accreditation fees awaiting directorate approval</p>
        </div>
        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">{apps.length} Pending</span>
      </div>

      {msg && (
        <div className="mx-5 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle size={15} /> {msg}
        </div>
      )}

      {loading ? <div className="p-8 text-center text-gray-400">Loading…</div>
      : apps.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <CheckCircle size={36} className="mx-auto mb-2 text-green-300" />
          No pending NABH reimbursement claims.
        </div>
      ) : (
        <div className="divide-y">
          {apps.map((app) => {
            const open = expanded === app.id;
            return (
              <div key={app.id} className="p-4">
                <button className="w-full flex items-center justify-between text-left"
                  onClick={() => setExpanded(open ? null : app.id)}>
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-100 rounded-full p-2 mt-0.5">
                      <Award size={16} className="text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{app.hospital_name}</p>
                      <p className="text-xs text-gray-500">
                        {app.nabh_accreditation_type} · Year {app.accreditation_year} · {app.applicant_user_name || app.applicant_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Fee Paid</p>
                      <p className="font-bold text-gray-800 text-sm">{fmtAmt(app.fee_paid_amount)}</p>
                    </div>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {open && (
                  <div className="mt-4 ml-11 space-y-4">
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      {[
                        ["Accreditation Type",    app.nabh_accreditation_type || "—"],
                        ["Certificate No.",       app.nabh_certificate_number || "—"],
                        ["Valid From",            app.nabh_valid_from ? new Date(app.nabh_valid_from).toLocaleDateString("en-IN") : "—"],
                        ["Valid To",              app.nabh_valid_to   ? new Date(app.nabh_valid_to).toLocaleDateString("en-IN")   : "—"],
                        ["Fee Paid",              fmtAmt(app.fee_paid_amount)],
                        ["Requested Amount",      app.requested_amount ? fmtAmt(app.requested_amount) : "Full amount"],
                        ["Submitted",             new Date(app.created_at).toLocaleDateString("en-IN")],
                        ["Applicant Email",       app.applicant_email || "—"],
                      ].map(([lbl, val]) => (
                        <div key={lbl} className="bg-gray-50 rounded-lg p-2.5">
                          <p className="text-xs text-gray-400">{lbl}</p>
                          <p className="font-medium text-xs mt-0.5">{val}</p>
                        </div>
                      ))}
                    </div>

                    {app.bank_account_number && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs">
                        <p className="font-semibold text-blue-700 mb-1">Bank Details</p>
                        <p>A/C: {app.bank_account_number} · IFSC: {app.ifsc_code} · Branch: {app.branch_name}</p>
                        <p>Beneficiary: {app.beneficiary_name}</p>
                      </div>
                    )}

                    <DocList docs={[
                      { label: "NABH Accreditation Certificate", path: app.doc_nabh_certificate },
                      { label: "Fee Receipt / Payment Proof",    path: app.doc_fee_receipt },
                      { label: "Bank Details Document",          path: app.doc_bank_details },
                      { label: "Other Documents",                path: app.doc_others },
                    ]} />

                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Directorate Decision</p>
                      <div className="flex gap-3">
                        <button onClick={() => openModal(app.id, "APPROVED", app.requested_amount || app.fee_paid_amount)}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                          <CheckCircle size={15} /> Approve
                        </button>
                        <button onClick={() => openModal(app.id, "REJECTED", 0)}
                          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
                          <XCircle size={15} /> Reject
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

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h4 className="font-semibold text-gray-800">{modal.decision === "APPROVED" ? "Approve" : "Reject"} NABH Claim #{modal.id}</h4>
            <p className="text-xs text-gray-500">Directorate — NABH Accreditation Fee Reimbursement Decision</p>
            {modal.decision === "APPROVED" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approved Amount (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input type="number" min="0" value={approvedAmt}
                    onChange={(e) => setApprovedAmt(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Add remarks..." />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">Cancel</button>
              <button onClick={submitDecision} disabled={saving}
                className={`px-5 py-2 text-sm text-white rounded-lg disabled:opacity-60 ${modal.decision === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}>
                {saving ? "Saving…" : `Confirm ${modal.decision === "APPROVED" ? "Approval" : "Rejection"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExamFeeReimbursementReview() {
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]     = useState(null);
  const [remarks, setRemarks] = useState("");
  const [approvedAmt, setApprovedAmt] = useState("");
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");

  const fmt = (n) => n != null ? `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

  const load = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get(`${API}/api/admin/exam-fee/pending`);
      setApps(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (id, decision) => { setModal({ id, decision }); setRemarks(""); setApprovedAmt(""); };

  const submitDecision = async () => {
    if (!modal) return;
    if (modal.decision === "APPROVED" && !approvedAmt) return alert("Please enter approved amount.");
    setSaving(true);
    try {
      await axiosInstance.put(`${API}/api/admin/exam-fee/${modal.id}`, {
        decision: modal.decision, remarks,
        approved_amount: modal.decision === "APPROVED" ? approvedAmt : null,
      });
      setMsg(`Application #${modal.id} has been ${modal.decision === "APPROVED" ? "approved" : "rejected"}.`);
      setModal(null);
      setExpanded(null);
      load();
    } catch (e) { alert(e.response?.data?.message || "Action failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl shadow mb-8">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={18} className="text-emerald-600" /> Exam Fee Reimbursement — Yoga Professionals
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Board-certified course fee claims awaiting directorate approval</p>
        </div>
        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
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
          No pending exam fee reimbursement claims.
        </div>
      ) : (
        <div className="divide-y">
          {apps.map((app) => {
            const open = expanded === app.id;
            return (
              <div key={app.id} className="p-4">
                <button className="w-full flex items-center justify-between text-left"
                  onClick={() => setExpanded(open ? null : app.id)}>
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-100 rounded-full p-2 mt-0.5">
                      <FileText size={16} className="text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{app.course_name}</p>
                      <p className="text-xs text-gray-500">
                        {app.certifying_board} · {app.applicant_name} · {app.applicant_user_name || app.applicant_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Claimed</p>
                      <p className="font-bold text-gray-800 text-sm">{fmt(app.claimed_amount)}</p>
                    </div>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {open && (
                  <div className="mt-4 ml-11 space-y-4">
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Exam Fee Paid</p>
                        <p className="font-bold">{fmt(app.exam_fee_paid)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Claimed Amount</p>
                        <p className="font-bold">{fmt(app.claimed_amount)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Completion Date</p>
                        <p className="font-bold">{new Date(app.completion_date).toLocaleDateString("en-IN")}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Registration No.</p>
                        <p className="font-medium text-xs">{app.registration_number || "—"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Exam Centre</p>
                        <p className="font-medium text-xs">{app.exam_center || "—"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Submitted On</p>
                        <p className="font-medium text-xs">{new Date(app.created_at).toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>

                    {app.bank_account_number && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs">
                        <p className="font-semibold text-blue-700 mb-1">Bank Details</p>
                        <p>A/C: {app.bank_account_number} · IFSC: {app.ifsc_code} · Branch: {app.branch_name}</p>
                        <p>Beneficiary: {app.beneficiary_name}</p>
                      </div>
                    )}

                    {/* Documents submitted by applicant */}
                    <DocList docs={[
                      { label: "Course Certificate",      path: app.doc_certificate },
                      { label: "Fee Receipt",             path: app.doc_fee_receipt },
                      { label: "Mark Sheet",              path: app.doc_marksheet },
                      { label: "ID Proof",                path: app.doc_id_proof },
                      { label: "Board Approval Letter",   path: app.doc_board_approval },
                    ]} />

                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Directorate Decision</p>
                      <div className="flex gap-3">
                        <button onClick={() => openModal(app.id, "APPROVED")}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                          <CheckCircle size={15} /> Approve
                        </button>
                        <button onClick={() => openModal(app.id, "REJECTED")}
                          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
                          <XCircle size={15} /> Reject
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

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h4 className="font-semibold text-gray-800">
              {modal.decision === "APPROVED" ? "Approve" : "Reject"} Claim #{modal.id}
            </h4>
            <p className="text-xs text-gray-500">Directorate — Exam Fee Reimbursement Decision</p>
            {modal.decision === "APPROVED" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approved Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input type="number" min="0" value={approvedAmt}
                    onChange={(e) => setApprovedAmt(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Add remarks..." />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">Cancel</button>
              <button onClick={submitDecision} disabled={saving}
                className={`px-5 py-2 text-sm text-white rounded-lg disabled:opacity-60 ${modal.decision === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}>
                {saving ? "Saving…" : `Confirm ${modal.decision === "APPROVED" ? "Approval" : "Rejection"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrainerFeeReview() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]       = useState(null);
  const [remarks, setRemarks]   = useState("");
  const [approvedAmt, setApprovedAmt] = useState("");
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");


  const INSTITUTE_LABELS = {
    INSTITUTION: "Institution", HOMESTAY: "Home Stay", RESORT: "Resort",
    HOTEL: "Hotel", SCHOOL: "School", COLLEGE: "College",
    YOGA_CENTRE: "Yoga Centre", YOGA_INSTITUTE: "Yoga Institute",
  };

  const load = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get(`${API}/api/admin/trainer-fee/pending`);
      setApps(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (id, decision, claimed) => {
    setModal({ id, decision });
    setRemarks("");
    setApprovedAmt(decision === "APPROVED" ? String(claimed) : "");
  };

  const submitDecision = async () => {
    if (!modal) return;
    if (modal.decision === "APPROVED" && !approvedAmt) return alert("Please enter approved amount.");
    setSaving(true);
    try {
      await axiosInstance.put(`${API}/api/admin/trainer-fee/${modal.id}`, {
        decision: modal.decision, remarks,
        approved_amount: modal.decision === "APPROVED" ? approvedAmt : null,
      });
      setMsg(`Trainer fee claim #${modal.id} ${modal.decision === "APPROVED" ? "approved" : "rejected"}.`);
      setModal(null); setExpanded(null); load();
    } catch (e) { alert(e.response?.data?.message || "Action failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl shadow mb-8">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users size={18} className="text-orange-600" /> Trainer Fee Reimbursement — Institutions
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            3-month claims · ₹250/session · Max 20 sessions/month · Cap ₹5,000/month · Total ₹15,000
          </p>
        </div>
        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
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
          No pending trainer fee reimbursement claims.
        </div>
      ) : (
        <div className="divide-y">
          {apps.map((app) => {
            const open = expanded === app.id;
            return (
              <div key={app.id} className="p-4">
                <button className="w-full flex items-center justify-between text-left"
                  onClick={() => setExpanded(open ? null : app.id)}>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 rounded-full p-2 mt-0.5">
                      <Users size={16} className="text-orange-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{app.institute_name}</p>
                      <p className="text-xs text-gray-500">
                        {INSTITUTE_LABELS[app.institute_type] || app.institute_type}
                        {" · "}{app.month_1_label} – {app.month_3_label}
                        {" · "}{app.applicant_user_name || app.applicant_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Claimed</p>
                      <p className="font-bold text-gray-800 text-sm">{fmt(app.total_claimed_amount)}</p>
                    </div>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {open && (
                  <div className="mt-4 ml-11 space-y-4">
                    {/* Monthly breakdown */}
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500">{app[`month_${n}_label`]}</p>
                          <p className="text-sm font-bold text-gray-800 mt-1">{app[`month_${n}_sessions`]} sessions</p>
                          <p className="text-sm font-semibold text-orange-700">{fmt(app[`month_${n}_amount`])}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      {[
                        ["Trainer", app.trainer_name || "—"],
                        ["Qualification", app.trainer_qualification || "—"],
                        ["Cert. No.", app.trainer_cert_number || "—"],
                        ["Contact Person", app.contact_person || "—"],
                        ["Phone", app.contact_phone || "—"],
                        ["Submitted", new Date(app.created_at).toLocaleDateString("en-IN")],
                      ].map(([lbl, val]) => (
                        <div key={lbl} className="bg-gray-50 rounded-lg p-2.5">
                          <p className="text-xs text-gray-400">{lbl}</p>
                          <p className="font-medium text-xs mt-0.5">{val}</p>
                        </div>
                      ))}
                    </div>

                    {app.bank_account_number && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs">
                        <p className="font-semibold text-blue-700 mb-1">Bank Details</p>
                        <p>A/C: {app.bank_account_number} · IFSC: {app.ifsc_code} · Branch: {app.branch_name}</p>
                        <p>Beneficiary: {app.beneficiary_name}</p>
                      </div>
                    )}

                    {/* Documents submitted by applicant */}
                    <DocList docs={[
                      { label: "Month 1 Attendance Sheet",  path: app.doc_attendance_m1 },
                      { label: "Month 2 Attendance Sheet",  path: app.doc_attendance_m2 },
                      { label: "Month 3 Attendance Sheet",  path: app.doc_attendance_m3 },
                      { label: "Trainer Certificate",       path: app.doc_trainer_certificate },
                      { label: "Others",                    path: app.doc_others },
                    ]} />

                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Directorate Decision</p>
                      <div className="flex gap-3">
                        <button onClick={() => openModal(app.id, "APPROVED", app.total_claimed_amount)}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                          <CheckCircle size={15} /> Approve
                        </button>
                        <button onClick={() => openModal(app.id, "REJECTED", 0)}
                          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
                          <XCircle size={15} /> Reject
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

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h4 className="font-semibold text-gray-800">
              {modal.decision === "APPROVED" ? "Approve" : "Reject"} Trainer Fee Claim #{modal.id}
            </h4>
            <p className="text-xs text-gray-500">Directorate — Trainer Fee Reimbursement Decision</p>
            {modal.decision === "APPROVED" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approved Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input type="number" min="0" max="15000" value={approvedAmt}
                    onChange={(e) => setApprovedAmt(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Maximum: ₹15,000</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Add remarks or conditions..." />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">Cancel</button>
              <button onClick={submitDecision} disabled={saving}
                className={`px-5 py-2 text-sm text-white rounded-lg disabled:opacity-60 ${modal.decision === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}>
                {saving ? "Saving…" : `Confirm ${modal.decision === "APPROVED" ? "Approval" : "Rejection"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Directorate = () => {
  const topCards = [
    {
      title: "Total State Entities",
      value: "2,456",
      desc: "All registered AYUSH entities in the state",
      icon: Building,
      color: "bg-blue-600"
    },
    {
      title: "Pending Approvals",
      value: "89",
      desc: "Applications awaiting directorate approval",
      icon: FileText,
      color: "bg-yellow-500"
    },
    {
      title: "Total Budget Utilized",
      value: "₹8.45 Cr",
      desc: "Of ₹12 Cr allocated budget (70.4%)",
      icon: DollarSign,
      color: "bg-green-500"
    }
  ];

  const actionRequiredItems = [
    "15 district-level incentive reports pending review",
    "NAAC accreditation renewal for 3 colleges due next month",
    "Annual compliance audit scheduled for next week"
  ];

  const districtStats = [
    {
      district: "North District",
      entities: 456,
      incentives: "₹45,00,000",
      pending: 23,
      officer: "Rajesh Kumar"
    },
    {
      district: "South District",
      entities: 389,
      incentives: "₹38,50,000",
      pending: 18,
      officer: "Meera Patel"
    },
    {
      district: "East District",
      entities: 512,
      incentives: "₹52,00,000",
      pending: 31,
      officer: "Anand Sharma"
    },
    {
      district: "West District",
      entities: 423,
      incentives: "₹42,30,000",
      pending: 17,
      officer: "Lakshmi Raman"
    },
    {
      district: "Central District",
      entities: 676,
      incentives: "₹67,60,000",
      pending: 0,
      officer: "Abdul Khan"
    }
  ];

  const incentiveSchemes = [
    {
      scheme: "Yoga Professional Registration",
      totalApplications: 856,
      approved: 812,
      amount: "₹4,06,00,000",
      utilization: "85%"
    },
    {
      scheme: "Centre Infrastructure Development",
      totalApplications: 234,
      approved: 198,
      amount: "₹9,90,00,000",
      utilization: "82.5%"
    },
    {
      scheme: "NAAC Accreditation Incentive",
      totalApplications: 45,
      approved: 42,
      amount: "₹2,10,00,000",
      utilization: "93.3%"
    },
    {
      scheme: "Research & Development Grant",
      totalApplications: 67,
      approved: 58,
      amount: "₹2,90,00,000",
      utilization: "86.6%"
    }
  ];

  const pendingApprovals = [
    {
      type: "College Accreditation",
      name: "Government AYUSH Medical College",
      district: "North District",
      submittedDate: "2025-11-10",
      priority: "High"
    },
    {
      type: "Large Incentive",
      name: "Sunrise Yoga Centre",
      district: "South District",
      submittedDate: "2025-11-12",
      priority: "Medium"
    },
    {
      type: "Policy Exception",
      name: "Harmony Wellness Centre",
      district: "East District",
      submittedDate: "2025-11-14",
      priority: "Low"
    }
  ];

  const complianceReports = [
    {
      type: "Annual Compliance",
      dueDate: "2025-12-31",
      submitted: 234,
      pending: 89,
      status: "On Track"
    },
    {
      type: "Quarterly Audit",
      dueDate: "2025-11-30",
      submitted: 456,
      pending: 23,
      status: "Critical"
    },
    {
      type: "Financial Audit",
      dueDate: "2025-12-15",
      submitted: 123,
      pending: 45,
      status: "On Track"
    }
  ];

  const budgetBreakdown = [
    {
      category: "Professional Incentives",
      allocated: "₹4.00 Cr",
      utilized: "₹3.45 Cr",
      percentage: 86.3
    },
    {
      category: "Centre Infrastructure",
      allocated: "₹3.50 Cr",
      utilized: "₹2.80 Cr",
      percentage: 80.0
    },
    {
      category: "College Accreditation",
      allocated: "₹2.00 Cr",
      utilized: "₹1.20 Cr",
      percentage: 60.0
    },
    {
      category: "Research & Development",
      allocated: "₹1.50 Cr",
      utilized: "₹0.80 Cr",
      percentage: 53.3
    },
    {
      category: "Administrative",
      allocated: "₹1.00 Cr",
      utilized: "₹0.20 Cr",
      percentage: 20.0
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome Back, Directorate Officer!
        </h1>
        <p className="text-gray-500">State AYUSH Directorate Dashboard</p>
      </div>

      {/* Trainer Fee Reimbursement Review */}
      <TrainerFeeReview />

      {/* NABH Accreditation Fee Reimbursement Review */}
      <NABHReimbursementReview />

      {/* NAAC Reimbursement Review */}
      <NAACReimbursementReview />

      {/* Exam Fee Reimbursement Review */}
      <ExamFeeReimbursementReview />

      {/* Research Grant Review */}
      <ResearchGrantReview />

      {/* Yoga TC Directorate Review */}
      <YogaTCDirectorateReview />

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
                Review Reports
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* District-wise Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">District-wise Statistics</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">District</th>
                <th className="text-left px-4 py-2">Total Entities</th>
                <th className="text-left px-4 py-2">Incentives Disbursed</th>
                <th className="text-left px-4 py-2">Pending</th>
                <th className="text-left px-4 py-2">District Officer</th>
              </tr>
            </thead>
            <tbody>
              {districtStats.map((district, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{district.district}</td>
                  <td className="px-4 py-2">{district.entities}</td>
                  <td className="px-4 py-2">{district.incentives}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      district.pending === 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {district.pending}
                    </span>
                  </td>
                  <td className="px-4 py-2">{district.officer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incentive Schemes Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Incentive Schemes Overview</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Scheme Name</th>
                <th className="text-left px-4 py-2">Total Applications</th>
                <th className="text-left px-4 py-2">Approved</th>
                <th className="text-left px-4 py-2">Total Amount</th>
                <th className="text-left px-4 py-2">Budget Utilization</th>
              </tr>
            </thead>
            <tbody>
              {incentiveSchemes.map((scheme, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{scheme.scheme}</td>
                  <td className="px-4 py-2">{scheme.totalApplications}</td>
                  <td className="px-4 py-2">{scheme.approved}</td>
                  <td className="px-4 py-2">{scheme.amount}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${scheme.utilization}` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{scheme.utilization}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Directorate Approvals */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Directorate Approvals</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">District</th>
                <th className="text-left px-4 py-2">Submitted Date</th>
                <th className="text-left px-4 py-2">Priority</th>
                <th className="text-left px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{item.type}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.district}</td>
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

      {/* Budget Utilization */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Utilization</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Category</th>
                <th className="text-left px-4 py-2">Allocated</th>
                <th className="text-left px-4 py-2">Utilized</th>
                <th className="text-left px-4 py-2">Utilization %</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {budgetBreakdown.map((budget, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{budget.category}</td>
                  <td className="px-4 py-2">{budget.allocated}</td>
                  <td className="px-4 py-2">{budget.utilized}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            budget.percentage >= 80 
                              ? 'bg-green-500' 
                              : budget.percentage >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${budget.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{budget.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      budget.percentage >= 80 
                        ? 'bg-green-100 text-green-700' 
                        : budget.percentage >= 50
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {budget.percentage >= 80 ? 'Good' : budget.percentage >= 50 ? 'Moderate' : 'Low'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Reports */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Compliance Reports Status</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Report Type</th>
                <th className="text-left px-4 py-2">Due Date</th>
                <th className="text-left px-4 py-2">Submitted</th>
                <th className="text-left px-4 py-2">Pending</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {complianceReports.map((report, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{report.type}</td>
                  <td className="px-4 py-2">{report.dueDate}</td>
                  <td className="px-4 py-2">{report.submitted}</td>
                  <td className="px-4 py-2">{report.pending}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      report.status === 'On Track' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {report.status}
                    </span>
                  </td>
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
          Approve Incentives
        </button>
        <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
          <BarChart3 className="mr-2" size={16} />
          Generate Reports
        </button>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm flex items-center">
          <Award className="mr-2" size={16} />
          Manage Schemes
        </button>
      </div>
    </div>
  );
};

export default Directorate;