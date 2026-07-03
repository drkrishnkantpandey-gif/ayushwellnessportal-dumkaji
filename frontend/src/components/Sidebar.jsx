import React from "react";
import {
  Home,
  FileText,
  Calendar,
  CreditCard,
  Award,
  Heart,
  Users,
  DollarSign,
  Building2,
  GraduationCap,
  UserCheck,
  Bell,
  LogOut
} from "lucide-react";

// Dashboard Sidebar
const Sidebar = ({ activeTab, setActiveTab, userRole, onLogout }) => {
  // Yoga Professional menu items
  const yogaProfessionalMenu = [
    { id: "home", icon: Home, label: "Dashboard Home" },
    { id: "profile", icon: Users, label: "Profile Management" },
    { id: "certificate", icon: Award, label: "Certification Module" },
    { id: "incentives", icon: CreditCard, label: "Payments & Incentives" },
    { id: "exam-fee", icon: GraduationCap, label: "Exam Fee Reimbursement" },
    { id: "sessions", icon: Calendar, label: "Yoga Activity Tracker" },
    { id: "applications", icon: FileText, label: "My Applications" },
    { id: "notifications", icon: Bell, label: "Notifications" },
  ];

  // Wellness Centre menu items
  const wellnessCentreMenu = [
    { id: "home", icon: Home, label: "Dashboard Home", badge: 3 },
    { id: "programs", icon: Heart, label: "Wellness Programs & Packages" },
    { id: "sessions", icon: Calendar, label: "Session Tracker" },
    { id: "incentives", icon: DollarSign, label: "Incentives & Grants" },
    { id: "therapists", icon: Users, label: "Therapists & Staff" },
  ];

  // AYUSH College menu items
  const ayushCollegeMenu = [
    { id: "home", icon: Home, label: "Dashboard Home", badge: 2 },
    { id: "profile", icon: Building2, label: "College Profile" },
    { id: "accreditation", icon: Award, label: "NAAC Accreditation" },
    { id: "naac-reimbursement", icon: DollarSign, label: "NAAC Reimbursement" },
    { id: "incentives", icon: DollarSign, label: "Incentive Applications" },
    { id: "faculty", icon: GraduationCap, label: "Faculty & Student Data" },
    { id: "notifications", icon: Bell, label: "Notifications & Alerts" },
  ];

  // Yoga Training Centre menu items
  const yogaCentreMenu = [
    { id: "home", icon: Home, label: "Dashboard Home" },
    { id: "trainers", icon: Users, label: "Trainer Management" },
    { id: "courses", icon: FileText, label: "Course Management" },
    { id: "infrastructure", icon: Building2, label: "Infrastructure Details" },
    { id: "analytics", icon: Calendar, label: "Analytics" },
    { id: "affiliation", icon: Award, label: "Affiliation" },
    { id: "incentives", icon: DollarSign, label: "Incentive Applications" },
  ];

  // AYUSH Hospital menu items
  const ayushHospitalMenu = [
    { id: "home", icon: Home, label: "Dashboard Home" },
    { id: "profile", icon: Users, label: "Hospital Profile" },
    { id: "incentives", icon: DollarSign, label: "NABH Incentive" },
    { id: "documents", icon: Award, label: "NABH Documents" },
    { id: "status", icon: UserCheck, label: "Application Status" },
    { id: "validity", icon: Calendar, label: "Validity Tracking" },
  ];

  // Research Grant menu items
  const researchOrgMenu = [
    { id: "research", icon: GraduationCap, label: "Research Grant Applications" },
  ];

  // Institution menu items
  const institutionMenu = [
    { id: "trainer-fee", icon: DollarSign, label: "Trainer Fee Reimbursement" },
  ];

  // Select menu items based on user role
  const getMenuItems = () => {
    switch (userRole) {
      case "wellness_centre":
        return wellnessCentreMenu;
      case "ayush_college":
        return ayushCollegeMenu;
      case "yoga_centre":
        return yogaCentreMenu;
      case "ayush_hospital":
        return ayushHospitalMenu;
      case "research_org":
        return researchOrgMenu;
      case "institution":
        return institutionMenu;
      case "yoga_professional":
      default:
        return yogaProfessionalMenu;
    }
  };

  // Get user role display name
  const getRoleDisplayName = () => {
    switch (userRole) {
      case "wellness_centre":
        return "Wellness Centre";
      case "yoga_professional":
        return "Yoga Professional";
      case "ayush_college":
        return "AYUSH College";
      case "yoga_centre":
        return "Yoga Training Centre";
      case "ayush_hospital":
        return "AYUSH Hospital";
      case "district_officer":
        return "District Officer";
      case "directorate":
        return "Directorate";
      case "admin":
        return "Administrator";
      case "research_org":
        return "Research Organisation";
      case "institution":
        return "Institution";
      default:
        return userRole?.replace(/_/g, ' ');
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="bg-gradient-to-b from-teal-700 to-teal-800 h-full p-4">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <span className="text-teal-700 font-bold">🕉</span>
        </div>
        <span className="text-white font-bold text-lg">AYUSH Portal</span>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === item.id
              ? "bg-teal-600 text-white"
              : "text-teal-100 hover:bg-teal-600 hover:text-white"
              }`}
          >
            <item.icon size={20} />
            <span className="flex-1 text-left text-sm">{item.label}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-8 p-3 bg-teal-900 rounded-lg">
        <p className="text-teal-300 text-xs mb-1">Logged in as</p>
        <p className="text-white text-sm font-semibold">
          {getRoleDisplayName()}
        </p>
      </div>

      <button
        onClick={onLogout}
        className="w-full mt-4 flex items-center space-x-3 px-4 py-3 text-red-100 hover:bg-red-600/20 hover:text-white rounded-lg transition"
      >
        <LogOut size={20} />
        <span className="text-sm font-medium">Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;