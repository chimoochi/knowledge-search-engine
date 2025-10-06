
import React from 'react';
import { LogoIcon } from './icons';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="py-4 px-8 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <button onClick={onLogoClick} className="flex items-center gap-3 text-left">
          <LogoIcon className="h-8 w-8 text-black" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-wider">
            Knowledge <span className="text-gray-500 font-normal">Engine</span>
          </h1>
        </button>
      </div>
    </header>
  );
};

export default Header;
