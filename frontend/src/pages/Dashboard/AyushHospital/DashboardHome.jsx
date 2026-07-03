import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import { Award, DollarSign, Clock, CheckCircle, AlertCircle, TrendingUp, Loader2, Users } from "lucide-react";
import axios from "axios";

const DashboardHome = ({ setActiveTab }) => {
    const [data, setData] = useState(null);
    const [patientSummary, setPatientSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {

                const [dashRes, patientRes] = await Promise.all([
                    axiosInstance.get(`${API}/api/ayush-hospital/dashboard`, { headers }),
                    axiosInstance.get(`${API}/api/ayush-hospital/patient-summary`, { headers })
                ]);

                if (dashRes.data.success) {
                    setData(dashRes.data.data);
                }
                if (patientRes.data.success) {
                    setPatientSummary(patientRes.data.data);
                }
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError("Error connecting to server. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-sans">
                <Loader2 size={40} className="animate-spin text-blue-600" />
                <p className="text-gray-500 font-medium tracking-wide">Assembling dashboard metrics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center shadow-lg shadow-red-100/50">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-red-900 uppercase tracking-tight">System Outage</h2>
                    <p className="text-red-700 mt-2 font-medium opacity-70">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-10 py-3 bg-red-600 text-white rounded-xl font-semibold text-xs hover:bg-red-700 transition shadow-xl shadow-red-200 uppercase tracking-widest"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: "NABH Status",
            value: data?.nabhStatus || "Pending",
            desc: `Valid until: ${data?.nabhValidTill || 'N/A'}`,
            icon: Award,
            color: "bg-blue-600",
        },
        {
            title: "Patients This Month",
            value: patientSummary?.totalMonthly ? patientSummary.totalMonthly.toLocaleString() : "0",
            desc: `OPD: ${patientSummary?.opdMonthly || 0} | IPD: ${patientSummary?.ipdMonthly || 0}`,
            icon: Users,
            color: "bg-indigo-600",
        },
        {
            title: "Latest Incentive",
            value: data?.incentiveAmount ? `₹ ${data.incentiveAmount.toLocaleString()}` : "₹ 0",
            desc: data?.incentiveStatus || "No active applications",
            icon: DollarSign,
            color: "bg-emerald-600",
        },
        {
            title: "Validity Remaining",
            value: data?.validityRemainingDays !== undefined ? `${data.validityRemainingDays} Days` : "N/A",
            desc: `Renewal window: ${data?.nextRenewalDate || 'N/A'}`,
            icon: Clock,
            color: "bg-amber-600",
        },
    ];

    return (
        <div className="p-6 space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">
                        AYUSH Hospital Dashboard
                    </h1>
                    <p className="text-gray-500 text-base">Overview of NABH accreditation, incentive status, and hospital activity</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-normal text-blue-700 tracking-widest uppercase">Live Tracking Enabled</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-7 rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
                        <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-${stat.color.split('-')[1]}-200 text-white`}>
                            <stat.icon size={28} />
                        </div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">{stat.title}</p>
                        <p className="text-3xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                        <p className="text-xs text-gray-400 mt-3 font-normal flex items-center gap-1.5">
                            <Clock size={12} /> {stat.desc}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hospital Services */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 tracking-tight uppercase text-xs opacity-60">Hospital Services</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                            <Award className="mb-2" />
                            <span className="text-sm font-medium">Institutional Profile</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("incentives")}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                            <DollarSign className="mb-2" />
                            <span className="text-sm font-medium">Incentive Submission</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("documents")}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border border-purple-100 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                        >
                            <CheckCircle className="mb-2" />
                            <span className="text-sm font-medium">Document Management</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("validity")}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                            <TrendingUp className="mb-2" />
                            <span className="text-sm font-medium">Validity Monitoring</span>
                        </button>
                    </div>
                </div>

                {/* System Activity Logs */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 tracking-tight uppercase text-xs opacity-60">System Activity Logs</h2>
                    <div className="space-y-4">
                        {data?.recentUpdates && data.recentUpdates.length > 0 ? (
                            data.recentUpdates.map((update, idx) => (
                                <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                                    <div className={`mt-1 p-1 rounded-full ${update.type === 'success' ? 'bg-green-100' : 'bg-amber-100'}`}>
                                        {update.type === 'success' ? <CheckCircle size={14} className="text-green-600" /> : <AlertCircle size={14} className="text-amber-600" />}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700 font-medium">{update.text}</p>
                                        <p className="text-xs text-gray-400">{update.time}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-4">No recent updates found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
