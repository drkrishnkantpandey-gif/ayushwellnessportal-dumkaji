import React from "react";
import { Shield, UserCheck, Award, Activity, CreditCard, FolderOpen } from "lucide-react";

const HeroSection = ({ setCurrentPage, language }) => {
  const features = [
    { icon: UserCheck, label: language === "EN" ? "Professional Registration" : "पेशेवर पंजीकरण", color: "text-teal-600", bg: "bg-teal-50" },
    { icon: Award, label: language === "EN" ? "Certification Tracking" : "प्रमाणीकरण ट्रैकिंग", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Activity, label: language === "EN" ? "Activity Monitoring" : "गतिविधि निगरानी", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: CreditCard, label: language === "EN" ? "Incentive Programs" : "प्रोत्साहन कार्यक्रम", color: "text-orange-600", bg: "bg-orange-50" },
    { icon: FolderOpen, label: language === "EN" ? "Digital Profile" : "डिजिटल प्रोफाइल", color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <img
                src="/images/ayush_setu_logo.png"
                alt="AYUSH Setu Logo"
                className="h-16 w-auto bg-white rounded-xl p-1.5 shadow-sm border border-teal-100 self-start"
              />
              <div className="inline-flex items-center px-3 py-1.5 bg-teal-100/80 backdrop-blur-sm text-teal-800 rounded-full text-xs sm:text-sm font-semibold border border-teal-200">
                {language === "EN" ? "Department of Ayush and Ayush Education, Uttarakhand Government" : "आयुष एवं आयुष शिक्षा विभाग, उत्तराखण्ड सरकार"}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
              {language === "EN" ? "Empowering Wellness:" : "कल्याण को सशक्त बनाना:"}
              <br />
              <span className="text-teal-700">
                {language === "EN" ? "Uttarakhand's Wellness Registry & Incentive Portal" : "उत्तराखण्ड वेलनेस रजिस्ट्री एवं प्रोत्साहन पोर्टल"}
              </span>
            </h1>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {features.map((f, i) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-1.5 ${f.bg} ${f.color} rounded-full text-xs font-semibold`}>
                  <f.icon size={14} />
                  {f.label}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setCurrentPage("verify")}
                className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 flex items-center gap-2"
              >
                <Shield size={20} />
                {language === "EN" ? "Verify Certificate" : "प्रमाणपत्र सत्यापित करें"}
              </button>

              <button
                onClick={() => setCurrentPage("register")}
                className="bg-white border-2 border-teal-600 text-teal-700 px-6 py-3 rounded-xl font-semibold hover:bg-teal-50 transition-all"
              >
                {language === "EN" ? "Register Now" : "अभी पंजीकरण करें"}
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl p-1 shadow-2xl shadow-teal-300/40">
              <div className="bg-gradient-to-br from-teal-200 to-green-200 rounded-3xl p-6">
                <div className="relative flex items-center justify-center bg-white rounded-2xl p-6 shadow-lg">
                  <img
                    src="/images/ayush_setu_logo.png"
                    alt="AYUSH Setu Logo"
                    className="w-full rounded-xl object-contain"
                    style={{ maxHeight: "280px" }}
                  />
                  {/* Location badge */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-2 shadow border border-teal-50">
                    <span className="text-lg">🏔</span>
                    <div>
                      <p className="text-teal-700 font-bold text-xs leading-tight">Uttarakhand</p>
                      <p className="text-gray-500 text-[10px] leading-tight">Dev Bhoomi — Land of Gods</p>
                    </div>
                  </div>
                  {/* Ayush badge */}
                  <div className="absolute top-3 right-3 bg-teal-600/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow">
                    <p className="text-white font-bold text-xs">AYUSH</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
