import React, { useState, useEffect } from "react";
import { Plus, Eye, FileText, DollarSign, TrendingUp, Loader2, X } from "lucide-react";
import wellnessService from "../../../services/wellnessService";

const IncentivesGrants = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
    status: 'SUBMITTED'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await wellnessService.getIncentives();
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch incentives:", err);
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
      const res = await wellnessService.addIncentive(formData);
      if (res.success) {
        setShowModal(false);
        setFormData({ title: '', amount: '', description: '', status: 'SUBMITTED' });
        fetchData();
      }
    } catch (err) {
      alert("Failed to submit incentive application");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredApplications = filterStatus
    ? applications.filter(app => app.status === filterStatus)
    : applications;

  const totalAmount = applications.reduce((sum, app) => sum + parseFloat(app.amount || 0), 0);
  const approvedAmount = applications
    .filter(app => app.status === 'APPROVED' || app.status === 'PAID')
    .reduce((sum, app) => sum + parseFloat(app.amount || 0), 0);

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
          <h1 className="text-2xl font-bold text-gray-800">Incentives & Grants</h1>
          <p className="text-gray-500">Manage subsidy and grant applications</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
        >
          <Plus className="mr-2" size={16} />
          New Application
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
            <FileText className="text-purple-500" size={32} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount Applied</p>
              <p className="text-2xl font-bold text-blue-600">₹{totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved/Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {applications.filter(a => a.status === 'APPROVED' || a.status === 'PAID').length}
              </p>
            </div>
            <div className="text-green-500 text-2xl font-bold">✓</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Amount Approved</p>
              <p className="text-2xl font-bold text-green-600">₹{approvedAmount.toLocaleString()}</p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white p-4 rounded-xl shadow">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Status</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="PAID">Paid</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3">Application Code</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Last Updated</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((application) => (
              <tr key={application.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-purple-600">
                  {application.application_code}
                </td>
                <td className="px-4 py-3">{application.type}</td>
                <td className="px-4 py-3 font-bold text-gray-900">₹{parseFloat(application.amount).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(application.status)}`}>
                    {application.status}
                  </span>
                </td>
                <td className="px-4 py-3">{new Date(application.last_updated).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 p-1">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredApplications.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-gray-500 font-medium">No applications found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Modal for New Incentive Application */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-purple-50">
              <h2 className="text-xl font-bold text-gray-800">New Incentive Application</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 transition">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Incentive Title / Type</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Infrastructure Subsidy"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount Requested (₹)</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description / Purpose</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about why this incentive is needed..."
                  rows={3}
                />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all shadow-md active:scale-95">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncentivesGrants;