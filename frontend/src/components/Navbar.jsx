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
    portalName: { EN: "AYUSH Setu", HI: "आयुष सेतु" },
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 pt-6 px-4">
      <nav className="max-w-7xl mx-auto flex items-center justify-between bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl transition-all duration-300">
        
        {/* Logo + Title */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setCurrentPage("home")}
          aria-label="Go to Home"
        >
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center overflow-hidden border border-white/10 p-0.5 group-hover:border-[#ef233c]/60 transition-colors">
            <img src="/images/uk_ayush_logo.png" alt="AYUSH Setu Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <img 
                src="/images/ayush_setu_logo_transparent.png" 
                alt="AYUSH Setu" 
                className="h-7 md:h-8 w-auto object-contain filter brightness-105"
              />
              <div className="w-1.5 h-1.5 bg-[#ef233c] rounded-full animate-ping"></div>
            </div>
            <p className="text-zinc-400 text-[9px] uppercase tracking-wider">{text.ministry[language]}</p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => setCurrentPage("home")}
            className={`text-sm font-semibold transition ${currentPage === "home" ? "text-white" : "text-zinc-400 hover:text-white"}`}
            aria-label="Go to Home"
          >
            {text.home[language]}
          </button>

          <button
            onClick={() => setCurrentPage("verify")}
            className={`text-sm font-semibold transition ${currentPage === "verify" ? "text-white" : "text-zinc-400 hover:text-white"}`}
            aria-label="Verify Certificate"
          >
            {text.verify[language]}
          </button>

          <button
            onClick={() => setCurrentPage("registry")}
            className={`text-sm font-semibold transition ${currentPage === "registry" ? "text-white" : "text-zinc-400 hover:text-white"}`}
            aria-label="Public Registry"
          >
            {text.registry[language]}
          </button>

          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-zinc-900/80 text-white px-3 py-1 rounded-full border border-white/10 text-xs cursor-pointer hover:border-[#ef233c] focus:outline-none transition"
              aria-label="Language Selection"
              title="Language Selection"
            >
              <option value="EN">EN</option>
              <option value="HI">हिं</option>
            </select>
          </div>

          {isLoggedIn ? (
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white/5 px-6 py-2 transition-transform active:scale-95"
              aria-label="Open Dashboard"
            >
              <span className="absolute inset-0 border border-white/10 rounded-full"></span>
              <span className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_75%,#ef233c_100%)] opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="absolute inset-[1px] rounded-full bg-black"></span>
              <span className="relative z-10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                {text.dashboard[language]}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentPage("login")}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white/5 px-6 py-2 transition-transform active:scale-95"
              aria-label="Go to Login/Register"
            >
              <span className="absolute inset-0 border border-white/10 rounded-full"></span>
              <span className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_75%,#ef233c_100%)] opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="absolute inset-[1px] rounded-full bg-black"></span>
              <span className="relative z-10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                {text.login[language]}
              </span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white hover:text-[#ef233c] transition-colors p-1"
          aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-7xl mx-auto mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => {
                setCurrentPage("home");
                setMobileMenuOpen(false);
              }}
              className={`text-left text-sm font-semibold transition py-1 ${currentPage === "home" ? "text-white" : "text-zinc-400"}`}
              aria-label="Go to Home"
            >
              {text.home[language]}
            </button>

            <button
              onClick={() => {
                setCurrentPage("verify");
                setMobileMenuOpen(false);
              }}
              className={`text-left text-sm font-semibold transition py-1 ${currentPage === "verify" ? "text-white" : "text-zinc-400"}`}
              aria-label="Verify Certificate"
            >
              {text.verify[language]}
            </button>

            <button
              onClick={() => {
                setCurrentPage("registry");
                setMobileMenuOpen(false);
              }}
              className={`text-left text-sm font-semibold transition py-1 ${currentPage === "registry" ? "text-white" : "text-zinc-400"}`}
              aria-label="Public Registry"
            >
              {text.registry[language]}
            </button>

            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <span className="text-xs text-zinc-500 font-semibold">Change Language</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-zinc-900 text-white px-3 py-1 rounded-full border border-white/10 text-xs cursor-pointer focus:outline-none"
                aria-label="Language Selection"
              >
                <option value="EN">EN</option>
                <option value="HI">हिं</option>
              </select>
            </div>

            <div className="border-t border-white/5 pt-3 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      setCurrentPage("dashboard");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-[#ef233c] hover:bg-red-700 text-white text-center py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition"
                    aria-label="Open Dashboard"
                  >
                    {text.dashboard[language]}
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full border border-red-500/30 text-red-400 text-center py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition hover:bg-red-500/10"
                    aria-label="Logout"
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
                  className="w-full bg-[#ef233c] hover:bg-red-700 text-white text-center py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition"
                  aria-label="Go to Login/Register"
                >
                  {text.login[language]}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
