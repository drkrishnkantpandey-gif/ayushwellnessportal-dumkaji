import React from "react";
import { Shield, UserCheck, Award, Activity, CreditCard, FolderOpen } from "lucide-react";

const HeroSection = ({ setCurrentPage, language }) => {
  const features = [
    { icon: UserCheck, label: language === "EN" ? "Professional Registration" : "पेशेवर पंजीकरण" },
    { icon: Award, label: language === "EN" ? "Certification Tracking" : "प्रमाणीकरण ट्रैकिंग" },
    { icon: Activity, label: language === "EN" ? "Activity Monitoring" : "गतिविधि निगरानी" },
    { icon: CreditCard, label: language === "EN" ? "Incentive Programs" : "प्रोत्साहन कार्यक्रम" },
    { icon: FolderOpen, label: language === "EN" ? "Digital Profile" : "डिजिटल प्रोफाइल" },
  ];

  return (
    <section className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* Left Hero Content */}
          <div className="text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 animate-fade-up">
              <img
                src="/images/uk_ayush_logo.png"
                alt="AYUSH Setu Logo"
                className="h-16 w-auto bg-white/5 rounded-xl p-2 shadow-lg border border-white/10 self-start"
              />
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs sm:text-sm font-medium text-zinc-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef233c]"></span>
                </span>
                <span>
                  {language === "EN" ? "Department of Ayush & Ayush Education, Uttarakhand" : "आयुष एवं आयुष शिक्षा विभाग, उत्तराखण्ड सरकार"}
                </span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold font-manrope tracking-tight leading-[1.1] mb-8 animate-fade-up">
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
                {language === "EN" ? "Empowering Wellness:" : "कल्याण को सशक्त बनाना:"}
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 mt-1">
                {language === "EN" ? "Uttarakhand's " : "उत्तराखण्ड "}
                <span className="text-[#ef233c] inline-block relative">
                  {language === "EN" ? "Wellness Registry" : "वेलनेस रजिस्ट्री"}
                  <svg className="absolute w-full h-3 -bottom-2 left-0 text-[#ef233c] opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" stroke-width="2" fill="none" />
                  </svg>
                </span>
              </span>
            </h1>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2.5 mb-10 animate-fade-up">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-zinc-300 hover:border-zinc-700 transition">
                  <f.icon className="text-[#ef233c] w-3.5 h-3.5" />
                  {f.label}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 animate-fade-up">
              <button
                onClick={() => setCurrentPage("verify")}
                className="shiny-cta group"
              >
                <span className="relative z-10 flex items-center gap-2 text-white font-semibold">
                  <Shield size={18} />
                  {language === "EN" ? "Verify Certificate" : "प्रमाणपत्र सत्यापित करें"}
                </span>
              </button>

              <button
                onClick={() => setCurrentPage("register")}
                className="group px-8 py-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                {language === "EN" ? "Register Now" : "अभी पंजीकरण करें"}
              </button>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="relative group animate-fade-up">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#ef233c] to-red-900 rounded-[32px] blur-xl opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-zinc-950/80 border border-white/10 rounded-[30px] p-6 backdrop-blur-xl">
              <div className="relative flex items-center justify-center bg-black/40 border border-white/5 rounded-2xl p-6 shadow-2xl overflow-hidden">
                <img
                  src="/images/uk_ayush_logo.png"
                  alt="AYUSH Setu Logo"
                  className="w-full rounded-xl object-contain relative z-10 filter drop-shadow-[0_0_15px_rgba(239,35,60,0.25)]"
                  style={{ maxHeight: "280px" }}
                />
                
                {/* Location badge */}
                <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-md rounded-xl px-3.5 py-1.5 flex items-center gap-2 shadow border border-white/10 z-20">
                  <span className="text-lg">🏔</span>
                  <div>
                    <p className="text-[#ef233c] font-black text-xs leading-tight">Uttarakhand</p>
                    <p className="text-zinc-400 text-[9px] font-semibold leading-tight">Dev Bhoomi — Land of Gods</p>
                  </div>
                </div>
                
                {/* Ayush badge */}
                <div className="absolute top-3 right-3 bg-[#ef233c]/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow z-20">
                  <p className="text-white font-black text-[10px] tracking-widest uppercase">AYUSH</p>
                </div>
              </div>
              
              <div className="flex justify-center mt-6 space-x-6 text-sm font-semibold">
                <a 
                  href="https://cdnbbsr.s3waas.gov.in/s3a77c8fd7f48b9c859bbd5ed81c5f441f/uploads/2025/07/20250730820732919.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-zinc-400 hover:text-[#ef233c] transition-colors flex items-center gap-1"
                >
                  Yoga Policy ↗
                </a>
                <a 
                  href="https://cdnbbsr.s3waas.gov.in/s3a77c8fd7f48b9c859bbd5ed81c5f441f/uploads/2025/07/202507301692620093.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-zinc-400 hover:text-[#ef233c] transition-colors flex items-center gap-1"
                >
                  Ayush Policy ↗
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
