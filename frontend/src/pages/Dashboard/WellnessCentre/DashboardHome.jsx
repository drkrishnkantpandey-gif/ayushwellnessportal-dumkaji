import React, { useState, useEffect } from "react";
import { Heart, Users, Calendar, DollarSign, AlertCircle, Award, Loader2, Building2, CheckCircle, Clock, RefreshCcw, Download, X } from "lucide-react";
import wellnessService from "../../../services/wellnessService";
import axiosInstance from "../../../config/axiosInstance";
import OperationalRegistrationForm from "./OperationalRegistrationForm";

const DashboardHome = ({ setActiveTab, onViewPublicProfile }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPrograms: 0,
    totalStaff: 0,
    totalSessions: 0,
    pendingIncentives: 0
  });
  const [sessions, setSessions] = useState([]);
  const [incentives, setIncentives] = useState([]);
  const [staff, setStaff] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [user, setUser] = useState({});
  const [profile, setProfile] = useState(null);
  const [pendingActions, setPendingActions] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  // Operational Registration states
  const [wcRegistration, setWcRegistration] = useState(undefined); // undefined = loading
  const [showRegForm, setShowRegForm] = useState(false);
  const [regSuccess, setRegSuccess] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({
    name: '',
    address: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    accreditation_level: '',
    registration_valid_to: ''
  });
  const [uploadFiles, setUploadFiles] = useState({
    registration_certificate: null,
    accreditation_docs: null,
    other_docs: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);

        const [dashRes, progRes, staffRes, sessRes, incRes, profRes, actionRes] = await Promise.all([
          wellnessService.getDashboardData(),
          wellnessService.getPrograms(),
          wellnessService.getStaff(),
          wellnessService.getSessions(),
          wellnessService.getIncentives(),
          wellnessService.getProfile(),
          wellnessService.getPendingActions()
        ]);

        if (dashRes.success) setStats(dashRes.data);
        if (progRes.success) setPrograms(progRes.data.slice(0, 5));
        if (staffRes.success) setStaff(staffRes.data.slice(0, 5));
        if (sessRes.success) setSessions(sessRes.data.slice(0, 5));
        if (incRes.success) setIncentives(incRes.data.slice(0, 5));
        if (profRes.success) {
          setProfile(profRes.data);
          setUpdateFormData({
            name: profRes.data.name || '',
            address: profRes.data.address || '',
            contact_person: profRes.data.contact_person || '',
            contact_email: profRes.data.contact_email || '',
            contact_phone: profRes.data.contact_phone || '',
            accreditation_level: profRes.data.accreditation_level || '',
            registration_valid_to: profRes.data.registration_valid_to ? profRes.data.registration_valid_to.split('T')[0] : ''
          });
        }
        if (actionRes.success) setPendingActions(actionRes.data);

        // Fetch operational registration status
        try {
          const regRes = await axiosInstance.get('/wellness/operational-registration');
          setWcRegistration(regRes.data?.data || null);
        } catch (e) {
          setWcRegistration(null);
        }

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const topCards = [
    {
      title: "Active Staff",
      value: stats.totalStaff,
      desc: "Registered wellness therapists/staff",
      icon: Users,
      color: "bg-purple-500"
    },
    {
      title: "Total Sessions",
      value: stats.totalSessions,
      desc: "Total wellness sessions conducted",
      icon: Calendar,
      color: "bg-green-500"
    },
    {
      title: "Pending Incentives",
      value: `₹${stats.pendingIncentives.toLocaleString()}`,
      desc: "Wellness program incentives",
      icon: DollarSign,
      color: "bg-yellow-500"
    }
  ];

  const actionRequiredItems = pendingActions.map(a => a.title);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await wellnessService.updateProfile(updateFormData);
      if (res.success) {
        setShowUpdateModal(false);
        const profRes = await wellnessService.getProfile();
        if (profRes.success) setProfile(profRes.data);
      }
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (uploadFiles.registration_certificate) {
      formData.append('registration_certificate', uploadFiles.registration_certificate);
    }
    if (uploadFiles.accreditation_docs) {
      formData.append('accreditation_docs', uploadFiles.accreditation_docs);
    }
    // Handle other docs (multiple)
    for (let i = 0; i < uploadFiles.other_docs.length; i++) {
      formData.append('other_docs', uploadFiles.other_docs[i]);
    }

    try {
      const res = await wellnessService.uploadDocuments(formData);
      if (res.success) {
        setShowUploadModal(false);
        alert("Documents uploaded successfully");
        // Refresh actions
        const actionRes = await wellnessService.getPendingActions();
        if (actionRes.success) setPendingActions(actionRes.data);
      }
    } catch (err) {
      alert("Failed to upload documents");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-purple-600 mx-auto" size={48} />
          <p className="mt-4 text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Operational Registration Form Modal */}
      {showRegForm && (
        <OperationalRegistrationForm
          isOpen={showRegForm}
          onClose={() => setShowRegForm(false)}
          user={user}
          onSuccess={(regNum) => {
            setRegSuccess(regNum);
            setShowRegForm(false);
            axiosInstance.get('/wellness/operational-registration')
              .then(r => setWcRegistration(r.data?.data || null))
              .catch(() => {});
          }}
        />
      )}

      {/* Registration Success Banner */}
      {regSuccess && (
        <div style={{ background: 'linear-gradient(135deg,#166534,#15803d)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', boxShadow: '0 4px 20px rgba(22,101,52,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <CheckCircle size={32} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Wellness Centre Registration Submitted Successfully!</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>Registration No: <strong>{regSuccess}</strong> — Your application has been sent to the District Officer for review.</div>
            </div>
          </div>
          <button onClick={() => setRegSuccess(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome Back, {profile?.name || user.full_name || 'Wellness Centre'}!
          </h1>
          <p className="text-gray-500">Wellness Centre Dashboard</p>
        </div>
        {/* Register Wellness Centre Button — show only if no registration yet */}
        {wcRegistration === null && (
          <button
            onClick={() => setShowRegForm(true)}
            style={{ background: 'linear-gradient(135deg,#166534,#15803d)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(22,101,52,0.35)', transition: 'opacity 0.2s' }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            <Building2 size={18} />
            Register Wellness Centre
          </button>
        )}
      </div>

      {/* Operational Registration Status Banner */}
      {wcRegistration && wcRegistration.status === 'SUBMITTED' && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '4px solid #3b82f6', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={20} style={{ color: '#2563eb' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: 14 }}>Wellness Centre Registration — Under Review</div>
              <div style={{ color: '#3b82f6', fontSize: 13 }}>Registration No: <strong>{wcRegistration.registration_number}</strong> &bull; Submitted on {new Date(wcRegistration.submitted_at).toLocaleDateString('en-IN')}</div>
            </div>
          </div>
        </div>
      )}

      {wcRegistration && wcRegistration.status === 'REVERTED' && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderLeft: '4px solid #f97316', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <RefreshCcw size={20} style={{ color: '#ea580c', marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#9a3412', fontSize: 14 }}>Registration Reverted by District Officer</div>
                <div style={{ color: '#c2410c', fontSize: 13 }}>Reg No: {wcRegistration.registration_number}</div>
                {wcRegistration.district_comment && (
                  <div style={{ marginTop: 6, fontSize: 13, color: '#7c2d12', background: '#ffedd5', padding: '8px 12px', borderRadius: 6 }}>
                    <strong>District Comment:</strong> {wcRegistration.district_comment}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowRegForm(true)}
              style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCcw size={14} /> Respond / Resubmit
            </button>
          </div>
        </div>
      )}

      {wcRegistration && wcRegistration.status === 'APPROVED' && (
        <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #86efac', borderLeft: '4px solid #16a34a', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle size={22} style={{ color: '#16a34a' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#166534', fontSize: 14 }}>Wellness Centre Registered ✓</div>
                <div style={{ color: '#15803d', fontSize: 13 }}>
                  Reg No: <strong>{wcRegistration.registration_number}</strong> &bull; Category: {wcRegistration.category} &bull;
                  Valid till: {wcRegistration.certificate_valid_till ? new Date(wcRegistration.certificate_valid_till).toLocaleDateString('en-IN') : 'N/A'}
                </div>
              </div>
            </div>
            <a
              href="/api/wellness/operational-registration/certificate"
              target="_blank"
              rel="noreferrer"
              style={{ background: '#166534', color: '#fff', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={14} /> Download Certificate
            </a>
          </div>
        </div>
      )}

      {wcRegistration && wcRegistration.status === 'REJECTED' && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={20} style={{ color: '#dc2626' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#991b1b', fontSize: 14 }}>Registration Rejected</div>
              <div style={{ color: '#dc2626', fontSize: 13 }}>{wcRegistration.district_comment}</div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="text-white" size={24} />
              </div>
              <h3 className="text-sm text-gray-600 font-medium">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Action Required */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="text-yellow-600 mr-3 mt-1" size={20} />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-2">Action Required</h4>
            <ul className="space-y-1">
              {actionRequiredItems.map((item, index) => (
                <li key={index} className="text-sm text-gray-700">• {item}</li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Upload Documents
              </button>
              <button
                onClick={() => setShowDetailsModal(true)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Centre Registration Status */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Centre Registration Status</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Registration Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profile?.registration_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                {profile?.registration_status || 'Under Review'}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Accreditation Level</span>
              <div className="flex items-center">
                <Award className="text-purple-500 mr-2" size={16} />
                <span className="text-sm text-gray-700">{profile?.accreditation_level || 'N/A'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Certificate Validity</span>
              <span className="text-sm text-gray-700">
                {profile?.registration_valid_to ? new Date(profile.registration_valid_to).toLocaleDateString() : 'TBD'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={() => onViewPublicProfile(profile?.id)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              View Public Profile
            </button>
          </div>
        </div>
      </div>

      {/* Session Tracker Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Tracker Overview</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Session Type</th>
                <th className="text-left px-4 py-2">Participants</th>
                <th className="text-left px-4 py-2">Staff</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{new Date(session.session_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{session.program_name}</td>
                  <td className="px-4 py-2">{session.participants_count}</td>
                  <td className="px-4 py-2">{session.staff_name}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Recorded
                    </span>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No sessions recorded recently.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wellness Programs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Wellness Programs</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Program Name</th>
                <th className="text-left px-4 py-2">Participants</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Next Session</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{program.name}</td>
                  <td className="px-4 py-2">{program.participants_count}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${program.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                      }`}>
                      {program.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{program.next_session_date ? new Date(program.next_session_date).toLocaleDateString() : 'TBD'}</td>
                </tr>
              ))}
              {programs.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">No active programs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incentive & Grant Applications */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Incentive & Grant Applications</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-left px-4 py-2">Application ID</th>
                <th className="text-left px-4 py-2">Amount</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {incentives.map((incentive, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{incentive.type}</td>
                  <td className="px-4 py-2">{incentive.application_code}</td>
                  <td className="px-4 py-2">₹{parseFloat(incentive.amount).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${incentive.status === 'APPROVED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-101 text-yellow-700'
                      }`}>
                      {incentive.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{new Date(incentive.last_updated).toLocaleDateString()}</td>
                </tr>
              ))}
              {incentives.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No grant applications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Management */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Staff Management</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Qualification</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{member.full_name}</td>
                  <td className="px-4 py-2 capitalize">{member.role}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${member.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{member.qualification}</td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">No staff members listed.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setActiveTab('sessions')}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm flex items-center transition-all active:scale-95"
        >
          <Calendar className="mr-2" size={16} />
          Add Session
        </button>
        <button
          onClick={() => setActiveTab('therapists')}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm flex items-center transition-all active:scale-95"
        >
          <Users className="mr-2" size={16} />
          Add Staff
        </button>
        <button
          onClick={() => setActiveTab('programs')}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center transition-all active:scale-95"
        >
          <Heart className="mr-2" size={16} />
          Create Program
        </button>
        <button
          onClick={() => setShowUpdateModal(true)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm flex items-center transition-all active:scale-95"
        >
          <Award className="mr-2" size={16} />
          Update Centre Info
        </button>
      </div>

      {/* UPDATE CENTRE INFO MODAL */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="p-6 border-b flex justify-between items-center bg-purple-50">
              <h2 className="text-xl font-bold text-gray-800">Update Centre Profile</h2>
              <button onClick={() => setShowUpdateModal(false)} className="text-gray-500 hover:text-gray-700">
                <Calendar /> {/* Using any icon for X for brevity or just import X */}
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">Centre Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={updateFormData.name}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, name: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">Address</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  value={updateFormData.address}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, address: e.target.value })}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Contact Person</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={updateFormData.contact_person}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, contact_person: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Contact Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={updateFormData.contact_email}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, contact_email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={updateFormData.contact_phone}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, contact_phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Accreditation Level</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={updateFormData.accreditation_level}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, accreditation_level: e.target.value })}
                >
                  <option value="">Select Level</option>
                  <option value="Level 1">Level 1</option>
                  <option value="Level 2">Level 2</option>
                  <option value="Level 3">Level 3</option>
                  <option value="Diamond">Diamond</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Registration Valid To</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={updateFormData.registration_valid_to}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, registration_valid_to: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 pt-4">
                <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700">
                  Save Profile Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENTS MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center bg-blue-50">
              <h2 className="text-xl font-bold text-gray-800">Upload Documents</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-700">X</button>
            </div>
            <form onSubmit={handleFileUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Registration Certificate</label>
                <input
                  type="file"
                  className="w-full text-sm"
                  onChange={(e) => setUploadFiles({ ...uploadFiles, registration_certificate: e.target.files[0] })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Accreditation Documents</label>
                <input
                  type="file"
                  className="w-full text-sm"
                  onChange={(e) => setUploadFiles({ ...uploadFiles, accreditation_docs: e.target.files[0] })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Other Documents (Max 5)</label>
                <input
                  type="file"
                  multiple
                  className="w-full text-sm"
                  onChange={(e) => setUploadFiles({ ...uploadFiles, other_docs: e.target.files })}
                />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
                  Upload to Secure Storage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center bg-yellow-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <AlertCircle className="mr-2 text-yellow-600" size={24} />
                Pending Actions Required
              </h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">X</button>
            </div>
            <div className="p-6 space-y-4">
              {pendingActions.map((action, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${action.priority === 'high' ? 'bg-red-500' : action.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                    <span className="text-gray-700 font-medium">{action.title}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (action.id === 'add_staff') setActiveTab('therapists');
                      if (action.id === 'create_program') setActiveTab('programs');
                      if (action.id === 'upload_docs') setShowUploadModal(true);
                      setShowDetailsModal(false);
                    }}
                    className="text-purple-600 font-bold text-sm hover:underline"
                  >
                    Resolve
                  </button>
                </div>
              ))}
              {pendingActions.length === 0 && (
                <p className="text-center text-gray-500 py-4">Great job! No pending actions at the moment.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;