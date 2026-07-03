import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import { Award, Clock, RefreshCcw, AlertTriangle, ShieldCheck, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

const ValidityTracking = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchValidityData = async () => {
            try {
                const response = await axiosInstance.get(`${API}/api/ayush-hospital/validity`, {
                });
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (err) {
                console.error("Validity fetch error:", err);
                setError("Unable to sync accreditation data with the server.");
            } finally {
                setLoading(false);
            }
        };

        fetchValidityData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-sans">
                <Loader2 size={42} className="animate-spin text-blue-600" />
                <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">Synchronizing Certificate Life-cycle...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border-2 border-dashed border-red-200 rounded-[2rem] p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-200/50">
                        <AlertCircle size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-red-900 tracking-tight uppercase">Connection Failure</h2>
                        <p className="text-red-600/70 font-normal mt-1">{error}</p>
                    </div>
                    <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 text-white rounded-xl font-semibold text-xs hover:bg-red-700 transition tracking-widest uppercase">
                        Retry Sync
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-8">
                <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-[2rem] p-12 text-center space-y-6">
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto rotate-12 shadow-xl shadow-amber-200/50">
                        <Award size={40} />
                    </div>
                    <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-semibold text-amber-900 tracking-tight">Accreditation Data Missing</h2>
                        <p className="text-amber-700/70 font-normal mt-2 leading-relaxed">
                            We couldn't find active NABH accreditation dates for your hospital. Please ensure your profile is updated or contact our support desk.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const { daysRemaining, validityState, validFrom, validTo, nabhStatus } = data;

    const getStatusStyles = () => {
        switch (validityState) {
            case 'EXPIRING_SOON':
                return {
                    gradient: "from-amber-500 to-orange-600",
                    badge: "bg-amber-400 text-amber-900",
                    alertBg: "bg-amber-50 border-amber-100",
                    label: "Critical Attention Required"
                };
            case 'EXPIRED':
                return {
                    gradient: "from-red-600 to-rose-700",
                    badge: "bg-red-500 text-white",
                    alertBg: "bg-red-50 border-red-100",
                    label: "Accreditation Expired"
                };
            default:
                return {
                    gradient: "from-blue-600 to-indigo-700",
                    badge: "bg-green-500 text-white",
                    alertBg: "bg-gray-50 border-gray-100",
                    label: "Accreditation Active"
                };
        }
    };

    const styles = getStatusStyles();

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-700">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-semibold text-gray-900">Accreditation Lifecycle & Maturity Monitor</h1>
                    <div className={`w-3 h-3 rounded-full animate-pulse ${validityState === 'ACTIVE' ? 'bg-green-500' : (validityState === 'EXPIRED' ? 'bg-red-500' : 'bg-amber-500')}`}></div>
                </div>
                <p className="text-gray-500 text-lg leading-none font-normal">Precise lifecycle management and maturity monitoring for your NABH {nabhStatus} certification.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Countdown Card */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden transform transition-all hover:scale-[1.01]">
                    <div className={`bg-gradient-to-br ${styles.gradient} p-10 text-white relative`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="bg-white/20 p-4 rounded-2xl border border-white/20 backdrop-blur-md shadow-inner">
                                <Award size={40} className="drop-shadow-sm" />
                            </div>
                            <span className={`${styles.badge} px-5 py-2 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] shadow-lg border border-white/20 animate-pulse`}>
                                {validityState.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-5xl font-semibold mb-2 tracking-tighter">
                                {daysRemaining <= 0 ? "0" : daysRemaining} Days <span className="text-2xl font-semibold opacity-60">To Go</span>
                            </h2>
                            <p className="text-blue-50 font-normal text-lg opacity-80">Final phase before mandatory certificate renewal cycle.</p>
                        </div>

                        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-white/10 pt-8 relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] text-white/50 font-medium uppercase tracking-widest">Valid From</p>
                                <p className="font-semibold text-lg tracking-tight">{validFrom || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-white/50 font-medium uppercase tracking-widest">Valid Until</p>
                                <p className="font-semibold text-lg tracking-tight text-white">{validTo || 'N/A'}</p>
                            </div>
                            <div className="space-y-1 col-span-2 md:col-span-1">
                                <p className="text-[10px] text-white/50 font-medium uppercase tracking-widest">Institutional Status</p>
                                <p className="font-semibold text-lg tracking-tight uppercase opacity-90">{nabhStatus}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-800 tracking-tight uppercase">Accreditation Lifecycle Workflow</h3>
                            <div className="flex items-center gap-1.5 text-[9px] font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                <RefreshCcw size={12} className="animate-spin-slow" /> SYNCHRONIZING METRICS
                            </div>
                        </div>
                        <div className="relative pt-2">
                            <div className="overflow-hidden h-6 mb-6 text-xs flex rounded-2xl bg-gray-50 border p-1 shadow-inner">
                                <div
                                    style={{ width: `${Math.max(5, Math.min(100, (daysRemaining / 1095) * 100))}%` }}
                                    className={`shadow-lg flex flex-col text-center whitespace-nowrap text-white justify-center rounded-xl transition-all duration-[2000ms] ease-out ${validityState === 'ACTIVE' ? 'bg-blue-600' : 'bg-orange-500'}`}
                                ></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-medium text-gray-400 uppercase tracking-widest px-1">
                                <span className="flex items-center gap-1"><ShieldCheck size={12} /> Issued</span>
                                <span className={`flex items-center gap-1 ${validityState !== 'ACTIVE' ? 'text-orange-600' : 'text-blue-600'}`}><Clock size={12} /> Live Progress</span>
                                <span className="flex items-center gap-1"><RefreshCcw size={12} /> Renewal Window</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Card */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-50 group hover:border-blue-200 transition-all">
                        <h3 className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            System Logic Alert <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                        </h3>
                        <div className="flex flex-col items-center text-center space-y-5">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 ${validityState === 'ACTIVE' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                <RefreshCcw size={40} className={daysRemaining <= 90 ? 'animate-spin' : ''} />
                            </div>
                            <div>
                                <h4 className="text-xl font-semibold text-gray-900 tracking-tight">
                                    {daysRemaining <= 90 ? "Renewal Window Open" : "Renewal Cycle Closed"}
                                </h4>
                                <p className="text-sm text-gray-500 leading-relaxed mt-2 font-normal">
                                    {daysRemaining <= 90
                                        ? "Your renewal application window is now active. Please prepare your documentation immediately."
                                        : "The renewal window opens 6 months (180 days) prior to expiry. The system will unlock automated tools then."
                                    }
                                </p>
                            </div>
                            <button
                                disabled={daysRemaining > 180}
                                className={`w-full py-4 rounded-2xl font-semibold text-xs tracking-widest uppercase transition-all shadow-lg ${daysRemaining <= 180
                                    ? 'bg-gray-900 text-white hover:bg-blue-600 hover:shadow-blue-200 cursor-pointer'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Commence Recertification Workflow
                            </button>
                        </div>
                    </div>

                    <div className={`p-8 rounded-[2.5rem] border-2 border-dashed ${styles.alertBg} transition-colors duration-500`}>
                        <div className="flex items-center gap-3 font-semibold text-gray-900 mb-3 uppercase text-xs tracking-widest">
                            <AlertTriangle size={20} className={validityState !== 'ACTIVE' ? 'text-orange-500' : 'text-blue-500'} />
                            Accreditation Compliance
                        </div>
                        <p className="text-sm text-gray-600 font-normal leading-relaxed">
                            Official policy: accreditation is tied to your physical facility. Any alteration in bed capacity or facility relocation cancels current validity.
                            <span className="block mt-2 font-medium text-gray-400">— NABH Council Oversight</span>
                        </p>
                    </div>
                </div>
            </div>
            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Strategic Quality Compliance Parameters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: "Infrastructure Audit", status: "Compliant", date: "Jan 12, 2024", icon: ShieldCheck },
                        { title: "Staff Qualification", status: "Compliant", date: "Dec 05, 2023", icon: ShieldCheck },
                        { title: "Biomedical Waste", status: "Review Due", date: "Mar 15, 2024", icon: AlertTriangle },
                        { title: "Patient Safety Protocol", status: "Compliant", date: "Jan 12, 2024", icon: ShieldCheck },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 group hover:border-blue-200 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-2 rounded-lg ${item.status === 'Compliant' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                    <item.icon size={20} />
                                </div>
                                {item.status === 'Compliant' && <CheckCircle2 size={16} className="text-green-500" />}
                            </div>
                            <h4 className="font-medium text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{item.title}</h4>
                            <p className="text-xs text-gray-400 font-mono mt-1 font-semibold">{item.date}</p>
                            <div className={`mt-3 text-[10px] font-semibold uppercase tracking-tighter inline-block px-2 py-0.5 rounded ${item.status === 'Compliant' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {item.status}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ValidityTracking;

