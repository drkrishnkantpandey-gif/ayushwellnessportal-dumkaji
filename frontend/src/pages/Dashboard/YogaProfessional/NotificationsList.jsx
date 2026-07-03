import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiBell, FiCheck, FiClock, FiAlertCircle, FiInfo } from "react-icons/fi";
import { toast } from "react-toastify";

const NotificationsList = () => {
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axiosInstance.get(`${API}/api/yoga-professional/notifications`, {
            });
            setNotifications(res.data);
        } catch (err) {
            toast.error("Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    };

    const markRead = async (id) => {
        try {
            await axiosInstance.put(`/api/yoga-professional/notification/${id}/read`, {}, {
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-center text-teal-600">Loading alerts...</div>;

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Notifications & Alerts</h1>
                    <p className="text-gray-500 text-sm">Stay updated with system activities and profile status</p>
                </div>
                <FiBell className="text-gray-300 text-3xl" />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <FiBell className="mx-auto text-4xl text-gray-100 mb-4" />
                        <p className="text-gray-400">No notifications yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-6 transition flex items-start gap-4 ${notif.is_read ? 'opacity-60' : 'bg-teal-50/30'}`}
                                onClick={() => !notif.is_read && markRead(notif.id)}
                            >
                                <div className={`p-3 rounded-2xl ${notif.type === 'EXPIRY' || notif.type === 'REJECTED' ? 'bg-red-100 text-red-600' :
                                        notif.type === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {notif.type === 'EXPIRY' ? <FiAlertCircle size={20} /> : <FiInfo size={20} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`font-bold ${notif.is_read ? 'text-gray-600' : 'text-gray-800'}`}>{notif.title}</h3>
                                        <span className="text-xs text-gray-400">{new Date(notif.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                                </div>
                                {!notif.is_read && (
                                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsList;
