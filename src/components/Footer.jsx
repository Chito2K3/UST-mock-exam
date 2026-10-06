import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800/80 bg-[#0a0b0f] py-8 text-center text-xs text-gray-400">
      <div className="max-w-7xl mx-auto px-4 space-y-2">
        <p className="font-semibold text-gray-400">
          USTET Master Entrance Examination Simulator & Practice Platform
        </p>
        <p className="text-[11px] text-gray-400">
          Crafted for Thomasian aspirants. Designed according to the four-part USTET standard (Mental Ability, English, Mathematics, Science).
        </p>
        <p className="text-[10px] text-gray-400">
          Independent educational mock platform for preparation and personal study.
        </p>
      </div>
    </footer>
  );
}
