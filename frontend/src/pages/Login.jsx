import React, { useState } from 'react';
import { Mail, Lock, Users, User, Building, Heart, GraduationCap, Shield, Map, Crown, Eye, EyeOff, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API from '../config/api';

const LoginPage = ({ setCurrentPage, setIsLoggedIn, setUserRole, language }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const handleSectionToggle = (title) => {
    setExpandedSection(prev => (prev === title ? null : title));
  };

  const roles = [
    { id: 'yoga_professional', en: 'Yoga Professional', hi: 'योग प्रोफेशनल', icon: User, desc: 'For certified yoga practitioners' },
    { id: 'yoga_centre', en: 'Yoga Centres', hi: 'योग केंद्र / संस्थान', icon: Building, desc: 'Yoga Centre or Institution (Home Stay, Resort, Hotel, School, College, Yoga Institute)' },
    { id: 'wellness_centre', en: 'Wellness Centre', hi: 'वेलनेस केंद्र', icon: Heart, desc: 'For wellness therapy centers' },
    { id: 'ayush_hospital', en: 'AYUSH Hospital', hi: 'आयुष अस्पताल', icon: Shield, desc: 'For NABH accredited hospitals' },
    { id: 'ayush_college', en: 'AYUSH College', hi: 'आयुष कॉलेज', icon: GraduationCap, desc: 'For NAAC accredited colleges' },
    { id: 'research_org', en: 'Research Grant', hi: 'अनुसंधान अनुदान', icon: GraduationCap, desc: 'NGO, Research Institute, Medical Org, University or College' },
    { id: 'district_officer', en: 'District Officer', hi: 'जिला अधिकारी', icon: Map, desc: 'For district administrators' },
    { id: 'directorate', en: 'Directorate', hi: 'निदेशालय', icon: Shield, desc: 'For state administrators' },
    { id: 'admin', en: 'Admin', hi: 'प्रशासक', icon: Crown, desc: 'For system administrators' }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
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
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        localStorage.setItem('userRole', selectedRole);
        localStorage.setItem('user', JSON.stringify(response.data.user));
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
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative z-10 flex items-center justify-center">
      <div className="bg-zinc-950/80 border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl max-w-5xl w-full">

        {!showLoginForm ? (
          /* ── Role Selection Screen ── */
          <div className="p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-[#ef233c] to-red-950 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-red-900/30 border border-white/10">
                <Users className="text-white" size={36} />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white font-manrope">
                {language === "EN" ? "Select Your Role" : "अपनी भूमिका चुनें"}
              </h2>
              <p className="text-zinc-400 mt-2 text-sm font-light">
                {language === "EN" ? "Select your operational division to proceed to login" : "सीधे लॉगिन के लिए अपनी भूमिका पर क्लिक करें"}
              </p>
            </div>

            {/* Sections */}
            {[{ title: language === "EN" ? "Wellness Registry" : "वेलनेस रजिस्ट्री", roleIds: ["yoga_professional", "wellness_centre"] }, { title: language === "EN" ? "Incentives / Grants" : "प्रोत्साहन / अनुदान", roleIds: ["yoga_centre", "ayush_hospital", "ayush_college", "research_org"] }, { title: language === "EN" ? "Officials" : "अधिकारी", roleIds: ["district_officer", "directorate", "admin"] }].map(section => (
              <div key={section.title} className="mb-4">
                <button
                  className="w-full flex justify-between items-center bg-zinc-900 border border-white/5 text-white p-4 rounded-xl hover:border-white/20 transition-all font-semibold"
                  onClick={() => handleSectionToggle(section.title)}
                >
                  <span className="font-bold text-base md:text-lg">{section.title}</span>
                  <span className="text-zinc-400">{expandedSection === section.title ? '▲' : '▼'}</span>
                </button>
                {expandedSection === section.title && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 animate-fade-up">
                    {roles.filter(r => section.roleIds.includes(r.id)).map(r => (
                      <div
                        key={r.id}
                        className="cursor-pointer p-5 border border-white/5 hover:border-[#ef233c]/40 bg-black/40 rounded-xl hover:shadow-xl hover:shadow-red-900/5 transition flex flex-col items-center text-center group"
                        onClick={() => handleRoleSelect(r.id)}
                      >
                        <r.icon className="text-[#ef233c] mb-3 group-hover:scale-110 transition-transform" size={40} />
                        <h3 className="font-bold text-zinc-100 group-hover:text-white transition-colors">{language === "EN" ? r.en : r.hi}</h3>
                        <p className="text-xs text-zinc-500 mt-2 leading-snug font-light">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="mt-8 text-center">
              <p className="text-zinc-400 text-sm">
                {language === "EN" ? "Don't have an account?" : "क्या आपके पास खाता नहीं है?"}{' '}
                <button
                  onClick={() => setCurrentPage('register')}
                  className="text-[#ef233c] font-bold hover:underline"
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
            <div className="md:col-span-2 bg-gradient-to-br from-red-950/80 to-zinc-950 p-8 flex flex-col justify-between text-white border-r border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#ef233c/10,transparent_70%)]"></div>
              <div className="relative z-10">
                <button
                  onClick={handleBackToRoles}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-semibold mb-8 transition-colors"
                >
                  ← {language === "EN" ? "Change Role" : "भूमिका बदलें"}
                </button>

                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                  {selectedRoleObj && (() => { const RoleIcon = selectedRoleObj.icon; return <RoleIcon className="text-[#ef233c]" size={32} />; })()}
                </div>

                <h2 className="text-3xl font-extrabold mb-2 font-manrope">
                  {language === "EN" ? "Welcome" : "स्वागत है"}
                </h2>
                <p className="text-zinc-400 text-sm mb-4">
                  {language === "EN" ? "Logging in as" : "लॉगिन करें"}{" "}
                  <span className="text-[#ef233c] font-bold">
                    {language === "EN" ? selectedRoleObj?.en : selectedRoleObj?.hi}
                  </span>
                </p>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 relative z-10">
                <p className="text-zinc-400 text-xs leading-relaxed font-light">
                  {language === "EN"
                    ? "Access your AYUSH dashboard, manage certifications, track yoga activities and handle incentive claims securely."
                    : "अपने AYUSH डैशबोर्ड तक पहुँचें, प्रमाणपत्र प्रबंधित करें, योग गतिविधियों को ट्रैक करें।"}
                </p>
              </div>
            </div>

            {/* Right Panel – Login Form */}
            <div className="md:col-span-3 p-8 flex flex-col justify-center bg-zinc-950/40">
              <h3 className="text-2xl font-bold text-white font-manrope mb-1">
                {language === "EN" ? "Sign In" : "साइन इन करें"}
              </h3>
              <p className="text-zinc-400 text-sm mb-8 font-light">
                {language === "EN" ? "Enter your registered credentials below" : "अपनी पंजीकृत क्रेडेंशियल्स दर्ज करें"}
              </p>

              {loginError && (
                <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 text-[#ef233c] rounded-xl text-sm flex items-start gap-3 animate-fade-up">
                  <span className="text-lg">⚠️</span>
                  <span className="font-medium">{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    {language === "EN" ? "Email / Username" : "ईमेल / उपयोगकर्ता नाम"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setLoginError('');
                      }}
                      className="w-full pl-12 pr-4 py-3.5 bg-black/60 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/20 transition text-sm font-medium"
                      placeholder={language === "EN" ? "Enter your email" : "अपना ईमेल दर्ज करें"}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    {language === "EN" ? "Password" : "पासवर्ड"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError('');
                      }}
                      className="w-full pl-12 pr-12 py-3.5 bg-black/60 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/20 transition text-sm font-medium"
                      placeholder={language === "EN" ? "Enter your password" : "अपना पासवर्ड दर्ज करें"}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-[#ef233c] accent-[#ef233c] bg-zinc-900 border-zinc-800 focus:ring-[#ef233c] rounded" 
                    />
                    <span className="text-sm text-zinc-400 font-medium">
                      {language === "EN" ? "Remember me" : "मुझे याद रखें"}
                    </span>
                  </label>
                  <button type="button" className="text-sm text-[#ef233c] hover:text-red-400 font-bold transition-colors">
                    {language === "EN" ? "Forgot Password?" : "पासवर्ड भूल गए?"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-extrabold text-white transition-all shadow-lg uppercase tracking-wider text-sm ${loading
                      ? 'bg-red-800/50 cursor-not-allowed'
                      : 'bg-[#ef233c] hover:bg-red-700 shadow-[#ef233c]/20 hover:shadow-xl hover:-translate-y-0.5'
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

                <div className="mt-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                  <div className="text-xs text-yellow-300/80 leading-relaxed font-medium">
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
                <p className="text-zinc-400 text-sm font-light">
                  {language === "EN" ? "Don't have an account?" : "खाता नहीं है?"}{' '}
                  <button
                    onClick={() => setCurrentPage('register')}
                    className="text-[#ef233c] font-bold hover:underline"
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
  );
};

export default LoginPage;
