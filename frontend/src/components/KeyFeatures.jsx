import React from "react";
import { FileText, CreditCard, MapPin, Shield } from "lucide-react"; 

// Feature Card
const FeatureCard = ({ icon, title, description }) => {
  const Icon = icon;
  return (
    <div
      className="bg-zinc-950/40 p-8 border border-white/5 hover:border-white/15 transition-all duration-300 rounded-2xl group hover:shadow-[0_0_40px_rgba(239,35,60,0.04)] relative overflow-hidden backdrop-blur-sm"
    >
      <div className="bg-white/5 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#ef233c] border border-white/10 group-hover:border-[#ef233c] transition-all duration-300">
        <Icon className="text-[#ef233c] group-hover:text-white transition-colors duration-300" size={24} />
      </div>
      <h3 className="text-xl font-bold text-zinc-100 mb-2 font-manrope group-hover:text-white transition-colors">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed font-light">{description}</p>
      
      {/* Subtle overlay glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.08] transition-opacity pointer-events-none duration-500" 
        style={{ background: "radial-gradient(circle at top right, #ef233c, transparent 70%)" }}
      ></div>
    </div>
  );
};

// Key Features Section
const KeyFeatures = ({ language }) => {
  //  Text in both languages
  const featuresEN = [
    {
      icon: FileText,
      title: "Certification & Accreditation",
      description: "Register yoga professionals, wellness centers, and colleges, and obtain digital accreditations.",
    },
    {
      icon: CreditCard,
      title: "Incentives & Reimbursements",
      description: "Automated processing of subsidies, grant claims, and direct payments via e-Treasury integration.",
    },
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      description: "Log yoga sessions with automatic geographic location mapping and attendance tracking.",
    },
    {
      icon: Shield,
      title: "Public Verification",
      description: "Public verification of certificates, accreditations, and entity statuses with secure codes.",
    },
  ];

  const featuresHI = [
    {
      icon: FileText,
      title: "प्रमाणीकरण और मान्यता",
      description: "योग पेशेवरों, केंद्रों को पंजीकृत करें और डिजिटल रूप से मान्यता प्राप्त करें",
    },
    {
      icon: CreditCard,
      title: "प्रोत्साहन और प्रतिपूर्ति",
      description: "ई-ट्रेजरी के माध्यम से स्वचालित सब्सिडी प्रसंस्करण और प्रत्यक्ष भुगतान",
    },
    {
      icon: MapPin,
      title: "रीयल-टाइम ट्रैकिंग",
      description: "जियो-लोकेशन और उपस्थिति लॉगिंग के साथ योग सत्रों को ट्रैक करें",
    },
    {
      icon: Shield,
      title: "सार्वजनिक सत्यापन",
      description: "सत्यापन कोड के साथ प्रमाणपत्र और रेटिंग सत्यापित करें",
    },
  ];

  const features = language === "EN" ? featuresEN : featuresHI;

  return (
    <section className="py-24 px-6 bg-transparent relative border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center font-manrope text-white mb-4 tracking-tight">
          {language === "EN" ? "Key Portal Features" : "मुख्य विशेषताएं"}
        </h2>
        <p className="text-center text-zinc-400 font-light mb-16 max-w-xl mx-auto text-sm leading-relaxed">
          {language === "EN"
            ? "Holistic digital tools built to empower traditional healthcare and wellness management across the state."
            : "कल्याण प्रबंधन के लिए पारंपरिक स्वास्थ्य सेवा और प्रबंधन उपकरण"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures;
