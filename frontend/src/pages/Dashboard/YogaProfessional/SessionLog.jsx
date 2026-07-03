import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiCalendar, FiClock, FiUsers, FiMapPin, FiCamera, FiPlus, FiCheckCircle, FiInfo, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

const SessionLog = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [formData, setFormData] = useState({
    sessionDate: new Date().toISOString().split('T')[0],
    sessionTime: new Date().toTimeString().slice(0, 5),
    participantsCount: "",
    addressDisplay: "",
    geotagLocation: null,
    sessionPhoto: null
  });

  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchSessions();
    getGeoLocation();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axiosInstance.get(`${API}/api/yoga-professional/sessions`, {
      });
      setSessions(res.data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      toast.error("Failed to load session history.");
    } finally {
      setLoading(false);
    }
  };

  const getGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = `${position.coords.latitude}, ${position.coords.longitude}`;
          setFormData(prev => ({ ...prev, geotagLocation: loc }));
        },
        (error) => {
          console.warn("Geolocation permission denied:", error.message);
        }
      );
    }
  };

  const handleLogSession = async (e) => {
    e.preventDefault();
    if (!formData.sessionPhoto) return toast.error("Please upload a photo proof of the session");

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    try {
      await axiosInstance.post(`${API}/api/yoga-professional/session`, data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      toast.success("Session logged successfully!");
      setShowLogForm(false);
      fetchSessions();
    } catch (err) {
      toast.error("Logging failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm("Are you sure you want to remove this session record? This action cannot be undone.")) return;

    try {
      await axiosInstance.delete(`/api/yoga-professional/session/${id}`, {
      });
      toast.success("Record deleted");
      setSessions(sessions.filter(s => s.id !== id));
      setSelectedSession(null);
    } catch (err) {
      toast.error("Failed to delete record");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 font-medium">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mb-4"></div>
      <p>Synchronizing activity logs...</p>
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto bg-[#F8FAFC] min-h-screen">
      {/* Refined Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Yoga Activity Tracker</h1>
          <p className="text-slate-400 font-medium text-sm mt-1">Official register for training contributions & verification</p>
        </div>
        {!showLogForm && (
          <button
            onClick={() => setShowLogForm(true)}
            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center gap-2"
          >
            <FiPlus size={18} /> New Entry
          </button>
        )}
      </div>

      {showLogForm && (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-200/60 animate-in fade-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-800">New Session Record</h2>
            <button onClick={() => setShowLogForm(false)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition">✕</button>
          </div>

          <form onSubmit={handleLogSession} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Date</label>
                  <input type="date" required value={formData.sessionDate} className="w-full mt-1.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none transition font-medium" onChange={e => setFormData({ ...formData, sessionDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Time</label>
                  <input type="time" required value={formData.sessionTime} className="w-full mt-1.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none transition font-medium" onChange={e => setFormData({ ...formData, sessionTime: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Participants</label>
                <div className="relative">
                  <FiUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="number" required placeholder="Attendee count" className="w-full mt-1.5 p-3.5 pl-12 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none transition font-medium" onChange={e => setFormData({ ...formData, participantsCount: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Venue Name</label>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="text" required placeholder="e.g. Wellness Centre" className="w-full mt-1.5 p-3.5 pl-12 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none transition font-medium" onChange={e => setFormData({ ...formData, addressDisplay: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Visual Proof</label>
                <div className="mt-1.5 border-2 border-dashed border-slate-100 rounded-[2rem] p-8 text-center flex flex-col items-center justify-center bg-slate-50 hover:bg-teal-50/20 transition-all cursor-pointer relative min-h-[180px]">
                  {formData.sessionPhoto ? (
                    <div className="flex flex-col items-center">
                      <FiCheckCircle className="text-teal-500 text-3xl mb-2" />
                      <p className="text-xs font-bold text-slate-700">{formData.sessionPhoto.name}</p>
                    </div>
                  ) : (
                    <>
                      <FiCamera className="text-3xl text-slate-300 mb-3" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload training photo</p>
                    </>
                  )}
                  <input type="file" required accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFormData({ ...formData, sessionPhoto: e.target.files[0] })} />
                </div>
              </div>

              <div className="p-5 bg-teal-50/30 rounded-2xl border border-teal-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-teal-600 border border-teal-50">
                  <FiMapPin size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-teal-700 uppercase tracking-widest">Geotag Engine</p>
                  <p className="text-xs font-semibold text-slate-500">{formData.geotagLocation || "Locating coordinates..."}</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-4 mt-4 pt-6 border-t border-slate-50">
              <button type="button" onClick={() => setShowLogForm(false)} className="px-8 py-3.5 text-slate-400 font-bold text-sm hover:text-slate-600 transition">Discard</button>
              <button type="submit" className="px-10 py-3.5 bg-slate-900 text-white font-bold rounded-2xl shadow-lg shadow-slate-200 transform hover:scale-[1.02] transition active:scale-95">Record Session</button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {sessions.length === 0 ? (
          <div className="md:col-span-3 bg-white p-20 text-center rounded-[2.5rem] border border-slate-200/60 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <FiCalendar size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No records found</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">Start logging your training sessions to build your verified activity history.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-[1.8rem] shadow-sm border border-slate-200/60 overflow-hidden group transition-all hover:border-slate-300">
              <div className="relative h-44">
                {session.photo_proof_path ? (
                  <img src={`http://localhost:4000/${session.photo_proof_path.replace(/\\/g, '/')}`} alt="Proof" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 italic text-xs">No visual captured</div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-bold text-teal-600 shadow-sm border border-white uppercase tracking-wider">
                  {session.status}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all border border-white"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{new Date(session.session_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</h3>
                    <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">{session.session_time}</p>
                  </div>
                  <div className="bg-slate-50 px-2.5 py-1 rounded-lg text-slate-600 font-bold text-xs border border-slate-100">
                    {session.participants_count} <span className="opacity-40 ml-0.5">Attendees</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                  <FiMapPin className="text-teal-500 mt-0.5" />
                  <span className="line-clamp-1 font-medium italic">{session.address_display}</span>
                </div>

                <button
                  onClick={() => setSelectedSession(session)}
                  className="w-full py-3 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-xs"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modern Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="h-60 relative">
              <img src={`http://localhost:4000/${selectedSession.photo_proof_path.replace(/\\/g, '/')}`} alt="Proof" className="w-full h-full object-cover" />
              <button onClick={() => setSelectedSession(null)} className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-white text-white hover:text-red-500 rounded-full backdrop-blur-md transition">✕</button>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Activity Log Record</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1">ID: SES-{selectedSession.id}</p>
                </div>
                <span className="px-4 py-1.5 bg-teal-50 text-teal-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-teal-100">
                  {selectedSession.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Date</p>
                  <p className="font-bold text-slate-800">{new Date(selectedSession.session_date).toLocaleDateString()}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Time</p>
                  <p className="font-bold text-slate-800">{selectedSession.session_time}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Attendees</p>
                  <p className="font-bold text-slate-800">{selectedSession.participants_count}</p>
                </div>
              </div>

              <div className="p-6 bg-[#F8FAFC] rounded-2xl border border-slate-200/60 flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200/60 flex items-center justify-center text-teal-600">
                  <FiMapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Venue & Coordinates</p>
                  <p className="text-slate-700 font-medium text-sm leading-relaxed">{selectedSession.address_display}</p>
                  <code className="text-[10px] text-teal-600 font-bold block mt-1">{selectedSession.geotag_location}</code>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-50">
                <button
                  onClick={() => handleDeleteSession(selectedSession.id)}
                  className="px-6 py-3.5 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition text-sm flex items-center gap-2"
                >
                  <FiTrash2 /> Delete Record
                </button>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="flex-1 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionLog;
