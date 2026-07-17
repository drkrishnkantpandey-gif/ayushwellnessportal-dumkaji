import React, { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosInstance";
import API from "../../config/api";
import { User, Mail, Phone, Lock, Save, FileText, Award, Building2, MapPin, Briefcase } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue for React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const ORG_TYPES = [
  { value: "NGO",                label: "NGO / Non-Governmental Organisation" },
  { value: "RESEARCH_INSTITUTE", label: "Research Institute" },
  { value: "MEDICAL_HEALTH_ORG", label: "Medical / Health Organisation" },
  { value: "UNIVERSITY",         label: "University" },
  { value: "COLLEGE",            label: "College (with full-time PG course in Yoga)" },
];

const DISTRICT_OPTIONS = [
  "Almora",
  "Bageshwar",
  "Chamoli",
  "Champawat",
  "Dehradun",
  "Haridwar",
  "Nainital",
  "Pauri Garhwal",
  "Pithoragarh",
  "Rudraprayag",
  "Tehri Garhwal",
  "Udham Singh Nagar",
  "Uttarkashi"
];

export default function ResearchOrgProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get(`${API}/api/research-grants/profile`);
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.put(`${API}/api/research-grants/profile`, profile);
      alert("Profile updated successfully!");
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // Helper map controller to update map view
  function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
      if (center && center[0] && center[1]) {
        map.setView(center, map.getZoom());
      }
    }, [center, map]);
    return null;
  }

  // Click handler on map
  function MapEvents() {
    useMapEvents({
      click(e) {
        setProfile(prev => ({
          ...prev,
          latitude: Number(e.latlng.lat.toFixed(6)),
          longitude: Number(e.latlng.lng.toFixed(6))
        }));
      }
    });
    return null;
  }

  if (loading) {
    return <div className="p-8 text-center text-teal-600 font-semibold">Loading profile details...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-red-500 font-semibold">Profile details could not be loaded.</div>;
  }

  // Fallback to Dehradun coordinates if not set
  const lat = parseFloat(profile.latitude) || 30.3165;
  const lng = parseFloat(profile.longitude) || 78.0322;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Institution Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and update your registered Research Institution profile
        </p>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleProfileSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8">
        <div className="border-b pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-700">
            <Building2 size={20} />
            <h2 className="text-lg font-bold text-gray-800">Registration Details</h2>
          </div>
          <span className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-semibold border border-teal-100 uppercase tracking-wide">
            Status: {profile.registration_status || "UNDER_REVIEW"}
          </span>
        </div>

        {/* General & Institutional Info (Editable except Email ID) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Institutional Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Organization Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.organization_name || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, organization_name: e.target.value }))}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Organization Type <span className="text-red-500">*</span></label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" 
                value={profile.organization_type || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, organization_type: e.target.value }))}
                required
              >
                <option value="">-- Select Type --</option>
                {ORG_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned District <span className="text-red-500">*</span></label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" 
                value={profile.district || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, district: e.target.value }))}
                required
              >
                <option value="">-- Select District --</option>
                {DISTRICT_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Registration Doc ID <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.registration_doc_id || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, registration_doc_id: e.target.value }))}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address (Non-Editable)</label>
              <input 
                type="text" 
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed" 
                value={profile.email || ""} 
                disabled 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Organization Website</label>
              <input 
                type="url" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.website || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://example.org"
              />
            </div>
          </div>
        </div>

        {/* GPS Map & Coordinates Section */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Location Map &amp; Coordinates</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">GPS Latitude <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                step="any"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.latitude || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">GPS Longitude <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                step="any"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.longitude || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                required 
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden h-64 relative z-0">
            <MapContainer center={[lat, lng]} zoom={13} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[lat, lng]} />
              <ChangeView center={[lat, lng]} />
              <MapEvents />
            </MapContainer>
            <div className="absolute bottom-2 left-2 z-[1000] bg-white/95 px-3 py-1 rounded shadow text-[10px] text-gray-600">
              Click on the map to automatically pin coordinates
            </div>
          </div>
        </div>

        {/* Section 2: Editable Applicant & General Info */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider">General Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Name of Applicant <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.applicant_name || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, applicant_name: e.target.value }))}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Designation <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.designation || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, designation: e.target.value }))}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
              <input 
                type="tel" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.contact_number || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, contact_number: e.target.value }))}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Work Experience in Yoga (Years) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.work_experience_years || 0} 
                onChange={(e) => setProfile(prev => ({ ...prev, work_experience_years: parseInt(e.target.value) || 0 }))}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Funding Received till Date (₹) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.funding_received || 0} 
                onChange={(e) => setProfile(prev => ({ ...prev, funding_received: parseFloat(e.target.value) || 0 }))}
                required 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Physical Address <span className="text-red-500">*</span></label>
              <textarea 
                rows={3} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.physical_address || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, physical_address: e.target.value }))}
                required 
              />
            </div>
          </div>
        </div>

        {/* Section 3: Yoga & Research Background */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Research & Yoga Background</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Research Projects Previously Completed <span className="text-red-500">*</span></label>
              <textarea 
                rows={3} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.projects_completed || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, projects_completed: e.target.value }))}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Brief of Organization's Association with Yoga <span className="text-red-500">*</span></label>
              <textarea 
                rows={3} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.association_with_yoga || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, association_with_yoga: e.target.value }))}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Organization's Affiliations Details <span className="text-red-500">*</span></label>
              <textarea 
                rows={3} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                value={profile.affiliations || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, affiliations: e.target.value }))}
                required 
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-slate-50 border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-slate-700 border-b pb-2">
            <FileText size={16} />
            <h4 className="font-bold text-sm uppercase tracking-wide">Registered Documents</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <span className="font-semibold text-gray-700 block text-xs mb-1">Registration Document</span>
              {profile.registration_doc_path ? (
                <a 
                  href={`${API}/${profile.registration_doc_path}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-teal-600 font-semibold hover:underline inline-flex items-center gap-1.5 text-sm mt-1"
                >
                  <FileText size={14} /> View Document
                </a>
              ) : <span className="text-xs text-gray-400 italic">Not Uploaded</span>}
            </div>

            <div>
              <span className="font-semibold text-gray-700 block text-xs mb-1">Relevant Documents</span>
              {profile.relevant_docs_paths && profile.relevant_docs_paths.length > 0 ? (
                <div className="space-y-1.5 mt-1">
                  {profile.relevant_docs_paths.map((path, idx) => (
                    <a 
                      key={idx}
                      href={`${API}/${path}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-teal-600 font-semibold hover:underline flex items-center gap-1.5 text-sm"
                    >
                      <FileText size={14} /> Document #{idx + 1}
                    </a>
                  ))}
                </div>
              ) : <span className="text-xs text-gray-400 italic">Not Uploaded</span>}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition text-sm inline-flex items-center gap-2 shadow-sm"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save Profile Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
