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
  LogOut,
  User,
  Lock
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
    { id: "profile", icon: Users, label: "Centre Profile" },
    { id: "programs", icon: Heart, label: "Wellness Programs & Packages" },
    { id: "therapists", icon: Users, label: "Therapists & Staff" },
    { id: "settings", icon: Lock, label: "Account Settings" },
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
    { id: "trainer-fee", icon: DollarSign, label: "Trainer Fee Reimbursement" },
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
    { id: "profile", icon: User, label: "Institution Profile" },
    { id: "settings", icon: Users, label: "Account Settings" },
  ];

  // Institution menu items
  const institutionMenu = [
    { id: "trainer-fee", icon: DollarSign, label: "Trainer Fee Reimbursement" },
  ];

  // Admin menu items
  const adminMenu = [
    { id: "home", icon: Home, label: "Dashboard Home" },
    { id: "profile", icon: Users, label: "Profile Management" },
    { id: "approvals", icon: UserCheck, label: "Directorate Approvals" },
  ];

  // Directorate menu items
  const directorateMenu = [
    { id: "home", icon: Home, label: "Dashboard Home" },
    { id: "profile", icon: Users, label: "Profile Management" },
    { id: "approvals", icon: UserCheck, label: "District Officer Approvals" },
    { id: "entity_approvals", icon: Award, label: "Entity Approvals" },
    { id: "wc_registrations", icon: Building2, label: "Wellness Centre Registrations" },
    { id: "trainer_fee_review", icon: DollarSign, label: "Trainer Fee Reimbursements" },
    { id: "nabh_reimbursement_review", icon: CreditCard, label: "NABH Reimbursements" },
    { id: "naac_reimbursement_review", icon: Award, label: "NAAC Reimbursements" },
    { id: "exam_fee_reimbursement_review", icon: GraduationCap, label: "Exam Fee Reimbursements" },
    { id: "research_grant_review", icon: FileText, label: "Research Grant Applications" },
    { id: "yoga_tc_incentive_review", icon: DollarSign, label: "Yoga TC Incentives" }
  ];

  // District Officer menu items
  const districtOfficerMenu = [
    { id: "home", icon: Home, label: "Dashboard Home" },
    { id: "profile", icon: Users, label: "Profile Management" },
    { id: "entity_approvals", icon: Award, label: "Entity Approvals" },
    { id: "wc_registrations", icon: Building2, label: "Wellness Centre Registrations" },
  ];

  // Select menu items based on user role
  const getMenuItems = () => {
    switch (userRole) {
      case "admin":
        return adminMenu;
      case "directorate":
        return directorateMenu;
      case "district_officer":
        return districtOfficerMenu;
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
        return "Yoga Centre";
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
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border border-teal-100 p-0.5">
          <img src="/images/ayush_setu_logo.png" alt="AYUSH Setu Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-white font-bold text-lg">AYUSH Setu</span>
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