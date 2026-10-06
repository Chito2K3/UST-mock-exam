import React from 'react';
import {
  Brain,
  BookOpen,
  Calculator,
  Atom,
  Clock,
  ShieldCheck,
  Award,
  Zap,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { UST_PROGRAMS } from '../data/programs';
import { SUBTEST_METADATA } from '../data/mockQuestions';

export default function LandingHero({ onStartFullExam, onOpenDrillMode }) {
  const subtestList = Object.values(SUBTEST_METADATA);

  return (
    <div className="space-y-16 py-6 animate-fade-in">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#181a26] via-[#12131d] to-[#0c0d14] border border-amber-500/30 p-8 sm:p-14 shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            University of Santo Tomas Entrance Test Simulator
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">USTET</span> with Authentic Simulation
          </h1>

          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Experience the pace, difficulty, and strict section-locking of the actual UST Entrance Exam. Complete with Easy, Medium, and Hard tiered items, no-calculator math enforcement, and instant Stanine cutoff forecasting.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartFullExam}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-sm rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5"
            >
              <span>Begin Full 4-Part USTET Simulation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenDrillMode}
              className="w-full sm:w-auto px-6 py-4 bg-[#1e2232] hover:bg-[#272c40] border border-gray-700/80 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2.5 transition"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Targeted Practice Drills</span>
            </button>
          </div>

          {/* Highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Strict Section-Locking Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pacing Alert (&lt;45s/item)</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Historical Program Cutoffs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Subtests Overview Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            The 4 USTET Examination Subtests
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            USTET administers 4 distinct timed sections. In this simulator, each section is sealed upon completion.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {subtestList.map((sub, idx) => {
            return (
              <div
                key={sub.id}
                className="bg-[#141620] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                    Part {idx + 1}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{sub.defaultDurationMinutes} mins</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition mb-1">
                  {sub.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  {sub.subtitle}
                </p>

                <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Difficulty: <strong>Easy • Med • Hard</strong></span>
                  <span className="text-amber-400 font-semibold">{sub.totalTargetItems} Curated Items</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Exam Simulation Protocol Rules */}
      <section className="bg-[#131520] border border-gray-800/80 rounded-3xl p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Authentic USTET Testing Protocols</h2>
            <p className="text-xs text-gray-400">Rules applied during your full mock examination session:</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              No Calculator Allowed
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Calculators are strictly prohibited in the physical USTET. A digital scratchpad with handwriting drawing & text notes is provided for manual arithmetic and scratch work.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Irreversible Section Locking
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Once you finish a subtest (or when its time expires), it is sealed. You cannot flip back to previous sections or jump ahead to other subjects.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              End-of-Exam Rationale Reveal
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Correct answers and detailed explanations remain concealed until all 4 parts are finalized, ensuring uncompromised testing realism.
            </p>
          </div>
        </div>
      </section>

      {/* UST Quota Programs Cutoff Benchmarks Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              UST Admission Benchmark Cutoffs
            </h2>
            <p className="text-xs text-gray-400">
              Target percentile standards for flagship Thomasian programs:
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#141620]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1a1d2b] text-gray-300 uppercase tracking-wider text-[10px] border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">College / Faculty</th>
                <th className="py-3 px-4">Flagship Program</th>
                <th className="py-3 px-4 text-center">Mental Ability</th>
                <th className="py-3 px-4 text-center">English</th>
                <th className="py-3 px-4 text-center">Math</th>
                <th className="py-3 px-4 text-center">Science</th>
                <th className="py-3 px-4 text-center">Overall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {UST_PROGRAMS.slice(0, 6).map((prog) => (
                <tr key={prog.shortCode} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 px-4 font-semibold text-white">{prog.college}</td>
                  <td className="py-3 px-4 text-amber-300 font-medium">
                    {prog.program}
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {prog.tier}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">{prog.cutoffs.mental_ability}+</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">{prog.cutoffs.english}+</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">{prog.cutoffs.mathematics}+</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">{prog.cutoffs.science}+</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-amber-400">{prog.cutoffs.overall}+</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
