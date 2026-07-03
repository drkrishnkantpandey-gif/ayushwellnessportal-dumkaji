import React, { useState } from "react";
import { DollarSign, Plus, FileText, CheckCircle, Clock, XCircle, AlertCircle, Eye, Download, Upload, Calendar, TrendingUp, Send } from "lucide-react";

const IncentiveApplications = () => {
  const [activeTab, setActiveTab] = useState("applications");
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);

  // Existing Applications
  const applications = [
    {
      id: "NAAC001",
      type: "NAAC Accreditation Incentive",
      amount: "₹5,00,000",
      appliedDate: "2024-02-15",
      status: "Under Review",
      stage: "Directorate Verification",
      lastUpdated: "2025-11-15",
      documents: 4,
      remarks: "Documents under verification by AYUSH Directorate"
    },
    {
      id: "RD001",
      type: "Research Development Grant",
      amount: "₹2,50,000",
      appliedDate: "2024-10-05",
      status: "Approved",
      stage: "Payment Processing",
      lastUpdated: "2025-11-10",
      documents: 3,
      remarks: "Payment will be processed via DBT within 7 working days"
    },
    {
      id: "INFRA001",
      type: "Infrastructure Improvement Grant",
      amount: "₹10,00,000",
      appliedDate: "2025-09-20",
      status: "Pending Documents",
      stage: "Document Submission",
      lastUpdated: "2025-11-18",
      documents: 2,
      remarks: "Building plan approval certificate required"
    },
    {
      id: "ACCR002",
      type: "NAAC Grade Improvement Incentive",
      amount: "₹3,00,000",
      appliedDate: "2025-10-12",
      status: "Rejected",
      stage: "Final Decision",
      lastUpdated: "2025-11-01",
      documents: 4,
      remarks: "Grade improvement criteria not met. Can reapply in next cycle."
    }
  ];

  // Payment History
  const paymentHistory = [
    {
      id: "PAY001",
      applicationId: "RD001",
      type: "Research Development Grant",
      amount: "₹2,50,000",
      sanctionDate: "2025-11-10",
      paymentDate: "2025-11-20",
      paymentMode: "DBT (Direct Bank Transfer)",
      transactionId: "DBT2025112012345",
      status: "Completed"
    },
    {
      id: "PAY002",
      applicationId: "PREV001",
      type: "Faculty Development Grant",
      amount: "₹1,50,000",
      sanctionDate: "2025-08-15",
      paymentDate: "2025-08-25",
      paymentMode: "e-Treasury",
      transactionId: "ETRY2025082512345",
      status: "Completed"
    }
  ];

  // Incentive Types Available
  const incentiveTypes = [
    {
      id: 1,
      name: "NAAC Accreditation Incentive",
      eligibility: "B+ grade or above",
      maxAmount: "₹5,00,000",
      description: "One-time incentive for achieving NAAC accreditation",
      documents: ["NAAC Certificate", "SSR Report", "College Profile"]
    },
    {
      id: 2,
      name: "NAAC Grade Improvement Incentive",
      eligibility: "Grade improvement by at least one level",
      maxAmount: "₹3,00,000",
      description: "Incentive for improving NAAC grade in re-accreditation",
      documents: ["Previous NAAC Certificate", "Current NAAC Certificate", "Comparative Report"]
    },
    {
      id: 3,
      name: "Research Development Grant",
      eligibility: "Minimum 10 research publications in last year",
      maxAmount: "₹2,50,000",
      description: "Grant for research infrastructure and activities",
      documents: ["Research Publication List", "Impact Factor Proof", "Research Plan"]
    },
    {
      id: 4,
      name: "Infrastructure Improvement Grant",
      eligibility: "Government AYUSH colleges only",
      maxAmount: "₹10,00,000",
      description: "Grant for infrastructure development and modernization",
      documents: ["Building Plan", "Approval Certificate", "Cost Estimate", "Utilization Plan"]
    }
  ];

  // Application Stages
  const applicationStages = [
    { stage: "Application Submitted", status: "completed" },
    { stage: "Document Verification", status: "current" },
    { stage: "Directorate Review", status: "pending" },
    { stage: "Approval/Rejection", status: "pending" },
    { stage: "Payment Processing", status: "pending" }
  ];

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'under review':
      case 'payment processing':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'pending documents':
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return <CheckCircle size={18} />;
      case 'under review':
      case 'payment processing':
        return <Clock size={18} />;
      case 'pending documents':
      case 'pending':
        return <AlertCircle size={18} />;
      case 'rejected':
        return <XCircle size={18} />;
      default:
        return <FileText size={18} />;
    }
  };

  const renderApplications = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Total Applications</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{applications.length}</p>
            </div>
            <FileText className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {applications.filter(app => app.status === 'Approved').length}
              </p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Under Review</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {applications.filter(app => app.status === 'Under Review').length}
              </p>
            </div>
            <Clock className="text-yellow-400" size={32} />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">Total Amount</p>
              <p className="text-xl font-bold text-purple-900 mt-1">₹20,50,000</p>
            </div>
            <DollarSign className="text-purple-400" size={32} />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">All Applications</h3>
          <button
            onClick={() => setShowNewApplicationModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} />
            New Application
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Application ID</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Applied Date</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Stage</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-indigo-600">{app.id}</td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <div className="font-medium text-gray-800">{app.type}</div>
                      <div className="text-xs text-gray-500">{app.documents} documents attached</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{app.amount}</td>
                  <td className="px-4 py-3 text-gray-600">{app.appliedDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(app.status)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(app.status)}
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs">
                      <div className="font-medium text-gray-700">{app.stage}</div>
                      <div className="text-gray-500">Updated: {app.lastUpdated}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      <Eye size={16} />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPaymentTracking = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Payment History & Tracking</h3>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <DollarSign size={32} className="mb-3 opacity-80" />
          <p className="text-sm opacity-90">Total Received</p>
          <p className="text-3xl font-bold mt-1">₹4,00,000</p>
          <p className="text-xs mt-2 opacity-75">2 payments completed</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <Clock size={32} className="mb-3 opacity-80" />
          <p className="text-sm opacity-90">Pending Payment</p>
          <p className="text-3xl font-bold mt-1">₹5,00,000</p>
          <p className="text-xs mt-2 opacity-75">1 application approved</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <TrendingUp size={32} className="mb-3 opacity-80" />
          <p className="text-sm opacity-90">Expected Amount</p>
          <p className="text-3xl font-bold mt-1">₹9,00,000</p>
          <p className="text-xs mt-2 opacity-75">Total sanctioned</p>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Payment Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Transaction ID</th>
                <th className="text-left px-4 py-3">Application ID</th>
                <th className="text-left px-4 py-3">Incentive Type</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Sanction Date</th>
                <th className="text-left px-4 py-3">Payment Date</th>
                <th className="text-left px-4 py-3">Payment Mode</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{payment.transactionId}</td>
                  <td className="px-4 py-3 font-medium text-indigo-600">{payment.applicationId}</td>
                  <td className="px-4 py-3">{payment.type}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">{payment.amount}</td>
                  <td className="px-4 py-3 text-gray-600">{payment.sanctionDate}</td>
                  <td className="px-4 py-3 text-gray-600">{payment.paymentDate}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                      {payment.paymentMode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                      <CheckCircle size={14} />
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank Account Info */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <DollarSign size={20} />
          Registered Bank Account for DBT
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-700 font-medium">Account Name</p>
            <p className="text-blue-900 mt-1">Govt AYUSH Medical College</p>
          </div>
          <div>
            <p className="text-blue-700 font-medium">Account Number</p>
            <p className="text-blue-900 mt-1">1234567890</p>
          </div>
          <div>
            <p className="text-blue-700 font-medium">Bank Name</p>
            <p className="text-blue-900 mt-1">State Bank of India</p>
          </div>
          <div>
            <p className="text-blue-700 font-medium">IFSC Code</p>
            <p className="text-blue-900 mt-1">SBIN0001234</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAvailableIncentives = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Available Incentive Schemes</h3>
        <p className="text-gray-600 text-sm">Explore and apply for various AYUSH incentive schemes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {incentiveTypes.map((incentive) => (
          <div key={incentive.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 text-lg">{incentive.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{incentive.description}</p>
              </div>
              <DollarSign className="text-green-500" size={32} />
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Maximum Amount</span>
                <span className="font-semibold text-green-700">{incentive.maxAmount}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-600">Eligibility</span>
                <span className="text-sm text-gray-800 text-right">{incentive.eligibility}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">Required Documents:</p>
              <div className="flex flex-wrap gap-1">
                {incentive.documents.map((doc, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {doc}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg flex items-center justify-center gap-2">
              <Send size={16} />
              Apply Now
            </button>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
          <AlertCircle size={18} />
          Important Guidelines
        </h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Ensure all documents are properly attested and uploaded</li>
          <li>• Only one application per incentive type per academic year</li>
          <li>• Processing time: 30-45 working days from application submission</li>
          <li>• Payment will be made via DBT to registered bank account only</li>
          <li>• Incomplete applications will be rejected automatically</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Incentive Applications</h1>
        <p className="text-gray-500">Apply for and track your NAAC incentive applications</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow">
        <div className="flex overflow-x-auto border-b">
          {[
            { id: 'applications', label: 'My Applications', icon: FileText },
            { id: 'payment', label: 'Payment Tracking', icon: DollarSign },
            { id: 'available', label: 'Available Incentives', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div>
        {activeTab === 'applications' && renderApplications()}
        {activeTab === 'payment' && renderPaymentTracking()}
        {activeTab === 'available' && renderAvailableIncentives()}
      </div>
    </div>
  );
};

export default IncentiveApplications;