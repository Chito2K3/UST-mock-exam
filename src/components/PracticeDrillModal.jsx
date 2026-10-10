import React, { useState } from 'react';
import { X, Target, Zap, BookOpen, Brain, Calculator, Atom, Shuffle } from 'lucide-react';

export default function PracticeDrillModal({ isOpen, onClose, onStartDrill }) {
  const [selectedSubtest, setSelectedSubtest] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [itemLimit, setItemLimit] = useState('all'); // '15', '30', 'all'
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [randomizeChoices, setRandomizeChoices] = useState(true);

  if (!isOpen) return null;

  const handleStart = () => {
    onStartDrill({
      subtest: selectedSubtest,
      difficulty: selectedDifficulty,
      itemLimit,
      shuffleQuestions,
      randomizeChoices,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#141622] border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 my-auto">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Targeted Practice Drills</h3>
              <p className="text-xs text-gray-400">Isolate specific subjects or difficulty tiers for focused study.</p>
            </div>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtest Selection */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
            1. Select Subject Focus:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'all', label: 'All 4 Subjects', icon: Target },
              { id: 'mental_ability', label: 'Mental Ability', icon: Brain },
              { id: 'english', label: 'English', icon: BookOpen },
              { id: 'mathematics', label: 'Mathematics', icon: Calculator },
              { id: 'science', label: 'Science', icon: Atom },
            ].map((sub) => {
              const Icon = sub.icon;
              const isSelected = selectedSubtest === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubtest(sub.id)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                      : 'bg-[#1a1d2b] border-gray-800 text-gray-300 hover:bg-[#222638]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{sub.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Tier Selection */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
            2. Select Difficulty Tier:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'all', label: 'All Tiers', color: 'text-white' },
              { id: 'EASY', label: 'Easy', color: 'text-emerald-400' },
              { id: 'MEDIUM', label: 'Medium', color: 'text-amber-400' },
              { id: 'HARD', label: 'Hard', color: 'text-red-400' },
            ].map((diff) => {
              const isSelected = selectedDifficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition ${
                    isSelected
                      ? 'bg-amber-500 text-black border-amber-400 shadow'
                      : 'bg-[#1a1d2b] border-gray-800 text-gray-300 hover:bg-[#222638]'
                  }`}
                >
                  {diff.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drill Length */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
            3. Drill Item Count:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '15', label: '15 Questions', desc: '~15 mins' },
              { id: '30', label: '30 Questions', desc: '~30 mins' },
              { id: 'all', label: 'All Available Items', desc: 'Full pool' },
            ].map((cnt) => (
              <button
                key={cnt.id}
                onClick={() => setItemLimit(cnt.id)}
                className={`p-2 rounded-xl border text-center transition ${
                  itemLimit === cnt.id
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-[#1a1d2b] border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className="block text-xs font-bold text-white">{cnt.label}</span>
                <span className="block text-[10px] text-gray-400">{cnt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Randomization Options */}
        <div className="p-3 rounded-2xl bg-[#191c2b] border border-gray-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
            <Shuffle className="w-3.5 h-3.5" />
            Randomization Settings
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-3.5 h-3.5 text-amber-500 rounded bg-gray-900 border-gray-700 focus:ring-amber-400"
              />
              <span className="text-gray-300 text-xs">Shuffle Questions</span>
            </label>
            <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={randomizeChoices}
                onChange={(e) => setRandomizeChoices(e.target.checked)}
                className="w-3.5 h-3.5 text-amber-500 rounded bg-gray-900 border-gray-700 focus:ring-amber-400"
              />
              <span className="text-gray-300 text-xs">Shuffle Choices (A–D)</span>
            </label>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            onClick={handleStart}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            Launch Practice Session
          </button>
        </div>
      </div>
    </div>
  );
}
