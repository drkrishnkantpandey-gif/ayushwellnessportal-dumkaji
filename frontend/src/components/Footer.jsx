import React from "react";

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold mb-3 text-lg text-teal-400">About Us</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              Department of Ayush and Ayush Education, Uttarakhand Government
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-lg text-teal-400">Contact</h4>
            <p className="text-gray-300 text-xs leading-relaxed">
              Directorate of Ayurvedic & Unani Services, Sahasatradhara Road, Near DG Health Office, Dehradun.
            </p>
            <p className="text-gray-300 text-xs mt-2 font-semibold">
              Email: <a href="mailto:mail@uttarakhandayurved.co.in" className="text-teal-300 hover:underline">mail@uttarakhandayurved.co.in</a>
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-lg text-teal-400">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/yoga_policy.jpg" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white hover:underline transition">
                  Yoga Policy
                </a>
              </li>
              <li>
                <a href="/ayush_policy.jpg" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white hover:underline transition">
                  AYUSH Policy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-lg text-teal-400">Other Imp Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://yogacertificationboard.nic.in" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white hover:underline transition block">
                  YCB
                </a>
              </li>
              <li>
                <a href="https://ayush.gov.in" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white hover:underline transition block">
                  AYUSH Ministry, GOI
                </a>
              </li>
              <li>
                <a href="https://nabh.co" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white hover:underline transition block">
                  NABH
                </a>
              </li>
              <li>
                <a href="https://ayurved.uk.gov.in" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white hover:underline transition block">
                  Ayurveda Dept Uttarakhand
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
          <p>
            © 2026 AYUSH Setu - Department of Ayush and Ayush Education, Uttarakhand Government. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
