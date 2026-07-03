import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import { Building2, MapPin, Phone, Mail, Award, ShieldCheck, Loader2, AlertCircle, Users, Clock } from "lucide-react";
import axios from "axios";

const HospitalProfile = () => {
    const [hospitalData, setHospitalData] = useState(null);
    const [patientStats, setPatientStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        opdCount: 0,
        ipdCount: 0,
        totalBeds: 0,
        departments: []
    });
    const [saving, setSaving] = useState(false);
    const [customDept, setCustomDept] = useState("");
    const [clinicalInfra, setClinicalInfra] = useState(null);
    const [isEditingInfra, setIsEditingInfra] = useState(false);
    const [editInfraData, setEditInfraData] = useState({
        totalBeds: 0,
        totalDepartments: 0,
        hasOpd: false,
        hasIpd: false,
        hasOt: false,
        hasIcu: false,
        hasDiagnostics: false,
        hasPharmacy: false
    });

    const presetDepartments = ["Emergency", "Gynecology", "Pediatrics", "Pharmacy", "Radiology", "Surgery", "ICU", "General Medicine", "Ayurveda"];

    useEffect(() => {
        const fetchAllData = async () => {
            try {

                // Fetching profile, stats, and clinical infra in parallel
                const [profileRes, statsRes, infraRes] = await Promise.all([
                    axiosInstance.get(`${API}/api/ayush-hospital/profile`, { headers }),
                    axiosInstance.get(`${API}/api/ayush-hospital/patient-stats`, { headers }),
                    axiosInstance.get(`${API}/api/ayush-hospital/clinical-infra`, { headers })
                ]);

                if (profileRes.data.success) {
                    setHospitalData(profileRes.data.data);
                } else {
                    setError("Failed to load profile data");
                }

                if (statsRes.data.success && statsRes.data.data) {
                    setPatientStats(statsRes.data.data);
                    setEditData(prev => ({
                        ...prev,
                        opdCount: statsRes.data.data.opdMonthly || 0,
                        ipdCount: statsRes.data.data.ipdMonthly || 0
                    }));
                }

                if (profileRes.data.success && profileRes.data.data) {
                    setEditData(prev => ({
                        ...prev,
                        totalBeds: profileRes.data.data.totalBeds || 0,
                        departments: profileRes.data.data.departments || []
                    }));
                }

                if (infraRes.data.success && infraRes.data.data) {
                    setClinicalInfra(infraRes.data.data);
                    setEditInfraData({
                        totalBeds: infraRes.data.data.total_beds || 0,
                        totalDepartments: infraRes.data.data.total_departments || 0,
                        hasOpd: infraRes.data.data.has_opd || false,
                        hasIpd: infraRes.data.data.has_ipd || false,
                        hasOt: infraRes.data.data.has_ot || false,
                        hasIcu: infraRes.data.data.has_icu || false,
                        hasDiagnostics: infraRes.data.data.has_diagnostics || false,
                        hasPharmacy: infraRes.data.data.has_pharmacy || false
                    });
                }
            } catch (err) {
                console.error("Profile fetch error:", err);
                setError(err.response?.data?.message || "Server connection error");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const handleEditToggle = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (patientStats && hospitalData) {
            setEditData({
                opdCount: patientStats.opdMonthly || 0,
                ipdCount: patientStats.ipdMonthly || 0,
                totalBeds: hospitalData.totalBeds || 0,
                departments: hospitalData.departments || []
            });
        }
        setCustomDept(""); // Clear custom department input on cancel
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value === '' ? '' : (name === 'departments' ? value : parseInt(value) || 0)
        }));
    };

    const toggleDepartment = (dept) => {
        setEditData(prev => {
            const depts = prev.departments.includes(dept)
                ? prev.departments.filter(d => d !== dept)
                : [...prev.departments, dept];
            return { ...prev, departments: depts };
        });
    };

    const handleSave = async () => {
        if (editData.totalBeds < 0) {
            alert("Total beds cannot be negative.");
            return;
        }

        setSaving(true);
        try {
            // Call the consolidated update-profile API
            const res = await axiosInstance.post(`${API}/api/ayush-hospital/update-profile`, editData, {
            });

            if (res.data.success) {
                // Refresh data to sync UI
                const [profileRes, statsRes] = await Promise.all([
                ]);

                if (profileRes.data.success) setHospitalData(profileRes.data.data);
                if (statsRes.data.success) setPatientStats(statsRes.data.data);

                setIsEditing(false);
                setCustomDept(""); // Clear custom department input on save
            }
        } catch (err) {
            console.error("Save error:", err);
            alert(err.response?.data?.message || "Failed to save data. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleInfraEditToggle = () => {
        setIsEditingInfra(true);
    };

    const handleInfraCancel = () => {
        setIsEditingInfra(false);
        if (clinicalInfra) {
            setEditInfraData({
                totalBeds: clinicalInfra.total_beds || 0,
                totalDepartments: clinicalInfra.total_departments || 0,
                hasOpd: clinicalInfra.has_opd || false,
                hasIpd: clinicalInfra.has_ipd || false,
                hasOt: clinicalInfra.has_ot || false,
                hasIcu: clinicalInfra.has_icu || false,
                hasDiagnostics: clinicalInfra.has_diagnostics || false,
                hasPharmacy: clinicalInfra.has_pharmacy || false
            });
        }
    };

    const handleInfraChange = (name, value) => {
        setEditInfraData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInfraSave = async () => {
        setSaving(true);
        try {
            const res = await axiosInstance.post(`${API}/api/ayush-hospital/clinical-infra`, editInfraData, {
            });

            if (res.data.success) {
                setClinicalInfra(res.data.data);
                setIsEditingInfra(false);
            }
        } catch (err) {
            console.error("Infra save error:", err);
            alert("Failed to save clinical infrastructure data.");
        } finally {
            setSaving(false);
        }
    };

    // 1. Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-sans animate-pulse">
                <Loader2 size={42} className="animate-spin text-blue-600" />
                <p className="text-gray-400 font-medium tracking-widest uppercase text-[10px]">Retrieving Hospital Credentials...</p>
            </div>
        );
    }

    // 2. Error State
    if (error) {
        return (
            <div className="p-8 font-sans">
                <div className="bg-red-50 border-2 border-dashed border-red-200 rounded-[2.5rem] p-12 text-center space-y-6 shadow-2xl shadow-red-100">
                    <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                        <AlertCircle size={40} className="text-red-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-red-900 uppercase tracking-tight">Access Error</h2>
                    <p className="text-red-700 font-normal mt-1 opacity-70 max-w-md mx-auto">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-12 py-4 bg-red-600 text-white rounded-2xl font-semibold text-xs hover:bg-red-700 transition tracking-[0.2em] uppercase shadow-xl shadow-red-200 active:scale-95"
                    >
                        Re-Authenticate
                    </button>
                </div>
            </div>
        );
    }

    // 3. Null Data Safety check
    if (!hospitalData) {
        return (
            <div className="p-8 font-sans">
                <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-[2.5rem] p-12 text-center">
                    <AlertCircle size={40} className="mx-auto text-amber-500 mb-4" />
                    <p className="text-amber-800 font-semibold uppercase tracking-widest text-sm">Profile Not Found</p>
                    <p className="text-amber-600 mt-2 font-normal">Please contact your administrator if this persists.</p>
                </div>
            </div>
        );
    }

    // 4. Default Fallback Objects
    const profile = hospitalData || {};
    const stats = patientStats || { opdMonthly: 0, ipdMonthly: 0, opdAnnual: 0, ipdAnnual: 0, lastUpdated: 'N/A' };
    const nabh = profile.nabh || { status: 'Pending', certificateNumber: 'N/A', validTill: 'N/A' };
    const verif = profile.verification || { district: 'Pending', directorate: 'Pending', verifiedAt: 'N/A' };

    const isVerified = verif.directorate === 'Approved';

    return (
        <div className="p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 font-sans max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
                <div>
                    <h1 className="text-5xl font-semibold text-gray-900 mb-2">Institutional Profile</h1>
                    <p className="text-gray-500 text-xl font-normal">Verification and monitoring of registration credentials.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    {isVerified ? (
                        <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-emerald-100 border border-emerald-400">
                            <ShieldCheck size={16} /> Verified Profile
                        </div>
                    ) : (
                        <div className="bg-amber-500 text-white px-6 py-3 rounded-2xl text-[10px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-amber-100 border border-amber-400 animate-pulse">
                            <AlertCircle size={16} /> Verification Pending
                        </div>
                    )}
                    <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-semibold uppercase tracking-[0.2em] border border-blue-500 shadow-xl shadow-blue-100">
                        REG # {profile.registrationNumber || 'Pending'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: General & Stats */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Institutional Registry */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 hover:shadow-gray-300/50 transition-shadow group">
                        <h2 className="text-xl font-semibold text-gray-900 mb-10 pb-4 border-b border-gray-50 flex items-center gap-4 uppercase">
                            <Building2 className="text-blue-600 group-hover:scale-110 transition-transform" /> Institutional Registry
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-2">
                                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.25em]">Facility Name</label>
                                <p className="text-gray-900 font-semibold text-2xl leading-tight">{profile.hospitalName || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.25em]">AYUSH Modality</label>
                                <p className="text-gray-800 font-semibold text-xl">{profile.ayushSystem || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.25em]">Category</label>
                                <p className="text-gray-800 font-semibold text-xl">{profile.hospitalType || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.25em]">Registry ID</label>
                                <p className="text-blue-600 font-semibold text-xl font-mono">{profile.registrationNumber || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Operational Performance Metrics */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 hover:shadow-gray-300/50 transition-shadow group">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-4 border-b border-gray-50 gap-4">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-4 uppercase">
                                <Users className="text-indigo-600 group-hover:scale-110 transition-transform" /> Operational Performance Metrics
                            </h2>
                            {!isEditing && (
                                <button
                                    onClick={handleEditToggle}
                                    className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100 active:scale-95"
                                >
                                    Edit Operational Details
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                            {[
                                { label: 'OPD (Monthly)', val: stats.opdMonthly, color: 'text-indigo-600', key: 'opdCount', editable: true },
                                { label: 'IPD (Monthly)', val: stats.ipdMonthly, color: 'text-indigo-600', key: 'ipdCount', editable: true },
                                { label: 'OPD (Annual)', val: stats.opdAnnual, color: 'text-gray-900' },
                                { label: 'IPD (Annual)', val: stats.ipdAnnual, color: 'text-gray-900' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-4">
                                    <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest leading-none">{item.label}</label>
                                    {isEditing && item.editable ? (
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name={item.key}
                                                value={editData[item.key]}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border-2 border-indigo-100 rounded-2xl px-4 py-3 text-2xl font-semibold text-indigo-700 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                                                placeholder="0"
                                            />
                                        </div>
                                    ) : (
                                        <p className={`${item.color} font-semibold text-4xl`}>{item.val?.toLocaleString() || 0}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        {isEditing && (
                            <div className="mt-10 flex gap-4 border-t border-gray-50 pt-8">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold text-xs hover:bg-indigo-600 transition tracking-[0.2em] uppercase shadow-xl shadow-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-semibold text-xs hover:bg-gray-200 transition tracking-[0.2em] uppercase border border-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                        <div className="mt-10 pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                Live Metrics Aggregation Enabled
                            </div>
                            <div className="bg-indigo-50 text-indigo-700 px-5 py-2 rounded-2xl border border-indigo-100 text-[10px] font-medium uppercase tracking-widest">
                                Last Updated: {stats.lastUpdated || 'Initial Sync'}
                            </div>
                        </div>
                    </div>

                    {/* Clinical Infrastructure Section */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 hover:shadow-gray-300/50 transition-shadow group">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-4 border-b border-gray-50 gap-4">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-4 uppercase">
                                <Building2 className="text-amber-500 group-hover:scale-110 transition-transform" /> Clinical Infrastructure
                            </h2>
                            {!isEditingInfra && (
                                <button
                                    onClick={handleInfraEditToggle}
                                    className="px-5 py-2 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all shadow-sm border border-amber-100 active:scale-95"
                                >
                                    Edit Clinical Infrastructure
                                </button>
                            )}
                        </div>

                        {isEditingInfra ? (
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Total Bed Capacity</label>
                                        <input
                                            type="number"
                                            value={editInfraData.totalBeds}
                                            onChange={(e) => handleInfraChange('totalBeds', parseInt(e.target.value) || 0)}
                                            className="w-full bg-gray-50 border-2 border-amber-100 rounded-2xl px-6 py-4 text-2xl font-semibold text-gray-900 focus:outline-none focus:border-amber-400 shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Number of Clinical Departments</label>
                                        <input
                                            type="number"
                                            value={editInfraData.totalDepartments}
                                            onChange={(e) => handleInfraChange('totalDepartments', parseInt(e.target.value) || 0)}
                                            className="w-full bg-gray-50 border-2 border-amber-100 rounded-2xl px-6 py-4 text-2xl font-semibold text-gray-900 focus:outline-none focus:border-amber-400 shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {[
                                        { key: 'hasOpd', label: 'OPD Facility' },
                                        { key: 'hasIpd', label: 'IPD Facility' },
                                        { key: 'hasOt', label: 'Operation Theatre' },
                                        { key: 'hasIcu', label: 'ICU / HDU' },
                                        { key: 'hasDiagnostics', label: 'Diagnostics' },
                                        { key: 'hasPharmacy', label: 'Pharmacy' }
                                    ].map((fac) => (
                                        <div key={fac.key} className="p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 space-y-3">
                                            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest block">{fac.label}</label>
                                            <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                                                <button
                                                    onClick={() => handleInfraChange(fac.key, true)}
                                                    className={`flex-1 py-2 text-[10px] font-semibold uppercase rounded-lg transition-all ${editInfraData[fac.key] ? 'bg-amber-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    onClick={() => handleInfraChange(fac.key, false)}
                                                    className={`flex-1 py-2 text-[10px] font-semibold uppercase rounded-lg transition-all ${!editInfraData[fac.key] ? 'bg-gray-200 text-gray-600 shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                                                >
                                                    No
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-6 border-t border-gray-50">
                                    <button
                                        onClick={handleInfraSave}
                                        disabled={saving}
                                        className="flex-1 px-8 py-4 bg-amber-600 text-white rounded-2xl font-semibold text-xs hover:bg-amber-700 transition tracking-[0.2em] uppercase shadow-xl shadow-amber-100 disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : "Save Infrastructure Data"}
                                    </button>
                                    <button
                                        onClick={handleInfraCancel}
                                        className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-semibold text-xs hover:bg-gray-200 transition tracking-[0.2em] uppercase border border-gray-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Total Beds</label>
                                        <p className="text-gray-900 font-semibold text-4xl">{clinicalInfra?.total_beds || 0}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Departments</label>
                                        <p className="text-gray-900 font-semibold text-4xl">{clinicalInfra?.total_departments || 0}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Avg. Occupancy</label>
                                        <p className="text-emerald-600 font-semibold text-4xl">{(clinicalInfra?.total_beds > 0 ? ((stats.ipdMonthly / clinicalInfra.total_beds) * 10).toFixed(1) : 0)}%</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">System Status</label>
                                        <div className="flex items-center gap-2 pt-2">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest">Operational</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'OPD Facility', val: clinicalInfra?.has_opd },
                                        { label: 'IPD Facility', val: clinicalInfra?.has_ipd },
                                        { label: 'Operation Theatre', val: clinicalInfra?.has_ot },
                                        { label: 'ICU / HDU', val: clinicalInfra?.has_icu },
                                        { label: 'Diagnostics', val: clinicalInfra?.has_diagnostics },
                                        { label: 'Pharmacy', val: clinicalInfra?.has_pharmacy }
                                    ].map((fac, i) => (
                                        <div key={i} className="flex flex-col gap-2 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                            <span className="text-[9px] font-medium text-gray-400 uppercase tracking-widest">{fac.label}</span>
                                            {fac.val ? (
                                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg w-fit border border-emerald-100">AVAILABLE</span>
                                            ) : (
                                                <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-lg w-fit border border-gray-200">UNAVAILABLE</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Administrative Contact Details */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 hover:shadow-gray-300/50 transition-shadow">
                        <h2 className="text-xl font-semibold text-gray-900 mb-10 pb-4 border-b border-gray-50 flex items-center gap-4 uppercase">
                            <MapPin className="text-emerald-500" /> Administrative Contact Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {[
                                { icon: MapPin, label: 'Postal Address', val: `${profile.address || ''}, ${profile.district || ''}, ${profile.state || ''}` },
                                { icon: Mail, label: 'Official Email', val: profile.email || 'N/A' },
                                { icon: Phone, label: 'Contact Phone', val: profile.mobile || 'N/A' },
                                { icon: Building2, label: 'Primary Contact', val: profile.contactPerson || 'N/A' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-5">
                                    <div className="mt-1 text-emerald-600 bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-50/50">
                                        <item.icon size={26} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{item.label}</label>
                                        <p className="text-gray-900 font-semibold text-lg leading-snug tracking-tight">{item.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: NABH & Verification */}
                <div className="space-y-12">
                    {/* NABH Certification */}
                    <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-950 p-10 rounded-[3rem] shadow-2xl shadow-blue-900/40 border border-blue-900 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="bg-white/10 p-5 rounded-3xl border border-white/20 backdrop-blur-xl shadow-2xl">
                                <Award size={36} className="text-blue-400" />
                            </div>
                            <div className="bg-white/10 text-white px-4 py-2 rounded-2xl text-[9px] font-medium uppercase tracking-[0.25em] border border-white/20 backdrop-blur-md">
                                {nabh.status === 'Fully Accredited' ? 'Gold Standard' : 'Entry Level'}
                            </div>
                        </div>
                        <h3 className="text-3xl font-semibold mb-1 relative z-10">Accreditation Details</h3>
                        <p className="text-blue-300/80 text-sm mb-12 font-medium tracking-wide relative z-10">Quality Standard Compliance</p>

                        <div className="space-y-6 relative z-10">
                            {[
                                { label: 'Certification Status', val: nabh.status },
                                { label: 'Certificate Number', val: nabh.certificateNumber, mono: true },
                                { label: 'Valid Maturity Date', val: nabh.validTill }
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-[11px] border-b border-white/10 pb-4">
                                    <span className="text-blue-300 font-medium uppercase tracking-widest">{item.label}</span>
                                    <span className={`font-semibold tracking-tight text-white ${item.mono ? 'font-mono' : ''}`}>{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Verification Roadmap */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 group hover:border-emerald-200 transition-all duration-300">
                        <h2 className="text-[10px] font-black text-gray-400 mb-10 uppercase tracking-[0.4em] text-center flex items-center justify-center gap-3">
                            <ShieldCheck size={16} className="text-emerald-500" /> Regulatory Compliance Status
                        </h2>
                        <div className="flex flex-col items-center">
                            <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center mb-8 border-4 shadow-2xl transform transition-transform group-hover:rotate-6 duration-500 ${isVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100'}`}>
                                <ShieldCheck size={56} />
                            </div>
                            <div className="space-y-4 w-full">
                                {[
                                    { level: 'District Verification', val: verif.district },
                                    { level: 'Directorate Approval', val: verif.directorate }
                                ].map((step, i) => (
                                    <div key={i} className={`flex items-center justify-between p-5 rounded-[1.5rem] transform hover:scale-[1.02] transition-transform ${step.val === 'Approved' || step.val === 'Verified' ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                                        <span className="text-[10px] font-medium uppercase tracking-widest">{step.level}</span>
                                        <div className="flex items-center gap-2">
                                            {(step.val === 'Approved' || step.val === 'Verified') && <ShieldCheck size={14} className="text-emerald-600" />}
                                            <span className="font-semibold text-xs uppercase">{step.val}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-10 font-semibold tracking-[0.2em] uppercase">
                                <Clock size={12} className="inline mr-2 mb-1" /> Checked-In: {verif.verifiedAt || 'Never'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalProfile;
