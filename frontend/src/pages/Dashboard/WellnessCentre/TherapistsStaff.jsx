import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, UserCheck, AlertCircle, Award, Calendar, Loader2, X, Phone, Mail } from "lucide-react";
import wellnessService from "../../../services/wellnessService";

const TherapistsStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'therapist',
    qualification: '',
    experience: '',
    contactInfo: '',
    status: 'ACTIVE'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await wellnessService.getStaff();
      if (res.success) {
        setStaff(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
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
        res = await wellnessService.updateStaff(currentId, formData);
      } else {
        res = await wellnessService.addStaff(formData);
      }

      if (res.success) {
        setShowModal(false);
        setEditMode(false);
        setFormData({ fullName: '', role: 'therapist', qualification: '', experience: '', contactInfo: '', status: 'ACTIVE' });
        fetchData();
      }
    } catch (err) {
      alert(`Failed to ${editMode ? 'update' : 'add'} staff member`);
    }
  };

  const handleEdit = (member) => {
    setEditMode(true);
    setCurrentId(member.id);
    setFormData({
      fullName: member.full_name,
      role: member.role,
      qualification: member.qualification,
      experience: member.experience,
      contactInfo: member.contact_info,
      status: member.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const res = await wellnessService.deleteStaff(id);
        if (res.success) {
          fetchData();
        }
      } catch (err) {
        alert("Failed to delete staff member");
      }
    }
  };

  const getStatusColor = (status) => {
    return status === 'ACTIVE'
      ? 'bg-green-100 text-green-700'
      : 'bg-yellow-100 text-yellow-700';
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
          <h1 className="text-2xl font-bold text-gray-800">Therapists & Staff</h1>
          <p className="text-gray-500">Manage your wellness professionals</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
        >
          <Plus className="mr-2" size={16} />
          Add New Staff
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
            </div>
            <Award className="text-purple-500" size={32} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Therapists</p>
              <p className="text-2xl font-bold text-green-600">
                {staff.filter(s => s.role === 'therapist').length}
              </p>
            </div>
            <UserCheck className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Support Staff</p>
              <p className="text-2xl font-bold text-yellow-600">
                {staff.filter(s => s.role === 'staff').length}
              </p>
            </div>
            <AlertCircle className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Experience</p>
              <p className="text-2xl font-bold text-blue-600">5+ Yrs</p>
            </div>
            <Calendar className="text-blue-500" size={32} />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3">FullName</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Qualification</th>
              <th className="text-left px-4 py-3">Experience</th>
              <th className="text-left px-4 py-3">Contact</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">{member.full_name}</td>
                <td className="px-4 py-3 capitalize">{member.role}</td>
                <td className="px-4 py-3">{member.qualification}</td>
                <td className="px-4 py-3">{member.experience}</td>
                <td className="px-4 py-3 text-xs">{member.contact_info}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(member.status)}`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(member)} className="text-blue-600 p-1"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(member.id)} className="text-red-600 p-1"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-12 text-center text-gray-500 font-medium">No staff members found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Adding Staff */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-purple-50">
              <h2 className="text-xl font-bold text-gray-800">{editMode ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  setFormData({ fullName: '', role: 'therapist', qualification: '', experience: '', contactInfo: '', status: 'ACTIVE' });
                }}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Dr. John Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="therapist">Therapist</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Experience</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g. 5 Years"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Qualification</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. PhD Yoga"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Info (Email/Phone)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  placeholder="e.g. john@example.com"
                />
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
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all shadow-md active:scale-95">
                  {editMode ? 'Update Staff Member' : 'Save Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistsStaff;