import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black border-t border-zinc-900 pt-20 pb-10 relative overflow-hidden mt-16 z-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 relative z-10">
        
        {/* About column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-[#ef233c] rounded-sm rotate-45"></div>
            <span className="text-2xl font-bold font-manrope tracking-tight text-white">AYUSH Setu</span>
          </div>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
            Department of Ayush and Ayush Education, Government of Uttarakhand. Pioneering traditional health registries, certification, and incentive systems.
          </p>
        </div>

        {/* Contact column */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-[#ef233c] uppercase tracking-widest">Contact Address</h4>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Directorate of Ayurvedic & Unani Services, Sahastradhara Road, Near DG Health Office, Dehradun.
          </p>
          <div className="text-xs pt-1">
            <span className="text-zinc-500">Email: </span>
            <a href="mailto:mail@uttarakhandayurved.co.in" className="text-zinc-300 hover:text-[#ef233c] transition-colors underline">
              mail@uttarakhandayurved.co.in
            </a>
          </div>
        </div>

        {/* Links column */}
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#ef233c] uppercase tracking-widest">Policies</h4>
            <ul className="space-y-3 text-zinc-400 text-xs font-medium">
              <li>
                <a 
                  href="https://cdnbbsr.s3waas.gov.in/s3a77c8fd7f48b9c859bbd5ed81c5f441f/uploads/2025/07/20250730820732919.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors"
                >
                  Yoga Policy
                </a>
              </li>
              <li>
                <a 
                  href="https://cdnbbsr.s3waas.gov.in/s3a77c8fd7f48b9c859bbd5ed81c5f441f/uploads/2025/07/202507301692620093.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors"
                >
                  AYUSH Policy
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#ef233c] uppercase tracking-widest">Important</h4>
            <ul className="space-y-3 text-zinc-400 text-xs font-medium">
              <li>
                <a href="https://yogacertificationboard.nic.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors block">
                  YCB
                </a>
              </li>
              <li>
                <a href="https://ayush.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors block">
                  Ministry of AYUSH
                </a>
              </li>
              <li>
                <a href="https://nabh.co" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors block">
                  NABH
                </a>
              </li>
              <li>
                <a href="https://ayurved.uk.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors block">
                  Ayurveda Dept
                </a>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Giant Decorative Footer text stroke */}
      <div className="flex justify-center items-center py-6 opacity-[0.03] pointer-events-none select-none">
        <h1 className="text-[12vw] leading-none font-extrabold font-manrope tracking-tighter text-stroke">
          AYUSH SETU
        </h1>
      </div>

      {/* Copy & Legal */}
      <div className="max-w-7xl mx-auto px-6 border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between text-zinc-600 text-[10px] uppercase tracking-widest font-semibold gap-4 relative z-10">
        <p>© 2026 AYUSH Setu. All rights reserved. Uttarakhand Gov.</p>
        <div className="flex gap-6">
          <span className="text-zinc-600">Dev Bhoomi Uttarakhand</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
