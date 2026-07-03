import API from '../../config/api';
// src/pages/Dashboard/WellnessCentre.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Heart,
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
  Award,
} from "lucide-react";

const WellnessCentreDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal + form state for Add Therapist
  const [showTherapistModal, setShowTherapistModal] = useState(false);
  const [newTherapist, setNewTherapist] = useState({
    name: "",
    certificationCode: "",
    status: "PENDING",
  });

  // TEMP: static session data (can be wired to backend later)
  const sessions = [
    {
      date: "2025-11-18",
      type: "Stress Management",
      participants: 12,
      submittedBy: "Therapist A",
      status: "Verified",
    },
    {
      date: "2025-11-17",
      type: "Meditation Therapy",
      participants: 8,
      submittedBy: "Therapist B",
      status: "Submitted",
    },
    {
      date: "2025-11-16",
      type: "Yoga Therapy",
      participants: 15,
      submittedBy: "Therapist C",
      status: "Verified",
    },
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosInstance.get(
          `${API}/api/wellness-centre/dashboard`
        );
        setData(res.data);
      } catch (err) {
        console.error("Error loading wellness centre dashboard", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleAddTherapist = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post(
        `${API}/api/wellness-centre/therapists`,
        newTherapist
      );

      const created = res.data;

      // merge new therapist into existing data
      setData((prev) => ({
        ...prev,
        therapistManagement: [...prev.therapistManagement, created],
      }));

      // reset form + close modal
      setNewTherapist({ name: "", certificationCode: "", status: "PENDING" });
      setShowTherapistModal(false);
    } catch (err) {
      console.error("Error adding therapist", err);
      alert("Failed to add therapist");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error || !data) return <p className="p-6 text-red-600">{error}</p>;

  // Build top 3 cards using backend data
  const activeTherapistsCount = data.therapistManagement?.length ?? 0;
  const pendingIncentivesAmount = data.topCards?.subsidyPendingAmount ?? 0;
  // Sessions this month -> will be 0 for now unless backend adds it later
  const sessionsThisMonth =
    data.metrics?.sessionsThisMonth != null
      ? data.metrics.sessionsThisMonth
      : 0;

  const topCards = [
    {
      title: "Active Therapists",
      value: activeTherapistsCount.toString(),
      desc: "Registered wellness therapists",
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Sessions This Month",
      value: sessionsThisMonth.toString(),
      desc: "Total wellness sessions conducted",
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      title: "Pending Incentives",
      value: `₹${pendingIncentivesAmount}`,
      desc: "Wellness program incentives under processing",
      icon: DollarSign,
      color: "bg-yellow-500",
    },
  ];

  const registration = data.centreRegistrationStatus;

  return (
    <>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome Back, {data.header.centreName}!
          </h1>
          <p className="text-gray-500">{data.header.subtitle}</p>
        </div>

        {/* Top 3 cards (icon style from old UI) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow hover:shadow-md transition"
              >
                <div
                  className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}
                >
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="text-sm text-gray-600 font-medium">
                  {card.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {card.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Action Required (styled like old version, but uses backend messages) */}
        {data.actionRequired.hasAction && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="text-yellow-600 mr-3 mt-1" size={20} />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Action Required
                </h4>
                <ul className="space-y-1">
                  {data.actionRequired.messages.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      • {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
                    {data.actionRequired.primaryButton?.label ||
                      "Upload Documents"}
                  </button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm">
                    {data.actionRequired.secondaryButton?.label ||
                      "View Details"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Centre Registration Status (old layout, dynamic data) */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Centre Registration Status
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Registration Status
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    registration.registrationStatus === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {registration.registrationStatus}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Accreditation Level
                </span>
                <div className="flex items-center">
                  <Award className="text-purple-500 mr-2" size={16} />
                  <span className="text-sm text-gray-700">
                    {registration.accreditationLevel || "Not specified"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Star Rating</span>
                <span className="text-sm text-gray-700">
                  {registration.starRating
                    ? `${registration.starRating} ⭐`
                    : "—"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                View Public Profile
              </button>
            </div>
          </div>
        </div>

        {/* Session Tracker Overview (still static for now) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Session Tracker Overview
          </h3>
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Session Type</th>
                  <th className="text-left px-4 py-2">Participants</th>
                  <th className="text-left px-4 py-2">Submitted By</th>
                  <th className="text-left px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{session.date}</td>
                    <td className="px-4 py-2">{session.type}</td>
                    <td className="px-4 py-2">{session.participants}</td>
                    <td className="px-4 py-2">{session.submittedBy}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          session.status === "Verified"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Wellness Programs (backend data, old styling) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Active Wellness Programs
          </h3>
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
                {data.activeWellnessPrograms.length > 0 ? (
                  data.activeWellnessPrograms.map((program, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 last:border-0"
                    >
                      <td className="px-4 py-2">{program.programName}</td>
                      <td className="px-4 py-2">{program.participants}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            program.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {program.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {program.nextSession
                          ? new Date(
                              program.nextSession
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-3 text-center text-gray-400"
                    >
                      No wellness programs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Incentive & Grant Applications (backend data, old styling) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Incentive & Grant Applications
          </h3>
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
                {data.incentiveApplications.length > 0 ? (
                  data.incentiveApplications.map((incentive, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 last:border-0"
                    >
                      <td className="px-4 py-2">{incentive.type}</td>
                      <td className="px-4 py-2">{incentive.applicationId}</td>
                      <td className="px-4 py-2">₹{incentive.amount}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            incentive.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {incentive.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {incentive.lastUpdated
                          ? new Date(
                              incentive.lastUpdated
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-3 text-center text-gray-400"
                    >
                      No incentive / grant applications
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Therapist Management (backend data, old styling + Add Therapist modal) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Therapist Management
          </h3>
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="text-left px-4 py-2">Therapist Name</th>
                  <th className="text-left px-4 py-2">Certification</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-left px-4 py-2">Sessions</th>
                </tr>
              </thead>
              <tbody>
                {data.therapistManagement.length > 0 ? (
                  data.therapistManagement.map((therapist, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 last:border-0"
                    >
                      <td className="px-4 py-2">{therapist.name}</td>
                      <td className="px-4 py-2">{therapist.certification}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            therapist.status === "VERIFIED"
                              ? "bg-green-100 text-green-700"
                              : therapist.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {therapist.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{therapist.sessions}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-3 text-center text-gray-400"
                    >
                      No therapists found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Actions with icons (old style) */}
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
              <Calendar className="mr-2" size={16} />
              Add Session
            </button>
            <button
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm flex items-center"
              onClick={() => setShowTherapistModal(true)}
            >
              <Users className="mr-2" size={16} />
              Add Therapist
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
              <Heart className="mr-2" size={16} />
              Create Program
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm flex items-center">
              <Award className="mr-2" size={16} />
              Update Centre Info
            </button>
          </div>
        </div>
      </div>

      {/* Add Therapist Modal */}
      {showTherapistModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Therapist</h3>
            <form className="space-y-4" onSubmit={handleAddTherapist}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={newTherapist.name}
                  onChange={(e) =>
                    setNewTherapist((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Certification Code
                </label>
                <input
                  type="text"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={newTherapist.certificationCode}
                  onChange={(e) =>
                    setNewTherapist((prev) => ({
                      ...prev,
                      certificationCode: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={newTherapist.status}
                  onChange={(e) =>
                    setNewTherapist((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                >
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"
                  onClick={() => setShowTherapistModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
                >
                  Save Therapist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default WellnessCentreDashboard;
