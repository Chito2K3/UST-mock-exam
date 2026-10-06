import React, { useEffect } from 'react';
import {
  X,
  Play,
  Clock,
  ShieldAlert,
  FileText,
  AlertTriangle,
  Lock,
  Layers,
} from 'lucide-react';

export default function ExamStartModal({ isOpen, config, onConfirm, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onClose]);

  if (!isOpen || !config) return null;

  const {
    title = 'USTET Entrance Examination',
    badge = 'Official Simulation',
    subtitle = 'Authentic University of Santo Tomas Entrance Test Simulator',
    itemCount = 0,
    partsCount = 1,
    durationMinutes = 0,
    subjects = [],
    calculatorAllowed = false,
  } = config;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#141622] border border-amber-500/50 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Decorative Gold Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-[#11121a] rounded-[14px] flex items-center justify-center font-black text-amber-400 text-sm">
                UST
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                  {badge}
                </span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mt-1">
                {title}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition"
            title="Cancel & Return"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Exam Parameter Highlights */}
        <div className="grid grid-cols-3 gap-3 relative z-10">
          <div className="bg-[#1a1d2b] border border-gray-800 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 text-[11px] mb-1">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Questions</span>
            </div>
            <span className="text-lg font-black text-white">{itemCount}</span>
            <span className="block text-[10px] text-gray-400">Total Items</span>
          </div>

          <div className="bg-[#1a1d2b] border border-gray-800 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 text-[11px] mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Allotted Time</span>
            </div>
            <span className="text-lg font-black text-amber-300">{durationMinutes}m</span>
            <span className="block text-[10px] text-gray-400">{partsCount > 1 ? `${partsCount} Parts Combined` : 'Single Section'}</span>
          </div>

          <div className="bg-[#1a1d2b] border border-gray-800 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 text-[11px] mb-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Coverage</span>
            </div>
            <span className="text-lg font-black text-emerald-400">{partsCount}</span>
            <span className="block text-[10px] text-gray-400">{partsCount === 1 ? 'Subtest' : 'Subtests'}</span>
          </div>
        </div>

        {/* Subjects Included */}
        {subjects.length > 0 && (
          <div className="space-y-1.5 relative z-10">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Subtest Structure:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {subjects.map((sub, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-[#181a26] border border-gray-800 text-[11px] text-gray-300 font-medium"
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mandatory Rules Notification Box */}
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-xs text-amber-200 space-y-2.5 relative z-10">
          <div className="flex items-center gap-2 font-bold text-amber-400 text-xs uppercase tracking-wide">
            <ShieldAlert className="w-4 h-4" />
            Important Examination Protocols
          </div>

          <ul className="space-y-2 text-[11px] leading-relaxed text-amber-100/90 pl-1">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
              <span>
                <strong>Timer starts immediately:</strong> The countdown clock begins the instant you click &apos;Start Examination&apos;.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span>
                <strong>Irreversible Section Locking:</strong> You cannot flip back to previous sections once submitted or after time expires.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span>
                <strong>Calculators Prohibited:</strong> {calculatorAllowed ? 'Allowed' : 'Strictly forbidden. A virtual digital scratchpad is provided for handwriting arithmetic.'}
              </span>
            </li>
          </ul>
        </div>

        {/* Modal Action Controls */}
        <div className="flex items-center gap-3 pt-2 relative z-10">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#1d202e] hover:bg-[#272b3e] text-gray-300 hover:text-white text-xs font-bold transition border border-gray-700/60 cursor-pointer"
          >
            Cancel / Go Back
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition cursor-pointer transform hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Examination & Begin Timer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
