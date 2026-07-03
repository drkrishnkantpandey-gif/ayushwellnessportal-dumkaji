import React, { useState } from "react";
import { Users, GraduationCap, Plus, Edit, Trash2, Upload, Download, Search, Filter, UserCheck, BookOpen, Award, Calendar, Mail, Phone } from "lucide-react";

const FacultyStudentData = () => {
  const [activeTab, setActiveTab] = useState("faculty");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Faculty Data
  const facultyList = [
    {
      id: 1,
      name: "Dr. Anand Sharma",
      department: "Ayurveda",
      designation: "Professor & HOD",
      qualification: "MD (Ayurveda), PhD",
      experience: "15 years",
      joiningDate: "2010-06-15",
      email: "anand.sharma@ayushcollege.edu.in",
      phone: "+91-9876543211",
      specialization: "Panchakarma",
      publications: 25,
      status: "Active"
    },
    {
      id: 2,
      name: "Dr. Meera Patel",
      department: "Yoga & Naturopathy",
      designation: "Associate Professor & HOD",
      qualification: "MD (Yoga), PhD",
      experience: "12 years",
      joiningDate: "2013-08-20",
      email: "meera.patel@ayushcollege.edu.in",
      phone: "+91-9876543212",
      specialization: "Therapeutic Yoga",
      publications: 18,
      status: "Active"
    },
    {
      id: 3,
      name: "Dr. Abdul Khan",
      department: "Unani",
      designation: "Associate Professor & HOD",
      qualification: "MD (Unani), PhD",
      experience: "10 years",
      joiningDate: "2015-01-10",
      email: "abdul.khan@ayushcollege.edu.in",
      phone: "+91-9876543213",
      specialization: "Moalajat",
      publications: 15,
      status: "Active"
    },
    {
      id: 4,
      name: "Dr. Lakshmi Raman",
      department: "Siddha",
      designation: "Assistant Professor & HOD",
      qualification: "MD (Siddha)",
      experience: "8 years",
      joiningDate: "2017-07-01",
      email: "lakshmi.raman@ayushcollege.edu.in",
      phone: "+91-9876543214",
      specialization: "Siddha Pharmacy",
      publications: 12,
      status: "Active"
    },
    {
      id: 5,
      name: "Dr. Rajesh Gupta",
      department: "Homeopathy",
      designation: "Professor & HOD",
      qualification: "MD (Homeopathy), PhD",
      experience: "18 years",
      joiningDate: "2008-04-15",
      email: "rajesh.gupta@ayushcollege.edu.in",
      phone: "+91-9876543215",
      specialization: "Materia Medica",
      publications: 30,
      status: "Active"
    },
    {
      id: 6,
      name: "Dr. Priya Singh",
      department: "Ayurveda",
      designation: "Assistant Professor",
      qualification: "MD (Ayurveda)",
      experience: "6 years",
      joiningDate: "2019-08-01",
      email: "priya.singh@ayushcollege.edu.in",
      phone: "+91-9876543216",
      specialization: "Kayachikitsa",
      publications: 8,
      status: "Active"
    },
    {
      id: 7,
      name: "Dr. Amit Kumar",
      department: "Yoga & Naturopathy",
      designation: "Assistant Professor",
      qualification: "MD (Yoga)",
      experience: "5 years",
      joiningDate: "2020-07-15",
      email: "amit.kumar@ayushcollege.edu.in",
      phone: "+91-9876543217",
      specialization: "Yoga Therapy",
      publications: 6,
      status: "On Leave"
    }
  ];

  // Student Data by Department
  const studentData = [
    {
      department: "Ayurveda",
      courses: [
        {
          courseName: "BAMS",
          year: "1st Year",
          intakeCapacity: 50,
          enrolled: 48,
          male: 20,
          female: 28
        },
        {
          courseName: "BAMS",
          year: "2nd Year",
          intakeCapacity: 50,
          enrolled: 45,
          male: 18,
          female: 27
        },
        {
          courseName: "BAMS",
          year: "3rd Year",
          intakeCapacity: 50,
          enrolled: 47,
          male: 22,
          female: 25
        },
        {
          courseName: "BAMS",
          year: "4th Year",
          intakeCapacity: 50,
          enrolled: 44,
          male: 19,
          female: 25
        },
        {
          courseName: "MD Ayurveda",
          year: "1st Year",
          intakeCapacity: 20,
          enrolled: 18,
          male: 8,
          female: 10
        },
        {
          courseName: "MD Ayurveda",
          year: "2nd Year",
          intakeCapacity: 20,
          enrolled: 17,
          male: 7,
          female: 10
        }
      ]
    },
    {
      department: "Yoga & Naturopathy",
      courses: [
        {
          courseName: "BNYS",
          year: "1st Year",
          intakeCapacity: 30,
          enrolled: 28,
          male: 12,
          female: 16
        },
        {
          courseName: "BNYS",
          year: "2nd Year",
          intakeCapacity: 30,
          enrolled: 27,
          male: 11,
          female: 16
        },
        {
          courseName: "BNYS",
          year: "3rd Year",
          intakeCapacity: 30,
          enrolled: 26,
          male: 10,
          female: 16
        },
        {
          courseName: "BNYS",
          year: "4th Year",
          intakeCapacity: 30,
          enrolled: 25,
          male: 9,
          female: 16
        },
        {
          courseName: "MD Yoga",
          year: "1st Year",
          intakeCapacity: 10,
          enrolled: 9,
          male: 4,
          female: 5
        }
      ]
    },
    {
      department: "Unani",
      courses: [
        {
          courseName: "BUMS",
          year: "1st Year",
          intakeCapacity: 25,
          enrolled: 24,
          male: 14,
          female: 10
        },
        {
          courseName: "BUMS",
          year: "2nd Year",
          intakeCapacity: 25,
          enrolled: 23,
          male: 13,
          female: 10
        },
        {
          courseName: "BUMS",
          year: "3rd Year",
          intakeCapacity: 25,
          enrolled: 22,
          male: 12,
          female: 10
        },
        {
          courseName: "BUMS",
          year: "4th Year",
          intakeCapacity: 25,
          enrolled: 21,
          male: 11,
          female: 10
        },
        {
          courseName: "MD Unani",
          year: "1st Year",
          intakeCapacity: 10,
          enrolled: 8,
          male: 4,
          female: 4
        }
      ]
    },
    {
      department: "Siddha",
      courses: [
        {
          courseName: "BSMS",
          year: "1st Year",
          intakeCapacity: 20,
          enrolled: 19,
          male: 9,
          female: 10
        },
        {
          courseName: "BSMS",
          year: "2nd Year",
          intakeCapacity: 20,
          enrolled: 18,
          male: 8,
          female: 10
        },
        {
          courseName: "BSMS",
          year: "3rd Year",
          intakeCapacity: 20,
          enrolled: 17,
          male: 7,
          female: 10
        },
        {
          courseName: "BSMS",
          year: "4th Year",
          intakeCapacity: 20,
          enrolled: 16,
          male: 6,
          female: 10
        },
        {
          courseName: "MD Siddha",
          year: "1st Year",
          intakeCapacity: 10,
          enrolled: 8,
          male: 3,
          female: 5
        }
      ]
    },
    {
      department: "Homeopathy",
      courses: [
        {
          courseName: "BHMS",
          year: "1st Year",
          intakeCapacity: 50,
          enrolled: 49,
          male: 22,
          female: 27
        },
        {
          courseName: "BHMS",
          year: "2nd Year",
          intakeCapacity: 50,
          enrolled: 47,
          male: 21,
          female: 26
        },
        {
          courseName: "BHMS",
          year: "3rd Year",
          intakeCapacity: 50,
          enrolled: 46,
          male: 20,
          female: 26
        },
        {
          courseName: "BHMS",
          year: "4th Year",
          intakeCapacity: 50,
          enrolled: 45,
          male: 19,
          female: 26
        },
        {
          courseName: "MD Homeopathy",
          year: "1st Year",
          intakeCapacity: 20,
          enrolled: 18,
          male: 7,
          female: 11
        },
        {
          courseName: "MD Homeopathy",
          year: "2nd Year",
          intakeCapacity: 20,
          enrolled: 17,
          male: 6,
          female: 11
        }
      ]
    }
  ];

  // Department Summary
  const departmentSummary = [
    {
      department: "Ayurveda",
      totalFaculty: 25,
      totalStudents: 485,
      courses: 3,
      intakeCapacity: 220
    },
    {
      department: "Yoga & Naturopathy",
      totalFaculty: 18,
      totalStudents: 320,
      courses: 2,
      intakeCapacity: 140
    },
    {
      department: "Unani",
      totalFaculty: 15,
      totalStudents: 280,
      courses: 2,
      intakeCapacity: 135
    },
    {
      department: "Siddha",
      totalFaculty: 12,
      totalStudents: 220,
      courses: 2,
      intakeCapacity: 110
    },
    {
      department: "Homeopathy",
      totalFaculty: 30,
      totalStudents: 551,
      courses: 3,
      intakeCapacity: 240
    }
  ];

  const departments = ["all", "Ayurveda", "Yoga & Naturopathy", "Unani", "Siddha", "Homeopathy"];

  const filteredFaculty = facultyList.filter(faculty => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faculty.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === "all" || faculty.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const renderFacultyTab = () => (
    <div className="space-y-6">
      {/* Faculty Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
          <Users size={32} className="mb-3 opacity-80" />
          <p className="text-sm opacity-90">Total Faculty</p>
          <p className="text-4xl font-bold mt-1">100</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <UserCheck size={32} className="mb-3 opacity-80" />
          <p className="text-sm opacity-90">Active Faculty</p>
          <p className="text-4xl font-bold mt-1">98</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <Award size={32} className="mb-3 opacity-80" />
          <p className="text-sm opacity-90">Professors</p>
          <p className="text-4xl font-bold mt-1">35</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <BookOpen size={32} className="mb-3 opacity-80" />
          <p className="text-sm opacity-90">Publications</p>
          <p className="text-4xl font-bold mt-1">250+</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search faculty by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === "all" ? "All Departments" : dept}
                </option>
              ))}
            </select>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Plus size={18} />
              Add Faculty
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Upload size={18} />
              Bulk Upload
            </button>
          </div>
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Faculty Name</th>
                <th className="text-left px-4 py-3">Department</th>
                <th className="text-left px-4 py-3">Designation</th>
                <th className="text-left px-4 py-3">Qualification</th>
                <th className="text-left px-4 py-3">Experience</th>
                <th className="text-left px-4 py-3">Contact</th>
                <th className="text-left px-4 py-3">Publications</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.map((faculty) => (
                <tr key={faculty.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{faculty.name}</div>
                    <div className="text-xs text-gray-500">{faculty.specialization}</div>
                  </td>
                  <td className="px-4 py-3">{faculty.department}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                      {faculty.designation}
                    </span>
                  </td>
                  <td className="px-4 py-3">{faculty.qualification}</td>
                  <td className="px-4 py-3">{faculty.experience}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <Mail size={12} />
                        <span className="truncate max-w-[150px]">{faculty.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone size={12} />
                        <span>{faculty.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">{faculty.publications}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      faculty.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {faculty.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStudentTab = () => (
    <div className="space-y-6">
      {/* Student Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <GraduationCap size={32} className="mb-3 opacity-80" />
          <p className="text-sm opacity-90">Total Students</p>
          <p className="text-4xl font-bold mt-1">1,856</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <Users size={32} className="mb-3 opacity-80" />
          <p className="text-sm opacity-90">Male Students</p>
          <p className="text-4xl font-bold mt-1">785</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-xl shadow-lg">
          <Users size={32} className="mb-3 opacity-80" />
          <p className="text-sm opacity-90">Female Students</p>
          <p className="text-4xl font-bold mt-1">1,071</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <BookOpen size={32} className="mb-3 opacity-80" />
          <p className="text-sm opacity-90">Total Intake</p>
          <p className="text-4xl font-bold mt-1">845</p>
        </div>
      </div>

      {/* Department-wise Student Data */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Department-wise Student Enrollment</h3>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Download size={18} />
            Export Report
          </button>
        </div>

        <div className="space-y-6">
          {studentData.map((deptData, deptIdx) => (
            <div key={deptIdx} className="border rounded-lg overflow-hidden">
              <div className="bg-indigo-50 px-4 py-3 border-b">
                <h4 className="font-semibold text-indigo-900 flex items-center justify-between">
                  <span>{deptData.department}</span>
                  <span className="text-sm font-normal">
                    Total: {deptData.courses.reduce((sum, course) => sum + course.enrolled, 0)} students
                  </span>
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="text-left px-4 py-2">Course</th>
                      <th className="text-left px-4 py-2">Year</th>
                      <th className="text-left px-4 py-2">Intake Capacity</th>
                      <th className="text-left px-4 py-2">Enrolled</th>
                      <th className="text-left px-4 py-2">Male</th>
                      <th className="text-left px-4 py-2">Female</th>
                      <th className="text-left px-4 py-2">Occupancy %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptData.courses.map((course, courseIdx) => (
                      <tr key={courseIdx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{course.courseName}</td>
                        <td className="px-4 py-2">{course.year}</td>
                        <td className="px-4 py-2">{course.intakeCapacity}</td>
                        <td className="px-4 py-2 font-semibold text-indigo-600">{course.enrolled}</td>
                        <td className="px-4 py-2">{course.male}</td>
                        <td className="px-4 py-2">{course.female}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${(course.enrolled / course.intakeCapacity) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">
                              {Math.round((course.enrolled / course.intakeCapacity) * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDepartmentTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Department Overview</h3>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} />
          Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departmentSummary.map((dept, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800 text-lg">{dept.department}</h4>
              <GraduationCap className="text-indigo-500" size={28} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Faculty</span>
                <span className="font-semibold text-gray-800">{dept.totalFaculty}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Students</span>
                <span className="font-semibold text-indigo-600">{dept.totalStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Courses Offered</span>
                <span className="font-semibold text-gray-800">{dept.courses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Intake Capacity</span>
                <span className="font-semibold text-gray-800">{dept.intakeCapacity}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex gap-2">
                <button className="flex-1 bg-indigo-50 text-indigo-700 py-2 rounded text-sm hover:bg-indigo-100">
                  View Details
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded text-sm hover:bg-gray-200">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Faculty & Student Data</h1>
        <p className="text-gray-500">Manage faculty and student information</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow">
        <div className="flex overflow-x-auto border-b">
          {[
            { id: 'faculty', label: 'Faculty List', icon: Users },
            { id: 'students', label: 'Student Enrollment', icon: GraduationCap },
            { id: 'departments', label: 'Department Summary', icon: BookOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div>
        {activeTab === 'faculty' && renderFacultyTab()}
        {activeTab === 'students' && renderStudentTab()}
        {activeTab === 'departments' && renderDepartmentTab()}
      </div>
    </div>
  );
};

export default FacultyStudentData;