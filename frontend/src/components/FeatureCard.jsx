import React from "react";
import { FileText, CreditCard, MapPin, Shield } from "lucide-react"; 

// Feature Card
const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-100 group hover:border-teal-300">
      <div className="bg-teal-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-600 transition">
        <Icon className="text-teal-700 group-hover:text-white transition" size={32} />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};


export default FeatureCard; 
