import React, { useState, useEffect } from "react";
import { Heart, Award, MapPin, Phone, Mail, Building2, ExternalLink, Loader2 } from "lucide-react";
import wellnessService from "../services/wellnessService";

const PublicProfile = ({ centreId, onBack }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                setLoading(true);
                const res = await wellnessService.getPublicProfile(centreId);
                if (res.success) {
                    setData(res.data);
                } else {
                    setError("Profile not found");
                }
            } catch (err) {
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        if (centreId) fetchPublicData();
    }, [centreId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || "Something went wrong"}</h2>
                <button onClick={onBack} className="bg-purple-600 text-white px-6 py-2 rounded-lg">Back to Home</button>
            </div>
        );
    }

    const { profile, programs } = data;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Hero Section */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="h-48 bg-gradient-to-r from-purple-600 to-indigo-700 flex items-center justify-center p-8">
                        <div className="text-center">
                            <h1 className="text-4xl font-extrabold text-white mb-2">{profile.name}</h1>
                            <div className="flex items-center justify-center text-purple-100 space-x-2">
                                <Award size={20} />
                                <span className="font-semibold">{profile.accreditation_level || 'Registered Wellness Centre'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">About Us</h2>
                            <div className="flex items-start space-x-3 text-gray-600">
                                <MapPin className="mt-1 text-purple-500" size={20} />
                                <p>{profile.address || 'Address not listed'}</p>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-600">
                                <Building2 className="text-purple-500" size={20} />
                                <p><span className="font-semibold text-gray-800">Registration:</span> {profile.registration_number}</p>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-600">
                                <span className="font-semibold text-gray-800">Type:</span>
                                <p>{profile.centre_type} ({profile.ownership_type || 'Private'})</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Contact Details</h2>
                            <div className="flex items-center space-x-3 text-gray-600">
                                <Phone className="text-purple-500" size={20} />
                                <p>{profile.contact_phone}</p>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-600">
                                <Mail className="text-purple-500" size={20} />
                                <p>{profile.contact_email}</p>
                            </div>
                            <div className="pt-4">
                                <button className="w-full bg-purple-100 text-purple-700 font-bold py-3 rounded-xl hover:bg-purple-200 transition">
                                    Book a Consultation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Programs section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Heart className="mr-2 text-red-500" size={24} />
                        Our Wellness Programs
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {programs.length > 0 ? programs.map((prog, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{prog.name}</h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-3">{prog.description}</p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">{prog.duration}</span>
                                    <span className="font-bold text-purple-600 text-lg">₹{parseFloat(prog.fees).toLocaleString()}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-center col-span-2 py-8 bg-white rounded-2xl">No active programs listed at the moment.</p>
                        )}
                    </div>
                </div>

                {/* Footer info */}
                <div className="text-center text-gray-500 text-sm">
                    <p>© 2026 AYUSH Portal. All wellness centres are registered under official guidelines.</p>
                    <button onClick={onBack} className="mt-4 text-purple-600 font-semibold flex items-center justify-center mx-auto hover:underline">
                        Back to Portal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
