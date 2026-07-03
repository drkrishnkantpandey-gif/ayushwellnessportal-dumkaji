import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiFileText, FiClock, FiCheckCircle, FiAlertCircle, FiEye, FiActivity } from "react-icons/fi";
import { toast } from "react-toastify";

const MyApplications = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {

      // We fetch both profile status and reimbursements to show as "Applications"
      const [profileRes, reimbRes] = await Promise.all([
        axiosInstance.get(`${API}/api/yoga-professional/profile`, {
        }),
        axiosInstance.get(`${API}/api/yoga-professional/reimbursements`, {
        })
      ]);

      const apps = [];

      // Add profile registration as an application
      apps.push({
        id: "REG-" + (profileRes.data.ayush_id || "PROVISIONAL"),
        type: "Yoga Professional Registration",
        status: profileRes.data.approval_status,
        submittedDate: new Date(profileRes.data.created_at || Date.now()).toLocaleDateString(),
        lastUpdate: "System Processed",
        isProfile: true,
        details: {
          name: profileRes.data.full_name,
          email: profileRes.data.email,
          category: profileRes.data.teaching_category,
          ayushId: profileRes.data.ayush_id || "Assignment Pending"
        }
      });

      // Add reimbursements
      reimbRes.data.forEach(r => {
        apps.push({
          id: "REIMB-" + r.id,
          type: r.application_type.replace(/_/g, ' '),
          status: r.status,
          submittedDate: new Date(r.created_at).toLocaleDateString(),
          lastUpdate: new Date(r.updated_at).toLocaleDateString(),
          amount: "₹" + r.amount,
          isProfile: false,
          details: {
            amount: r.amount,
            type: r.application_type,
            notes: r.description || "Incentive application for yoga sessions"
          }
        });
      });

      setApplications(apps);
    } catch (err) {
      console.error("Error fetching applications:", err);
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Synchronizing application records...</div>;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto bg-[#F8FAFC] min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Application Tracker</h1>
          <p className="text-slate-400 font-medium mt-1">Monitor the lifecycle of your portal submissions</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Submissions</span>
          <span className="text-2xl font-bold text-slate-800">{applications.length}</span>
        </div>
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="bg-white p-16 text-center rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiFileText className="text-slate-300 text-2xl" />
            </div>
            <p className="text-slate-400 font-semibold">No active applications detected</p>
            <p className="text-slate-300 text-xs mt-1">Your submissions will appear here for tracking</p>
          </div>
        ) : (
          applications.map((app, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[1.5rem] border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-slate-300 transition-all group">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                    <FiFileText size={18} />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base uppercase tracking-tight">{app.id}</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">{app.type}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-5 text-[11px] font-semibold text-slate-400 pl-1">
                  <span className="flex items-center gap-1.5"><FiClock className="text-slate-300" /> Submitted: <span className="text-slate-600">{app.submittedDate}</span></span>
                  <span className="flex items-center gap-1.5"><FiActivity className="text-slate-300" /> Track: <span className="text-slate-600">{app.lastUpdate}</span></span>
                  {app.amount && <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg border border-emerald-100 font-bold">{app.amount}</span>}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-none pt-4 md:pt-0">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${app.status === 'APPROVED' || app.status === 'PAID' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                  app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                    'bg-slate-50 text-slate-600 border-slate-100'
                  }`}>
                  {app.status}
                </span>
                <button
                  onClick={() => setSelectedApp(app)}
                  className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-xs font-bold ml-auto md:ml-0"
                >
                  Details <FiEye size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Subtle Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white animate-in fade-in zoom-in duration-300">
            <div className="p-8 text-center relative border-b border-slate-50 bg-[#F8FAFC]">
              <button
                onClick={() => setSelectedApp(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition"
              >
                <FiEye className="rotate-180" />
              </button>
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
                <FiFileText className="text-teal-500 text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Application Overview</h2>
              <p className="text-slate-400 font-medium text-sm mt-1">{selectedApp.id}</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                  <p className="text-slate-800 font-bold">{selectedApp.status}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Submission Date</p>
                  <p className="text-slate-800 font-bold">{selectedApp.submittedDate}</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm font-semibold text-slate-500">Service Type</span>
                  <span className="text-sm font-bold text-slate-800">{selectedApp.type}</span>
                </div>
                {selectedApp.isProfile ? (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-sm font-semibold text-slate-500">AYUSH ID</span>
                      <span className="text-sm font-bold text-teal-600">{selectedApp.details.ayushId}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-sm font-semibold text-slate-500">Specialization</span>
                      <span className="text-sm font-bold text-slate-800">{selectedApp.details.category}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-sm font-semibold text-slate-500">Claim Amount</span>
                      <span className="text-sm font-bold text-emerald-600">{selectedApp.amount}</span>
                    </div>
                    <div className="py-2">
                      <span className="text-sm font-semibold text-slate-500 block mb-2">Claim Notes</span>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedApp.details.notes}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-8 bg-slate-50 flex gap-4">
              <button
                onClick={() => setSelectedApp(null)}
                className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition shadow-lg shadow-slate-200"
              >
                Close Overview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
