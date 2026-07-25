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
    <section className="bg-transparent py-24 px-6 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto">

        {/* Section heading */}
        <div className="text-center mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ef233c]/5 border border-[#ef233c]/20 text-[#ef233c] rounded-full text-xs font-semibold mb-4 tracking-wide uppercase">
            🌿 {language === "EN" ? "Our Leadership" : "हमारा नेतृत्व"}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-manrope text-white mb-4 tracking-tight">
            {language === "EN"
              ? "Visionary Leadership of AYUSH Uttarakhand"
              : "आयुष उत्तराखण्ड के दूरदर्शी नेतृत्व"}
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm leading-relaxed font-light">
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
              className="bg-zinc-950/40 border border-white/5 hover:border-[#ef233c]/30 rounded-2xl p-5 flex flex-col items-center text-center backdrop-blur-sm transition-all duration-300 group hover:shadow-[0_0_30px_rgba(239,35,60,0.05)] relative overflow-hidden"
            >
              {/* Photo */}
              <div
                className="relative w-32 h-36 md:w-40 md:h-48 rounded-xl overflow-hidden border border-white/10 ring-4 ring-[#ef233c]/10 group-hover:ring-[#ef233c]/25 transition-all duration-300 mb-4 group-hover:scale-105"
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#ef233c]/10 text-[#ef233c] mb-3 border border-[#ef233c]/20">
                <span>{leader.icon}</span>
                {language === "EN" ? leader.titleEN : leader.titleHI}
              </span>

              {/* Name */}
              <h3 className="font-bold text-zinc-100 text-sm leading-snug mb-1 group-hover:text-white transition-colors">
                {language === "EN" ? leader.nameEN : leader.nameHI}
              </h3>

              {/* Department */}
              <p className="text-zinc-500 text-[11px] leading-tight font-medium">
                {language === "EN" ? leader.subtitleEN : leader.subtitleHI}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-16 flex items-center gap-4">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#ef233c]/30 to-transparent" />
          <span className="text-xl opacity-60">🌿</span>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#ef233c]/30 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;
