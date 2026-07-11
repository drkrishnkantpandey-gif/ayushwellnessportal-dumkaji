import React from "react";
import { FileText, CreditCard, MapPin, Shield } from "lucide-react"; 

// Feature Card
const FeatureCard = ({ icon, title, description }) => {
  const Icon = icon;
  return (
    <div
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-100 group hover:border-teal-300"
    >
      <div className="bg-teal-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-600 transition">
        <Icon className="text-teal-700 group-hover:text-white transition" size={32} />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
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
      description: "Register yoga professionals, centers, and get accredited digitally",
    },
    {
      icon: CreditCard,
      title: "Incentives & Reimbursements",
      description: "Automated subsidy processing and direct payments via e-Treasury",
    },
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      description: "Track yoga sessions with geo-location and attendance logging",
    },
    {
      icon: Shield,
      title: "Public Verification",
      description: "Verify certificates and ratings with QR code scanning",
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
      description: "क्यूआर कोड स्कैनिंग के साथ प्रमाणपत्र और रेटिंग सत्यापित करें",
    },
  ];

  // Select language-specific array
  const features = language === "EN" ? featuresEN : featuresHI;

  return (
    <div className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          {language === "EN" ? "Key Features" : "मुख्य विशेषताएँ"}
        </h2>
        <p className="text-center text-gray-600 mb-12">
          {language === "EN"
            ? "Comprehensive tools for wellness management"
            : "कल्याण प्रबंधन के लिए व्यापक उपकरण"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeyFeatures;
