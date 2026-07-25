import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = ({ language, setLanguage, currentPage, setCurrentPage, isLoggedIn, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Text dictionary for EN/HI
  const text = {
    home: { EN: "Home", HI: "होम" },
    verify: { EN: "Verify Certificate", HI: "सत्यापित करें" },
    registry: { EN: "Registry", HI: "रजिस्ट्री" },
    dashboard: { EN: "Dashboard", HI: "डैशबोर्ड" },
    login: { EN: "Login / Register", HI: "लॉगिन / रजिस्टर" },
    logout: { EN: "Logout", HI: "लॉगआउट" },
    ministry: { EN: "Dept of Ayush, Uttarakhand Gov", HI: "आयुष विभाग, उत्तराखण्ड सरकार" },
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 h-20 flex items-center px-4 md:px-8 bg-[#fdf8f3]/80 backdrop-blur-xl border-b border-[#262626]/5">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Side: Brand Logo / Text */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentPage("home")}
          aria-label="Go to Home"
        >
          <img 
            src="/images/ayush_setu_logo_transparent.png" 
            alt="AYUSH Setu Logo" 
            className="h-10 md:h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
          />
          <div className="hidden sm:block">
            <span className="text-[#262626] font-black text-sm tracking-[0.2em] font-spartan">
              AYUSH SETU
            </span>
          </div>
        </div>

        {/* Center: Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => setCurrentPage("home")}
            className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
              currentPage === "home" ? "text-[#e4a4bd]" : "text-[#262626]/70 hover:text-[#262626]"
            }`}
            aria-label="Go to Home"
          >
            {text.home[language]}
          </button>

          <button
            onClick={() => setCurrentPage("verify")}
            className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
              currentPage === "verify" ? "text-[#e4a4bd]" : "text-[#262626]/70 hover:text-[#262626]"
            }`}
            aria-label="Verify Certificate"
          >
            {text.verify[language]}
          </button>

          <button
            onClick={() => setCurrentPage("registry")}
            className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
              currentPage === "registry" ? "text-[#e4a4bd]" : "text-[#262626]/70 hover:text-[#262626]"
            }`}
            aria-label="Public Registry"
          >
            {text.registry[language]}
          </button>

          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-[#262626] font-bold text-[10px] uppercase tracking-[0.25em] px-2 py-1 rounded cursor-pointer border border-[#262626]/10 focus:outline-none hover:border-[#e4a4bd] transition-colors"
              aria-label="Language Selection"
            >
              <option value="EN">EN</option>
              <option value="HI">हिं</option>
            </select>
          </div>
        </div>

        {/* Far Right: Pill CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => setCurrentPage("dashboard")}
                className="bg-[#e4a4bd] text-[#262626] px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#d88fa9] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                aria-label="Open Dashboard"
              >
                {text.dashboard[language]}
              </button>
              <button
                onClick={onLogout}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#262626]/50 hover:text-red-600 transition-colors"
                aria-label="Logout"
              >
                {text.logout[language]}
              </button>
            </>
          ) : (
            <button
              onClick={() => setCurrentPage("login")}
              className="bg-[#e4a4bd] text-[#262626] px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#d88fa9] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              aria-label="Go to Login/Register"
            >
              {text.login[language]}
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#262626] hover:text-[#e4a4bd] transition-colors p-1"
          aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#fdf8f3] border-b border-[#262626]/10 px-6 py-6 shadow-xl flex flex-col space-y-5 animate-fade-in z-50">
          <button
            onClick={() => {
              setCurrentPage("home");
              setMobileMenuOpen(false);
            }}
            className={`text-[10px] font-bold uppercase tracking-[0.2em] text-left transition-colors ${
              currentPage === "home" ? "text-[#e4a4bd]" : "text-[#262626]/75"
            }`}
          >
            {text.home[language]}
          </button>

          <button
            onClick={() => {
              setCurrentPage("verify");
              setMobileMenuOpen(false);
            }}
            className={`text-[10px] font-bold uppercase tracking-[0.2em] text-left transition-colors ${
              currentPage === "verify" ? "text-[#e4a4bd]" : "text-[#262626]/75"
            }`}
          >
            {text.verify[language]}
          </button>

          <button
            onClick={() => {
              setCurrentPage("registry");
              setMobileMenuOpen(false);
            }}
            className={`text-[10px] font-bold uppercase tracking-[0.2em] text-left transition-colors ${
              currentPage === "registry" ? "text-[#e4a4bd]" : "text-[#262626]/75"
            }`}
          >
            {text.registry[language]}
          </button>

          <div className="flex items-center justify-between border-t border-[#262626]/5 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#262626]/60">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-[#262626] font-bold text-[10px] uppercase tracking-[0.2em] border border-[#262626]/10 px-2.5 py-1 rounded cursor-pointer"
            >
              <option value="EN">EN</option>
              <option value="HI">हिं</option>
            </select>
          </div>

          <div className="border-t border-[#262626]/5 pt-4 flex flex-col gap-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    setCurrentPage("dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#e4a4bd] text-[#262626] text-center py-3.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]"
                >
                  {text.dashboard[language]}
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full border border-[#262626]/15 text-[#262626]/60 text-center py-3.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]"
                >
                  {text.logout[language]}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setCurrentPage("login");
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-[#e4a4bd] text-[#262626] text-center py-3.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]"
              >
                {text.login[language]}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
