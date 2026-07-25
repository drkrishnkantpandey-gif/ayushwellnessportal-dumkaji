import React from "react";

const HeroSection = ({ setCurrentPage, language }) => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 relative overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-16 md:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="text-left flex flex-col justify-center h-full">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5f0eb] border border-[#262626]/5 mb-8 self-start">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e4a4bd] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#e4a4bd]"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#262626]/70 font-spartan">
                {language === "EN" ? "Dept of Ayush, Uttarakhand" : "आयुष विभाग, उत्तराखण्ड"}
              </span>
            </div>

            <h1 className="text-[12vw] md:text-[15vw] font-black font-spartan tracking-tighter leading-[0.8] mb-10 text-[#262626] uppercase">
              AYUSH <span className="text-[#e4a4bd] lowercase italic font-normal">setu</span>
            </h1>

            <p className="text-xl md:text-2xl text-[#262626]/70 leading-relaxed font-light mb-12 max-w-xl">
              {language === "EN" 
                ? "Uttarakhand's official gateway to unified wellness registration, tracking, and incentive distribution."
                : "उत्तराखण्ड सरकार का एकीकृत कल्याण पंजीकरण, ट्रैकिंग और प्रोत्साहन वितरण का आधिकारिक प्रवेश द्वार।"
              }
            </p>

            <div className="flex flex-wrap gap-8 items-center">
              <button
                onClick={() => setCurrentPage("register")}
                className="inline-flex items-center gap-3 text-sm font-bold text-[#262626] border-b-2 border-[#e4a4bd] pb-1 hover:text-[#e4a4bd] hover:border-[#e4a4bd] transition-colors duration-300"
              >
                <span>{language === "EN" ? "REGISTER NOW" : "पंजीकरण शुरू करें"}</span>
                <span className="text-base">→</span>
              </button>
              
              <button
                onClick={() => setCurrentPage("verify")}
                className="inline-flex items-center gap-3 text-sm font-bold text-[#262626]/50 hover:text-[#262626] transition-colors duration-300"
              >
                <span>{language === "EN" ? "Verify Certificate" : "प्रमाणपत्र सत्यापित करें"}</span>
              </button>
            </div>
          </div>
 
          {/* Right Hero Image Card */}
          <div className="relative justify-self-center md:justify-self-end w-full max-w-lg aspect-[4/3] rounded-[24px] overflow-hidden group shadow-2xl">
            {/* Grayscale-to-color image with scale up on hover */}
            <img
              src="/images/uttarakhand_yoga_hero.jpg"
              alt="Yoga in Uttarakhand"
              className="w-full h-full object-cover premium-img"
            />
            
            {/* Floating Concierge Badge */}
            <div className="absolute -top-12 -right-12 w-[160px] h-[160px] rounded-full bg-[#e4a4bd] text-[#262626] flex flex-col items-center justify-center shadow-2xl animate-bounce-slow z-20 select-none">
              <span className="text-4xl font-extrabold italic leading-none font-spartan">01</span>
              <span className="text-[8px] font-black uppercase tracking-[0.25em] mt-2 text-center">
                AYUSH<br />PORTAL
              </span>
            </div>

            {/* Subtle Overlay Badge */}
            <div className="absolute bottom-4 left-4 bg-[#fdf8f3]/95 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-2 border border-[#262626]/10 z-20">
              <span className="text-base">🏔</span>
              <div>
                <p className="text-[#262626] font-bold text-[10px] uppercase tracking-wider leading-none">Uttarakhand</p>
                <p className="text-[#262626]/60 text-[8px] font-medium leading-none mt-1">Dev Bhoomi</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
