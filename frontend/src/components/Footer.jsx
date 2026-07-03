import React from "react";

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold mb-4">About Us</h4>
            <p className="text-gray-400 text-sm">
              Department of Ayush and Ayush Education, Uttarakhand Government
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <p className="text-gray-400 text-sm">ayush@gov.in</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Privacy Policy</h4>
            <p className="text-gray-400 text-sm">Terms & Conditions</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Government Systems</h4>
            <p className="text-gray-400 text-sm">YCB, NABH, NAAC, e-Treasury</p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
          <p>
            © 2024 AYUSH Portal - Department of Ayush and Ayush Education, Uttarakhand Government. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
