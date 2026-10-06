import React from 'react';
import {
  Clock,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Play,
  Zap,
} from 'lucide-react';
import { UST_PROGRAMS } from '../data/programs';
import { SUBTEST_METADATA } from '../data/mockQuestions';

export default function LandingHero({
  onStartFullExam,
  onStartTierExam,
  onStartSubjectExam,
  onOpenDrillMode,
}) {
  const subtestList = Object.values(SUBTEST_METADATA);

  return (
    <div className="space-y-16 py-6 animate-fade-in">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#181a26] via-[#12131d] to-[#0c0d14] border border-amber-500/30 p-8 sm:p-14 shadow-2xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            University of Santo Tomas Entrance Test (USTET) Full Simulation
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">USTET</span> With Complete Mock Sets
          </h1>

          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Experience authentic USTET testing with full multi-item sections, strict sequential section locking, no-calculator rules in Mathematics, and instant Stanine cutoff evaluation.
          </p>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              onClick={onStartFullExam}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-base rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 mx-auto transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Begin Full 4-Part USTET Exam (All Items)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dedicated Tier Exam Buttons */}
          <div className="pt-4 border-t border-gray-800/80">
            <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-3">
              Or Choose a Complete Difficulty Mock Set:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onStartTierExam('EASY')}
                className="px-5 py-2.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-2 transition"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Complete EASY Mock Set (All 4 Subjects)
              </button>

              <button
                onClick={() => onStartTierExam('MEDIUM')}
                className="px-5 py-2.5 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/50 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-2 transition"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Complete MEDIUM Mock Set (All 4 Subjects)
              </button>

              <button
                onClick={() => onStartTierExam('HARD')}
                className="px-5 py-2.5 bg-red-950/60 hover:bg-red-900/80 border border-red-500/50 text-red-300 font-bold text-xs rounded-xl flex items-center gap-2 transition"
              >
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                Complete HARD Mock Set (All 4 Subjects)
              </button>

              <button
                onClick={onOpenDrillMode}
                className="px-5 py-2.5 bg-[#1b1e2e] hover:bg-[#252a3f] border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-2 transition"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Custom Practice Drill
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Subtests Overview & Subject-Specific Launchers */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            The 4 USTET Examination Subtests
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Click on any subtest card below to take a dedicated full-length subject examination:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {subtestList.map((sub, idx) => {
            return (
              <div
                key={sub.id}
                onClick={() => onStartSubjectExam(sub.id)}
                className="bg-[#141620] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/60 hover:bg-[#1a1d2b] transition cursor-pointer flex flex-col justify-between"
              >
                <div>
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
                </div>

                <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-semibold group-hover:underline flex items-center gap-1">
                    <Play className="w-3 h-3 fill-current" />
                    Take Subject Exam
                  </span>
                  <span className="text-gray-400 text-[11px]">Easy • Med • Hard</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Protocol Rules */}
      <section className="bg-[#131520] border border-gray-800/80 rounded-3xl p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Authentic USTET Testing Protocols</h2>
            <p className="text-xs text-gray-400">Strict examination rules enforced by this simulator:</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              No Calculator Allowed
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Calculators are strictly prohibited in the USTET. A digital scratchpad is integrated for handwriting steps and notes.
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
              Correct answers and step-by-step explanations remain concealed until all 4 parts are finalized.
            </p>
          </div>
        </div>
      </section>

      {/* Program Cutoffs Preview */}
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
              {UST_PROGRAMS.map((prog) => (
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
