import API from '../../../config/api';
import React, { useState, useEffect } from "react";
import { MapPin, Eye, BarChart as ChartIcon, Save } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import axios from "axios";
import axiosInstance from '../../../config/axiosInstance';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
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

export default function LocationAnalytics() {
  const token = localStorage.getItem("token");
  const [address, setAddress] = useState("123 Yoga Street, Wellness City");
  const [mapPin, setMapPin] = useState({ lat: 28.6139, lng: 77.209 });
  const [publicVisible, setPublicVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!token) return;

        const res = await axiosInstance.get('/api/training-centre/profile', {
        });

        if (res.data.success && res.data.data) {
          const { address, latitude, longitude } = res.data.data;

          // Only update if data exists, otherwise keep defaults
          if (address) setAddress(address);
          if (latitude && longitude) {
            setMapPin({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const saveLocation = async () => {
    try {
      setLoading(true);
      if (!token) {
        toast.error("Please login to save location");
        return;
      }

      await axiosInstance.put('/api/training-centre/profile', {
        address,
        latitude: mapPin.lat,
        longitude: mapPin.lng
      }, {
      });
      toast.success("Location saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  const analyticsData = [
    { month: "Jan", profileViews: 120, mapViews: 80, enquiries: 20 },
    { month: "Feb", profileViews: 150, mapViews: 100, enquiries: 30 },
    { month: "Mar", profileViews: 200, mapViews: 130, enquiries: 40 },
    { month: "Apr", profileViews: 170, mapViews: 110, enquiries: 35 },
    { month: "May", profileViews: 220, mapViews: 150, enquiries: 50 },
  ];

  // Reverse geocoding: lat,lng -> address
  const fetchAddress = async ({ lat, lng }) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (data.display_name) setAddress(data.display_name);
    } catch (err) {
      console.error("Failed to fetch address:", err);
    }
  };

  // Forward geocoding: address -> lat,lng
  const fetchCoordinates = async (addr) => {
    if (!addr) return;
    try {
      setLoading(true);

      // Try fetching full address
      let res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          addr
        )}`
      );
      let data = await res.json();

      // If no results, try fallback: remove House number etc, search broader terms
      if (!data || data.length === 0) {
        toast.info("Exact address not found. Searching broader area...");
        // Heuristic: try splitting by comma and searching last 2 parts (usually city/state)
        const parts = addr.split(',');
        if (parts.length > 1) {
          const broadQuery = parts.slice(-2).join(',');
          res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(broadQuery)}`
          );
          data = await res.json();
        }
      }

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setMapPin({ lat: newLat, lng: newLng });
        toast.success("Location updated on map. Verify pin position.");
      } else {
        toast.warning("Address not found on map. Please drag the pin manually.");
      }
    } catch (err) {
      console.error("Failed to fetch coordinates:", err);
      toast.error("Error searching location.");
    } finally {
      setLoading(false);
    }
  };

  // Component to handle map movement and center updates
  function MapController() {
    const map = useMapEvents({
      moveend: () => {
        const center = map.getCenter();
        setMapPin({ lat: center.lat, lng: center.lng });
        fetchAddress(center);
      },
    });

    // Update map center when mapPin changes programmatically (e.g. search or GPS)
    useEffect(() => {
      const center = map.getCenter();
      // Calculate distance (simple Euclidean approximation for small distances is enough to detect drift)
      const dist = Math.sqrt(
        Math.pow(center.lat - mapPin.lat, 2) + Math.pow(center.lng - mapPin.lng, 2)
      );

      // Only re-center map if the change is significant (not caused by small map drifts)
      if (dist > 0.0001) {
        map.setView([mapPin.lat, mapPin.lng], map.getZoom());
      }
    }, [mapPin.lat, mapPin.lng, map]);

    return null;
  }

  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    toast.info("Fetching your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapPin({ lat: latitude, lng: longitude });
        fetchAddress({ lat: latitude, lng: longitude });
        setLoading(false);
        toast.success("Location found!");
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Unable to retrieve your location. Please check browser permissions.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="p-6 space-y-8">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Location Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
            <MapPin size={24} /> Centre Location
          </h2>
          <button
            onClick={saveLocation}
            disabled={loading}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? "Saving..." : "Save Location"}
          </button>
        </div>

        <div className="space-y-4">
          {/* Address Input */}
          <div>
            <label className="font-medium">Address:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchCoordinates(address);
                  }
                }}
                className="w-full border px-3 py-2 rounded-lg mt-1"
                placeholder="Enter full address..."
              />
              <button
                onClick={() => fetchCoordinates(address)}
                className="mt-1 bg-gray-100 border text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 min-w-[100px]"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              Tip: Move the map to position the pin at your exact location.
            </p>
          </div>

          {/* Leaflet Map Container */}
          <div className="h-96 rounded-lg overflow-hidden mb-2 z-0 relative group">
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white/50 z-[1000] flex items-center justify-center">
                <span className="text-emerald-700 font-bold">Updating Map...</span>
              </div>
            )}

            {/* Fixed Center Pin (Delivery-App Style) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[500] pointer-events-none mb-4">
              <img
                src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png"
                alt="Center Pin"
                className="w-8 h-10 drop-shadow-xl"
              />
            </div>

            {/* GPS Button */}
            <button
              onClick={handleGPSLocation}
              className="absolute bottom-4 right-4 z-[500] bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 text-emerald-700 transition"
              title="Use Current Location"
            >
              <MapPin size={24} />
            </button>

            <MapContainer
              center={[mapPin.lat, mapPin.lng]}
              zoom={15}
              className="h-full w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapController />
            </MapContainer>
          </div>

          {/* Latitude & Longitude Inputs */}
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="text-xs text-gray-500">Latitude</label>
              <input
                type="number"
                value={mapPin.lat}
                readOnly
                className="border px-3 py-2 rounded-lg w-full bg-gray-50"
              />
            </div>
            <div className="w-1/2">
              <label className="text-xs text-gray-500">Longitude</label>
              <input
                type="number"
                value={mapPin.lng}
                readOnly
                className="border px-3 py-2 rounded-lg w-full bg-gray-50"
              />
            </div>
          </div>

          {/* Public Visibility Toggle */}
          <div className="flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              checked={publicVisible}
              onChange={() => setPublicVisible(!publicVisible)}
              id="publicToggle"
              className="h-5 w-5 text-emerald-600 rounded"
            />
            <label htmlFor="publicToggle" className="font-medium">
              Public Visibility
            </label>
          </div>
        </div>
      </div>

      {/* Analytics & Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Analytics Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-emerald-700 mb-6 flex items-center gap-2">
              <ChartIcon size={24} /> Performance Insights
            </h2>

            {/* Summary Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Profile Views */}
              <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-xl border border-emerald-100 shadow-sm transition hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Public Profile Views</p>
                    <p className="text-3xl font-bold text-emerald-800 mt-1">
                      {analyticsData.reduce((a, d) => a + d.profileViews, 0)}
                    </p>
                  </div>
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Eye className="text-emerald-600" size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
                  <span>▲ 12% vs last month</span>
                </div>
              </div>

              {/* Map Impressions */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100 shadow-sm transition hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Map Search Appearances</p>
                    <p className="text-3xl font-bold text-blue-800 mt-1">
                      {analyticsData.reduce((a, d) => a + d.mapViews, 0)}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MapPin className="text-blue-600" size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs font-medium text-blue-600">
                  <span>▲ 8% vs last month</span>
                </div>
              </div>

              {/* Enquiries */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border border-purple-100 shadow-sm transition hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Enquiries</p>
                    <p className="text-3xl font-bold text-purple-800 mt-1">
                      {analyticsData.reduce((a, d) => a + d.enquiries, 0)}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <ChartIcon className="text-purple-600" size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs font-medium text-purple-600">
                  <span>5 pending responses</span>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-xl border border-orange-100 shadow-sm transition hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Enrollment Conversion</p>
                    <p className="text-3xl font-bold text-orange-800 mt-1">
                      {((analyticsData.reduce((a, d) => a + d.enquiries, 0) / analyticsData.reduce((a, d) => a + d.profileViews, 0)) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Save className="text-orange-600" size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs font-medium text-orange-600">
                  <span>Top 10% in your city</span>
                </div>
              </div>
            </div>

            {/* Detailed Chart */}
            <div className="h-80 w-full mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Engagement Trends</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  barSize={20}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: 'none' }}
                    cursor={{ fill: '#F3F4F6' }}
                  />
                  <Bar dataKey="profileViews" fill="#10B981" name="Profile Views" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="mapViews" fill="#3B82F6" name="Map Impressions" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="enquiries" fill="#8B5CF6" name="Enquiries" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Public Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Eye size={20} className="text-indigo-600" />
              Public Comparison
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This is how your centre currently appears to students searching on the AYUSH Portal map.
            </p>

            {/* Mock Phone Preview */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-gray-50 mx-auto max-w-[280px]">
              {/* Fake Map Header */}
              <div className="bg-emerald-600 h-32 relative w-full">
                <div className="absolute inset-0 bg-black/10"></div>
                <MapPin className="text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-md" size={32} />
              </div>

              {/* Card Content */}
              <div className="p-4 bg-white -mt-4 rounded-t-2xl relative">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3"></div>
                <h4 className="font-bold text-gray-800 text-lg leading-tight">Yoga Health Centre</h4>
                <div className="flex items-center gap-1 mt-1 mb-2">
                  <span className="text-yellow-400 text-sm">★★★★☆</span>
                  <span className="text-xs text-gray-400">(4.8) • 1.2km away</span>
                </div>

                <p className="text-xs text-gray-500 border-b pb-3 mb-3">
                  {address.split(',').slice(0, 2).join(',')}...
                </p>

                <div className="flex gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2 rounded mb-3">
                  <span className="bg-white px-2 py-0.5 rounded shadow-sm">Yoga Therapy</span>
                  <span className="bg-white px-2 py-0.5 rounded shadow-sm">Meditation</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button className="bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg">
                    Book Session
                  </button>
                  <button className="border border-emerald-600 text-emerald-600 text-xs font-bold py-2 rounded-lg">
                    View Profile
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <p className="text-xs text-yellow-800 font-medium flex items-center gap-2">
                <span>💡</span> Tip: Add more detailed "Facilities" to your profile to appear in more filtered searches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
