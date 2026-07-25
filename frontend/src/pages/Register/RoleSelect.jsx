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
    bgClass: "bg-zinc-950/40 border-white/5",
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
    bgClass: "bg-zinc-950/40 border-white/5",
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
    bgClass: "bg-zinc-950/60 border-white/5",
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
      <label className="block text-sm font-semibold text-zinc-300">
        Select Your Role to Get Started
      </label>
      <div className="space-y-6">
        {categories.map((category, catIdx) => (
          <div key={catIdx} className={`p-5 border rounded-2xl ${category.bgClass} shadow-xl space-y-3`}>
            <div>
              <h2 className="text-base font-bold text-zinc-100 font-manrope">{category.title}</h2>
              <p className="text-xs text-zinc-500 font-medium">{category.description}</p>
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
                    className={`p-4 border rounded-xl transition-all text-left group ${selected
                        ? "border-[#ef233c] bg-zinc-900 shadow-xl ring-2 ring-[#ef233c]/20"
                        : "border-white/5 bg-black/40 hover:border-zinc-800 hover:bg-zinc-950"
                      }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-900 border border-white/10 group-hover:border-[#ef233c]/30 shadow-sm"
                      >
                        <Icon className="text-[#ef233c]" size={22} />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-bold text-zinc-200 text-sm group-hover:text-white transition-colors">{role.name}</h3>
                        <p className="text-xs text-zinc-500 leading-snug mt-0.5 font-light">{role.description}</p>
                      </div>
                      {selected && (
                        <div className="w-6 h-6 bg-[#ef233c] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
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
