// DashboardHome.jsx
import React, { useState, useEffect } from "react";
import { GraduationCap, Users, Calendar, DollarSign, AlertCircle, Award, FileText, BookOpen, Loader } from "lucide-react";
import dashboardService from "../../../services/dashboardService";

const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [data, setData] = useState({
    collegeName: "AYUSH College",
    naacGrade: "-",
    totalStudents: 0,
    pendingIncentive: 0,
    naacProgress: [],
    departments: [],
    research: [],
    incentives: [],
    naacCriteria: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel requests for efficiency
        const [
          overviewRes,
          progressRes,
          deptRes,
          researchRes,
          incRes,
          critRes
        ] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getNaacProgress(),
          dashboardService.getDepartments(),
          dashboardService.getResearch(),
          dashboardService.getIncentives(),
          dashboardService.getNaacCriteria()
        ]);

        setData({
          collegeName: overviewRes.data.collegeName,
          naacGrade: overviewRes.data.naacGrade,
          totalStudents: overviewRes.data.totalStudents,
          pendingIncentive: overviewRes.data.pendingIncentive,
          naacProgress: progressRes.data || [],
          departments: deptRes.data || [],
          research: researchRes.data || [],
          incentives: incRes.data || [],
          naacCriteria: critRes.data || []
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const topCards = [
    {
      title: "NAAC Accreditation Status",
      value: data.naacGrade,
      desc: "Current accreditation grade",
      icon: Award,
      color: "bg-purple-600"
    },
    {
      title: "Total Students Enrolled",
      value: data.totalStudents.toLocaleString(),
      desc: "Across all AYUSH programs",
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Pending Incentive Amount",
      value: `₹${Number(data.pendingIncentive).toLocaleString()}`,
      desc: "NAAC incentive under processing",
      icon: DollarSign,
      color: "bg-yellow-500"
    }
  ];

  const actionRequiredItems = [
    "Submit annual NAAC compliance report",
    "Upload updated faculty documentation",
    "Complete research publication verification"
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex">
            <AlertCircle className="text-red-600 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome Back, {data.collegeName}!
        </h1>
        <p className="text-gray-500">AYUSH College Dashboard (NAAC Incentive)</p>
      </div>

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
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
                Submit Reports
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NAAC Accreditation Progress */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">NAAC Accreditation Progress</h3>
        <div className="space-y-4">
          {data.naacProgress.length > 0 ? (
            data.naacProgress.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.completed
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
                  }`}>
                  {item.completed ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${item.completed ? 'text-gray-800' : 'text-gray-600'
                      }`}>
                      {item.step}
                    </span>
                    <span className="text-sm text-gray-500">{item.date}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No progress timeline available.</p>
          )}
        </div>
      </div>

      {/* Department Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Overview</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Department</th>
                <th className="text-left px-4 py-2">Head of Department</th>
                <th className="text-left px-4 py-2">Students</th>
                <th className="text-left px-4 py-2">Faculty</th>
                <th className="text-left px-4 py-2">Courses</th>
              </tr>
            </thead>
            <tbody>
              {data.departments.length > 0 ? data.departments.map((dept, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{dept.name}</td>
                  <td className="px-4 py-2">{dept.head_of_department}</td>
                  <td className="px-4 py-2">{dept.student_count}</td>
                  <td className="px-4 py-2">{dept.faculty_count}</td>
                  <td className="px-4 py-2">{dept.course_count}</td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="px-4 py-4 text-center text-gray-500">No departments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NAAC Criteria Status */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">NAAC Criteria Status</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Criterion</th>
                <th className="text-left px-4 py-2">Score</th>
                <th className="text-left px-4 py-2">Grade</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.naacCriteria.length > 0 ? data.naacCriteria.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{item.criterion_name}</td>
                  <td className="px-4 py-2">
                    <span className="font-medium">{item.score}</span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="font-medium">{item.grade}</span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'Very Good'
                      ? 'bg-green-100 text-green-700'
                      : item.status === 'Good'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="px-4 py-4 text-center text-gray-500">No NAAC criteria data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Research Publications */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Research Publications</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Research Title</th>
                <th className="text-left px-4 py-2">Faculty</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Journal</th>
                <th className="text-left px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.research.length > 0 ? data.research.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{item.title}</td>
                  <td className="px-4 py-2">{item.faculty}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'Published'
                      ? 'bg-green-100 text-green-700'
                      : item.status === 'Under Review'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{item.journal}</td>
                  <td className="px-4 py-2">{item.date}</td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="px-4 py-4 text-center text-gray-500">No research publications found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incentive Applications */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Incentive Applications</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Incentive Type</th>
                <th className="text-left px-4 py-2">Application ID</th>
                <th className="text-left px-4 py-2">Amount</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.incentives.length > 0 ? data.incentives.map((incentive, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{incentive.type}</td>
                  <td className="px-4 py-2">{incentive.id}</td>
                  <td className="px-4 py-2">₹{Number(incentive.amount).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${incentive.status === 'Approved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {incentive.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{incentive.updated}</td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="px-4 py-4 text-center text-gray-500">No incentive applications found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm flex items-center">
          <FileText className="mr-2" size={16} />
          Submit NAAC Report
        </button>
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
          <DollarSign className="mr-2" size={16} />
          Apply for Incentive
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
          <BookOpen className="mr-2" size={16} />
          Update Research Data
        </button>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm flex items-center">
          <GraduationCap className="mr-2" size={16} />
          Update College Profile
        </button>
      </div>
    </div>
  );
};

export default DashboardHome;