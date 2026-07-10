import React, { useState, useEffect } from "react";
import axios from "axios";
import API from "../config/api";
import { Search, MapPin, CheckCircle, XCircle, ShieldAlert, Award, FileText, ArrowLeft } from "lucide-react";

const Registry = ({ onBack, forceVerifyOpen = false }) => {
  const [activeTab, setActiveTab] = useState("wellness"); // wellness | yoga
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  
  // Verification search state
  const [verifySearch, setVerifySearch] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [showVerifySection, setShowVerifySection] = useState(forceVerifyOpen);

  // Check user role
  const userRole = localStorage.getItem("userRole") || "";
  const isDistrictOfficer = userRole === "district_officer";
  const officerDistrict = "North District"; // Mock district as defined in DistrictOfficer.jsx

  // Districts list for Uttarakhand
  const districts = [
    "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", 
    "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", 
    "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"
  ];

  useEffect(() => {
    if (isDistrictOfficer) {
      setSelectedDistrict(officerDistrict);
    }
  }, [isDistrictOfficer]);

  useEffect(() => {
    fetchRegistryData();
  }, [activeTab, selectedDistrict]);

  const fetchRegistryData = async () => {
    setLoading(true);
    try {
      const type = activeTab === "wellness" ? "wellness_centre" : "yoga_professional";
      let url = `${API}/api/registry/list?type=${type}`;
      
      if (selectedDistrict !== "All") {
        url += `&district=${encodeURIComponent(selectedDistrict)}`;
      }

      const res = await axios.get(url);
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching registry:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySearch = async (e) => {
    e.preventDefault();
    if (!verifySearch.trim()) return;

    setVerifying(true);
    setVerifyError("");
    setVerificationResult(null);

    try {
      const res = await axios.get(`${API}/api/registry/verify?registrationNumber=${encodeURIComponent(verifySearch.trim())}`);
      if (res.data && res.data.success) {
        setVerificationResult(res.data);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerifyError(err.response?.data?.message || "Invalid registration number or network error");
    } finally {
      setVerifying(false);
    }
  };

  // Filter records locally by search query
  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = (item.name || "").toLowerCase().includes(query);
    const regNumMatch = (item.registrationNumber || "").toLowerCase().includes(query);
    return nameMatch || regNumMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2.5 bg-white hover:bg-slate-100 border rounded-xl text-slate-600 transition"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">AYUSH Setu Registry</h1>
              <p className="text-sm text-slate-500 font-medium">Official registry of approved Wellness Centres and Yoga Professionals in Uttarakhand</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowVerifySection(!showVerifySection)}
            className="self-start bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow transition flex items-center gap-2"
          >
            <Award size={18} />
            {showVerifySection ? "Hide Verification Tool" : "Verify Registration / Certificate"}
          </button>
        </div>

        {/* Verification Section */}
        {showVerifySection && (
          <div className="bg-gradient-to-r from-teal-700 to-emerald-700 p-8 rounded-3xl text-white shadow-xl space-y-6">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold">Register/Certificate Verification Tool</h2>
              <p className="text-teal-100 text-xs mt-1">Enter a registration number (e.g. UK-WC-P-0001, UK-YP-0002) to verify its authenticity.</p>
            </div>
            
            <form onSubmit={handleVerifySearch} className="flex flex-col sm:flex-row gap-3 max-w-3xl">
              <input
                type="text"
                value={verifySearch}
                onChange={(e) => setVerifySearch(e.target.value)}
                placeholder="Enter Registration Number (e.g., UK-WC-P-0001)"
                className="flex-1 px-5 py-3.5 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm font-semibold tracking-wider uppercase"
              />
              <button
                type="submit"
                disabled={verifying}
                className="bg-white hover:bg-teal-50 text-teal-800 font-bold px-6 py-3.5 rounded-xl transition text-sm flex items-center justify-center gap-2"
              >
                {verifying ? "Searching..." : "Search & Verify"}
              </button>
            </form>

            {verificationResult && (
              <div className="bg-white text-slate-800 p-6 rounded-2xl shadow-lg border border-teal-100 flex items-start gap-4 max-w-3xl">
                {verificationResult.valid ? (
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                    <CheckCircle size={28} />
                  </div>
                ) : (
                  <div className="p-3 bg-rose-100 text-rose-600 rounded-full">
                    <ShieldAlert size={28} />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                      {verificationResult.type === "wellness_centre" ? "Wellness Centre" : "Yoga Professional"}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${verificationResult.valid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {verificationResult.valid ? "Verified & Valid" : "Valid status pending"}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">{verificationResult.name}</h4>
                  <p className="text-xs font-mono font-bold text-teal-700 tracking-wider">
                    Registration No: {verificationResult.registrationNumber}
                  </p>
                </div>
              </div>
            )}

            {verifyError && (
              <div className="bg-rose-50/90 backdrop-blur border border-rose-200 text-rose-800 p-5 rounded-2xl flex items-center gap-3 max-w-3xl">
                <XCircle className="text-rose-600 flex-shrink-0" size={24} />
                <p className="text-sm font-medium">{verifyError}</p>
              </div>
            )}
          </div>
        )}

        {/* Filters & Tabs */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl self-start">
            <button
              onClick={() => setActiveTab("wellness")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "wellness" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              Wellness Centres
            </button>
            <button
              onClick={() => setActiveTab("yoga")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "yoga" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              Yoga Professionals
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or reg no..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white transition"
              />
            </div>

            {/* District dropdown */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedDistrict}
                disabled={isDistrictOfficer}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 disabled:bg-slate-100 disabled:opacity-80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-700"
              >
                {!isDistrictOfficer && <option value="All">All Districts</option>}
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* List Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <FileText className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-700">No records found</h3>
            <p className="text-slate-400 text-sm mt-1">There are no approved registrations matching the filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition duration-300 p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md">
                      {item.type === "wellness_centre" ? (item.entityType || "Wellness Centre").replace(/_/g, ' ') : "Yoga Professional"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle size={10} /> Valid Registry
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{item.name || item.fullName}</h3>
                    <p className="text-[11px] font-mono font-bold text-teal-700 mt-1 uppercase tracking-wider">
                      Reg: {item.registrationNumber}
                    </p>
                  </div>

                  {/* Services tags for wellness */}
                  {item.type === "wellness_centre" && item.services && item.services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.services.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-[9px] font-bold uppercase tracking-wider">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-50 space-y-2 text-xs font-semibold text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="text-slate-400 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">District</span>
                        <span>{item.district || "Uttarakhand"}</span>
                        {item.address && (
                          <span className="block text-[11px] text-slate-400 font-medium leading-tight mt-0.5">{item.address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 text-[11px] text-slate-400 flex items-center justify-between font-bold">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400 leading-none">Email</span>
                    <span className="text-slate-600">{item.contactEmail || "N/A"}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400 leading-none">Phone</span>
                    <span className="text-slate-600">{item.contactPhone || "N/A"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Registry;
