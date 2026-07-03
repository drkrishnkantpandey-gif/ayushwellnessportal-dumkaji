import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ExternalLink, Loader2, X } from "lucide-react";
import wellnessService from "../../../services/wellnessService";

const WellnessPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    programName: '',
    description: '',
    duration: '',
    fees: '',
    status: 'ACTIVE'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await wellnessService.getPrograms();
      if (res.success) {
        setPrograms(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch programs:", err);
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
      let res;
      if (editMode) {
        res = await wellnessService.updateProgram(currentId, formData);
      } else {
        res = await wellnessService.addProgram(formData);
      }

      if (res.success) {
        setShowModal(false);
        setEditMode(false);
        setFormData({ programName: '', description: '', duration: '', fees: '', status: 'ACTIVE' });
        fetchData();
      }
    } catch (err) {
      alert(`Failed to ${editMode ? 'update' : 'create'} program`);
    }
  };

  const handleEdit = (program) => {
    setEditMode(true);
    setCurrentId(program.id);
    setFormData({
      programName: program.name,
      description: program.description,
      duration: program.duration,
      fees: program.fees,
      status: program.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this program?")) {
      try {
        const res = await wellnessService.deleteProgram(id);
        if (res.success) {
          fetchData();
        }
      } catch (err) {
        alert("Failed to delete program");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-blue-100 text-blue-700';
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
          <h1 className="text-2xl font-bold text-gray-800">Wellness Programs & Packages</h1>
          <p className="text-gray-500">Manage your wellness offerings</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
        >
          <Plus className="mr-2" size={16} />
          Create New Program
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Programs</p>
          <p className="text-2xl font-bold text-gray-900">{programs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Active Programs</p>
          <p className="text-2xl font-bold text-green-600">
            {programs.filter(p => p.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Avg. Fees</p>
          <p className="text-2xl font-bold text-blue-600">
            ₹{programs.length > 0 ? (programs.reduce((acc, p) => acc + parseFloat(p.fees || 0), 0) / programs.length).toFixed(0) : 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Global Participants</p>
          <p className="text-2xl font-bold text-purple-600">
            {programs.reduce((acc, p) => acc + (p.participants_count || 0), 0)}
          </p>
        </div>
      </div>

      {/* Programs Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3">Program Name</th>
              <th className="text-left px-4 py-3">Duration</th>
              <th className="text-left px-4 py-3">Fees</th>
              <th className="text-left px-4 py-3">Participants</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((program) => (
              <tr key={program.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  <div>{program.name}</div>
                  <div className="text-xs text-gray-400 font-normal">{program.description?.substring(0, 50)}...</div>
                </td>
                <td className="px-4 py-3">{program.duration}</td>
                <td className="px-4 py-3 font-semibold">₹{parseFloat(program.fees).toLocaleString()}</td>
                <td className="px-4 py-3">{program.participants_count}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(program.status)}`}>
                    {program.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-4">
                    <button onClick={() => handleEdit(program)} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(program.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {programs.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-gray-500 font-medium">No programs found. Start by creating one!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Creating Program */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-purple-50">
              <h2 className="text-xl font-bold text-gray-800">{editMode ? 'Edit Program' : 'Create New Program'}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  setFormData({ programName: '', description: '', duration: '', fees: '', status: 'ACTIVE' });
                }}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Program Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.programName}
                  onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                  placeholder="e.g. Stress Management Workshop"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief details about the program..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 3 Months"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fees (₹)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.fees}
                    onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="UPCOMING">Upcoming</option>
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all shadow-md active:scale-95">
                  {editMode ? 'Update Program' : 'Save Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessPrograms;