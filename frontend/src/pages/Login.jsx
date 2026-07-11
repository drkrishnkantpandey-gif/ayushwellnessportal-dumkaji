import React, { useState } from 'react';
import { Mail, Lock, Users, User, Building, Heart, GraduationCap, Shield, Map, Crown, Eye, EyeOff } from 'lucide-react';
import { Hospital } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API from '../config/api';

const LoginPage = ({ setCurrentPage, setIsLoggedIn, setUserRole, language }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);

  const roles = [
    { id: 'yoga_professional', en: 'Yoga Professional', hi: 'योग प्रोफेशनल', icon: User, desc: 'For certified yoga practitioners' },
    { id: 'yoga_centre', en: 'Yoga Centre', hi: 'योग केंद्र', icon: Building, desc: 'For yoga institutions' },
    { id: 'wellness_centre', en: 'Wellness Centre', hi: 'वेलनेस केंद्र', icon: Heart, desc: 'For wellness therapy centers' },
    { id: 'ayush_hospital', en: 'AYUSH Hospital', hi: 'आयुष अस्पताल', icon: Shield, desc: 'For NABH accredited hospitals' },
    { id: 'ayush_college', en: 'AYUSH College', hi: 'आयुष कॉलेज', icon: GraduationCap, desc: 'For NAAC accredited colleges' },
    { id: 'research_org', en: 'Research Grant', hi: 'अनुसंधान अनुदान', icon: GraduationCap, desc: 'NGO, Research Institute, Medical Org, University or College' },
    { id: 'institution', en: 'Institution', hi: 'संस्थान', icon: Building, desc: 'Institution, Home Stay, Resort, Hotel, School, College, Yoga Centre or Yoga Institute' },
    { id: 'district_officer', en: 'District Officer', hi: 'जिला अधिकारी', icon: Map, desc: 'For district administrators' },
    { id: 'directorate', en: 'Directorate', hi: 'निदेशालय', icon: Shield, desc: 'For state administrators' },
    { id: 'admin', en: 'Admin', hi: 'प्रशासक', icon: Crown, desc: 'For system administrators' }
  ];

  // When role card is clicked, open login form directly
  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    // Reset credentials when role changes
    setEmail('');
    setPassword('');
    setLoginError('');
    setShowLoginForm(true);
  };

  const handleBackToRoles = () => {
    setShowLoginForm(false);
    setSelectedRole('');
    setEmail('');
    setPassword('');
    setLoginError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!selectedRole) {
      setLoginError(language === 'EN' ? 'Please select a role to continue' : 'कृपया जारी रखने के लिए एक भूमिका चुनें');
      return;
    }

    if (!email.trim()) {
      setLoginError(language === 'EN' ? 'Please enter your email or username' : 'कृपया अपना ईमेल या उपयोगकर्ता नाम दर्ज करें');
      return;
    }

    if (!password) {
      setLoginError(language === 'EN' ? 'Please enter your password' : 'कृपया अपना पासवर्ड दर्ज करें');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API}/api/auth/login`, {
        email: email.trim(),
        password,
        role: selectedRole
      }, { withCredentials: true });

      if (response.data.success) {
        // JWT is stored in httpOnly cookie by the server — do NOT put it in localStorage
        localStorage.setItem('userRole', selectedRole);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Set default tab to sessions (Yoga Activity Tracker) for yoga_professional
        if (selectedRole === 'yoga_professional') {
          localStorage.setItem('activeTab', 'sessions');
        } else {
          localStorage.setItem('activeTab', 'home');
        }

        setIsLoggedIn(true);
        setUserRole(selectedRole);
        setCurrentPage('dashboard');

        toast.success(language === 'EN' ? 'Login successful!' : 'लॉगिन सफल!');
      } else {
        setLoginError(response.data.message || (language === 'EN' ? 'Invalid credentials' : 'अमान्य क्रेडेंशियल्स'));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
        (language === 'EN' ? 'Login failed. Please check your credentials and try again.' : 'लॉगिन विफल। कृपया अपनी क्रेडेंशियल्स जाँचें और पुनः प्रयास करें।');
      setLoginError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleObj = roles.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {!showLoginForm ? (
            /* ── Role Selection Screen ── */
            <div className="p-8">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-200">
                  <Users className="text-white" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">
                  {language === "EN" ? "Select Your Role" : "अपनी भूमिका चुनें"}
                </h2>
                <p className="text-gray-500 mt-2">
                  {language === "EN"
                    ? "Click on your role to proceed directly to login"
                    : "सीधे लॉगिन के लिए अपनी भूमिका पर क्लिक करें"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className="p-5 border-2 border-gray-100 rounded-2xl hover:border-teal-400 hover:bg-teal-50 transition-all group text-left"
                    >
                      <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-600 transition-colors">
                        <Icon className="text-teal-700 group-hover:text-white transition-colors" size={28} />
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm mb-1">
                        {language === "EN" ? role.en : role.hi}
                      </h3>
                      <p className="text-gray-400 text-xs">{role.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 text-sm">
                  {language === "EN" ? "Don't have an account?" : "क्या आपके पास खाता नहीं है?"}{' '}
                  <button
                    onClick={() => setCurrentPage('register')}
                    className="text-teal-600 font-semibold hover:underline"
                  >
                    {language === "EN" ? "Register Now" : "अभी पंजीकरण करें"}
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* ── Login Form Screen ── */
            <div className="grid md:grid-cols-5 min-h-[500px]">
              {/* Left Panel */}
              <div className="md:col-span-2 bg-gradient-to-br from-teal-800 to-teal-600 p-8 flex flex-col justify-between text-white">
                <div>
                  <button
                    onClick={handleBackToRoles}
                    className="flex items-center gap-2 text-teal-200 hover:text-white text-sm font-medium mb-8 transition-colors"
                  >
                    ← {language === "EN" ? "Change Role" : "भूमिका बदलें"}
                  </button>

                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                    {selectedRoleObj && <selectedRoleObj.icon size={32} />}
                  </div>

                  <h2 className="text-2xl font-bold mb-2">
                    {language === "EN" ? "Welcome Back" : "वापसी पर स्वागत है"}
                  </h2>
                  <p className="text-teal-200 text-sm mb-4">
                    {language === "EN" ? "Logging in as" : "लॉगिन करें"}{" "}
                    <span className="text-white font-bold">
                      {language === "EN" ? selectedRoleObj?.en : selectedRoleObj?.hi}
                    </span>
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-teal-100 text-xs leading-relaxed">
                    {language === "EN"
                      ? "Access your AYUSH dashboard, manage certifications, track yoga activities and handle incentive claims securely."
                      : "अपने AYUSH डैशबोर्ड तक पहुँचें, प्रमाणपत्र प्रबंधित करें, योग गतिविधियों को ट्रैक करें।"}
                  </p>
                </div>
              </div>

              {/* Right Panel – Login Form */}
              <div className="md:col-span-3 p-8 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {language === "EN" ? "Sign In" : "साइन इन करें"}
                </h3>
                <p className="text-gray-500 text-sm mb-8">
                  {language === "EN" ? "Enter your registered credentials below" : "अपनी पंजीकृत क्रेडेंशियल्स दर्ज करें"}
                </p>

                {loginError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-3">
                    <span className="text-lg">⚠️</span>
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === "EN" ? "Email / Username" : "ईमेल / उपयोगकर्ता नाम"}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setLoginError('');
                        }}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition"
                        placeholder={language === "EN" ? "Enter your email" : "अपना ईमेल दर्ज करें"}
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === "EN" ? "Password" : "पासवर्ड"}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setLoginError('');
                        }}
                        className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition"
                        placeholder={language === "EN" ? "Enter your password" : "अपना पासवर्ड दर्ज करें"}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                      <span className="text-sm text-gray-600">
                        {language === "EN" ? "Remember me" : "मुझे याद रखें"}
                      </span>
                    </label>
                    <button type="button" className="text-sm text-teal-600 hover:text-teal-700 font-semibold">
                      {language === "EN" ? "Forgot Password?" : "पासवर्ड भूल गए?"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${loading
                        ? 'bg-teal-400 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700 shadow-teal-200 hover:shadow-xl hover:-translate-y-0.5'
                      }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {language === "EN" ? "Signing In..." : "लॉगिन हो रहा है..."}
                      </span>
                    ) : (
                      language === "EN" ? "Sign In" : "साइन इन"
                    )}
                  </button>
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                    <div className="text-xs text-amber-800 leading-relaxed font-medium">
                      {language === "EN" ? (
                        <strong>Note:</strong>
                      ) : (
                        <strong>नोट:</strong>
                      )}
                      {" "}
                      {language === "EN" 
                        ? "Registrations require administrative approval before you can log in. Wellness Centres, Yoga Professionals, Yoga Centres, and AYUSH Hospitals should contact their District Office or Directorate. AYUSH Colleges and Research Institutions should contact the Directorate."
                        : "लॉगिन करने से पहले पंजीकरणों के लिए प्रशासनिक स्वीकृति आवश्यक है। वैलनेस सेंटर्स, योग प्रोफेशनल्स, योग सेंटर्स, और आयुष अस्पतालों को अपने जिला कार्यालय या निदेशालय से संपर्क करना चाहिए। आयुष कॉलेजों और शोध संस्थानों को निदेशालय से संपर्क करना चाहिए।"
                      }
                    </div>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600 text-sm">
                    {language === "EN" ? "Don't have an account?" : "खाता नहीं है?"}{' '}
                    <button
                      onClick={() => setCurrentPage('register')}
                      className="text-teal-600 font-semibold hover:underline"
                    >
                      {language === "EN" ? "Register Now" : "अभी पंजीकरण करें"}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
