import React, { useState } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import LeadershipSection from "./components/LeadershipSection";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import KeyFeatures from "./components/KeyFeatures";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register/Register";
import PublicProfile from "./pages/PublicProfile";
import Registry from "./pages/Registry";

// Yoga Professional Components
import YogaProfessional from "./pages/Dashboard/YogaProfessional/DashboardHome";
import MyApplications from "./pages/Dashboard/YogaProfessional/MyApplications";
import ProfileManagement from "./pages/Dashboard/YogaProfessional/ProfileManagement";
import NotificationsList from "./pages/Dashboard/YogaProfessional/NotificationsList";
import SessionActivityLog from "./pages/Dashboard/YogaProfessional/SessionLog";
import IncentivePayment from "./pages/Dashboard/YogaProfessional/IncentiveStatus";
import VerifyCertificate from "./pages/Dashboard/YogaProfessional/VerifyCertificate";

// Wellness Centre Components
import WellnessDashboardHome from "./pages/Dashboard/WellnessCentre/DashboardHome";
import WellnessPrograms from "./pages/Dashboard/WellnessCentre/WellnessPrograms";
import SessionTracker from "./pages/Dashboard/WellnessCentre/SessionTracker";
import IncentivesGrants from "./pages/Dashboard/WellnessCentre/IncentivesGrants";
import TherapistsStaff from "./pages/Dashboard/WellnessCentre/TherapistsStaff";

// AYUSH College Components
import AyushCollegeHome from "./pages/Dashboard/AyushCollege/DashboardHome";
import CollegeProfile from "./pages/Dashboard/AyushCollege/CollegeProfile";
import NAACAccreditation from "./pages/Dashboard/AyushCollege/NAACAccreditation";
import CollegeIncentiveApplications from "./pages/Dashboard/AyushCollege/IncentiveApplications";
import FacultyStudentData from "./pages/Dashboard/AyushCollege/FacultyAndStudentData";
import NotificationsAlerts from "./pages/Dashboard/AyushCollege/NotificationStatus";

// Other Role-based Dashboards

import YogaTrainingCentreHome from "./pages/Dashboard/YogaTrainingCentre/DashboardHome";
import TrainerManagement from "./pages/Dashboard/YogaTrainingCentre/TrainerManagement";
import CourseManagement from "./pages/Dashboard/YogaTrainingCentre/Courses";
import InfrastructureDetails from "./pages/Dashboard/YogaTrainingCentre/Infrastructure";
import CenterAnalytics from "./pages/Dashboard/YogaTrainingCentre/LocationAnalytics";
import CenterAffiliation from "./pages/Dashboard/YogaTrainingCentre/Affiliation";
import YogaTCIncentive from "./pages/Dashboard/YogaTrainingCentre/IncentiveApplication";

import ResearchGrant from "./pages/Dashboard/ResearchGrant";
import ExamFeeReimbursement from "./pages/Dashboard/YogaProfessional/ExamFeeReimbursement";
import NAACReimbursement from "./pages/Dashboard/AyushCollege/NAACReimbursement";
import TrainerFeeReimbursement from "./pages/Dashboard/Institution/TrainerFeeReimbursement";

// AYUSH Hospital Components
import AyushHospitalHome from "./pages/Dashboard/AyushHospital/DashboardHome";
import HospitalProfile from "./pages/Dashboard/AyushHospital/HospitalProfile";
import NABHIncentive from "./pages/Dashboard/AyushHospital/NABHIncentive";
import NABHDocuments from "./pages/Dashboard/AyushHospital/NABHDocuments";
import ApplicationStatus from "./pages/Dashboard/AyushHospital/ApplicationStatus";
import ValidityTracking from "./pages/Dashboard/AyushHospital/ValidityTracking";


// import YogaTrainingCentre from "./pages/Dashboard/YogaTrainingCentre";

