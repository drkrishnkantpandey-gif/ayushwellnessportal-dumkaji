import React from "react";

const leaders = [
  {
    image: "/images/leaders/pushkar_dhami.jpg",
    nameEN: "Shri Pushkar Singh Dhami",
    nameHI: "श्री पुष्कर सिंह धामी",
    titleEN: "Hon'ble Chief Minister",
    titleHI: "माननीय मुख्यमंत्री",
    subtitleEN: "Government of Uttarakhand",
    subtitleHI: "उत्तराखण्ड सरकार",
    border: "border-orange-400",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-800",
    ring: "ring-orange-200",
    gradient: "from-orange-50 to-amber-50",
    icon: "🏛",
  },
  {
    image: "https://cdnbbsr.s3waas.gov.in/s3a77c8fd7f48b9c859bbd5ed81c5f441f/uploads/2026/05/202605062128712880.jpeg",
    nameEN: "Shri Madan Kaushik",
    nameHI: "श्री मदन कौशिक",
    titleEN: "Hon'ble Ayush Minister",
    titleHI: "माननीय आयुष मंत्री",
    subtitleEN: "Government of Uttarakhand",
    subtitleHI: "उत्तराखण्ड सरकार",
    border: "border-teal-400",
    badgeBg: "bg-teal-100",
    badgeText: "text-teal-800",
    ring: "ring-teal-200",
    gradient: "from-teal-50 to-emerald-50",
    icon: "🌿",
  },
  {
    image: "/images/leaders/ranjana_rajguru.jpg",
    nameEN: "Smt. Ranjana Rajguru, IAS",
    nameHI: "श्रीमती रंजना राजगुरु, IAS",
    titleEN: "Secretary",
    titleHI: "सचिव",
    subtitleEN: "Ayush & Ayush Education, Uttarakhand",
    subtitleHI: "आयुष एवं आयुष शिक्षा, उत्तराखण्ड",
    border: "border-blue-400",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-800",
    ring: "ring-blue-200",
    gradient: "from-blue-50 to-indigo-50",
    icon: "📋",
  },
  {
    image: "https://cdnbbsr.s3waas.gov.in/s3a77c8fd7f48b9c859bbd5ed81c5f441f/uploads/2026/01/202601221607237338.png",
    nameEN: "Dr. Vijay Kumar Jogdande, IAS",
    nameHI: "डॉ. विजय कुमार जोगदंडे, IAS",
    titleEN: "Director",
    titleHI: "निदेशक",
    subtitleEN: "Ayurvedic & Unani Services, Uttarakhand",
    subtitleHI: "आयुर्वेदिक एवं यूनानी सेवाएं, उत्तराखण्ड",
    border: "border-purple-400",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-800",
    ring: "ring-purple-200",
    gradient: "from-purple-50 to-pink-50",
    icon: "⚕️",
  },
];

const LeadershipSection = ({ language = "EN" }) => {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-14 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Section heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 rounded-full text-sm font-semibold mb-4">
            🏛 {language === "EN" ? "Our Leadership" : "हमारा नेतृत्व"}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            {language === "EN"
              ? "Visionary Leaders of AYUSH Uttarakhand"
              : "आयुष उत्तराखण्ड के दूरदर्शी नेतृत्व"}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            {language === "EN"
              ? "Under the esteemed guidance of our distinguished leaders, the Department of Ayush and Ayush Education is committed to promoting traditional and holistic healthcare across Uttarakhand."
              : "हमारे विशिष्ट नेताओं के सम्मानित मार्गदर्शन में, आयुष एवं आयुष शिक्षा विभाग उत्तराखण्ड में पारंपरिक एवं समग्र स्वास्थ्य सेवाओं को बढ़ावा देने के लिए प्रतिबद्ध है।"}
          </p>
        </div>

        {/* Leader cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {leaders.map((leader, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-b ${leader.gradient} rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 group`}
            >
              {/* Photo */}
              <div
                className={`relative w-32 h-36 md:w-40 md:h-48 rounded-xl overflow-hidden border-4 ${leader.border} ring-4 ${leader.ring} ring-offset-2 shadow-md group-hover:scale-105 transition-transform duration-300 mb-4`}
              >
                <img
                  src={leader.image}
                  alt={leader.nameEN}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.nameEN)}&background=e2e8f0&color=475569&size=200`;
                  }}
                />
              </div>

              {/* Role badge */}
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${leader.badgeBg} ${leader.badgeText} mb-2`}>
                <span>{leader.icon}</span>
                {language === "EN" ? leader.titleEN : leader.titleHI}
              </span>

              {/* Name */}
              <h3 className="font-bold text-gray-800 text-sm leading-snug mb-1">
                {language === "EN" ? leader.nameEN : leader.nameHI}
              </h3>

              {/* Department */}
              <p className="text-gray-500 text-xs leading-tight">
                {language === "EN" ? leader.subtitleEN : leader.subtitleHI}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-12 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />
          <span className="text-2xl">🌿</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;
