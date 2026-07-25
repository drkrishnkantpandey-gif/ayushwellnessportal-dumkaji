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
    icon: "⚕️",
  },
];

const LeadershipSection = ({ language = "EN" }) => {
  return (
    <section className="bg-transparent py-24 px-6 md:px-8 relative border-t border-[#262626]/5">
      <div className="max-w-7xl mx-auto reveal-up">

        {/* Section heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e4a4bd]/20 border border-[#e4a4bd]/35 text-[#262626] rounded-full text-[10px] font-bold tracking-widest uppercase mb-4">
            🌿 {language === "EN" ? "Our Leadership" : "हमारा नेतृत्व"}
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-spartan text-[#262626] mb-4 tracking-tight uppercase">
            {language === "EN"
              ? "Visionary Leadership"
              : "दूरदर्शी नेतृत्व"}
          </h2>
          <p className="text-[#262626]/60 max-w-2xl mx-auto text-sm leading-relaxed font-light">
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
              className="bg-[#f5f0eb] border border-[#262626]/5 hover:border-[#e4a4bd] rounded-3xl p-5 flex flex-col items-center text-center transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) group hover:shadow-xl relative overflow-hidden"
            >
              {/* Photo */}
              <div
                className="relative w-32 h-36 md:w-40 md:h-48 rounded-2xl overflow-hidden border border-[#262626]/10 mb-4 transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
              >
                <img
                  src={leader.image}
                  alt={leader.nameEN}
                  className="w-full h-full object-cover object-top premium-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.nameEN)}&background=e4a4bd&color=262626&size=200`;
                  }}
                />
              </div>

              {/* Role badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold bg-[#e4a4bd] text-[#262626] mb-3 tracking-widest uppercase">
                <span>{leader.icon}</span>
                {language === "EN" ? leader.titleEN : leader.titleHI}
              </span>

              {/* Name */}
              <h3 className="font-extrabold text-[#262626] text-sm leading-snug mb-1 font-spartan uppercase">
                {language === "EN" ? leader.nameEN : leader.nameHI}
              </h3>

              {/* Department */}
              <p className="text-[#262626]/60 text-[10px] leading-tight font-medium uppercase tracking-wider">
                {language === "EN" ? leader.subtitleEN : leader.subtitleHI}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-16 flex items-center gap-4">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#e4a4bd]/30 to-transparent" />
          <span className="text-xl opacity-60">🌿</span>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#e4a4bd]/30 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;
