
import React from 'react';
import { DuckLogo } from '../constants';

interface HeaderProps {
  isSignedIn: boolean;
  onToggleSignIn: (val: boolean) => void;
  userName?: string;
  userAvatar?: string;
}

const Header: React.FC<HeaderProps> = ({ isSignedIn, onToggleSignIn, userName, userAvatar }) => {
  return (
    <header className="sticky top-0 z-50 bg-yellow-400 border-b-4 border-green-600 px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <DuckLogo className="w-12 h-12 transform group-hover:scale-110 transition-transform duration-300" />
          <div>
            <h1 className="text-3xl font-extrabold text-green-800 tracking-tight leading-none">DuckFile</h1>
            <p className="text-xs font-bold text-green-700 uppercase tracking-widest">Waddle into Productivity</p>
          </div>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-green-900 font-bold hover:text-green-700 transition-colors">My Pond</a>
          <a href="#" className="text-green-900 font-bold hover:text-green-700 transition-colors">Shared</a>
          <a href="#" className="text-green-900 font-bold hover:text-green-700 transition-colors">Settings</a>
        </nav>

        <div className="flex items-center space-x-4">
          {isSignedIn ? (
            <>
              <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-sm font-bold text-green-900 leading-none">{userName}</span>
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">Pro Duck</span>
              </div>
              <button 
                onClick={() => onToggleSignIn(false)}
                className="relative group focus:outline-none"
                title="Sign Out"
              >
                <img 
                    src={userAvatar || "https://picsum.photos/seed/ducky/40/40"} 
                    className="w-10 h-10 rounded-full border-2 border-green-800 group-hover:border-white transition-colors" 
                    alt="Profile" 
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-yellow-400 rounded-full"></div>
              </button>
            </>
          ) : (
            <button 
              onClick={() => onToggleSignIn(true)}
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
