import React, { useState } from "react";
import { Award, Upload, FileText, CheckCircle, Clock, AlertCircle, Calendar, Eye, Download, ChevronRight, TrendingUp } from "lucide-react";

const NAACAccreditation = () => {
  const [activeSection, setActiveSection] = useState("overview");

  //  Certificate Details
  const naacDetails = {
    accreditationGrade: "B++",
    cgpa: "2.85",
    validFrom: "2024-01-15",
    validTill: "2029-01-14",
    certificateNumber: "NAAC/2024/B++/001",
    cycle: "2nd Cycle",
    status: "Active",
    daysRemaining: 1514
  };

  // Document Upload Status
  const documents = [
    {
      id: 1,
      name: "NAAC Certificate",
      type: "Certificate",
      status: "Uploaded",
      uploadedDate: "2024-02-01",
      fileName: "NAAC_Certificate_2024.pdf",
      size: "2.5 MB"
    },
    {
      id: 2,
      name: "Self Study Report (SSR)",
      type: "Report",
      status: "Uploaded",
      uploadedDate: "2025-08-15",
      fileName: "SSR_Report_2025.pdf",
      size: "15.8 MB"
    },
    {
      id: 3,
      name: "Peer Team Report",
      type: "Report",
      status: "Pending",
      uploadedDate: "-",
      fileName: "-",
      size: "-"
    },
    {
      id: 4,
      name: "DVV Clarification Documents",
      type: "Clarification",
      status: "Uploaded",
      uploadedDate: "2025-09-20",
      fileName: "DVV_Clarifications.pdf",
      size: "8.2 MB"
    },
    {
      id: 5,
      name: "Annual Quality Assurance Report (AQAR)",
      type: "Report",
      status: "Uploaded",
      uploadedDate: "2025-10-05",
      fileName: "AQAR_2024-25.pdf",
      size: "12.3 MB"
    }
  ];

  // Accreditation Timeline
  const timeline = [
    {
      step: "Application Submitted",
      date: "2025-07-10",
      status: "completed",
      description: "Initial application submitted to NAAC"
    },
    {
      step: "SSR Submission",
      date: "2025-08-15",
      status: "completed",
      description: "Self Study Report uploaded and verified"
    },
    {
      step: "Data Validation & Verification (DVV)",
      date: "2025-09-20",
      status: "completed",
      description: "Data validated by NAAC team"
    },
    {
      step: "Peer Team Visit",
      date: "2025-12-10",
      status: "scheduled",
      description: "On-site peer team assessment scheduled"
    },
    {
      step: "Final Grade Declaration",
      date: "2026-02-15",
      status: "pending",
      description: "Expected final accreditation result"
    }
  ];

  // NAAC Criteria Scores
  const criteriaScores = [
    {
      id: 1,
      criterion: "Curricular Aspects",
      weightage: "100",
      score: "85",
      grade: "A",
      status: "Good"
    },
    {
      id: 2,
      criterion: "Teaching-Learning and Evaluation",
      weightage: "200",
      score: "78",
      grade: "B++",
      status: "Good"
    },
    {
      id: 3,
      criterion: "Research, Innovations and Extension",
      weightage: "150",
      score: "72",
      grade: "B+",
      status: "Satisfactory"
    },
    {
      id: 4,
      criterion: "Infrastructure and Learning Resources",
      weightage: "100",
      score: "88",
      grade: "A",
      status: "Very Good"
    },
    {
      id: 5,
      criterion: "Student Support and Progression",
      weightage: "150",
      score: "80",
      grade: "A",
      status: "Good"
    },
    {
      id: 6,
      criterion: "Governance, Leadership and Management",
      weightage: "100",
      score: "75",
      grade: "B+",
      status: "Satisfactory"
    },
    {
      id: 7,
      criterion: "Institutional Values and Best Practices",
      weightage: "100",
      score: "82",
      grade: "A",
      status: "Good"
    }
  ];

  // Compliance Reports
  const complianceReports = [
    {
      id: 1,
      reportName: "Annual Compliance Report 2024-25",
      dueDate: "2025-12-31",
      status: "Pending",
      lastReminder: "2025-11-15"
    },
    {
      id: 2,
      reportName: "Infrastructure Update Report",
      dueDate: "2025-11-30",
      status: "Submitted",
      submittedDate: "2025-11-10"
    },
    {
      id: 3,
      reportName: "Faculty Update Report",
      dueDate: "2025-12-15",
      status: "Pending",
      lastReminder: "2025-11-20"
    }
  ];

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'uploaded':
      case 'completed':
      case 'active':
      case 'submitted':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* NAAC Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <Award size={32} className="mb-3 opacity-80" />
          <p className="text-sm opacity-90">Current Grade</p>
          <p className="text-4xl font-bold mt-1">{naacDetails.accreditationGrade}</p>
          <p className="text-xs mt-2 opacity-75">CGPA: {naacDetails.cgpa}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <CheckCircle size={32} className="mb-3 opacity-80" />
          <p className="text-sm opacity-90">Accreditation Status</p>
          <p className="text-2xl font-bold mt-1">{naacDetails.status}</p>
          <p className="text-xs mt-2 opacity-75">Valid till: {naacDetails.validTill}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <Calendar size={32} className="mb-3 opacity-80" />
          <p className="text-sm opacity-90">Days Remaining</p>
          <p className="text-4xl font-bold mt-1">{naacDetails.daysRemaining}</p>
          <p className="text-xs mt-2 opacity-75">Until re-accreditation</p>
        </div>
      </div>

      {/* Certificate Details */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Award className="text-purple-600" size={22} />
          NAAC Accreditation Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Certificate Number</p>
            <p className="text-gray-800 font-medium mt-1">{naacDetails.certificateNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Accreditation Cycle</p>
            <p className="text-gray-800 font-medium mt-1">{naacDetails.cycle}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valid From</p>
            <p className="text-gray-800 font-medium mt-1">{naacDetails.validFrom}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valid Till</p>
            <p className="text-gray-800 font-medium mt-1">{naacDetails.validTill}</p>
          </div>
        </div>
      </div>

      {/* Action Required Alert */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="text-yellow-600 mr-3 mt-1" size={20} />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-2">Upcoming Actions Required</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Peer Team Visit scheduled for December 10, 2025</li>
              <li>• Annual Compliance Report due by December 31, 2025</li>
              <li>• Faculty documentation update pending</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Upload & Manage Documents</h3>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Upload size={18} />
          Upload New Document
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3">Document Name</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Upload Date</th>
              <th className="text-left px-4 py-3">File Info</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{doc.name}</td>
                <td className="px-4 py-3">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                    {doc.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{doc.uploadedDate}</td>
                <td className="px-4 py-3">
                  {doc.fileName !== '-' ? (
                    <div className="text-xs">
                      <div className="text-gray-700">{doc.fileName}</div>
                      <div className="text-gray-500">{doc.size}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {doc.status === 'Uploaded' ? (
                      <>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye size={18} />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <Download size={18} />
                        </button>
                      </>
                    ) : (
                      <button className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-xs hover:bg-indigo-200">
                        Upload
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <FileText size={18} />
          Document Guidelines
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All documents must be in PDF format</li>
          <li>• Maximum file size: 20 MB per document</li>
          <li>• Documents must be clearly scanned and readable</li>
          <li>• Use official letterhead for institutional documents</li>
        </ul>
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Accreditation Timeline & Progress</h3>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="space-y-6">
          {timeline.map((item, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.status === 'completed' ? 'bg-green-500 text-white' :
                  item.status === 'scheduled' ? 'bg-blue-500 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {item.status === 'completed' ? <CheckCircle size={20} /> :
                   item.status === 'scheduled' ? <Calendar size={20} /> :
                   <Clock size={20} />}
                </div>
                {index < timeline.length - 1 && (
                  <div className={`w-0.5 h-16 ${
                    item.status === 'completed' ? 'bg-green-300' : 'bg-gray-300'
                  }`} />
                )}
              </div>
              <div className="flex-1 pb-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.step}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Calendar size={12} />
                      {item.date}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'completed' ? 'bg-green-100 text-green-700' :
                    item.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCriteria = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">NAAC Seven Criteria Assessment</h3>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3">Criterion</th>
              <th className="text-left px-4 py-3">Weightage</th>
              <th className="text-left px-4 py-3">Score (%)</th>
              <th className="text-left px-4 py-3">Grade</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Progress</th>
            </tr>
          </thead>
          <tbody>
            {criteriaScores.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">Criterion {item.id}</div>
                  <div className="text-xs text-gray-600">{item.criterion}</div>
                </td>
                <td className="px-4 py-3">{item.weightage}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-gray-800">{item.score}%</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold text-indigo-600">{item.grade}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'Very Good' ? 'bg-green-100 text-green-700' :
                    item.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-green-600" size={20} />
            <h4 className="font-semibold text-green-900">Strong Areas</h4>
          </div>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Infrastructure & Learning Resources</li>
            <li>• Curricular Aspects</li>
            <li>• Institutional Values</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-yellow-600" size={20} />
            <h4 className="font-semibold text-yellow-900">Areas to Improve</h4>
          </div>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Research & Innovation</li>
            <li>• Governance & Leadership</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="text-blue-600" size={20} />
            <h4 className="font-semibold text-blue-900">Overall CGPA</h4>
          </div>
          <p className="text-3xl font-bold text-blue-900">{naacDetails.cgpa}</p>
          <p className="text-sm text-blue-700 mt-1">Grade: {naacDetails.accreditationGrade}</p>
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Compliance & Annual Reports</h3>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3">Report Name</th>
              <th className="text-left px-4 py-3">Due Date</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Last Action</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {complianceReports.map((report) => (
              <tr key={report.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{report.reportName}</td>
                <td className="px-4 py-3">{report.dueDate}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {report.status === 'Pending' ? `Reminder: ${report.lastReminder}` : `Submitted: ${report.submittedDate}`}
                </td>
                <td className="px-4 py-3">
                  {report.status === 'Pending' ? (
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs">
                      Submit Report
                    </button>
                  ) : (
                    <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs">
                      <Eye size={14} />
                      View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">NAAC Accreditation</h1>
        <p className="text-gray-500">Manage your NAAC accreditation details and documents</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow">
        <div className="flex overflow-x-auto border-b">
          {[
            { id: 'overview', label: 'Overview', icon: Award },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'timeline', label: 'Timeline', icon: Calendar },
            { id: 'criteria', label: 'Criteria Scores', icon: TrendingUp },
            { id: 'compliance', label: 'Compliance Reports', icon: CheckCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                  activeSection === tab.id
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
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'documents' && renderDocuments()}
        {activeSection === 'timeline' && renderTimeline()}
        {activeSection === 'criteria' && renderCriteria()}
        {activeSection === 'compliance' && renderCompliance()}
      </div>
    </div>
  );
};

export default NAACAccreditation;