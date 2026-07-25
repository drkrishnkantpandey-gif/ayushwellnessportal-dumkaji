import React, { useState, useEffect } from "react";
import axios from "axios";
import API from "../config/api";
import { Search, MapPin, CheckCircle, XCircle, ShieldAlert, Award, FileText, ArrowLeft } from "lucide-react";

const Registry = ({ onBack, forceVerifyOpen = false }) => {
  const [activeTab, setActiveTab] = useState("wellness"); // wellness | yoga | research
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
  const officerDistrict = "North District"; // Mock district

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
      const type = activeTab === "wellness" ? "wellness_centre" : activeTab === "yoga" ? "yoga_professional" : "research_org";
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

  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = (item.name || "").toLowerCase().includes(query);
    const regNumMatch = (item.registrationNumber || "").toLowerCase().includes(query);
    return nameMatch || regNumMatch;
  });

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative z-10 bg-transparent">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-up">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-white/10 rounded-xl text-zinc-300 transition"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight font-manrope">AYUSH Setu Registry</h1>
              <p className="text-sm text-zinc-400 font-medium">Official registry of approved Wellness Centres and Yoga Professionals in Uttarakhand</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowVerifySection(!showVerifySection)}
            className="self-start bg-[#ef233c] hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-[#ef233c]/15 transition flex items-center gap-2"
          >
            <Award size={18} />
            {showVerifySection ? "Hide Verification Tool" : "Verify Registration / Certificate"}
          </button>
        </div>

        {/* Verification Section */}
        {showVerifySection && (
          <div className="bg-gradient-to-br from-red-950/80 to-zinc-950 border border-white/10 p-8 rounded-3xl text-white shadow-2xl space-y-6 relative overflow-hidden animate-fade-up">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#ef233c/5,transparent_75%)]"></div>
            <div className="max-w-2xl relative z-10">
              <h2 className="text-xl font-bold font-manrope">Register/Certificate Verification Tool</h2>
              <p className="text-zinc-400 text-xs mt-1 font-light">Enter a registration number (e.g. UK-WC-P-0001, UK-YP-0002) to verify its authenticity.</p>
            </div>
            
            <form onSubmit={handleVerifySearch} className="flex flex-col sm:flex-row gap-3 max-w-3xl relative z-10">
              <input
                type="text"
                value={verifySearch}
                onChange={(e) => setVerifySearch(e.target.value)}
                placeholder="Enter Registration Number (e.g., UK-WC-P-0001)"
                className="flex-1 px-5 py-3.5 bg-black/60 backdrop-blur border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/20 text-sm font-semibold tracking-wider uppercase"
              />
              <button
                type="submit"
                disabled={verifying}
                className="bg-[#ef233c] hover:bg-red-700 text-white font-bold px-6 py-3.5 rounded-xl transition text-sm flex items-center justify-center gap-2"
              >
                {verifying ? "Searching..." : "Search & Verify"}
              </button>
            </form>

            {verificationResult && (
              <div className="bg-zinc-950/90 text-white p-6 rounded-2xl shadow-2xl border border-white/10 flex items-start gap-4 max-w-3xl backdrop-blur-md relative z-10 animate-fade-up">
                {verificationResult.valid ? (
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                    <CheckCircle size={28} />
                  </div>
                ) : (
                  <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
                    <ShieldAlert size={28} />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">
                      {verificationResult.type === "wellness_centre" ? "Wellness Centre" : "Yoga Professional"}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${verificationResult.valid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      {verificationResult.valid ? "Verified & Valid" : "Valid status pending"}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-zinc-100">{verificationResult.name}</h4>
                  <p className="text-xs font-mono font-bold text-[#ef233c] tracking-wider">
                    Registration No: {verificationResult.registrationNumber}
                  </p>
                </div>
              </div>
            )}

            {verifyError && (
              <div className="bg-red-500/5 border border-red-500/20 text-[#ef233c] p-5 rounded-2xl flex items-center gap-3 max-w-3xl relative z-10 animate-fade-up">
                <XCircle className="text-red-500 flex-shrink-0" size={24} />
                <p className="text-sm font-medium">{verifyError}</p>
              </div>
            )}
          </div>
        )}

        {/* Filters & Tabs */}
        <div className="bg-zinc-950/40 p-5 border border-white/5 rounded-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md animate-fade-up">
          {/* Tabs */}
          <div className="flex bg-black/60 border border-white/10 p-1 rounded-xl self-start">
            <button
              onClick={() => setActiveTab("wellness")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "wellness" ? "bg-[#ef233c] text-white shadow-md shadow-[#ef233c]/15" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Wellness Centres
            </button>
            <button
              onClick={() => setActiveTab("yoga")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "yoga" ? "bg-[#ef233c] text-white shadow-md shadow-[#ef233c]/15" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Yoga Professionals
            </button>
            <button
              onClick={() => setActiveTab("research")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "research" ? "bg-[#ef233c] text-white shadow-md shadow-[#ef233c]/15" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Research Institutions
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or reg no..."
                className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/20 text-white placeholder-zinc-500 transition"
              />
            </div>

            {/* District dropdown */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedDistrict}
                disabled={isDistrictOfficer}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/60 border border-white/10 text-zinc-300 disabled:opacity-50 rounded-xl text-sm focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/20 font-semibold"
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
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ef233c]"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-zinc-950/40 rounded-3xl p-12 text-center border border-white/5 shadow-2xl animate-fade-up">
            <FileText className="mx-auto text-zinc-700 mb-4" size={48} />
            <h3 className="text-lg font-bold text-zinc-200">No records found</h3>
            <p className="text-zinc-500 text-sm mt-1">There are no approved registrations matching the filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up">
            {filteredData.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-950/40 border border-white/5 hover:border-zinc-800 rounded-3xl shadow-xl hover:shadow-red-950/5 transition duration-300 p-6 flex flex-col justify-between space-y-4 relative overflow-hidden group"
              >
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                      {item.type === "wellness_centre" 
                        ? (item.entityType || "Wellness Centre").replace(/_/g, ' ') 
                        : item.type === "yoga_professional" 
                          ? "Yoga Professional" 
                          : `Research Institution (${item.entityType || 'RI'})`}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#ef233c]/10 text-[#ef233c] border border-[#ef233c]/20">
                      <CheckCircle size={10} /> Valid Registry
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-zinc-200 group-hover:text-white transition-colors">{item.name || item.fullName}</h3>
                    <p className="text-[11px] font-mono font-bold text-[#ef233c] mt-1 uppercase tracking-wider">
                      Reg: {item.registrationNumber}
                    </p>
                  </div>

                  {/* Services tags for wellness */}
                  {item.type === "wellness_centre" && item.services && item.services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.services.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 text-zinc-400 rounded text-[9px] font-bold uppercase tracking-wider">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/5 space-y-2 text-xs font-semibold text-zinc-300">
                    <div className="flex items-start gap-2">
                      <MapPin className="text-zinc-500 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block leading-none mb-1">District</span>
                        <span>{item.district || "Uttarakhand"}</span>
                        {item.address && (
                          <span className="block text-[11px] text-zinc-500 font-medium leading-tight mt-0.5">{item.address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 text-[11px] text-zinc-400 flex items-center justify-between font-bold relative z-10">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-zinc-500 leading-none">Email</span>
                    <span className="text-zinc-300">{item.contactEmail || "N/A"}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] uppercase tracking-wider text-zinc-500 leading-none">Phone</span>
                    <span className="text-zinc-300">{item.contactPhone || "N/A"}</span>
                  </div>
                </div>
                
                {/* Glow overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none duration-500" 
                  style={{ background: "radial-gradient(circle at bottom right, #ef233c, transparent 65%)" }}
                ></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Registry;
