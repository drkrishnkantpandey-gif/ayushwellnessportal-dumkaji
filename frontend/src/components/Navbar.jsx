import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = ({ language, setLanguage, currentPage, setCurrentPage, isLoggedIn, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Text dictionary for EN/HI
  const text = {
    home: { EN: "Home", HI: "होम" },
    verify: { EN: "Verify Certificate", HI: "प्रमाणपत्र सत्यापित करें" },
    trainer: { EN: "Find Trainer", HI: "प्रशिक्षक खोजें" },
    dashboard: { EN: "Dashboard", HI: "डैशबोर्ड" },
    login: { EN: "Login / Register", HI: "लॉगिन / रजिस्टर" },
    logout: { EN: "Logout", HI: "लॉगआउट" },
    ministry: { EN: "Department of Ayush and Ayush Education, Uttarakhand Government", HI: "आयुष एवं आयुष शिक्षा विभाग, उत्तराखण्ड सरकार" },
    portalName: { EN: "AYUSH Portal", HI: "आयुष पोर्टल" },
  };

  return (
    <nav className="bg-gradient-to-r from-teal-700 to-teal-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo + Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setCurrentPage("home")}
            aria-label="Go to Home"
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-teal-700 font-bold text-xl">🕉</span>
            </div>
            <div>
              <span className="text-white font-bold text-xl">
                {text.portalName[language]}
              </span>
              <p className="text-teal-100 text-xs">{text.ministry[language]}</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setCurrentPage("home")}
              className="text-white hover:text-teal-200 transition"
              aria-label="Go to Home"
            >
              {text.home[language]}
            </button>

            <button
              onClick={() => setCurrentPage("verify")}
              className="text-white hover:text-teal-200 transition"
              aria-label="Verify Certificate"
            >
              {text.verify[language]}
            </button>

            <button
              onClick={() => setCurrentPage("trainer")}
              className="text-white hover:text-teal-200 transition"
              aria-label="Find Trainer"
            >
              {text.trainer[language]}
            </button>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-teal-800 text-white px-3 py-1 rounded border border-teal-500 text-sm cursor-pointer"
              aria-label="Language Selection"
              title="Language Selection"
            >
              <option value="EN">EN</option>
              <option value="HI">हिं</option>
            </select>

            {isLoggedIn ? (
              <button
                onClick={() => setCurrentPage("dashboard")}
                className="bg-white text-teal-700 px-4 py-2 rounded-lg font-semibold hover:bg-teal-50 transition"
                aria-label="Open Dashboard"
              >
                {text.dashboard[language]}
              </button>
            ) : (
              <button
                onClick={() => setCurrentPage("login")}
                className="bg-white text-teal-700 px-4 py-2 rounded-lg font-semibold hover:bg-teal-50 transition"
                aria-label="Go to Login/Register"
              >
                {text.login[language]}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
            aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-teal-800 pb-4">
          <div className="px-4 space-y-3">
            <button
              onClick={() => {
                setCurrentPage("home");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-white py-2"
              aria-label="Go to Home"
            >
              {text.home[language]}
            </button>

            <button
              onClick={() => {
                setCurrentPage("verify");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-white py-2"
              aria-label="Verify Certificate"
            >
              {text.verify[language]}
            </button>

            <button
              onClick={() => {
                setCurrentPage("trainer");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-white py-2"
              aria-label="Find Trainer"
            >
              {text.trainer[language]}
            </button>

            <button
              onClick={() => {
                setCurrentPage(isLoggedIn ? "dashboard" : "login");
                setMobileMenuOpen(false);
              }}
              className="w-full bg-white text-teal-700 px-4 py-2 rounded-lg font-semibold"
              aria-label={isLoggedIn ? "Open Dashboard" : "Go to Login/Register"}
            >
              {isLoggedIn ? text.dashboard[language] : text.login[language]}
            </button>

            {isLoggedIn && (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full border border-red-400 text-red-200 px-4 py-2 rounded-lg font-semibold"
                aria-label="Logout"
              >
                {text.logout[language]}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
