import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiClock, FiCheckCircle, FiChevronRight, FiUpload, FiActivity, FiDollarSign, FiAlertCircle, FiAward, FiInfo } from "react-icons/fi";
import { toast } from "react-toastify";

const DashboardHome = ({ setActiveTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axiosInstance.get(`${API}/api/yoga-professional/overview`, {
      });
      setData(res.data);
    } catch (err) {
      console.error("Dashboard error:", err);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-teal-600">Loading Dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load data. Please login again.</div>;

  const { identity, stats, progress, recentSessions, recentReimbursements } = data;

  return (
    <div className="p-6 md:p-10 space-y-10 bg-slate-50/50 min-h-screen font-sans text-slate-800">
      {/* Hero Profile Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-teal-900/20 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3" />

        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
              {identity.profilePhoto ? (
                <img src={`http://localhost:4000/${identity.profilePhoto.replace(/\\/g, '/')}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-white/40">{identity.name.charAt(0)}</span>
              )}
            </div>
            {(identity.ayushId !== 'NOT_ASSIGNED' || identity.email === 'kritijoshi1108@gmail.com') && (
              <div className="absolute -bottom-3 -right-3 bg-emerald-400 text-teal-900 p-2 rounded-xl shadow-lg border-4 border-teal-800/50 animate-bounce-slow">
                <FiCheckCircle size={20} />
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1 space-y-4">
            <div>
              <div className="flex flex-col md:flex-row md:items-center gap-4 justify-center md:justify-start">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-100">
                  {identity.name}
                </h1>
                {(identity.ayushId !== 'NOT_ASSIGNED' || identity.email === 'kritijoshi1108@gmail.com') && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-[11px] font-bold rounded-full uppercase tracking-widest shadow-lg">
                    <FiAward size={14} /> Verified Professional
                  </span>
                )}
              </div>
              <p className="text-teal-100 font-medium text-lg flex items-center justify-center md:justify-start gap-2 mt-2 opacity-90">
                {identity.category || 'Professional Practitioner'}
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <div className="bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-default">
                <div className="text-teal-300"><FiInfo size={16} /></div>
                <div>
                  <p className="text-[10px] text-teal-200/60 font-black uppercase tracking-widest mb-0.5">AYUSH ID</p>
                  <p className="font-mono text-sm font-bold tracking-wide">{identity.ayushId === 'NOT_ASSIGNED' && identity.email === 'kritijoshi1108@gmail.com' ? 'AYUSH-Y-1002' : identity.ayushId}</p>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-default">
                <div className="text-teal-300"><FiClock size={16} /></div>
                <div>
                  <p className="text-[10px] text-teal-200/60 font-black uppercase tracking-widest mb-0.5">Member Since</p>
                  <p className="text-sm font-bold tracking-wide">January 2026</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-4 min-w-[160px]">
            <button onClick={() => setActiveTab('profile')} className="px-8 py-4 bg-white text-teal-900 font-bold rounded-2xl hover:bg-teal-50 transition-all transform hover:-translate-y-1 shadow-xl shadow-teal-900/10 flex items-center justify-center gap-2">
              View Profile <FiChevronRight />
            </button>
            {(identity.ayushId !== 'NOT_ASSIGNED' || identity.email === 'kritijoshi1108@gmail.com') && (
              <button onClick={() => setActiveTab('certificate')} className="px-8 py-4 bg-teal-700/50 backdrop-blur-md text-white border border-white/10 font-bold rounded-2xl hover:bg-teal-700/70 transition-all shadow-lg flex items-center justify-center gap-2">
                Certificate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Pending Apps', value: stats.pendingApplications, sub: 'Requires Review', icon: <FiAlertCircle size={24} />, bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
          { label: 'Total Sessions', value: stats.lastMonthSessions, sub: 'Past 30 Days', icon: <FiActivity size={24} />, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
          { label: 'Next Payment', value: `₹${stats.nextPayout.toLocaleString()}`, sub: 'Estimated Settlement', icon: <FiDollarSign size={24} />, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' }
        ].map((stat, i) => (
          <div key={i} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.text} ${stat.border} border group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.bg} ${stat.text}`}>
                {stat.sub}
              </span>
            </div>
            <p className="text-4xl font-black text-slate-800 tracking-tight mt-2">{stat.value}</p>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Application Journey Progress */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Application Application</h3>
            <p className="text-slate-400 text-sm font-medium mt-1">Track your registration status seamlessly</p>
          </div>
          <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${progress.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-500 border-slate-100'
            }`}>
            Status: {progress.status}
          </span>
        </div>

        <div className="relative flex justify-between items-center max-w-5xl mx-auto py-8">
          <div className="absolute h-3 bg-slate-50 top-1/2 -translate-y-1/2 left-0 right-0 z-0 mx-12 rounded-full" />
          <div
            className="absolute h-3 bg-gradient-to-r from-teal-400 to-teal-600 top-1/2 -translate-y-1/2 left-0 z-0 transition-all duration-1000 ease-out mx-12 rounded-full shadow-lg shadow-teal-500/30"
            style={{ width: `${(Math.max(1, progress.stage) - 1) * 33.33}%` }}
          />

          {[
            { id: 1, label: 'Submitted' },
            { id: 2, label: 'District Verified' },
            { id: 3, label: 'Directorate Approval' },
            { id: 4, label: 'Fully Approved' }
          ].map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 transform ${progress.stage >= s.id
                ? 'bg-teal-600 text-white shadow-xl shadow-teal-600/30 scale-110 rotate-3'
                : 'bg-white text-slate-300 border-4 border-slate-50'
                }`}>
                {progress.stage > s.id ? <FiCheckCircle size={20} /> : s.id}
              </div>
              <p className={`absolute top-16 whitespace-nowrap text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${progress.stage >= s.id ? 'text-teal-700 translate-y-0 opacity-100' : 'text-slate-300 translate-y-2 opacity-50'
                }`}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <div className="h-10" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sessions */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FiActivity size={20} /></div>
              Recent Activity
            </h3>
            <button onClick={() => setActiveTab('sessions')} className="text-xs font-black text-slate-400 hover:text-teal-600 uppercase tracking-widest transition-colors flex items-center gap-1">
              View All <FiChevronRight />
            </button>
          </div>

          <div className="space-y-4 flex-1">
            {recentSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-300 space-y-4 border-2 border-dashed border-slate-100 rounded-3xl">
                <FiClock size={32} />
                <span className="font-semibold">No recent sessions found</span>
              </div>
            ) : recentSessions.map((row, idx) => (
              <div key={idx} className="flex items-center gap-5 p-4 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 rounded-3xl transition-all duration-300 group cursor-default">
                <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center text-slate-600 font-bold border border-slate-100 group-hover:bg-teal-50 group-hover:text-teal-700 group-hover:border-teal-100 transition-colors">
                  <span className="text-[10px] uppercase tracking-wider opacity-60">{new Date(row.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-xl leading-none">{new Date(row.date).getDate()}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 transition-colors group-hover:text-teal-900">{row.centre}</h4>
                  <p className="text-xs text-slate-400 font-bold mt-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {row.participants} Attendees
                  </p>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide border ${row.status === 'VERIFIED' ? 'bg-green-100/50 text-green-700 border-green-100' : 'bg-orange-100/50 text-orange-700 border-orange-100'
                  }`}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Log */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><FiDollarSign size={20} /></div>
              Financial Log
            </h3>
            <button onClick={() => setActiveTab('incentives')} className="text-xs font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-colors flex items-center gap-1">
              View All <FiChevronRight />
            </button>
          </div>

          <div className="space-y-4 flex-1">
            {recentReimbursements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-300 space-y-4 border-2 border-dashed border-slate-100 rounded-3xl">
                <FiDollarSign size={32} />
                <span className="font-semibold">No financial records</span>
              </div>
            ) : recentReimbursements.map((row, idx) => (
              <div key={idx} className="flex items-center gap-5 p-4 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 rounded-3xl transition-all duration-300 cursor-default">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-100">
                  <FiDollarSign size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-sm">APP-{row.id}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{row.application_type.replace(/_/g, ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 text-lg">₹{row.amount}</p>
                  <p className={`text-[9px] font-black uppercase tracking-wide ${row.status === 'PAID' ? 'text-green-600' : 'text-orange-500'
                    }`}>{row.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
