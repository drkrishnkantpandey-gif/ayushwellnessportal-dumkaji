// src/pages/Register/RoleSelect.jsx
import React from "react";
import {
  User,
  Building,
  Heart,
  GraduationCap,
  Shield,
  Map,
} from "lucide-react";

const categories = [
  {
    title: "Wellness Registry",
    description: "Registry and enrollment for wellness practitioners and centers",
    bgClass: "bg-[#fdf8f3] border-[#262626]/5",
    roles: [
      {
        id: "wellness_centre",
        name: "Register Existing Centre",
        icon: Heart,
        description: "Register your existing Panchakarma, Yoga, Naturopathy Based Wellness Centre",
      },
      {
        id: "yoga_professional",
        name: "Yoga Professional Registration",
        icon: User,
        description: "For Registration of certified Yoga Professionals",
      }
    ]
  },
  {
    title: "Incentives / Grant Registration",
    description: "Apply for government incentives, accreditation subsidies, and grants",
    bgClass: "bg-[#fdf8f3] border-[#262626]/5",
    roles: [
      {
        id: "yoga_centre",
        name: "Yoga Centre",
        icon: Building,
        description: "For One Time Capital Subsidy / Trainer Fee Reimbursement",
      },
      {
        id: "ayush_hospital",
        name: "AYUSH Hospital",
        icon: Shield,
        description: "For NABH accredited hospitals",
      },
      {
        id: "ayush_college",
        name: "AYUSH College",
        icon: GraduationCap,
        description: "For NAAC accredited colleges",
      },
      {
        id: "research_org",
        name: "Research Institution",
        icon: GraduationCap,
        description: "NGO, Research Institute, Medical Org, University or College",
      }
    ]
  },
  {
    title: "Officials",
    description: "Departmental access for administrators and district officers",
    bgClass: "bg-[#fdf8f3] border-[#262626]/5",
    roles: [
      {
        id: "district_officer",
        name: "District Officer",
        icon: Map,
        description: "For district level administrators",
      },
      {
        id: "directorate",
        name: "Directorate",
        icon: Shield,
        description: "For state level administrators",
      }
    ]
  }
];

const RoleSelect = ({ formData, setFormData, onRoleSelect }) => {
  const handleSelect = (roleId) => {
    setFormData((prev) => ({ ...prev, userType: roleId }));
    if (onRoleSelect) {
      onRoleSelect(roleId);
    }
  };

  return (
    <div className="space-y-6">
      <label className="block text-xs font-bold uppercase tracking-widest text-[#262626]">
        Select Your Role to Get Started
      </label>
      <div className="space-y-6">
        {categories.map((category, catIdx) => (
          <div key={catIdx} className={`p-5 border rounded-3xl ${category.bgClass} shadow-md space-y-3`}>
            <div>
              <h2 className="text-sm font-black text-[#262626] font-spartan uppercase">{category.title}</h2>
              <p className="text-[11px] text-[#262626]/60 leading-relaxed font-light">{category.description}</p>
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
                    className={`p-4 border rounded-2xl transition-all duration-300 text-left group ${selected
                        ? "border-[#e4a4bd] bg-[#e4a4bd]/10 shadow-lg ring-2 ring-[#e4a4bd]/20"
                        : "border-[#262626]/5 bg-[#f5f0eb] hover:border-[#e4a4bd] hover:bg-[#fdf8f3]"
                      }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#fdf8f3] border border-[#262626]/5 shadow-sm group-hover:bg-[#e4a4bd] transition-colors duration-500"
                      >
                        <Icon className="text-[#262626]" size={22} />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-extrabold text-[#262626] font-spartan uppercase text-xs leading-none">{role.name}</h3>
                        <p className="text-[10px] text-[#262626]/60 leading-relaxed mt-1 font-light">{role.description}</p>
                      </div>
                      {selected && (
                        <div className="w-6 h-6 bg-[#e4a4bd] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-[#262626] text-xs font-bold">✓</span>
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
