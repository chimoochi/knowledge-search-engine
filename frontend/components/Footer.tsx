
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto py-6 px-8 text-center text-gray-500 text-sm border-t border-gray-200 bg-white">
      <div className="container mx-auto">
        <div className="flex justify-center gap-4 mb-2">
          <a href="#" className="hover:text-gray-800 transition-colors">Privacy Policy</a>
          <span>|</span>
          <a href="#" className="hover:text-gray-800 transition-colors">Legal</a>
          <span>|</span>
          <a href="#" className="hover:text-gray-800 transition-colors">Contact</a>
          <span>|</span>
          <a href="#" className="hover:text-gray-800 transition-colors">Resources</a>
        </div>
        <p>Copyright ©{new Date().getFullYear()} NASA | This UI is a submission for the #SpaceApps Challenge.</p>
        <p className="mt-1">Funded by NASA's Earth Science Division through a contract with Booz Allen Hamilton, Mindgrub, and SecondMuse.</p>
      </div>
    </footer>
  );
};

export default Footer;