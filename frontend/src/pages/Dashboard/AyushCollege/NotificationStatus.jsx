import React, { useState } from "react";
import { Bell, AlertCircle, CheckCircle, XCircle, Info, Clock, Calendar, FileText, DollarSign, Award, TrendingUp, Trash2, Eye, Filter } from "lucide-react";

const NotificationsAlerts = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  // Notifications Data
  const notifications = [
    {
      id: 1,
      type: "urgent",
      category: "NAAC",
      title: "NAAC Peer Team Visit Scheduled",
      message: "Peer team visit has been scheduled for December 10, 2025. Please ensure all documents and infrastructure are ready for inspection.",
      date: "2025-11-22",
      time: "10:30 AM",
      isRead: false,
      icon: Award,
      actionRequired: true,
      deadline: "2025-12-10"
    },
    {
      id: 2,
      type: "warning",
      category: "Compliance",
      title: "Annual Compliance Report Due Soon",
      message: "Your annual NAAC compliance report is due by December 31, 2025. Please submit all required documents before the deadline.",
      date: "2025-11-20",
      time: "09:15 AM",
      isRead: false,
      icon: FileText,
      actionRequired: true,
      deadline: "2025-12-31"
    },
    {
      id: 3,
      type: "success",
      category: "Incentive",
      title: "Research Development Grant Approved",
      message: "Congratulations! Your Research Development Grant application (RD001) has been approved. Amount: ₹2,50,000. Payment will be processed within 7 working days.",
      date: "2025-11-18",
      time: "02:45 PM",
      isRead: false,
      icon: DollarSign,
      actionRequired: false
    },
    {
      id: 4,
      type: "info",
      category: "Update",
      title: "Faculty Documentation Update Required",
      message: "Please update faculty documentation for the following departments: Ayurveda, Unani. Submit updated qualification certificates and experience letters.",
      date: "2025-11-15",
      time: "11:20 AM",
      isRead: true,
      icon: Info,
      actionRequired: true,
      deadline: "2025-12-15"
    },
    {
      id: 5,
      type: "urgent",
      category: "NAAC",
      title: "NAAC Certificate Validity Expiring",
      message: "Your NAAC accreditation certificate will expire on January 14, 2029. Plan for re-accreditation process at least 6 months in advance.",
      date: "2025-11-12",
      time: "03:30 PM",
      isRead: true,
      icon: Award,
      actionRequired: true,
      deadline: "2028-07-14"
    },
    {
      id: 6,
      type: "info",
      category: "Payment",
      title: "Payment Processed Successfully",
      message: "Payment of ₹2,50,000 for Research Development Grant has been transferred to your registered bank account. Transaction ID: DBT2025112012345",
      date: "2025-11-20",
      time: "04:15 PM",
      isRead: true,
      icon: CheckCircle,
      actionRequired: false
    },
    {
      id: 7,
      type: "warning",
      category: "Incentive",
      title: "Additional Documents Required",
      message: "Your NAAC Accreditation Incentive application (NAAC001) requires additional documents. Please upload: Building plan approval certificate.",
      date: "2025-11-10",
      time: "01:00 PM",
      isRead: true,
      icon: AlertCircle,
      actionRequired: true,
      deadline: "2025-11-30"
    },
    {
      id: 8,
      type: "error",
      category: "Incentive",
      title: "Application Rejected",
      message: "Your NAAC Grade Improvement Incentive application (ACCR002) has been rejected. Reason: Grade improvement criteria not met. You can reapply in the next cycle.",
      date: "2025-11-01",
      time: "10:45 AM",
      isRead: true,
      icon: XCircle,
      actionRequired: false
    },
    {
      id: 9,
      type: "info",
      category: "Update",
      title: "Student Enrollment Data Updated",
      message: "Student enrollment data for Academic Year 2025-26 has been successfully updated. Total enrolled students: 1,856",
      date: "2025-10-28",
      time: "05:20 PM",
      isRead: true,
      icon: TrendingUp,
      actionRequired: false
    },
    {
      id: 10,
      type: "success",
      category: "NAAC",
      title: "SSR Report Submitted Successfully",
      message: "Your Self Study Report (SSR) has been successfully submitted to NAAC. Reference Number: SSR2025081512345. Next step: Data Validation & Verification.",
      date: "2025-08-15",
      time: "12:30 PM",
      isRead: true,
      icon: CheckCircle,
      actionRequired: false
    }
  ];

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !notif.isRead;
    if (activeFilter === "action") return notif.actionRequired;
    return notif.type === activeFilter;
  });

  // Notification type badges
  const getTypeBadge = (type) => {
    switch(type) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-300";
      case "warning":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "success":
        return "bg-green-100 text-green-700 border-green-300";
      case "error":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-blue-100 text-blue-700 border-blue-300";
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "urgent":
      case "warning":
        return <AlertCircle size={20} />;
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <XCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const toggleNotificationSelection = (id) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(nId => nId !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  const handleMarkAllRead = () => {
    alert("All notifications marked as read");
  };

  const handleDeleteSelected = () => {
    if (selectedNotifications.length === 0) {
      alert("Please select notifications to delete");
      return;
    }
    alert(`${selectedNotifications.length} notification(s) deleted`);
    setSelectedNotifications([]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications & Alerts</h1>
          <p className="text-gray-500">Stay updated with important notifications and alerts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllRead}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <CheckCircle size={18} />
            Mark All Read
          </button>
          <button
            onClick={handleDeleteSelected}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete Selected
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Total Notifications</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{notifications.length}</p>
            </div>
            <Bell className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Unread</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {notifications.filter(n => !n.isRead).length}
              </p>
            </div>
            <AlertCircle className="text-red-400" size={32} />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Action Required</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {notifications.filter(n => n.actionRequired).length}
              </p>
            </div>
            <Clock className="text-yellow-400" size={32} />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Completed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {notifications.filter(n => n.type === 'success').length}
              </p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow">
        <div className="flex overflow-x-auto border-b">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: notifications.filter(n => !n.isRead).length },
            { id: 'action', label: 'Action Required', count: notifications.filter(n => n.actionRequired).length },
            { id: 'urgent', label: 'Urgent', count: notifications.filter(n => n.type === 'urgent').length },
            { id: 'warning', label: 'Warnings', count: notifications.filter(n => n.type === 'warning').length },
            { id: 'success', label: 'Success', count: notifications.filter(n => n.type === 'success').length }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                activeFilter === filter.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {filter.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeFilter === filter.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <Bell className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No notifications found</h3>
            <p className="text-gray-500">You're all caught up! No {activeFilter} notifications at the moment.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const NotifIcon = notif.icon;
            return (
              <div
                key={notif.id}
                className={`bg-white rounded-xl shadow hover:shadow-md transition p-4 ${
                  !notif.isRead ? 'border-l-4 border-indigo-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notif.id)}
                    onChange={() => toggleNotificationSelection(notif.id)}
                    className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeBadge(notif.type)}`}>
                    <NotifIcon size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notif.title}
                          </h3>
                          {!notif.isRead && (
                            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                              New
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {notif.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {notif.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {notif.time}
                          </span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getTypeBadge(notif.type)}`}>
                        {getTypeIcon(notif.type)}
                        {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">{notif.message}</p>

                    {/* Action Required / Deadline */}
                    {notif.actionRequired && notif.deadline && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="text-yellow-600" size={16} />
                          <span className="text-sm font-medium text-yellow-900">
                            Action Required by: {notif.deadline}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {notif.actionRequired ? (
                        <>
                          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded text-sm flex items-center gap-1">
                            <CheckCircle size={14} />
                            Take Action
                          </button>
                          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm flex items-center gap-1">
                            <Eye size={14} />
                            View Details
                          </button>
                        </>
                      ) : (
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm flex items-center gap-1">
                          <Eye size={14} />
                          View Details
                        </button>
                      )}
                      {!notif.isRead && (
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Mark as Read
                        </button>
                      )}
                      <button className="text-red-600 hover:text-red-800 text-sm ml-auto">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Bell size={20} />
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">NAAC Updates</p>
              <p className="text-sm text-gray-600">Get notified about NAAC accreditation updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Incentive Application Updates</p>
              <p className="text-sm text-gray-600">Receive updates on your incentive applications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Payment Notifications</p>
              <p className="text-sm text-gray-600">Get notified when payments are processed</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Deadline Reminders</p>
              <p className="text-sm text-gray-600">Receive reminders for upcoming deadlines</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsAlerts;