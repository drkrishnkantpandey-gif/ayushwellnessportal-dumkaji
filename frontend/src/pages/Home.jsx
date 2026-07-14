import React, { useState } from 'react';
import { Home, FileText, Shield, CreditCard, Award, Menu, X, Search, Bell, User, ChevronRight, Download, Upload, Eye, Calendar, MapPin, Camera, Lock, Mail, Phone, Building, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

// Mock Data
const dummyData = {
  user: {
    name: "Priya Sharma",
    role: "Yoga Professional",
    certId: "CERT-2023-5678",
    pendingApps: 2,
    lastMonthSessions: 15,
    nextPayout: "₹15,000"
  },
  notifications: [
    { id: 1, text: "Please upload missing documents for Application ID: AYUSH-2024-007", type: "warning" },
    { id: 2, text: "Session Upload: 2 saved, central resubmission not done", type: "info" }
  ],
  recentActivity: [
    { id: 1, text: "Incentive Uploaded - 2", date: "07/05" },
    { id: 2, text: "Session Logged", date: "06/05" }
  ],
  applications: [
    {
      id: "AYUSH-2024-007",
      type: "Yoga Professional Certification",
      status: "Pending Documents",
      submittedDate: "15/10/2024",
      lastUpdate: "05/11/2024",
      documents: ["Aadhaar", "Qualification Certificate", "Experience Letter"]
    },
    {
      id: "AYUSH-2024-005",
      type: "Session Reimbursement",
      status: "Under Review",
      submittedDate: "01/10/2024",
      lastUpdate: "30/10/2024",
      amount: "₹12,000"
    }
  ],
  sessions: [
    {
      id: 1,
      date: "2024-11-10",
      location: "Community Center, Dehradun",
      participants: 25,
      duration: "60 mins",
      photos: 3,
      status: "Approved"
    },
    {
      id: 2,
      date: "2024-11-08",
      location: "Wellness Center, Mussoorie Road",
      participants: 18,
      duration: "45 mins",
      photos: 2,
      status: "Pending Verification"
    }
  ]
};

// Navbar Component
const Navbar = ({ language, setLanguage, currentPage, setCurrentPage, isLoggedIn }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-teal-700 to-teal-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setCurrentPage('home')}
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border border-teal-100 p-0.5">
              <img src="/images/ayush_setu_logo.png" alt="AYUSH Setu Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-white font-bold text-xl">AYUSH Setu</span>
              <p className="text-teal-100 text-xs">Ministry of AYUSH, Govt. of India</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setCurrentPage('home')}
              className="text-white hover:text-teal-200 transition"
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentPage('verify')}
              className="text-white hover:text-teal-200 transition"
            >
              Verify Certificate
            </button>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-teal-800 text-white px-3 py-1 rounded border border-teal-500 text-sm cursor-pointer"
            >
              <option value="EN">EN</option>
              <option value="HI">हिं</option>
            </select>

            {isLoggedIn ? (
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="bg-white text-teal-700 px-4 py-2 rounded-lg font-semibold hover:bg-teal-50 transition"
              >
                Dashboard
              </button>
            ) : (
              <button 
                onClick={() => setCurrentPage('login')}
                className="bg-white text-teal-700 px-4 py-2 rounded-lg font-semibold hover:bg-teal-50 transition"
              >
                Login / Register
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-teal-800 pb-4">
          <div className="px-4 space-y-3">
            <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="block w-full text-left text-white py-2">Home</button>
            <button onClick={() => { setCurrentPage('verify'); setMobileMenuOpen(false); }} className="block w-full text-left text-white py-2">Verify Certificate</button>
            <button 
              onClick={() => { setCurrentPage(isLoggedIn ? 'dashboard' : 'login'); setMobileMenuOpen(false); }}
              className="w-full bg-white text-teal-700 px-4 py-2 rounded-lg font-semibold"
            >
              {isLoggedIn ? 'Dashboard' : 'Login / Register'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

// Hero Section
const HeroSection = ({ setCurrentPage }) => {
  return (
    <div className="bg-gradient-to-br from-teal-50 to-green-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Empowering Wellness:<br />
              <span className="text-teal-700">Uttarakhand's Wellness Registry & Incentive Portal</span>
            </h1>
            <p className="text-gray-600 mb-6 text-lg">
              Register, certify, and track yoga activities. Access incentives and manage wellness programs digitally.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setCurrentPage('verify')}
                className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center"
              >
                <Shield className="mr-2" size={20} />
                Verify Certificate
              </button>
              <button 
                onClick={() => setCurrentPage('register')}
                className="bg-white border-2 border-teal-600 text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition"
              >
                Register Now
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-teal-200 to-green-200 rounded-2xl p-8 shadow-xl flex items-center justify-center bg-white">
              <img 
                src="/images/ayush_setu_logo.png"
                alt="AYUSH Setu Logo"
                className="w-full rounded-lg object-contain"
                style={{ maxHeight: "240px" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature Card
const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-100 group hover:border-teal-300">
      <div className="bg-teal-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-600 transition">
        <Icon className="text-teal-700 group-hover:text-white transition" size={32} />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Key Features Section
const KeyFeatures = () => {
  const features = [
    {
      icon: FileText,
      title: "Certification & Accreditation",
      description: "Register yoga professionals, centers, and get accredited digitally"
    },
    {
      icon: CreditCard,
      title: "Incentives & Reimbursements",
      description: "Automated subsidy processing and direct payments via e-Treasury"
    },
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      description: "Track yoga sessions with geo-location and attendance logging"
    },
    {
      icon: Shield,
      title: "Public Verification",
      description: "Verify certificates and ratings with QR code scanning"
    }
  ];

  return (
    <div className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Key Features</h2>
        <p className="text-center text-gray-600 mb-12">Comprehensive tools for wellness management</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Login Page
const Login = ({ setCurrentPage, setIsLoggedIn }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Login to AYUSH Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-teal-600 hover:text-teal-700 font-semibold">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={() => setCurrentPage('register')}
                className="text-teal-600 hover:text-teal-700 font-semibold"
              >
                Register Now
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Register Page
const Register = ({ setCurrentPage }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userType: '',
    fullName: '',
    email: '',
    phone: '',
    aadhaar: '',
    pan: '',
    password: '',
    confirmPassword: '',
    organization: '',
    qualification: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      alert('Registration Successful! Please verify your email.');
      setCurrentPage('login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Register on AYUSH Portal</h2>
            <p className="text-gray-600 mt-2">Step {step} of 3</p>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <div className={`flex-1 h-1 ${step >= 2 ? 'bg-teal-600' : 'bg-gray-300'}`}></div>
            </div>
            <div className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <div className={`flex-1 h-1 ${step >= 3 ? 'bg-teal-600' : 'bg-gray-300'}`}></div>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              3
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: User Type Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { value: 'yoga_professional', label: 'Yoga Professional', icon: User },
                      { value: 'center_owner', label: 'Wellness Center Owner', icon: Building },
                      { value: 'hospital', label: 'AYUSH Hospital', icon: Building },
                      { value: 'govt_staff', label: 'Government Staff', icon: Shield }
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({...formData, userType: type.value})}
                        className={`p-6 rounded-lg border-2 transition ${
                          formData.userType === type.value
                            ? 'border-teal-600 bg-teal-50'
                            : 'border-gray-300 hover:border-teal-300'
                        }`}
                      >
                        <type.icon className={`mx-auto mb-3 ${formData.userType === type.value ? 'text-teal-600' : 'text-gray-400'}`} size={32} />
                        <p className="font-semibold text-gray-800">{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      value={formData.aadhaar}
                      onChange={(e) => setFormData({...formData, aadhaar: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="12-digit Aadhaar"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={formData.pan}
                      onChange={(e) => setFormData({...formData, pan: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="PAN Card Number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Qualification
                    </label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Your qualification"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Password & Verification */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Create Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Re-enter password"
                    required
                  />
                </div>

                <div className="bg-teal-50 p-6 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-4">Document Upload Required</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <FileText className="mr-2 text-teal-600" size={16} />
                      Aadhaar Card (Front & Back)
                    </li>
                    <li className="flex items-center">
                      <FileText className="mr-2 text-teal-600" size={16} />
                      PAN Card
                    </li>
                    <li className="flex items-center">
                      <FileText className="mr-2 text-teal-600" size={16} />
                      Qualification Certificates
                    </li>
                    <li className="flex items-center">
                      <FileText className="mr-2 text-teal-600" size={16} />
                      Experience Letters (if applicable)
                    </li>
                  </ul>
                  <p className="mt-4 text-xs text-gray-600">
                    * Documents can be uploaded after registration from your dashboard
                  </p>
                </div>

                <label className="flex items-start">
                  <input type="checkbox" className="w-4 h-4 mt-1 text-teal-600 border-gray-300 rounded focus:ring-teal-500" required />
                  <span className="ml-2 text-sm text-gray-700">
                    I agree to the Terms & Conditions and Privacy Policy of AYUSH Portal
                  </span>
                </label>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Previous
                </button>
              )}
              <button
                type="submit"
                className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
              >
                {step === 3 ? 'Complete Registration' : 'Next'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={() => setCurrentPage('login')}
                className="text-teal-600 hover:text-teal-700 font-semibold"
              >
                Login Here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// My Applications Page
const MyApplications = () => {
  const { applications } = dummyData;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Applications</h1>
          <p className="text-gray-600">Track all your submissions and their status</p>
        </div>
        <button className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center">
          <Upload className="mr-2" size={20} />
          New Application
        </button>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{app.id}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    app.status === 'Pending Documents' ? 'bg-yellow-100 text-yellow-700' :
                    app.status === 'Under Review' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{app.type}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>Submitted: {app.submittedDate}</span>
                  <span>Last Update: {app.lastUpdate}</span>
                  {app.amount && <span className="font-semibold text-teal-600">{app.amount}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition flex items-center">
                  <Eye className="mr-2" size={16} />
                  View Details
                </button>
                {app.status === 'Pending Documents' && (
                  <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition flex items-center">
                    <Upload className="mr-2" size={16} />
                    Upload Docs
                  </button>
                )}
              </div>
            </div>
            
            {app.documents && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Required Documents:</p>
                <div className="flex flex-wrap gap-2">
                  {app.documents.map((doc, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Session Log Page
const SessionLog = () => {
  const { sessions } = dummyData;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Session/Activity Log</h1>
          <p className="text-gray-600">Record and track your yoga sessions</p>
        </div>
        <button className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center">
          <Camera className="mr-2" size={20} />
          Log New Session
        </button>
      </div>

      <div className="grid gap-6">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="text-teal-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-800">{session.date}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    session.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {session.status}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="mr-2 text-teal-600" size={18} />
                    <span>{session.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="mr-2 text-teal-600" size={18} />
                    <span>{session.participants} Participants</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="mr-2 text-teal-600" size={18} />
                    <span>{session.duration}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Camera className="mr-2 text-teal-600" size={18} />
                    <span>{session.photos} Photos Uploaded</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition">
                  View Details
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  <Download size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Incentive Status Page
const IncentiveStatus = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Incentive/Payment Status</h1>
        <p className="text-gray-600">Track your reimbursements and subsidies</p>
      </div>

      {/* Payment Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <CheckCircle className="mb-3" size={32} />
          <p className="text-sm opacity-90 mb-1">Total Received</p>
          <p className="text-3xl font-bold">₹45,000</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
          <Clock className="mb-3" size={32} />
          <p className="text-sm opacity-90 mb-1">Pending Approval</p>
          <p className="text-3xl font-bold">₹15,000</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <CreditCard className="mb-3" size={32} />
          <p className="text-sm opacity-90 mb-1">Next Payout</p>
          <p className="text-3xl font-bold">₹15,000</p>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Payment History</h3>
        <div className="space-y-4">
          {[
            { id: 'PAY-2024-015', amount: '₹12,000', date: '25/10/2024', status: 'Completed', type: 'Session Reimbursement' },
            { id: 'PAY-2024-012', amount: '₹18,000', date: '15/09/2024', status: 'Completed', type: 'Monthly Incentive' },
            { id: 'PAY-2024-010', amount: '₹15,000', date: '20/08/2024', status: 'Completed', type: 'Session Reimbursement' },
            { id: 'PAY-2024-007', amount: '₹15,000', date: '15/11/2024', status: 'Processing', type: 'Monthly Incentive' }
          ].map((payment) => (
            <div key={payment.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex-1">
                <p className="font-bold text-gray-800">{payment.id}</p>
                <p className="text-sm text-gray-600">{payment.type}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-800">{payment.amount}</p>
                <p className="text-sm text-gray-600">{payment.date}</p>
              </div>
              <div className="ml-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  payment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// My Certificate Page
const VerifyCertificate = () => {
  const { user } = dummyData;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Digital Certificate</h1>
        <p className="text-gray-600">Download and share your AYUSH certificate</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Certificate Preview */}
        <div className="bg-white p-8 rounded-xl shadow-lg border-4 border-teal-600">
          <div className="text-center">
            <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">AYUSH Certificate</h2>
            <p className="text-teal-600 font-semibold mb-4">Yoga Professional</p>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <div className="w-32 h-32 bg-white mx-auto flex items-center justify-center border-2 border-gray-300">
                <span className="text-xs text-gray-500">QR Code</span>
              </div>
            </div>
            
            <p className="font-bold text-xl text-gray-800 mb-1">{user.name}</p>
            <p className="text-gray-600 mb-4">Certificate ID: {user.certId}</p>
            
            <div className="border-t border-gray-300 pt-4">
              <p className="text-sm text-gray-600">Issued by:</p>
              <p className="font-semibold text-gray-800">Ministry of AYUSH</p>
              <p className="text-sm text-gray-600">Government of India</p>
            </div>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Certificate Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Certificate ID:</span>
                <span className="font-semibold text-gray-800">{user.certId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Issue Date:</span>
                <span className="font-semibold text-gray-800">15/10/2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valid Until:</span>
                <span className="font-semibold text-gray-800">14/10/2027</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="bg-teal-50 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Verification URL</h3>
            <div className="bg-white p-3 rounded border border-teal-300 mb-3">
              <p className="text-sm text-gray-600 break-all">
                https://ayush.gov.in/verify/{user.certId}
              </p>
            </div>
            <button className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition">
              Copy Link
            </button>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center justify-center">
              <Download className="mr-2" size={20} />
              Download PDF
            </button>
            <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center">
              <Upload className="mr-2" size={20} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Sidebar
const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Dashboard Home', badge: 3 },
    { id: 'applications', icon: FileText, label: 'My Applications' },
    { id: 'sessions', icon: Calendar, label: 'Session/Activity Log' },
    { id: 'incentives', icon: CreditCard, label: 'Incentive/Payment Status' },
    { id: 'certificate', icon: Award, label: 'My Digital Certificate' }
  ];

  return (
    <div className="bg-gradient-to-b from-teal-700 to-teal-800 h-full p-4">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border border-teal-100 p-0.5">
          <img src="/images/ayush_setu_logo.png" alt="AYUSH Setu Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-white font-bold text-lg">AYUSH Setu</span>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              activeTab === item.id 
                ? 'bg-teal-600 text-white' 
                : 'text-teal-100 hover:bg-teal-600 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="flex-1 text-left text-sm">{item.label}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

// Dashboard Home
const Dashboard = ({ setActiveTab }) => {
  const { user, notifications, recentActivity } = dummyData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back, {user.name}!</h1>
          <p className="text-gray-600">Yoga Professional Dashboard</p>
        </div>
        <button 
          onClick={() => setActiveTab('sessions')}
          className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center"
        >
          <Camera className="mr-2" size={20} />
          Start New Yoga Session
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => setActiveTab('applications')}
          className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500 text-left hover:shadow-xl transition"
        >
          <p className="text-gray-600 text-sm mb-1">Pending Applications</p>
          <p className="text-4xl font-bold text-gray-800">{user.pendingApps}</p>
        </button>
        <button 
          onClick={() => setActiveTab('sessions')}
          className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500 text-left hover:shadow-xl transition"
        >
          <p className="text-gray-600 text-sm mb-1">Last Month's Sessions</p>
          <p className="text-4xl font-bold text-gray-800">{user.lastMonthSessions}</p>
        </button>
        <button 
          onClick={() => setActiveTab('incentives')}
          className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500 text-left hover:shadow-xl transition"
        >
          <p className="text-gray-600 text-sm mb-1">Next Payout Due</p>
          <p className="text-4xl font-bold text-gray-800">{user.nextPayout}</p>
        </button>
      </div>

      {/* Notification */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
        <div className="flex items-start">
          <Bell className="text-yellow-600 mr-3 mt-1" size={24} />
          <div className="flex-1">
            <p className="font-bold text-gray-800 mb-1">ACTION REQUIRED:</p>
            <p className="text-gray-700">{notifications[0].text}</p>
            <button 
              onClick={() => setActiveTab('applications')}
              className="mt-3 text-teal-600 hover:text-teal-700 font-semibold text-sm"
            >
              Upload Documents →
            </button>
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Application Progress</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="text-white" size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Submitted</p>
                <p className="text-sm text-gray-600">Application received</p>
              </div>
            </div>
            <ChevronRight className="text-gray-400" />
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="text-white" size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">District Verification</p>
                <p className="text-sm text-gray-600">Verified by district officer</p>
              </div>
            </div>
            <ChevronRight className="text-gray-400" />
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center animate-pulse">
                <Clock className="text-white" size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Directorate Approval</p>
                <p className="text-sm text-orange-600">Pending approval</p>
              </div>
            </div>
            <ChevronRight className="text-gray-400" />
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <Award className="text-white" size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-500">Certified</p>
                <p className="text-sm text-gray-400">Certificate generation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Preview */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">My Latest Digital Certificate</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-teal-500 transition cursor-pointer">
            <div className="w-32 h-32 bg-gray-200 mb-4 flex items-center justify-center rounded">
              <span className="text-4xl">📱</span>
            </div>
            <p className="font-bold text-gray-800">{user.certId}</p>
            <p className="text-sm text-gray-600 mb-4">Priya Sharma</p>
            <button 
              onClick={() => setActiveTab('certificate')}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
            >
              View Certificate
            </button>
          </div>
          
          <div className="bg-teal-50 p-6 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-3">Recent Upload:</h4>
            <p className="text-sm text-gray-700 mb-2">
              Session Upload: 2 saved, central resubmission not done For Proposition ID: AYUSH-2024-007
            </p>
            <p className="text-xs text-gray-600 mb-4">Area: 5 (aaas)</p>
            <div className="text-right">
              <button 
                onClick={() => setActiveTab('sessions')}
                className="text-teal-700 hover:text-teal-800 font-semibold text-sm"
              >
                View Details →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex justify-between items-center py-3 border-b border-gray-100">
              <p className="text-gray-700">{activity.text}</p>
              <span className="text-sm text-gray-500">{activity.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold mb-4">About Us</h4>
            <p className="text-gray-400 text-sm">Ministry of AYUSH, Government of India</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <p className="text-gray-400 text-sm">ayush@gov.in</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Privacy Policy</h4>
            <p className="text-gray-400 text-sm">Terms & Conditions</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Government Systems</h4>
            <p className="text-gray-400 text-sm">YCB, NABH, NAAC, e-Treasury</p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
          <p>© 2024 AYUSH Setu - Ministry of AYUSH, Government of India. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
const App = () => {
  const [language, setLanguage] = useState('EN');
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const renderPage = () => {
    if (currentPage === 'login') {
      return <Login setCurrentPage={setCurrentPage} setIsLoggedIn={setIsLoggedIn} />;
    }
    
    if (currentPage === 'register') {
      return <Register setCurrentPage={setCurrentPage} />;
    }
    
    if (currentPage === 'dashboard' || isLoggedIn) {
      return (
        <div className="flex h-[calc(100vh-64px)]">
          <div className="w-64 hidden md:block overflow-y-auto">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {activeTab === 'home' && <Dashboard setActiveTab={setActiveTab} />}
            {activeTab === 'applications' && <MyApplications />}
            {activeTab === 'sessions' && <SessionLog />}
            {activeTab === 'incentives' && <IncentiveStatus/>}
            {activeTab === 'certificate' && <MyCertificate />}
          </div>
        </div>
      );
    }
    
    return (
      <>
        <HeroSection setCurrentPage={setCurrentPage} />
        <KeyFeatures />
        <Footer />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        language={language} 
        setLanguage={setLanguage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isLoggedIn={isLoggedIn}
      />
      {renderPage()}
    </div>
  );
};

export default App;
