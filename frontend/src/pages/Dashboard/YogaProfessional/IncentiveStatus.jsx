import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiDollarSign, FiClock, FiCheckCircle, FiPlus, FiFileText, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";

const IncentiveStatus = () => {
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [showApply, setShowApply] = useState(false);
  const [formData, setFormData] = useState({
    applicationType: "YCB_EXAM_FEE",
    amount: "",
    receiptFile: null
  });

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await axiosInstance.get(`${API}/api/yoga-professional/reimbursements`, {
      });
      setClaims(res.data);
    } catch (err) {
      console.error("Error fetching claims:", err);
      toast.error("Failed to load claims.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!formData.receiptFile) return toast.error("Please upload fee receipt");

    const data = new FormData();
    data.append("applicationType", formData.applicationType);
    data.append("amount", formData.amount);
    data.append("receiptFile", formData.receiptFile);

    try {
      await axiosInstance.post(`${API}/api/yoga-professional/reimbursement`, data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      toast.success("Application submitted successfully!");
      setShowApply(false);
      fetchClaims();
    } catch (err) {
      toast.error("Submission failed: " + (err.response?.data?.message || err.message));
    }
  };

  const stats = {
    totalPaid: claims.filter(c => c.status === 'PAID').reduce((acc, c) => acc + parseFloat(c.amount), 0),
    totalPending: claims.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' || c.status === 'APPROVED').reduce((acc, c) => acc + parseFloat(c.amount), 0)
  };

  if (loading) return <div className="p-8 text-center text-teal-600">Loading claims history...</div>;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payments & Incentives</h1>
          <p className="text-gray-500 text-sm">Track reimbursements and financial claims</p>
        </div>
        {!showApply && (
          <button
            onClick={() => setShowApply(true)}
            className="px-6 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition flex items-center gap-2"
          >
            <FiPlus /> New Claim
          </button>
        )}
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-teal-700 p-8 rounded-3xl shadow-lg text-white">
          <FiCheckCircle className="text-4xl opacity-50 mb-4" />
          <p className="text-teal-100 font-medium">Total Amount Received</p>
          <h2 className="text-4xl font-bold mt-1">₹ {stats.totalPaid.toLocaleString()}</h2>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-8 rounded-3xl shadow-lg text-white">
          <FiClock className="text-4xl opacity-50 mb-4" />
          <p className="text-orange-100 font-medium">Pending Reimbursements</p>
          <h2 className="text-4xl font-bold mt-1">₹ {stats.totalPending.toLocaleString()}</h2>
        </div>
      </div>

      {showApply && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-teal-600 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Apply for Reimbursement</h2>
            <button onClick={() => setShowApply(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Application Type</label>
              <select
                className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl"
                value={formData.applicationType}
                onChange={e => setFormData({ ...formData, applicationType: e.target.value })}
              >
                <option value="YCB_EXAM_FEE">YCB Exam Fee Reimbursement</option>
                <option value="TRAINER_FEE">Yoga Trainer Monthly Fee</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Amount Claimed (₹)</label>
              <input
                type="number"
                required
                className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl"
                placeholder="e.g. 5000"
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Upload Fee Receipt / Proof (PDF/JPG)</label>
              <input
                type="file"
                required
                className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl"
                onChange={e => setFormData({ ...formData, receiptFile: e.target.files[0] })}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
              <button
                type="button"
                onClick={() => setShowApply(false)}
                className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-100"
              >
                Submit Claim
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="font-bold text-gray-800">Claim History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Application ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Applied On</th>
                <th className="px-6 py-4">Payment Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {claims.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">No reimbursement claims found.</td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-teal-600">CLAIM-#{claim.id.toString().padStart(5, '0')}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{claim.application_type.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">₹ {claim.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${claim.status === 'PAID' ? 'bg-green-100 text-green-700 border-green-200' :
                          claim.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{new Date(claim.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {claim.payment_ref ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-800">{claim.payment_ref}</span>
                          <span className="text-[10px] text-gray-400">{new Date(claim.payment_date).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-300">Pending disbursement</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncentiveStatus;

