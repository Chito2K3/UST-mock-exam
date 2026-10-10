import React from 'react';
import {
  Clock,
  Play,
  Trash2,
  X,
  Brain,
  BookOpen,
  Calculator,
  Atom,
} from 'lucide-react';
import { SUBTEST_METADATA } from '../data/mockQuestions';
import ustSeal from '../assets/ust-seal.jpg';

export default function ResumeExamModal({
  isOpen,
  session,
  onResume,
  onDismiss,
  onDiscard,
}) {
  if (!isOpen || !session) return null;

  const currentSubtestKey = session.activeSubtests[session.currentSubtestIndex] || 'mental_ability';
  const meta = SUBTEST_METADATA[currentSubtestKey];

  const subtestQuestions = session.activeQuestions.filter(
    (q) => q.subtest === currentSubtestKey
  );
  const totalSubtestItems = subtestQuestions.length;
  const currentItemNumber = (session.currentQuestionIndex || 0) + 1;

  const answeredInSubtest = subtestQuestions.filter(
    (q) => session.userAnswers && session.userAnswers[q.id]
  ).length;

  const totalAnsweredAcrossExam = Object.keys(session.userAnswers || {}).length;
  const totalQuestions = session.activeQuestions.length;

  const formatTime = (secs) => {
    const mins = Math.floor((secs || 0) / 60);
    const rem = (secs || 0) % 60;
    return `${mins}m ${rem < 10 ? '0' : ''}${rem}s`;
  };

  const getSubtestIcon = (key) => {
    switch (key) {
      case 'mental_ability':
        return <Brain className="w-5 h-5 text-amber-400" />;
      case 'english':
        return <BookOpen className="w-5 h-5 text-blue-400" />;
      case 'mathematics':
        return <Calculator className="w-5 h-5 text-red-400" />;
      case 'science':
        return <Atom className="w-5 h-5 text-emerald-400" />;
      default:
        return <Brain className="w-5 h-5 text-amber-400" />;
    }
  };

  const formattedSavedTime = session.lastSavedAt
    ? new Date(session.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Recent';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#141622] border border-amber-500/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/25 shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#11121a]">
                <img
                  src={ustSeal}
                  alt="University of Santo Tomas Official Seal"
                  className="w-full h-full object-cover scale-105"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                  Active Session Found
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  Saved at {formattedSavedTime}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                Resume Previous Mock Exam?
              </h2>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition"
            title="Dismiss popup (session remains saved on Home screen)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Session Status Card */}
        <div className="bg-[#191c2b] border border-amber-500/30 rounded-2xl p-5 space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#21253a] border border-gray-700/60">
                {getSubtestIcon(currentSubtestKey)}
              </div>
              <div>
                <span className="text-xs text-amber-400 font-bold block uppercase tracking-wider">
                  Part {session.currentSubtestIndex + 1} of {session.activeSubtests.length}
                </span>
                <h3 className="text-base font-bold text-white">
                  {meta?.title || 'Active Section'}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-gray-400 block font-medium">Time Left</span>
              <div className="text-base sm:text-lg font-black text-amber-400 font-mono flex items-center gap-1 justify-end">
                <Clock className="w-4 h-4 text-amber-400" />
                {formatTime(session.sectionTimeRemaining)}
              </div>
            </div>
          </div>

          {/* Section Progress details */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800 text-xs">
            <div className="bg-[#11131c] p-2.5 rounded-xl border border-gray-800">
              <span className="text-gray-400 block">Current Question</span>
              <span className="font-bold text-white text-sm">
                Item {currentItemNumber} <span className="text-gray-400 font-normal">/ {totalSubtestItems}</span>
              </span>
              <span className="block text-[10px] text-amber-400 font-mono mt-0.5">{answeredInSubtest} answered in section</span>
            </div>

            <div className="bg-[#11131c] p-2.5 rounded-xl border border-gray-800">
              <span className="text-gray-400 block">Total Exam Progress</span>
              <span className="font-bold text-emerald-400 text-sm">
                {totalAnsweredAcrossExam} <span className="text-gray-400 font-normal">/ {totalQuestions} answered</span>
              </span>
            </div>
          </div>

          <p className="text-[11px] text-gray-300 leading-relaxed">
            Your exact questions, randomized options, answers, flagged items, and remaining countdown timers have been safely restored.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 relative z-10">
          <button
            onClick={onResume}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            Resume Examination Now
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onDismiss}
              className="flex-1 py-2.5 bg-[#1e2230] hover:bg-[#252a3d] border border-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition"
            >
              Continue to Home First
            </button>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to discard this exam session? All answers and timer progress will be lost permanently.')) {
                  onDiscard();
                }
              }}
              className="px-4 py-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-700/60 text-red-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              Discard Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
