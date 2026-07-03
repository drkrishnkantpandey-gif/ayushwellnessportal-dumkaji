import React, { useState } from "react";
import { Building2, Edit, Save, X, Phone, Mail, MapPin, Calendar, Users, GraduationCap, FileText, CheckCircle, Globe, User } from "lucide-react";

const CollegeProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState(null);

  const [profileData, setProfileData] = useState({
    // Basic Details
    collegeName: "Government AYUSH Medical College",
    collegeCode: "AYUSH-2024-001",
    established: "2015",
    affiliatedTo: "State AYUSH University",
    recognizedBy: "Central Council of Indian Medicine (CCIM)",
    address: "Medical College Road, Dehradun",
    city: "Dehradun",
    state: "Uttarakhand",
    pincode: "248001",
    phone: "+91-135-2712345",
    email: "principal@ayushcollege.edu.in",
    website: "www.ayushcollege.edu.in",
    
    // Principal Details
    principalName: "Dr. Ramesh Kumar",
    principalEmail: "principal@ayushcollege.edu.in",
    principalPhone: "+91-9876543210",
    principalQualification: "MD (Ayurveda), PhD",
    
    // Infrastructure
    totalArea: "25 acres",
    builtUpArea: "50,000 sq.ft",
    hospitalBeds: "100",
    laboratories: "15",
    library: "Yes - 10,000+ books",
    
    // Accreditation
    naacGrade: "B++",
    naacValidFrom: "2024-01-15",
    naacValidTill: "2029-01-14",
    
    // Current Status
    totalFaculty: "100",
    totalStudents: "1,856",
    totalDepartments: "5"
  });

  const departments = [
    {
      id: 1,
      name: "Ayurveda",
      hodName: "Dr. Anand Sharma",
      hodEmail: "anand.sharma@ayushcollege.edu.in",
      hodPhone: "+91-9876543211",
      students: 485,
      faculty: 25,
      courses: ["BAMS", "MD Ayurveda", "PhD Ayurveda"],
      intakeCapacity: 100
    },
    {
      id: 2,
      name: "Yoga & Naturopathy",
      hodName: "Dr. Meera Patel",
      hodEmail: "meera.patel@ayushcollege.edu.in",
      hodPhone: "+91-9876543212",
      students: 320,
      faculty: 18,
      courses: ["BNYS", "MD Yoga"],
      intakeCapacity: 60
    },
    {
      id: 3,
      name: "Unani",
      hodName: "Dr. Abdul Khan",
      hodEmail: "abdul.khan@ayushcollege.edu.in",
      hodPhone: "+91-9876543213",
      students: 280,
      faculty: 15,
      courses: ["BUMS", "MD Unani"],
      intakeCapacity: 50
    },
    {
      id: 4,
      name: "Siddha",
      hodName: "Dr. Lakshmi Raman",
      hodEmail: "lakshmi.raman@ayushcollege.edu.in",
      hodPhone: "+91-9876543214",
      students: 220,
      faculty: 12,
      courses: ["BSMS", "MD Siddha"],
      intakeCapacity: 40
    },
    {
      id: 5,
      name: "Homeopathy",
      hodName: "Dr. Rajesh Gupta",
      hodEmail: "rajesh.gupta@ayushcollege.edu.in",
      hodPhone: "+91-9876543215",
      students: 551,
      faculty: 30,
      courses: ["BHMS", "MD Homeopathy", "PhD Homeopathy"],
      intakeCapacity: 100
    }
  ];

  const handleEdit = (section) => {
    setIsEditing(true);
    setEditSection(section);
  };

  const handleSave = () => {
    setIsEditing(false);
    setEditSection(null);
    // Here you would typically save to backend
    alert("Profile updated successfully!");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditSection(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">College Profile</h1>
          <p className="text-gray-500">Manage your college information and details</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => handleEdit('all')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Edit size={18} />
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Save size={18} />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Basic College Information */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Building2 className="text-indigo-600" size={22} />
            Basic College Information
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">College Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.collegeName}
                onChange={(e) => setProfileData({...profileData, collegeName: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.collegeName}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">College Code</label>
            <p className="text-gray-800 font-medium mt-1 bg-gray-50 px-3 py-2 rounded-lg">{profileData.collegeCode}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Year of Establishment</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.established}
                onChange={(e) => setProfileData({...profileData, established: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.established}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Affiliated To</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.affiliatedTo}
                onChange={(e) => setProfileData({...profileData, affiliatedTo: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.affiliatedTo}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Recognized By</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.recognizedBy}
                onChange={(e) => setProfileData({...profileData, recognizedBy: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.recognizedBy}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Mail className="text-indigo-600" size={22} />
          Contact Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-600">Address</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.address}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">City</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.city}
                onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.city}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">State</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.state}
                onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.state}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">PIN Code</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.pincode}
                onChange={(e) => setProfileData({...profileData, pincode: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.pincode}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <Phone size={14} /> Phone
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.phone}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <Mail size={14} /> Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.email}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <Globe size={14} /> Website
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.website}
                onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.website}</p>
            )}
          </div>
        </div>
      </div>

      {/* Principal Details */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <User className="text-indigo-600" size={22} />
          Principal Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Principal Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.principalName}
                onChange={(e) => setProfileData({...profileData, principalName: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.principalName}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Qualification</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.principalQualification}
                onChange={(e) => setProfileData({...profileData, principalQualification: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.principalQualification}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={profileData.principalEmail}
                onChange={(e) => setProfileData({...profileData, principalEmail: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.principalEmail}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Phone</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.principalPhone}
                onChange={(e) => setProfileData({...profileData, principalPhone: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.principalPhone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Infrastructure */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Building2 className="text-indigo-600" size={22} />
          Infrastructure Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Total Area</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.totalArea}
                onChange={(e) => setProfileData({...profileData, totalArea: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.totalArea}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Built-up Area</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.builtUpArea}
                onChange={(e) => setProfileData({...profileData, builtUpArea: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.builtUpArea}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Hospital Beds</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.hospitalBeds}
                onChange={(e) => setProfileData({...profileData, hospitalBeds: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.hospitalBeds}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Laboratories</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.laboratories}
                onChange={(e) => setProfileData({...profileData, laboratories: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.laboratories}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Library</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.library}
                onChange={(e) => setProfileData({...profileData, library: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800 font-medium mt-1">{profileData.library}</p>
            )}
          </div>
        </div>
      </div>

      {/* Department List with HODs */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <GraduationCap className="text-indigo-600" size={22} />
          Departments & Head of Departments
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Department</th>
                <th className="text-left px-4 py-3">HOD Name</th>
                <th className="text-left px-4 py-3">Contact</th>
                <th className="text-left px-4 py-3">Courses</th>
                <th className="text-left px-4 py-3">Intake</th>
                <th className="text-left px-4 py-3">Faculty</th>
                <th className="text-left px-4 py-3">Students</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{dept.name}</td>
                  <td className="px-4 py-3">{dept.hodName}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs">
                      <div className="flex items-center gap-1">
                        <Mail size={12} />
                        <span className="truncate max-w-[150px]">{dept.hodEmail}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Phone size={12} />
                        <span>{dept.hodPhone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs space-y-1">
                      {dept.courses.map((course, idx) => (
                        <div key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{course}</div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">{dept.intakeCapacity}</td>
                  <td className="px-4 py-3">{dept.faculty}</td>
                  <td className="px-4 py-3">{dept.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow">
          <Users size={32} className="mb-3 opacity-80" />
          <p className="text-3xl font-bold">{profileData.totalStudents}</p>
          <p className="text-blue-100 text-sm mt-1">Total Students</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow">
          <GraduationCap size={32} className="mb-3 opacity-80" />
          <p className="text-3xl font-bold">{profileData.totalFaculty}</p>
          <p className="text-green-100 text-sm mt-1">Total Faculty</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow">
          <Building2 size={32} className="mb-3 opacity-80" />
          <p className="text-3xl font-bold">{profileData.totalDepartments}</p>
          <p className="text-purple-100 text-sm mt-1">Departments</p>
        </div>
      </div>
    </div>
  );
};

export default CollegeProfile;