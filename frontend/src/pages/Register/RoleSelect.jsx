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

const roles = [
  {
    id: "yoga_professional",
    name: "Yoga Professional",
    icon: User,
    description: "For certified yoga practitioners",
    color: "from-teal-500 to-teal-700",
    bg: "bg-teal-50 hover:border-teal-400",
  },
  {
    id: "yoga_centre",
    name: "Yoga Centre",
    icon: Building,
    description: "For yoga institutions",
    color: "from-emerald-500 to-emerald-700",
    bg: "bg-emerald-50 hover:border-emerald-400",
  },
  {
    id: "wellness_centre",
    name: "Wellness Centre",
    icon: Heart,
    description: "For wellness therapy centers",
    color: "from-pink-500 to-pink-700",
    bg: "bg-pink-50 hover:border-pink-400",
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
  },
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
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-6">
        Select Your Role to Get Started
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const selected = formData.userType === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => handleSelect(role.id)}
              className={`p-4 border-2 rounded-xl transition-all text-left ${selected
                  ? "border-teal-500 bg-teal-50 shadow-md"
                  : `border-gray-200 ${role.bg}`
                }`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${role.color} shadow-sm`}
                >
                  <Icon className="text-white" size={24} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-gray-800">{role.name}</h3>
                  <p className="text-sm text-gray-500">{role.description}</p>
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
  );
};

export default RoleSelect;
