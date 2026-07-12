import React, { useState, useEffect } from "react";
import API from "../../config/api";
import axiosInstance from "../../config/axiosInstance";
import { Users, Building, DollarSign, AlertCircle, FileText, TrendingUp, CheckCircle, Award, BarChart3, Settings, Shield, Database } from "lucide-react";
import { toast } from "react-toastify";

const AdminDashboard = ({ activeTab }) => {
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [filterStatus, setFilterStatus] = useState("pending");

  const fetchPendingUsers = async (statusVal = filterStatus) => {
    setLoadingUsers(true);
    try {
      const res = await axiosInstance.get(`${API}/api/admin/pending-registrations?status=${statusVal}`);
      if (res.data.success) {
        setPendingUsers(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching pending users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "approvals") {
      fetchPendingUsers(filterStatus);
    }
  }, [activeTab, filterStatus]);

  const handleAction = async (targetUserId, decision) => {
    if (!window.confirm(`Are you sure you want to ${decision} this registration?`)) return;
    try {
      const res = await axiosInstance.put(`${API}/api/admin/approve-user-registration/${targetUserId}`, {
        decision
      });
      if (res.data.success) {
        toast.success(res.data.message || `User registration ${decision} successfully!`);
        fetchPendingUsers();
      }
    } catch (err) {
      console.error("Error during approval decision:", err);
      toast.error(err.response?.data?.message || "Action failed.");
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const r = await axiosInstance.get(`${API}/api/admin/dashboard-stats`);
        if (r.data.success) {
          setStats(r.data.data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  const topCards = [
    {
      title: "Total System Users",
      value: stats ? stats.totalUsers : "0",
      desc: "All registered users across the platform",
      icon: Users,
      color: "bg-blue-600"
    },
    {
      title: "System Health",
      value: "99.9%",
      desc: "Overall system uptime and performance",
      icon: Shield,
      color: "bg-green-500"
    },
    {
      title: "Total Approved Entities",
      value: stats ? stats.totalEntities : "0",
      desc: "All approved entities on the platform",
      icon: CheckCircle,
      color: "bg-purple-600"
    }
  ];

  const actionRequiredItems = [
    "Verify pending user registrations in Admin panel",
    "Review incoming NAAC and NABH incentive requests"
  ];

  const systemStats = [
    {
      category: "User Management",
      totalUsers: stats ? stats.totalUsers : 0,
      activeUsers: stats ? stats.totalEntities : 0,
      newRegistrations: stats ? stats.pendingVerifications : 0,
      pendingVerifications: stats ? stats.pendingVerifications : 0
    }
  ];

  const recentActivities = [];

  const userAnalytics = (stats ? stats.roleStats : []).map(r => ({
    role: r.type,
    count: r.registered,
    percentage: stats && stats.totalUsers > 0 ? parseFloat(((r.registered / stats.totalUsers) * 100).toFixed(1)) : 0,
    growth: "+0.0%"
  }));

  const systemAlerts = [];

  const performanceMetrics = [
    {
      metric: "Server Response Time",
      current: "0.1s",
      target: "< 2s",
      status: "Excellent",
      trend: "Optimal"
    },
    {
      metric: "Database Query Time",
      current: "0.05s",
      target: "< 1s",
      status: "Excellent",
      trend: "Optimal"
    },
    {
      metric: "API Success Rate",
      current: "100%",
      target: "> 99%",
      status: "Excellent",
      trend: "Optimal"
    },
    {
      metric: "System Uptime",
      current: "99.99%",
      target: "> 99%",
      status: "Excellent",
      trend: "Optimal"
    },
    {
      metric: "Error Rate",
      current: "0.0%",
      target: "< 1%",
      status: "Excellent",
      trend: "Optimal"
    }
  ];

  const securityMetrics = [
    {
      aspect: "Authentication",
      status: "Secure",
      lastAudit: new Date().toISOString().split('T')[0],
      issues: 0
    },
    {
      aspect: "Authorization",
      status: "Secure",
      lastAudit: new Date().toISOString().split('T')[0],
      issues: 0
    },
    {
      aspect: "Data Encryption",
      status: "Secure",
      lastAudit: new Date().toISOString().split('T')[0],
      issues: 0
    },
    {
      aspect: "Access Control",
      status: "Secure",
      lastAudit: new Date().toISOString().split('T')[0],
      issues: 0
    },
    {
      aspect: "Network Security",
      status: "Secure",
      lastAudit: new Date().toISOString().split('T')[0],
      issues: 0
    }
  ];

  if (activeTab === "approvals") {
    return (
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle className="text-teal-600" size={32} />
            Directorate Nodal Officer Approvals
          </h1>
          <p className="text-gray-500 mt-1">Review and approve incoming registration requests from Directorate officers</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-px">
          {["pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`pb-3 px-4 text-sm font-semibold capitalize border-b-2 transition-all ${
                filterStatus === status
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {status === "pending" ? "Pending Approvals" : status === "approved" ? "Approved History" : "Rejected History"}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {loadingUsers ? (
            <div className="p-8 text-center text-teal-600 font-medium">Loading applications...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium bg-gray-50 rounded-xl">
              No {filterStatus} Directorate registrations found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Officer Details</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID Details</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Documents</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted On</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {pendingUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{u.full_name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                        <div className="text-sm text-gray-500">{u.phone}</div>
                        <div className="text-xs mt-1 text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full inline-block">
                          Designation: {u.designation || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        <div>Type: {u.id_type || "N/A"}</div>
                        <div className="font-mono mt-0.5">No: {u.id_number || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 space-y-1 text-sm">
                        {u.id_upload_path ? (
                          <a
                            href={`${API}${u.id_upload_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline block font-semibold"
                          >
                            📄 View ID Upload
                          </a>
                        ) : (
                          <span className="text-gray-400">No ID File</span>
                        )}
                        {u.authority_order_path ? (
                          <a
                            href={`${API}${u.authority_order_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline block font-semibold"
                          >
                            📄 View Authority Order
                          </a>
                        ) : (
                          <span className="text-gray-400">No Authority File</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {filterStatus === "pending" ? (
                          <>
                            <button
                              onClick={() => handleAction(u.id, "approved")}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(u.id, "rejected")}
                              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            filterStatus === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {filterStatus === "approved" ? "Approved" : "Rejected"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome Back, System Administrator!
        </h1>
        <p className="text-gray-500">System Administration Dashboard</p>
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
                Schedule Audit
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow">
              <h4 className="font-semibold text-gray-800 mb-4">{stat.category}</h4>
              <div className="space-y-3">
                {Object.entries(stat).filter(([key]) => key !== 'category').map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent System Activities */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent System Activities</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Action</th>
                <th className="text-left px-4 py-2">Timestamp</th>
                <th className="text-left px-4 py-2">User</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((activity, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{activity.action}</td>
                  <td className="px-4 py-2">{activity.timestamp}</td>
                  <td className="px-4 py-2">{activity.user}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      activity.status === 'Success' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Analytics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">User Analytics by Role</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">User Role</th>
                <th className="text-left px-4 py-2">Count</th>
                <th className="text-left px-4 py-2">Percentage</th>
                <th className="text-left px-4 py-2">Growth</th>
                <th className="text-left px-4 py-2">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {userAnalytics.map((user, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2">{user.count}</td>
                  <td className="px-4 py-2">{user.percentage}%</td>
                  <td className="px-4 py-2">
                    <span className="text-green-600 font-medium">{user.growth}</span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${user.percentage}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Alerts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Alerts</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-left px-4 py-2">Message</th>
                <th className="text-left px-4 py-2">Timestamp</th>
                <th className="text-left px-4 py-2">Priority</th>
              </tr>
            </thead>
            <tbody>
              {systemAlerts.map((alert, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      alert.type === 'Error' 
                        ? 'bg-red-100 text-red-700'
                        : alert.type === 'Warning'
                        ? 'bg-yellow-100 text-yellow-700'
                        : alert.type === 'Success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {alert.type}
                    </span>
                  </td>
                  <td className="px-4 py-2">{alert.message}</td>
                  <td className="px-4 py-2">{alert.timestamp}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      alert.priority === 'High' 
                        ? 'bg-red-100 text-red-700' 
                        : alert.priority === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {alert.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Metric</th>
                <th className="text-left px-4 py-2">Current</th>
                <th className="text-left px-4 py-2">Target</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Trend</th>
              </tr>
            </thead>
            <tbody>
              {performanceMetrics.map((metric, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{metric.metric}</td>
                  <td className="px-4 py-2">{metric.current}</td>
                  <td className="px-4 py-2">{metric.target}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      metric.status === 'Excellent' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {metric.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`font-medium ${
                      metric.trend.startsWith('+') ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {metric.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Metrics</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Security Aspect</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Last Audit</th>
                <th className="text-left px-4 py-2">Issues Found</th>
              </tr>
            </thead>
            <tbody>
              {securityMetrics.map((security, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{security.aspect}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      security.status === 'Secure' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {security.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{security.lastAudit}</td>
                  <td className="px-4 py-2">
                    <span className={`font-medium ${
                      security.issues === 0 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {security.issues}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center">
          <Settings className="mr-2" size={16} />
          System Settings
        </button>
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
          <Users className="mr-2" size={16} />
          User Management
        </button>
        <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
          <Database className="mr-2" size={16} />
          Database Backup
        </button>
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
          <Shield className="mr-2" size={16} />
          Security Audit
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;