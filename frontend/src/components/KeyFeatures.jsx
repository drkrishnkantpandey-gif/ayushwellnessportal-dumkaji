import React from "react";
import { FileText, CreditCard, MapPin, Shield } from "lucide-react"; 

// Feature Card
const FeatureCard = ({ icon, title, description }) => {
  const Icon = icon;
  return (
    <div className="bg-[#fdf8f3] p-10 border border-[#262626]/5 hover:bg-[#e4a4bd] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) group flex flex-col justify-between h-full">
      <div>
        <div className="text-[#e4a4bd] group-hover:text-[#262626] transition-colors duration-1000 cubic-bezier(0.16, 1, 0.3, 1) mb-8">
          <Icon size={48} />
        </div>
        <h3 className="text-lg font-black tracking-widest uppercase text-[#262626] mb-4 font-spartan leading-none">
          {title}
        </h3>
        <p className="text-[#262626]/70 group-hover:text-[#262626]/85 text-xs leading-relaxed font-light">
          {description}
        </p>
      </div>
    </div>
  );
};

// Key Features Section
const KeyFeatures = ({ language }) => {
  const featuresEN = [
    {
      icon: FileText,
      title: "Accreditation",
      description: "Register yoga professionals, wellness centers, and colleges, and obtain digital accreditations.",
    },
    {
      icon: CreditCard,
      title: "Incentives",
      description: "Automated processing of subsidies, grant claims, and direct payments via e-Treasury integration.",
    },
    {
      icon: MapPin,
      title: "Real-Time Logs",
      description: "Log yoga sessions with automatic geographic location mapping and attendance tracking.",
    },
  ];

  const featuresHI = [
    {
      icon: FileText,
      title: "प्रमाणीकरण",
      description: "योग पेशेवरों, केंद्रों को पंजीकृत करें और डिजिटल रूप से मान्यता प्राप्त करें",
    },
    {
      icon: CreditCard,
      title: "प्रोत्साहन",
      description: "ई-ट्रेजरी के माध्यम से स्वचालित सब्सिडी प्रसंस्करण और प्रत्यक्ष भुगतान",
    },
    {
      icon: MapPin,
      title: "रीयल-टाइम",
      description: "जियो-लोकेशन और उपस्थिति लॉगिंग के साथ योग सत्रों को ट्रैक करें",
    },
  ];

  const features = language === "EN" ? featuresEN : featuresHI;

  return (
    <section className="py-24 px-6 md:px-8 bg-[#f5f0eb] relative border-t border-[#262626]/5">
      <div className="max-w-7xl mx-auto reveal-up">
        {/* Massive 8xl Headline */}
        <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.8] text-[#262626] mb-6 font-spartan uppercase text-center md:text-left">
          {language === "EN" ? "KEY SERVICES" : "मुख्य सेवाएं"}
        </h2>
        <p className="text-[#262626]/60 font-light mb-16 max-w-xl text-sm leading-relaxed text-center md:text-left">
          {language === "EN"
            ? "Holistic digital tools built to empower traditional healthcare and wellness management across the state."
            : "कल्याण प्रबंधन के लिए पारंपरिक स्वास्थ्य सेवा और प्रबंधन उपकरण"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#262626]/10 rounded-3xl overflow-hidden shadow-sm">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures;
