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
    { id: "home", icon: Home, label: "Dashboard Home" },
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
    <div className="bg-black/80 h-full p-5 flex flex-col justify-between border-r border-white/5 backdrop-blur-xl relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#ef233c/5,transparent_75%)] pointer-events-none"></div>
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8 border-b border-white/5 pb-5">
          <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center overflow-hidden border border-white/10 p-0.5">
            <img src="/images/uk_ayush_logo.png" alt="AYUSH Setu Logo" className="w-full h-full object-contain" />
          </div>
          <img 
            src="/images/ayush_setu_logo_transparent.png" 
            alt="AYUSH Setu" 
            className="h-7 w-auto object-contain filter brightness-105"
          />
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
                ? "bg-[#ef233c] text-white shadow-lg shadow-[#ef233c]/15 font-semibold"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200 font-medium"
                }`}
            >
              <item.icon size={18} className={activeTab === item.id ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"} />
              <span className="flex-1 text-left text-sm">{item.label}</span>
              {item.badge && (
                <span className="bg-white text-[#ef233c] text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center shadow">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Role Info */}
        <div className="mt-6 p-4 bg-white/5 border border-white/5 rounded-2xl">
          <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-extrabold mb-1">Operational Division</p>
          <p className="text-zinc-200 text-sm font-bold font-manrope">
            {getRoleDisplayName()}
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full mt-4 flex items-center space-x-3 px-4 py-3.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200 font-semibold"
        >
          <LogOut size={18} className="text-zinc-500 group-hover:text-red-400" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;