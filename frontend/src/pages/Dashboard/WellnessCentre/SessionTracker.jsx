import React, { useState, useEffect } from "react";
import { Plus, Filter, Edit, Eye, Calendar, Users, Loader2, X, Trash2 } from "lucide-react";
import wellnessService from "../../../services/wellnessService";

const SessionTracker = () => {
  const [sessions, setSessions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    programId: '',
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    numberOfParticipants: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessRes, progRes, staffRes] = await Promise.all([
        wellnessService.getSessions(),
        wellnessService.getPrograms(),
        wellnessService.getStaff()
      ]);

      if (sessRes.success) setSessions(sessRes.data);
      if (progRes.success) setPrograms(progRes.data);
      if (staffRes.success) setStaff(staffRes.data);

    } catch (err) {
      console.error("Failed to fetch session data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await wellnessService.addSession(formData);
      if (res.success) {
        setShowModal(false);
        setFormData({
          programId: '',
          staffId: '',
          date: new Date().toISOString().split('T')[0],
          numberOfParticipants: 0
        });
        fetchData();
      }
    } catch (err) {
      alert("Failed to track session");
    }
  };

  const handleRemove = async (id) => {
    if (window.confirm("Are you sure you want to delete this session record?")) {
      try {
        const res = await wellnessService.deleteSession(id);
        if (res.success) {
          fetchData();
        }
      } catch (err) {
        alert("Failed to delete session");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Session Tracker</h1>
          <p className="text-gray-500">Track and manage all wellness sessions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
        >
          <Plus className="mr-2" size={16} />
          Add New Session
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
            </div>
            <Calendar className="text-purple-500" size={32} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">
                {sessions.length}
              </p>
            </div>
            <div className="text-green-500 text-2xl font-bold">✓</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Programs</p>
              <p className="text-2xl font-bold text-yellow-600">{programs.length}</p>
            </div>
            <div className="text-yellow-500 text-2xl">⏳</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-blue-600">
                {sessions.reduce((sum, s) => sum + (s.participants_count || 0), 0)}
              </p>
            </div>
            <Users className="text-blue-500" size={32} />
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Program</th>
              <th className="text-left px-4 py-3">Staff / Therapist</th>
              <th className="text-left px-4 py-3">Participants</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{new Date(session.session_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-medium">{session.program_name}</td>
                <td className="px-4 py-3">{session.staff_name}</td>
                <td className="px-4 py-3 font-semibold">{session.participants_count}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    Recorded
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 p-1"><Eye size={16} /></button>
                    <button onClick={() => handleRemove(session.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-gray-500 font-medium">No sessions tracked yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Adding Session */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-purple-50">
              <h2 className="text-xl font-bold text-gray-800">Track Session</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 transition">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Program</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.programId}
                  onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                >
                  <option value="">-- Select Program --</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Staff / Therapist</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                >
                  <option value="">-- Select Staff --</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Participants</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.numberOfParticipants}
                    onChange={(e) => setFormData({ ...formData, numberOfParticipants: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all shadow-md active:scale-95">
                  Record Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionTracker;