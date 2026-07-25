import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#f5f0eb] border-t border-[#262626]/5 pt-24 pb-12 relative overflow-hidden mt-24 z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-12 gap-12 mb-20 relative z-10">
        
        {/* Left 5 Columns: Brand Logo & Mission */}
        <div className="col-span-12 md:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <img 
              src="/images/ayush_setu_logo_transparent.png" 
              alt="AYUSH Setu Logo" 
              className="h-10 w-auto object-contain"
            />
            <span className="text-xl font-black font-spartan tracking-[0.2em] text-[#262626]">
              AYUSH SETU
            </span>
          </div>
          <p className="text-[#262626]/60 text-xs leading-relaxed max-w-sm font-light">
            Department of Ayush and Ayush Education, Government of Uttarakhand. Pioneering traditional health registries, digital accreditations, and automated incentive payments.
          </p>
        </div>

        {/* Right 7 Columns: Split into 3 sub-columns */}
        <div className="col-span-12 md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
          
          {/* Sub-Column 1: Links */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-[#e4a4bd] uppercase tracking-[0.25em] relative">
              IMPORTANT LINKS
              <div className="absolute -bottom-2 left-0 w-8 h-[2px] bg-[#e4a4bd]"></div>
            </h4>
            <ul className="space-y-3.5 text-[#262626]/70 text-[10px] font-bold uppercase tracking-[0.15em] pt-2">
              <li>
                <a href="https://yogacertificationboard.nic.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#262626] transition-colors block">
                  YCB Portal ↗
                </a>
              </li>
              <li>
                <a href="https://ayush.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#262626] transition-colors block">
                  Ministry of AYUSH ↗
                </a>
              </li>
              <li>
                <a href="https://nabh.co" target="_blank" rel="noopener noreferrer" className="hover:text-[#262626] transition-colors block">
                  NABH India ↗
                </a>
              </li>
              <li>
                <a href="https://ayurved.uk.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#262626] transition-colors block">
                  Ayurveda Dept ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Sub-Column 2: Policies */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-[#e4a4bd] uppercase tracking-[0.25em] relative">
              POLICIES
              <div className="absolute -bottom-2 left-0 w-8 h-[2px] bg-[#e4a4bd]"></div>
            </h4>
            <ul className="space-y-3.5 text-[#262626]/70 text-[10px] font-bold uppercase tracking-[0.15em] pt-2">
              <li>
                <a 
                  href="https://cdnbbsr.s3waas.gov.in/s3a77c8fd7f48b9c859bbd5ed81c5f441f/uploads/2025/07/20250730820732919.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#262626] transition-colors block"
                >
                  Yoga Policy ↗
                </a>
              </li>
              <li>
                <a 
                  href="https://cdnbbsr.s3waas.gov.in/s3a77c8fd7f48b9c859bbd5ed81c5f441f/uploads/2025/07/202507301692620093.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#262626] transition-colors block"
                >
                  AYUSH Policy ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Sub-Column 3: Contact */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-[#e4a4bd] uppercase tracking-[0.25em] relative">
              CONTACT
              <div className="absolute -bottom-2 left-0 w-8 h-[2px] bg-[#e4a4bd]"></div>
            </h4>
            <p className="text-[#262626]/60 text-xs leading-relaxed font-light pt-2">
              Directorate of Ayurvedic & Unani Services, Sahastradhara Road, Near DG Health Office, Dehradun.
            </p>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] pt-1">
              <a href="mailto:mail@uttarakhandayurved.co.in" className="text-[#262626] hover:text-[#e4a4bd] transition-colors underline">
                mail@uttarakhandayurved.co.in
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* Giant Decorative Footer text stroke */}
      <div className="flex justify-center items-center py-6 opacity-30 pointer-events-none select-none">
        <h1 className="text-[12vw] leading-none font-black tracking-tighter text-stroke-rose font-spartan">
          AYUSH SETU
        </h1>
      </div>

      {/* Copy & Legal */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 border-t border-[#262626]/10 pt-8 flex flex-col md:flex-row items-center justify-between text-[#262626]/40 text-[9px] uppercase tracking-[0.2em] font-bold gap-4 relative z-10">
        <p>© 2026 AYUSH Setu. All rights reserved. Uttarakhand Gov.</p>
        <div className="flex gap-6">
          <span>Dev Bhoomi Uttarakhand</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
