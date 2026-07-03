import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, ShieldCheck, ArrowRight, FileText, MapPin, Building2, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

const ApplicationStatus = ({ setActiveTab }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await axiosInstance.get(`${API}/api/ayush-hospital/application-status`, {
                });
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (err) {
                console.error("Fetch application status error:", err);
                setError("Failed to load application status tracking.");
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 size={40} className="animate-spin text-blue-600" />
                <p className="text-gray-500 font-medium">Fetching your application workflow...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
                    <AlertCircle size={32} />
                    <div>
                        <h3 className="font-semibold text-lg">System Error</h3>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // A) If NO application exists
    if (!data?.hasApplication) {
        return (
            <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="max-w-2xl">
                    <h1 className="text-3xl font-semibold text-gray-900">Submission Status Monitoring</h1>
                    <p className="text-gray-500 mt-2 text-lg font-normal">Your account has no active registry entries. Explore the institutional support schemes below.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {data?.eligibleSchemes?.map((scheme, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col justify-between hover:border-blue-200 transition-all group">
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <FileText size={32} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">{scheme.type}</h3>
                                <p className="text-gray-500 leading-relaxed font-normal">{scheme.description}</p>
                            </div>
                            <button
                                onClick={() => setActiveTab("incentives")}
                                className="mt-8 w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-200"
                            >
                                Institutional Submission <ArrowRight size={20} />
                            </button>
                        </div>
                    ))}

                    <div className="bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                            <ShieldCheck size={28} />
                        </div>
                        <h4 className="font-medium text-emerald-900 text-lg">More Schemes Coming Soon</h4>
                        <p className="text-emerald-700/70 text-sm max-w-[200px] font-normal">We are constantly adding more financial and quality support programs.</p>
                    </div>
                </div>

                <div className="bg-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-500/20">
                    <div className="space-y-1">
                        <p className="font-semibold text-2xl uppercase tracking-wider">Regulatory Compliance Helpdesk</p>
                        <p className="text-blue-100 opacity-80 font-normal">Access institutional guidance for NABH accreditation and quality compliance.</p>
                    </div>
                    <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold text-sm hover:bg-blue-50 transition shadow-inner whitespace-nowrap">
                        TALK TO EXPERT
                    </button>
                </div>
            </div>
        );
    }

    // B) If application EXISTS
    const calculateProgress = (status) => {
        switch (status) {
            case 'SUBMITTED': return 33;
            case 'DISTRICT_VERIFIED': return 66;
            case 'DIRECTORATE_APPROVED': return 100;
            case 'REJECTED': return 100;
            default: return 0;
        }
    };

    const progress = calculateProgress(data.currentStatus);

    const steps = [
        { label: "Digital Registry Entry", id: 'submitted', icon: FileText },
        { label: "Field Verification (District)", id: 'district', icon: MapPin },
        { label: "Administrative Approval (Directorate)", id: 'directorate', icon: Building2 }
    ];

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Real-time Submission Workflow Monitor</h1>
                    <p className="text-gray-500 mt-1 font-normal">Institutional status tracking for your {data.applicationType}.</p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl text-blue-700 border border-blue-100">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                    <span className="text-xs font-semibold uppercase tracking-widest leading-none">Live Tracking</span>
                </div>
            </div>

            {/* Hero Badge Section */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col lg:flex-row items-center gap-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full -mr-32 -mt-32 -z-0"></div>
                <div className="relative z-10">
                    <div className="w-40 h-40 rounded-full border-[12px] border-gray-50 flex items-center justify-center shadow-inner">
                        <svg className="w-40 h-40 absolute -rotate-90 drop-shadow-sm">
                            <circle
                                cx="80" cy="80" r="72"
                                stroke="currentColor" strokeWidth="12" fill="transparent"
                                className="text-gray-50"
                            />
                            <circle
                                cx="80" cy="80" r="72"
                                stroke="currentColor" strokeWidth="12" fill="transparent"
                                strokeDasharray={452.4}
                                strokeDashoffset={452.4 - (452.4 * progress) / 100}
                                className={`${data.currentStatus === 'REJECTED' ? 'text-red-500' : 'text-blue-600'} transition-all duration-[1500ms] ease-out stroke-round`}
                            />
                        </svg>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className={`text-3xl font-semibold ${data.currentStatus === 'REJECTED' ? 'text-red-600' : 'text-blue-700'}`}>{progress}%</p>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">Progress</p>
                    </div>
                </div>

                <div className="text-center lg:text-left space-y-4 relative z-10 flex-1">
                    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest border shadow-sm ${data.currentStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                            data.currentStatus === 'DIRECTORATE_APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                'bg-blue-600 text-white border-blue-600'
                            }`}>
                            Current Stage: {data.currentStatus.replace(/_/g, ' ')}
                        </span>
                        <span className="bg-white text-gray-700 px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest border border-gray-200 shadow-sm">
                            Ref: AYH-{Math.floor(1000 + Math.random() * 9000)}-2026
                        </span>
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900 leading-tight">
                        {data.currentStatus === 'SUBMITTED' ? 'Awaiting District Field Review' :
                            data.currentStatus === 'DISTRICT_VERIFIED' ? 'State Directorate Final Approval' :
                                data.currentStatus === 'DIRECTORATE_APPROVED' ? 'Grant Disbursal Initiated' :
                                    'Application Requires Correction'}
                    </h2>
                    <p className="text-gray-500 max-w-xl text-lg leading-relaxed font-normal">
                        {data.currentStatus === 'SUBMITTED' && "Your documents are securely stored and pending assignment to a district verification officer."}
                        {data.currentStatus === 'DISTRICT_VERIFIED' && "Verified successfully at the district level. Currently with the State HQ for final certificate issuance."}
                        {data.currentStatus === 'DIRECTORATE_APPROVED' && "Process complete. The accreditation incentive has been approved for the current fiscal cycle."}
                        {data.currentStatus === 'REJECTED' && "Discrepancies found during verification. Please contact the district office or resubmit documents."}
                    </p>
                </div>
            </div>

            {/* Workflow Timeline */}
            <div className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-3 h-full bg-blue-600/5"></div>
                <div className="space-y-16">
                    {steps.map((stepConfig, idx) => {
                        const stepKey = stepConfig.id;
                        const stepData = data.workflow[stepKey];
                        const Icon = stepConfig.icon;

                        const isCompleted = stepData?.status === 'Completed' || stepData?.status === 'Verified' || stepData?.status === 'Approved';
                        const isRejected = stepData?.status === 'Rejected';
                        const isPending = stepData?.status === 'Pending' || !stepData;
                        const isActive = !isPending && !isCompleted && !isRejected;

                        return (
                            <div key={idx} className="flex gap-8 relative group">
                                {/* Connector Line */}
                                {idx !== steps.length - 1 && (
                                    <div className={`absolute left-[27px] top-[60px] w-1 h-[68px] rounded-full transition-colors duration-1000 ${isCompleted ? 'bg-emerald-400' : 'bg-gray-100'}`}></div>
                                )}

                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all duration-700 border-4 border-white shadow-2xl ${isCompleted ? 'bg-emerald-500 text-white rotate-[360deg]' :
                                    isRejected ? 'bg-red-500 text-white' :
                                        isActive || (idx === 0 && !isPending) ? 'bg-blue-600 text-white shadow-blue-200' :
                                            'bg-gray-50 text-gray-300 border-gray-50'
                                    }`}>
                                    {isCompleted ? <CheckCircle size={28} /> : <Icon size={24} />}
                                </div>

                                <div className="space-y-2 pt-1 flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <h3 className={`text-xl font-semibold ${isPending ? 'text-gray-300' : 'text-gray-800'}`}>
                                                {stepConfig.label}
                                            </h3>
                                            <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400 font-mono tracking-widest uppercase">
                                                <Clock size={12} className="text-gray-300" /> {stepData?.date || 'SCHEDULED'}
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-semibold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-2 ${isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            isRejected ? 'bg-red-50 text-red-700 border-red-100' :
                                                !isPending ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse' :
                                                    'bg-gray-50 text-gray-400 border-gray-100'
                                            }`}>
                                            {stepData?.status || 'PENDING'}
                                        </span>
                                    </div>
                                    <div className={`mt-4 p-5 rounded-2xl border transition-all duration-500 ${isPending ? 'bg-gray-50/50 border-gray-50' : 'bg-white border-gray-100 shadow-sm'}`}>
                                        <p className={`text-sm leading-relaxed font-normal ${isPending ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {stepData?.remarks || "The relevant department will provide feedback and action details here once processing begins."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Help/CTA */}
            <div className="bg-gray-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="space-y-2 relative z-10">
                    <p className="font-semibold text-2xl tracking-tight">Need expedited support?</p>
                    <p className="text-gray-400 text-sm max-w-sm font-normal">Our quality monitoring team is available 10 AM - 5 PM to assist with workflow queries.</p>
                </div>
                <button className="bg-white text-gray-900 px-10 py-4 rounded-2xl font-semibold text-xs hover:bg-gray-100 transition shadow-2xl relative z-10 uppercase tracking-widest">
                    Connect With Support
                </button>
            </div>
        </div>
    );
};

export default ApplicationStatus;
