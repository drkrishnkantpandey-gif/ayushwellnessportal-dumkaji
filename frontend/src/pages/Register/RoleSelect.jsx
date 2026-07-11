// src/pages/Register/RoleSelect.jsx
import React from "react";
import {
  User,
  Building,
  Heart,
  GraduationCap,
  Shield,
  Map,
  Crown,
} from "lucide-react";

const categories = [
  {
    title: "Wellness Registry",
    description: "Registry and enrollment for wellness practitioners and centers",
    bgClass: "bg-teal-50/30 border-teal-100",
    roles: [
      {
        id: "wellness_centre",
        name: "Register Existing Centre",
        icon: Heart,
        description: "Register your existing Panchakarma, Yoga, Naturopathy Based Wellness Centre",
        color: "from-pink-500 to-pink-700",
        bg: "bg-pink-50 hover:border-pink-400",
      },
      {
        id: "yoga_professional",
        name: "Yoga Professional Registration",
        icon: User,
        description: "For Registration of certified Yoga Professionals",
        color: "from-teal-500 to-teal-700",
        bg: "bg-teal-50 hover:border-teal-400",
      }
    ]
  },
  {
    title: "Incentives / Grant Registration",
    description: "Apply for government incentives, accreditation subsidies, and grants",
    bgClass: "bg-emerald-50/30 border-emerald-100",
    roles: [
      {
        id: "yoga_centre",
        name: "Yoga Centre",
        icon: Building,
        description: "For One Time Capital Subsidy / Trainer Fee Reimbursement",
        color: "from-emerald-500 to-emerald-700",
        bg: "bg-emerald-50 hover:border-emerald-400",
      },
      {
        id: "ayush_hospital",
        name: "AYUSH Hospital",
        icon: Shield,
        description: "For NABH accredited hospitals",
        color: "from-blue-500 to-blue-700",
        bg: "bg-blue-50 hover:border-blue-400",
      },
      {
        id: "ayush_college",
        name: "AYUSH College",
        icon: GraduationCap,
        description: "For NAAC accredited colleges",
        color: "from-purple-500 to-purple-700",
        bg: "bg-purple-50 hover:border-purple-400",
      },
      {
        id: "research_org",
        name: "Research Institution",
        icon: GraduationCap,
        description: "NGO, Research Institute, Medical Org, University or College",
        color: "from-sky-500 to-sky-700",
        bg: "bg-sky-50 hover:border-sky-400",
      }
    ]
  },
  {
    title: "Officials",
    description: "Departmental access for administrators and district officers",
    bgClass: "bg-slate-50 border-slate-200",
    roles: [
      {
        id: "district_officer",
        name: "District Officer",
        icon: Map,
        description: "For district level administrators",
        color: "from-orange-500 to-orange-700",
        bg: "bg-orange-50 hover:border-orange-400",
      },
      {
        id: "directorate",
        name: "Directorate",
        icon: Shield,
        description: "For state level administrators",
        color: "from-cyan-500 to-cyan-700",
        bg: "bg-cyan-50 hover:border-cyan-400",
      },
      {
        id: "admin",
        name: "Admin",
        icon: Crown,
        description: "For system administrators",
        color: "from-gray-600 to-gray-800",
        bg: "bg-gray-50 hover:border-gray-400",
      }
    ]
  }
];

const RoleSelect = ({ formData, setFormData, onRoleSelect }) => {
  const handleSelect = (roleId) => {
    setFormData((prev) => ({ ...prev, userType: roleId }));
    // Immediately advance to the next step when a role is selected
    if (onRoleSelect) {
      onRoleSelect(roleId);
    }
  };

  return (
    <div className="space-y-6">
      <label className="block text-sm font-semibold text-gray-700">
        Select Your Role to Get Started
      </label>
      <div className="space-y-6">
        {categories.map((category, catIdx) => (
          <div key={catIdx} className={`p-5 border rounded-2xl ${category.bgClass} shadow-sm space-y-3`}>
            <div>
              <h2 className="text-base font-bold text-gray-800">{category.title}</h2>
              <p className="text-xs text-gray-400 font-medium">{category.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.roles.map((role) => {
                const Icon = role.icon;
                const selected = formData.userType === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleSelect(role.id)}
                    className={`p-4 border-2 rounded-xl transition-all text-left ${selected
                        ? "border-teal-500 bg-white shadow-md ring-2 ring-teal-200"
                        : `border-gray-200 bg-white hover:border-teal-400 ${role.bg}`
                      }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${role.color} shadow-sm`}
                      >
                        <Icon className="text-white" size={24} />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-bold text-gray-800 text-sm">{role.name}</h3>
                        <p className="text-xs text-gray-500 leading-snug mt-0.5">{role.description}</p>
                      </div>
                      {selected && (
                        <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelect;
