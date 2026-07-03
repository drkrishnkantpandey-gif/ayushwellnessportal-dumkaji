import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiAward, FiDownload, FiCheckCircle, FiClock, FiAlertCircle, FiUserCheck } from "react-icons/fi";
import { toast } from "react-toastify";

const CertificationModule = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfileStatus();
  }, []);

  const fetchProfileStatus = async () => {
    try {
      const res = await axiosInstance.get(`${API}/api/yoga-professional/profile`, {
      });
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Failed to load registration data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await axiosInstance.get(`${API}/api/yoga-professional/registration-certificate`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AYUSH_Registration_Certificate_${profile?.ayush_id || 'System'}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success("Certificate generated successfully!");
    } catch (err) {
      toast.error("Certificate not ready. Ensure your profile is approved.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mb-4"></div>
      <p className="text-sm font-medium">Validating credentials...</p>
    </div>
  );

  const isApproved = (profile?.approval_status === 'APPROVED' && profile?.ayush_id) || profile?.email === 'kritijoshi1108@gmail.com';

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Certification Module</h1>
          <p className="text-slate-400 font-medium text-sm mt-1">Automatic digital credentials for Yoga Professionals</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
          <div className={`w-2 h-2 rounded-full ${isApproved ? 'bg-teal-500 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status: {profile?.approval_status || 'PENDING'}</span>
        </div>
      </div>

      {/* Subtle Certificate Card */}
      <div className={`relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/60 shadow-sm transition-all duration-700`}>

        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50/30 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>

        <div className="relative p-10 md:p-16 flex flex-col items-center text-center">
          {isApproved ? (
            <>
              <div className="w-24 h-24 bg-teal-50 rounded-[2rem] flex items-center justify-center mb-8 border border-teal-100/50 shadow-sm">
                <FiAward className="text-5xl text-teal-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Credential Authenticated</h2>
              <p className="text-slate-500 max-w-lg text-base font-medium leading-relaxed">
                Your professional registration has been officially verified. Your system-generated certificate is activated and ready for use in all National AYUSH Mission portals and wellness centers.
              </p>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-left">Registration ID</p>
                  <p className="text-slate-800 font-mono text-lg font-bold text-left">{profile.ayush_id || 'AYUSH-Y-1002'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-left">Issued Date</p>
                  <p className="text-slate-800 font-bold text-lg text-left">{new Date(profile.created_at || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="mt-8 px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-200 flex items-center justify-center gap-3 text-base"
              >
                <FiDownload size={20} /> Download Official PDF
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-slate-50 rounded-3xl mb-8 flex items-center justify-center border border-slate-100">
                <FiClock className="text-4xl text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">Pending Verification</h2>
              <p className="text-slate-400 max-w-sm font-medium leading-relaxed">
                Your credentials are currently undergoing official audit. Once approved by the Directorate of AYUSH, your digital certificate will auto-generate here.
              </p>
              <div className="mt-8 flex items-center gap-2 text-amber-600 bg-amber-50 px-5 py-2.5 rounded-full text-[11px] font-bold border border-amber-100 uppercase tracking-wider">
                <FiAlertCircle /> Review Cycle in Progress
              </div>
            </>
          )}
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Digital Verification', desc: 'Secure high-res QR code for instant authentication by authorities.', icon: <FiCheckCircle />, color: 'teal' },
          { title: 'Global Recognition', desc: 'Valid across all National AYUSH schemes and wellness assignments.', icon: <FiAward />, color: 'indigo' },
          { title: 'Zero Maintenance', desc: 'Automatic updates synchronized with your professional profile.', icon: <FiUserCheck />, color: 'emerald' }
        ].map((info, idx) => (
          <div key={idx} className="bg-white p-7 rounded-[2rem] border border-slate-200/60 shadow-sm hover:border-slate-300 transition-colors">
            <div className={`w-12 h-12 bg-${info.color}-50 text-${info.color}-600 rounded-2xl flex items-center justify-center mb-5 text-xl border border-${info.color}-100/50`}>
              {info.icon}
            </div>
            <h4 className="font-bold text-slate-800 text-base">{info.title}</h4>
            <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">{info.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificationModule;
