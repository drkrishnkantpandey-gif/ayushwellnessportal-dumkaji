import React from "react";
import { Users, Building, DollarSign, AlertCircle, FileText, TrendingUp, CheckCircle, Award, BarChart3, Settings, Shield, Database } from "lucide-react";

const AdminDashboard = () => {
  const topCards = [
    {
      title: "Total System Users",
      value: "15,234",
      desc: "All registered users across the platform",
      icon: Users,
      color: "bg-blue-600"
    },
    {
      title: "System Health",
      value: "98.5%",
      desc: "Overall system uptime and performance",
      icon: Shield,
      color: "bg-green-500"
    },
    {
      title: "Total Budget Managed",
      value: "₹45.67 Cr",
      desc: "Across all incentive schemes",
      icon: DollarSign,
      color: "bg-purple-600"
    }
  ];

  const actionRequiredItems = [
    "System security audit scheduled for next week",
    "Database backup verification pending",
    "User access permissions review due"
  ];

  const systemStats = [
    {
      category: "User Management",
      totalUsers: 15234,
      activeUsers: 14567,
      newRegistrations: 156,
      pendingVerifications: 89
    },
    {
      category: "Application Processing",
      totalApplications: 3456,
      processedApplications: 3123,
      pendingApplications: 234,
      averageProcessingTime: "3.2 days"
    },
    {
      category: "Financial Operations",
      totalDisbursements: "₹45.67 Cr",
      pendingDisbursements: "₹2.34 Cr",
      approvedIncentives: 2890,
      rejectedApplications: 123
    },
    {
      category: "System Performance",
      uptime: "98.5%",
      responseTime: "1.2s",
      errorRate: "0.3%",
      dataProcessing: "99.8%"
    }
  ];

  const recentActivities = [
    {
      action: "System Backup Completed",
      timestamp: "2025-11-18 02:00:00",
      user: "System",
      status: "Success"
    },
    {
      action: "Security Patch Applied",
      timestamp: "2025-11-17 18:30:00",
      user: "Admin",
      status: "Success"
    },
    {
      action: "Database Maintenance",
      timestamp: "2025-11-17 10:15:00",
      user: "System",
      status: "Success"
    },
    {
      action: "User Access Review",
      timestamp: "2025-11-16 15:45:00",
      user: "Admin",
      status: "In Progress"
    },
    {
      action: "Performance Optimization",
      timestamp: "2025-11-15 09:00:00",
      user: "System",
      status: "Success"
    }
  ];

  const userAnalytics = [
    {
      role: "Yoga Professional",
      count: 8956,
      percentage: 58.8,
      growth: "+12.3%"
    },
    {
      role: "Yoga Centre",
      count: 2345,
      percentage: 15.4,
      growth: "+8.7%"
    },
    {
      role: "Wellness Centre",
      count: 1567,
      percentage: 10.3,
      growth: "+15.2%"
    },
    {
      role: "AYUSH Hospital",
      count: 890,
      percentage: 5.8,
      growth: "+6.4%"
    },
    {
      role: "AYUSH College",
      count: 456,
      percentage: 3.0,
      growth: "+4.1%"
    },
    {
      role: "District Officer",
      count: 89,
      percentage: 0.6,
      growth: "+2.2%"
    },
    {
      role: "Directorate",
      count: 23,
      percentage: 0.2,
      growth: "+0.0%"
    },
    {
      role: "Admin",
      count: 12,
      percentage: 0.1,
      growth: "+0.0%"
    }
  ];

  const systemAlerts = [
    {
      type: "Warning",
      message: "High memory usage detected in application server",
      timestamp: "2025-11-18 10:30:00",
      priority: "Medium"
    },
    {
      type: "Info",
      message: "Scheduled system maintenance on 2025-11-25",
      timestamp: "2025-11-17 14:00:00",
      priority: "Low"
    },
    {
      type: "Error",
      message: "Database connection timeout in backup server",
      timestamp: "2025-11-16 22:15:00",
      priority: "High"
    },
    {
      type: "Success",
      message: "Security audit completed successfully",
      timestamp: "2025-11-15 17:30:00",
      priority: "Low"
    }
  ];

  const performanceMetrics = [
    {
      metric: "Server Response Time",
      current: "1.2s",
      target: "< 2s",
      status: "Good",
      trend: "-0.3s"
    },
    {
      metric: "Database Query Time",
      current: "0.8s",
      target: "< 1s",
      status: "Good",
      trend: "-0.2s"
    },
    {
      metric: "API Success Rate",
      current: "99.7%",
      target: "> 99%",
      status: "Excellent",
      trend: "+0.2%"
    },
    {
      metric: "System Uptime",
      current: "98.5%",
      target: "> 99%",
      status: "Good",
      trend: "+0.1%"
    },
    {
      metric: "Error Rate",
      current: "0.3%",
      target: "< 1%",
      status: "Excellent",
      trend: "-0.1%"
    }
  ];

  const securityMetrics = [
    {
      aspect: "Authentication",
      status: "Secure",
      lastAudit: "2025-11-10",
      issues: 0
    },
    {
      aspect: "Authorization",
      status: "Secure",
      lastAudit: "2025-11-10",
      issues: 0
    },
    {
      aspect: "Data Encryption",
      status: "Secure",
      lastAudit: "2025-11-10",
      issues: 0
    },
    {
      aspect: "Access Control",
      status: "Needs Review",
      lastAudit: "2025-11-10",
      issues: 2
    },
    {
      aspect: "Network Security",
      status: "Secure",
      lastAudit: "2025-11-10",
      issues: 0
    }
  ];

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