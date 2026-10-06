import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Brain,
  Calculator,
  Atom,
  ChevronDown,
  Filter,
  Check,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Share2,
  BookmarkCheck,
  BarChart3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import MathRenderer from './MathRenderer';
import { UST_PROGRAMS } from '../data/programs';
import { SUBTEST_METADATA } from '../data/mockQuestions';

export default function ResultAnalytics({
  examResults,
  questions,
  onRetakeExam,
  onOpenDrillMode,
}) {
  const [selectedSubtestFilter, setSelectedSubtestFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all'); // 'all' | 'incorrect' | 'correct' | 'flagged'
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState('all'); // 'all' | 'EASY' | 'MEDIUM' | 'HARD'
  const [selectedDreamProgram, setSelectedDreamProgram] = useState(UST_PROGRAMS[1].shortCode); // default BS Nursing

  const {
    userAnswers = {},
    flaggedQuestions = {},
    subtestStats = {},
    totalTimeSeconds = 0,
  } = examResults;

  // Calculate overall metrics
  let totalScore = 0;
  let totalQuestions = questions.length;

  questions.forEach((q) => {
    if (userAnswers[q.id] === q.correctAnswer) {
      totalScore += 1;
    }
  });

  const overallPercentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  // Approximate UST Stanine (1 to 9) and Percentile Rank
  const calculateStanineAndPercentile = (pct) => {
    if (pct >= 90) return { stanine: 9, percentile: 97 };
    if (pct >= 82) return { stanine: 8, percentile: 91 };
    if (pct >= 74) return { stanine: 7, percentile: 83 };
    if (pct >= 65) return { stanine: 6, percentile: 72 };
    if (pct >= 55) return { stanine: 5, percentile: 60 };
    if (pct >= 45) return { stanine: 4, percentile: 48 };
    if (pct >= 35) return { stanine: 3, percentile: 35 };
    if (pct >= 25) return { stanine: 2, percentile: 22 };
    return { stanine: 1, percentile: 10 };
  };

  const overallRating = calculateStanineAndPercentile(overallPercentage);

  // Trigger celebration confetti if score is high
  useEffect(() => {
    if (overallPercentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F1B82D', '#FFFFFF', '#111111', '#FFC72C'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [overallPercentage]);

  // Compute stats per subtest
  const subtestKeys = ['mental_ability', 'english', 'mathematics', 'science'];
  const subtestScores = {};

  subtestKeys.forEach((key) => {
    const sectionQs = questions.filter((q) => q.subtest === key);
    let sectionCorrect = 0;
    sectionQs.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) sectionCorrect += 1;
    });
    const pct = sectionQs.length > 0 ? Math.round((sectionCorrect / sectionQs.length) * 100) : 0;
    const rating = calculateStanineAndPercentile(pct);
    subtestScores[key] = {
      correct: sectionCorrect,
      total: sectionQs.length,
      percentage: pct,
      stanine: rating.stanine,
      percentile: rating.percentile,
    };
  });

  // Filtered review questions
  const filteredQuestions = questions.filter((q) => {
    if (selectedSubtestFilter !== 'all' && q.subtest !== selectedSubtestFilter) return false;
    if (selectedDifficultyFilter !== 'all' && q.difficulty !== selectedDifficultyFilter) return false;

    const isCorrect = userAnswers[q.id] === q.correctAnswer;
    const isFlagged = !!flaggedQuestions[q.id];

    if (selectedStatusFilter === 'incorrect' && isCorrect) return false;
    if (selectedStatusFilter === 'correct' && !isCorrect) return false;
    if (selectedStatusFilter === 'flagged' && !isFlagged) return false;

    return true;
  });

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
        return <Award className="w-5 h-5 text-amber-400" />;
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1c26] via-[#141520] to-[#0e0f17] border border-amber-500/30 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Official USTET Diagnostic Report
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              University of Santo Tomas Mock Exam Results
            </h1>
            <p className="text-gray-400 text-sm max-w-xl">
              Authentic simulation complete. All 4 sections have been scored according to USTET Stanine scaling and normative percentile cutoffs.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#1e2230]/80 border border-gray-700/60 p-5 rounded-2xl backdrop-blur-md">
            <div className="text-center px-4 border-r border-gray-700/70">
              <span className="block text-xs uppercase text-gray-400 tracking-wider font-semibold">Raw Score</span>
              <span className="text-3xl font-black text-amber-400">
                {totalScore} <span className="text-sm font-medium text-gray-400">/ {totalQuestions}</span>
              </span>
            </div>
            <div className="text-center px-4 border-r border-gray-700/70">
              <span className="block text-xs uppercase text-gray-400 tracking-wider font-semibold">Stanine</span>
              <span className="text-3xl font-black text-amber-300">
                {overallRating.stanine} <span className="text-xs font-semibold text-gray-400">/ 9</span>
              </span>
            </div>
            <div className="text-center px-4">
              <span className="block text-xs uppercase text-gray-400 tracking-wider font-semibold">Percentile</span>
              <span className="text-3xl font-black text-emerald-400">
                {overallRating.percentile}th
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-8 pt-6 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Total Exam Duration: <strong className="text-gray-200">{formatTime(totalTimeSeconds)}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRetakeExam}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Full 4-Part Simulation
            </button>
            <button
              onClick={onOpenDrillMode}
              className="px-4 py-2 bg-[#252836] hover:bg-[#2f3346] text-gray-200 border border-gray-700 font-semibold text-xs rounded-xl flex items-center gap-2 transition"
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Target Practice & Tier Drills
            </button>
          </div>
        </div>
      </div>

      {/* Subtests Performance Grid */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Subtest Performance Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subtestKeys.map((key) => {
            const meta = SUBTEST_METADATA[key];
            const stats = subtestScores[key];
            const isStrong = stats.percentage >= 75;
            const isWeak = stats.percentage < 50;

            return (
              <div
                key={key}
                className="bg-[#141620] border border-gray-800/80 rounded-2xl p-5 hover:border-amber-500/40 transition group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-[#1d202e] border border-gray-700/60">
                    {getSubtestIcon(key)}
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      isStrong
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50'
                        : isWeak
                        ? 'bg-red-950/80 text-red-400 border-red-800/50'
                        : 'bg-amber-950/80 text-amber-400 border-amber-800/50'
                    }`}
                  >
                    {isStrong ? 'Exemplary' : isWeak ? 'Needs Review' : 'Competitive'}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition">
                  {meta.title}
                </h3>
                <p className="text-xs text-gray-400 mb-4 line-clamp-1">{meta.subtitle}</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Score</span>
                    <span className="font-bold text-white">
                      {stats.correct} / {stats.total} ({stats.percentage}%)
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-[#202433] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${stats.percentage}%`,
                        backgroundColor: meta.color,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center pt-2 text-xs border-t border-gray-800/60">
                    <span className="text-gray-400">Stanine: <strong className="text-amber-400">{stats.stanine}</strong></span>
                    <span className="text-gray-400">Percentile: <strong className="text-emerald-400">{stats.percentile}th</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* UST Program Cutoff Forecaster */}
      <div className="bg-[#141620] border border-gray-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
              <GraduationCap className="w-4 h-4" />
              UST Admission Predictor
            </div>
            <h2 className="text-xl font-bold text-white">
              Target College & Quota Program Simulator
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Evaluates your calculated subtest percentiles against historic admission cutoffs for competitive programs.
            </p>
          </div>

          {/* Dream Program Selector */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-400 font-medium">Select Target:</label>
            <select
              value={selectedDreamProgram}
              onChange={(e) => setSelectedDreamProgram(e.target.value)}
              className="bg-[#1d202e] border border-amber-500/40 text-amber-300 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              {UST_PROGRAMS.map((prog) => (
                <option key={prog.shortCode} value={prog.shortCode} className="bg-[#141620] text-white">
                  {prog.program} ({prog.tier})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Dream Program Spotlight */}
        {(() => {
          const target = UST_PROGRAMS.find((p) => p.shortCode === selectedDreamProgram) || UST_PROGRAMS[0];
          const mathPass = subtestScores.mathematics.percentile >= target.cutoffs.mathematics;
          const sciPass = subtestScores.science.percentile >= target.cutoffs.science;
          const engPass = subtestScores.english.percentile >= target.cutoffs.english;
          const maPass = subtestScores.mental_ability.percentile >= target.cutoffs.mental_ability;
          const overallPass = overallRating.percentile >= target.cutoffs.overall;

          const allPass = mathPass && sciPass && engPass && maPass && overallPass;
          const nearPass = overallRating.percentile >= target.cutoffs.overall - 10;

          return (
            <div
              className={`p-6 rounded-2xl border transition ${
                allPass
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                  : nearPass
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-100'
                  : 'bg-red-950/20 border-red-500/40 text-red-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded bg-black/40 text-amber-300 border border-amber-500/30">
                    {target.college}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">{target.program}</h3>
                  <p className="text-xs text-gray-300 mt-0.5">{target.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  {allPass ? (
                    <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-xl border border-emerald-500/50 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      PREDICTED PASS (QUALIFIED)
                    </div>
                  ) : nearPass ? (
                    <div className="flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-xl border border-amber-500/50 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      ELIGIBLE FOR RECONSIDERATION
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-xl border border-red-500/50 font-bold text-sm">
                      <XCircle className="w-5 h-5 text-red-400" />
                      DID NOT MEET CUTOFF
                    </div>
                  )}
                </div>
              </div>

              {/* Required vs Actual Table */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 text-xs">
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="block text-gray-400">Mental Ability</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-base font-bold ${maPass ? 'text-emerald-400' : 'text-red-400'}`}>
                      {subtestScores.mental_ability.percentile}th
                    </span>
                    <span className="text-gray-500 font-normal">/ {target.cutoffs.mental_ability}th req</span>
                  </div>
                </div>

                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="block text-gray-400">English</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-base font-bold ${engPass ? 'text-emerald-400' : 'text-red-400'}`}>
                      {subtestScores.english.percentile}th
                    </span>
                    <span className="text-gray-500 font-normal">/ {target.cutoffs.english}th req</span>
                  </div>
                </div>

                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="block text-gray-400">Mathematics</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-base font-bold ${mathPass ? 'text-emerald-400' : 'text-red-400'}`}>
                      {subtestScores.mathematics.percentile}th
                    </span>
                    <span className="text-gray-500 font-normal">/ {target.cutoffs.mathematics}th req</span>
                  </div>
                </div>

                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="block text-gray-400">Science</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-base font-bold ${sciPass ? 'text-emerald-400' : 'text-red-400'}`}>
                      {subtestScores.science.percentile}th
                    </span>
                    <span className="text-gray-500 font-normal">/ {target.cutoffs.science}th req</span>
                  </div>
                </div>

                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
                  <span className="block text-gray-400">Overall Benchmark</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-base font-bold ${overallPass ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {overallRating.percentile}th
                    </span>
                    <span className="text-gray-500 font-normal">/ {target.cutoffs.overall}th req</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Comprehensive Detailed Answer Rationales */}
      <div className="bg-[#141620] border border-gray-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
              <CheckCircle2 className="w-4 h-4" />
              Full Post-Exam Review
            </div>
            <h2 className="text-xl font-bold text-white">
              Answer Keys & Step-by-Step Explanations
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Revealed in full now that all 4 subtests are officially concluded. Review each item's solution to master high-frequency USTET concepts.
            </p>
          </div>

          <span className="text-xs text-gray-400 bg-[#1e2230] px-3 py-1.5 rounded-xl border border-gray-700">
            Showing <strong className="text-white">{filteredQuestions.length}</strong> of {questions.length} items
          </span>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Subtest filter */}
          <div className="flex items-center gap-1.5 bg-[#1b1e2a] p-1 rounded-xl border border-gray-700 text-xs">
            {['all', 'mental_ability', 'english', 'mathematics', 'science'].map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubtestFilter(sub)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  selectedSubtestFilter === sub
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {sub === 'all'
                  ? 'All Subjects'
                  : sub === 'mental_ability'
                  ? 'Mental Ability'
                  : sub === 'english'
                  ? 'English'
                  : sub === 'mathematics'
                  ? 'Math'
                  : 'Science'}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 bg-[#1b1e2a] p-1 rounded-xl border border-gray-700 text-xs">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'incorrect', label: 'Incorrect Only' },
              { id: 'correct', label: 'Correct Only' },
              { id: 'flagged', label: 'Flagged' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  selectedStatusFilter === st.id
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-1.5 bg-[#1b1e2a] p-1 rounded-xl border border-gray-700 text-xs">
            {['all', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficultyFilter(diff)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  selectedDifficultyFilter === diff
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {diff === 'all' ? 'All Tiers' : diff}
              </button>
            ))}
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-6">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No questions match the current filter selection.
            </div>
          ) : (
            filteredQuestions.map((q, idx) => {
              const userAnswer = userAnswers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              const isFlagged = !!flaggedQuestions[q.id];
              const originalIndex = questions.findIndex((item) => item.id === q.id) + 1;

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-6 transition ${
                    isCorrect
                      ? 'bg-[#12171c]/90 border-emerald-500/30'
                      : 'bg-[#1c1317]/90 border-red-500/30'
                  }`}
                >
                  {/* Item Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#222638] text-white flex items-center justify-center font-bold text-xs border border-gray-700">
                        {originalIndex}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black/40 text-gray-300 border border-gray-700">
                        {SUBTEST_METADATA[q.subtest].title}
                      </span>
                      <span className="text-xs text-gray-400">• {q.topic}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          q.difficulty === 'EASY'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : q.difficulty === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                            : 'bg-red-950 text-red-400 border border-red-800/40'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      {isFlagged && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/50">
                          <BookmarkCheck className="w-3 h-3" /> Flagged
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
                          <CheckCircle2 className="w-4 h-4" /> Correct (+1)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-950/80 px-3 py-1 rounded-full border border-red-800">
                          <XCircle className="w-4 h-4" /> Incorrect (0)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stimulus if any */}
                  {q.stimulus && (
                    <div className="mb-4 p-4 rounded-xl bg-black/40 border border-gray-700/60 text-gray-300 text-xs italic leading-relaxed">
                      {q.stimulus}
                    </div>
                  )}

                  {/* Question Stem */}
                  <div className="text-white text-sm sm:text-base font-medium mb-4 leading-relaxed">
                    <MathRenderer content={q.question} />
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                    {q.options.map((opt) => {
                      const isOptionCorrect = opt.id === q.correctAnswer;
                      const isOptionChosen = userAnswer === opt.id;

                      let optStyle = 'bg-[#181b26] border-gray-800 text-gray-300';
                      if (isOptionCorrect) {
                        optStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-semibold ring-1 ring-emerald-500/30';
                      } else if (isOptionChosen && !isCorrect) {
                        optStyle = 'bg-red-950/70 border-red-500 text-red-200 font-semibold ring-1 ring-red-500/30';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-xs sm:text-sm transition ${optStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 font-bold text-xs ${
                              isOptionCorrect
                                ? 'bg-emerald-500 text-black'
                                : isOptionChosen
                                ? 'bg-red-500 text-white'
                                : 'bg-[#252838] text-gray-400'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <div className="flex-1">
                            <MathRenderer content={opt.text} />
                            {isOptionChosen && (
                              <span className="block mt-1 text-[11px] font-bold">
                                {isOptionCorrect ? '(Your Answer - Correct)' : '(Your Answer - Incorrect)'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Step-by-Step Rationale Box */}
                  <div className="p-4 rounded-xl bg-[#0f1118] border border-amber-500/30 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      Detailed USTET Solution & Concept Rationale:
                    </div>
                    <div className="text-gray-300 leading-relaxed">
                      <MathRenderer content={q.explanation} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
