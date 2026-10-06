import React from 'react';
import { Award, Zap, HelpCircle } from 'lucide-react';

export default function Header({ currentView, onGoHome, onOpenDrillMode }) {
  return (
    <header className="border-b border-gray-800 bg-[#0e1017]/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-[#11121a] rounded-[14px] flex items-center justify-center font-black text-amber-400 text-sm tracking-wider">
              UST
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight group-hover:text-amber-400 transition">
                USTET Master Mock
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                2026 Edition
              </span>
            </div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              The Pontifical & Royal University of Santo Tomas
            </p>
          </div>
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-3">
          {currentView !== 'exam' && (
            <>
              <button
                onClick={onOpenDrillMode}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1b1e2b] hover:bg-[#25293d] border border-gray-700/80 text-gray-200 text-xs font-semibold transition"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Practice Drills
              </button>

              <button
                onClick={onGoHome}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  currentView === 'home'
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Overview
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
