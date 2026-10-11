import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Clock,
  Brain,
  BookOpen,
  Calculator,
  Atom,
  Shuffle,
  Layers,
  Award,
  Zap,
  Flame,
  Check,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Filter,
} from 'lucide-react';
import ustSeal from '../assets/ust-seal.jpg';
import { SET_CATALOG, SUBTEST_SPECS } from '../data/setRegistry.js';
import { generateExamSet } from '../utils/questionGenerator.js';

const SUBTEST_ICONS = {
  mental_ability: Brain,
  english: BookOpen,
  mathematics: Calculator,
  science: Atom,
};

export default function QuestionnaireGeneratorModal({
  isOpen,
  initialScope = 'full',
  onClose,
  onLaunchExam,
}) {
  const [scope, setScope] = useState(initialScope); // 'full' | 'mental_ability' | 'english' | 'mathematics' | 'science'
  const [setId, setSetId] = useState('dynamic'); // 'dynamic' | 'set_a' | 'set_b' | 'express'
  const [lengthMode, setLengthMode] = useState('standard'); // 'standard' | 'sprint'
  const [difficultyTier, setDifficultyTier] = useState('all'); // 'all' | 'EASY' | 'MEDIUM' | 'HARD'
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [randomizeChoices, setRandomizeChoices] = useState(true);

  // Sync initial scope if opened from a specific button
  useEffect(() => {
    if (initialScope) {
      setScope(initialScope);
    }
  }, [initialScope, isOpen]);

  // Keyboard escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate live preview counts based on current selections
  let previewItems = 270;
  let previewDuration = 165;

  if (scope === 'full') {
    if (lengthMode === 'sprint') {
      previewItems = 135;
      previewDuration = 90;
    } else if (setId === 'express') {
      previewItems = 60;
      previewDuration = 45;
    } else {
      previewItems = 270;
      previewDuration = 165;
    }
  } else {
    const spec = SUBTEST_SPECS[scope];
    if (spec) {
      if (lengthMode === 'sprint') {
        previewItems = spec.sprintItems;
        previewDuration = spec.sprintMinutes;
      } else {
        previewItems = spec.standardItems;
        previewDuration = spec.standardMinutes;
      }
    }
  }

  const handleGenerate = () => {
    const examBundle = generateExamSet({
      scope,
      setId,
      lengthMode,
      difficultyTier,
      shuffleQuestions,
      randomizeChoices,
    });

    onLaunchExam(examBundle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#12141f] border border-amber-500/50 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden my-auto">
        {/* Ambient Gold Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-28 -mt-28"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/25 shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#11121a]">
                <img
                  src={ustSeal}
                  alt="UST Seal"
                  className="w-full h-full object-cover scale-105"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                  Questionnaire Generator
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  100% Verified Question Bank
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Generate Custom USTET Set
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Configure your mock exam scope, question set source, and testing parameters.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Scope Selection (Full vs Subsets) */}
        <div className="space-y-2 relative z-10">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            1. Select Examination Scope:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setScope('full')}
              className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                scope === 'full'
                  ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10 text-white'
                  : 'bg-[#181a27] border-gray-800/90 text-gray-400 hover:border-gray-700 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  scope === 'full' ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-400'
                }`}>
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Full 4-Part Exam</div>
                  <div className="text-xs text-gray-400">All 4 USTET subtests in official sequence</div>
                </div>
              </div>
              {scope === 'full' && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
            </button>

            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(SUBTEST_SPECS).map(([key, spec]) => {
                const IconComponent = SUBTEST_ICONS[key] || Brain;
                const isSelected = scope === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setScope(key)}
                    className={`p-2 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm'
                        : 'bg-[#181a27] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                    }`}
                  >
                    <IconComponent
                      className="w-4 h-4 shrink-0"
                      style={{ color: isSelected ? '#FBBF24' : spec.color }}
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{spec.title}</div>
                      <div className="text-[10px] text-gray-400 truncate">{spec.standardItems} Items</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 2: Generation Mode / Set Source */}
        <div className="space-y-2 relative z-10">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            2. Choose Question Set / Generation Source:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SET_CATALOG.map((set) => {
              const isSelected = setId === set.id;
              return (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => setSetId(set.id)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-950/40 to-[#181a27] border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-[#181a27] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {set.id === 'dynamic' && (
                    <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      RECOMMENDED
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{set.label}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {set.description}
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-amber-400 font-semibold">{set.badge}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Exam Length & Pace */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              3. Exam Length & Timing:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLengthMode('standard')}
                className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                  lengthMode === 'standard'
                    ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                    : 'bg-[#181a27] border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">Standard Length</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Official USTET Timing</div>
              </button>

              <button
                type="button"
                onClick={() => setLengthMode('sprint')}
                className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                  lengthMode === 'sprint'
                    ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                    : 'bg-[#181a27] border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">Sprint Mode (50%)</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Half Items & Timing</div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              4. Randomization & Anti-Memorization:
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center justify-between p-2 rounded-xl bg-[#181a27] border border-gray-800 cursor-pointer">
                <span className="text-xs text-gray-300">Shuffle Question Order</span>
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="rounded border-gray-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-[#181a27] border border-gray-800 cursor-pointer">
                <span className="text-xs text-gray-300">Randomize Choices (A, B, C, D)</span>
                <input
                  type="checkbox"
                  checked={randomizeChoices}
                  onChange={(e) => setRandomizeChoices(e.target.checked)}
                  className="rounded border-gray-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Live Generated Configuration Summary Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#181a27] to-[#12141f] border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">
                {previewItems} Total Items • {previewDuration} Minutes
              </div>
              <div className="text-[11px] text-gray-400">
                {scope === 'full' ? '4 Sequential Subtests' : `${SUBTEST_SPECS[scope]?.title} Section`} • Strictly No Calculator in Math
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-black/40 border border-gray-800 text-[11px] text-amber-300 font-mono">
              {setId === 'dynamic' ? 'Procedural Seed' : setId.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-800 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/50 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-black shadow-lg shadow-amber-500/25 flex items-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>Generate & Launch Exam</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