import DistrictOfficer from "./pages/Dashboard/DistrictOfficer";
import DirectorateDashboard from "./pages/Dashboard/DirectorateDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [language, setLanguage] = useState("EN");
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("userRole") ? "dashboard" : "home";
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("userRole");
  });
  const [activeTab, setActiveTab] = useState(() => {
    const stored = localStorage.getItem("activeTab");
    const role = localStorage.getItem("userRole");
    // Default yoga_professional to sessions (Yoga Activity Tracker)
    if (!stored && role === "yoga_professional") return "sessions";
    return stored || "home";
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("userRole") || "";
  });
  const [selectedCentreId, setSelectedCentreId] = useState(null);

  // Persist activeTab to localStorage
  React.useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  // Sync state with localStorage if it changes elsewhere or for safety
  React.useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role && !isLoggedIn) {
      setIsLoggedIn(true);
      setUserRole(role);
      setCurrentPage("dashboard");
    }
  }, [isLoggedIn]);

  // Yoga Professional Dashboard Tabs
  const renderYogaProfessionalContent = () => {
    switch (activeTab) {
      case "home":
        return <YogaProfessional setActiveTab={setActiveTab} />;
      case "profile":
        return <ProfileManagement />;
      case "applications":
        return <MyApplications />;
      case "notifications":
        return <NotificationsList />;
      case "sessions":
        return <SessionActivityLog />;
      case "incentives":
        return <IncentivePayment />;
      case "exam-fee":
        return <ExamFeeReimbursement />;
      case "certificate":
        return <VerifyCertificate />;
      default:
        // Default: show Yoga Activity Tracker for yoga professionals
        return <SessionActivityLog />;
    }
  };

  // Wellness Centre Dashboard Tabs
  const renderWellnessCentreContent = () => {
    switch (activeTab) {
      case "home":
        return <WellnessDashboardHome
          setActiveTab={setActiveTab}
          onViewPublicProfile={(id) => {
            setSelectedCentreId(id);
            setCurrentPage("public_profile");
          }}
        />;
      case "programs":
        return <WellnessPrograms />;
      case "sessions":
        return <SessionTracker />;
      case "incentives":
        return <IncentivesGrants />;
      case "therapists":
        return <TherapistsStaff />;
      default:
        return <WellnessDashboardHome />;
    }
  };

  // AYUSH College Dashboard Tabs
  const renderAyushCollegeContent = () => {
    switch (activeTab) {
      case "home":
        return <AyushCollegeHome />;
      case "profile":
        return <CollegeProfile />;
      case "accreditation":
        return <NAACAccreditation />;
      case "incentives":
        return <CollegeIncentiveApplications />;
      case "naac-reimbursement":
        return <NAACReimbursement />;
      case "faculty":
        return <FacultyStudentData />;
      case "notifications":
        return <NotificationsAlerts />;
      default:
        return <AyushCollegeHome />;
    }
  };

  // Yoga Training Centre Dashboard Tabs
  const renderYogaTrainingCentreContent = () => {
    switch (activeTab) {
      case "home":
        return <YogaTrainingCentreHome />;
      case "trainers":
        return <TrainerManagement />;
      case "courses":
        return <CourseManagement />;
      case "infrastructure":
        return <InfrastructureDetails />;
      case "analytics":
        return <CenterAnalytics />;
      case "affiliation":
        return <CenterAffiliation />;
      case "incentives":
        return <YogaTCIncentive />;
      case "trainer-fee":
        return <TrainerFeeReimbursement />;
      default:
        return <YogaTrainingCentreHome />;
    }
  };

  // AYUSH Hospital Dashboard Tabs
  const renderAyushHospitalContent = () => {
    switch (activeTab) {
      case "home":
        return <AyushHospitalHome setActiveTab={setActiveTab} />;
      case "profile":
        return <HospitalProfile />;
      case "incentives":
        return <NABHIncentive />;
      case "documents":
        return <NABHDocuments />;
      case "status":
        return <ApplicationStatus setActiveTab={setActiveTab} />;
      case "validity":
        return <ValidityTracking />;
      default:
        return <AyushHospitalHome setActiveTab={setActiveTab} />;
    }
  };

  // Other Dashboards fallback
  const renderOtherDashboards = () => {
    switch (userRole) {
      case "yoga_centre":
        return <YogaTrainingCentreHome />;
      case "district_officer":
        return <DistrictOfficer />;
      case "directorate":
        return <DirectorateDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <YogaProfessional setActiveTab={setActiveTab} />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    localStorage.removeItem("activeTab");
    setIsLoggedIn(false);
    setUserRole("");
    setCurrentPage("home");
    setActiveTab("home");
  };

  // Render page based on login/currentPage
  const renderPage = () => {
    if (currentPage === "login") {
      return (
        <Login
          setCurrentPage={setCurrentPage}
          setIsLoggedIn={setIsLoggedIn}
          setUserRole={setUserRole}
          language={language}
        />
      );
    }

    if (currentPage === "public_profile") {
      return <PublicProfile
        centreId={selectedCentreId}
        onBack={() => {
          setCurrentPage(isLoggedIn ? "dashboard" : "home");
        }}
      />;
    }

    if (currentPage === "registry" || currentPage === "verify") {
      return (
        <Registry
          forceVerifyOpen={currentPage === "verify"}
          onBack={() => {
            setCurrentPage(isLoggedIn ? "dashboard" : "home");
          }}
        />
      );
    }

    if (currentPage === "register") {
      return (
        <Register
          setCurrentPage={setCurrentPage}
          setUserRole={setUserRole}
          language={language}
        />
      );
    }

    if (currentPage === "dashboard" || isLoggedIn) {
      return (
        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar */}
          <div className="w-64 hidden md:block overflow-y-auto bg-white border-r">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              userRole={userRole}

              onLogout={handleLogout}
            />
          </div>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {userRole === "yoga_professional" && renderYogaProfessionalContent()}
            {userRole === "wellness_centre" && renderWellnessCentreContent()}
            {userRole === "ayush_college" && renderAyushCollegeContent()}
            {userRole === "yoga_centre" && renderYogaTrainingCentreContent()}
            {userRole === "ayush_hospital" && renderAyushHospitalContent()}
            {userRole === "research_org" && <ResearchGrant />}
            {userRole === "institution" && <TrainerFeeReimbursement />}
            {!["yoga_professional", "wellness_centre", "ayush_college", "yoga_centre", "ayush_hospital", "research_org", "institution"].includes(userRole) &&
              activeTab === "home" && renderOtherDashboards()
            }
          </div>
        </div>
      );
    }

    // Public Home Page
    return (
      <>
        <HeroSection setCurrentPage={setCurrentPage} language={language} />
        <LeadershipSection language={language} />
        <KeyFeatures language={language} />
        <Footer />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      <Navbar
        language={language}
        setLanguage={setLanguage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      {renderPage()}
    </div>
  );
};

export default App;
