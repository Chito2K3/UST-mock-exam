import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Send,
  PenTool,
  Brain,
  BookOpen,
  Calculator,
  Atom,
  ShieldAlert,
  RotateCcw,
  Check,
  Lock,
  Info,
} from 'lucide-react';
import MathRenderer from './MathRenderer';
import ScratchpadModal from './ScratchpadModal';
import { SUBTEST_METADATA } from '../data/mockQuestions';

export default function ExamEngine({
  questions,
  activeSubtests = ['mental_ability', 'english', 'mathematics', 'science'],
  onFinishExam,
  onExitExam,
  isDrillMode = false,
}) {
  // State for subtest and active question
  const [currentSubtestIndex, setCurrentSubtestIndex] = useState(0);
  const currentSubtestKey = activeSubtests[currentSubtestIndex];
  const currentSubtestMeta = SUBTEST_METADATA[currentSubtestKey];

  // Filter questions for the current subtest
  const subtestQuestions = questions.filter((q) => q.subtest === currentSubtestKey);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = subtestQuestions[currentQuestionIndex];

  // User answers and flags
  const [userAnswers, setUserAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('ustet_user_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [flaggedQuestions, setFlaggedQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('ustet_flagged');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Timers: Section timer (countdown) & Question pacing timer
  const [sectionTimeRemaining, setSectionTimeRemaining] = useState(
    (currentSubtestMeta?.defaultDurationMinutes || 15) * 60
  );
  const [questionPaceSeconds, setQuestionPaceSeconds] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  // Modals
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [showSectionSubmitConfirm, setShowSectionSubmitConfirm] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  // Calculate Halfway thresholds and status
  const totalExamQuestionsCount = questions.length;
  const totalAnsweredAcrossExam = Object.keys(userAnswers).filter((id) =>
    questions.some((q) => q.id === id)
  ).length;
  const halfwayThreshold = Math.ceil(totalExamQuestionsCount / 2);
  const isHalfwayBySection =
    activeSubtests.length > 1 && currentSubtestIndex >= Math.ceil(activeSubtests.length / 2);
  const isHalfwayByAnswers = totalAnsweredAcrossExam >= halfwayThreshold;
  const isPastHalfway = isHalfwayBySection || isHalfwayByAnswers;
  const isNearingHalfway =
    !isPastHalfway && totalAnsweredAcrossExam >= Math.floor(halfwayThreshold * 0.8);

  // Synchronize localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ustet_user_answers', JSON.stringify(userAnswers));
      localStorage.setItem('ustet_flagged', JSON.stringify(flaggedQuestions));
    } catch {
      // Ignore
    }
  }, [userAnswers, flaggedQuestions]);

  // Section timer effect
  useEffect(() => {
    setSectionTimeRemaining((currentSubtestMeta?.defaultDurationMinutes || 15) * 60);
  }, [currentSubtestIndex, currentSubtestMeta]);

  useEffect(() => {
    if (showRestartConfirm) return;

    const timer = setInterval(() => {
      setSectionTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitSection();
          return 0;
        }
        return prev - 1;
      });

      setQuestionPaceSeconds((prev) => prev + 1);
      setTotalTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSubtestIndex, showRestartConfirm]);

  // Reset pacing timer when question changes
  useEffect(() => {
    setQuestionPaceSeconds(0);
  }, [currentQuestionIndex]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isScratchpadOpen || showSectionSubmitConfirm || showRestartConfirm) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentQuestionIndex < subtestQuestions.length - 1) {
          handleNextQuestion();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentQuestionIndex > 0) {
          handlePrevQuestion();
        }
      } else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key)) {
        handleSelectOption(e.key.toUpperCase());
      } else if (e.key === 'f' || e.key === 'F') {
        handleToggleFlag();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, subtestQuestions.length, isScratchpadOpen, showSectionSubmitConfirm, showRestartConfirm, currentQuestion]);

  const handleSelectOption = (optionId) => {
    if (!currentQuestion) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < subtestQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Section Advancement (USTET strict locking)
  const handleAutoSubmitSection = () => {
    advanceToNextSection();
  };

  const advanceToNextSection = () => {
    setShowSectionSubmitConfirm(false);
    if (currentSubtestIndex < activeSubtests.length - 1) {
      setCurrentSubtestIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Final Section completed! Finish exam
      finishEntireExam();
    }
  };

  const finishEntireExam = () => {
    // Clear in-flight exam storage
    try {
      localStorage.removeItem('ustet_user_answers');
      localStorage.removeItem('ustet_flagged');
    } catch {
      // Ignore
    }

    onFinishExam({
      userAnswers,
      flaggedQuestions,
      totalTimeSeconds: totalTimeSpent,
    });
  };

  // Restart Examination (Permitted only before halfway point)
  const handleRestartExam = () => {
    try {
      localStorage.removeItem('ustet_user_answers');
      localStorage.removeItem('ustet_flagged');
    } catch {
      // Ignore
    }

    setUserAnswers({});
    setFlaggedQuestions({});
    setCurrentSubtestIndex(0);
    setCurrentQuestionIndex(0);
    const firstSubtestKey = activeSubtests[0];
    const firstSubtestMeta = SUBTEST_METADATA[firstSubtestKey];
    setSectionTimeRemaining((firstSubtestMeta?.defaultDurationMinutes || 15) * 60);
    setQuestionPaceSeconds(0);
    setTotalTimeSpent(0);
    setShowRestartConfirm(false);
  };

  // Formatting helpers
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSubtestIcon = (key) => {
    switch (key) {
      case 'mental_ability':
        return <Brain className="w-4 h-4" />;
      case 'english':
        return <BookOpen className="w-4 h-4" />;
      case 'mathematics':
        return <Calculator className="w-4 h-4" />;
      case 'science':
        return <Atom className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const answeredCount = subtestQuestions.filter((q) => userAnswers[q.id]).length;
  const isTimeCritical = sectionTimeRemaining < 120; // less than 2 mins

  return (
    <div className="min-h-screen bg-[#0d0e14] flex flex-col text-gray-200">
      {/* Top Test Header */}
      <header className="sticky top-0 z-40 bg-[#13151f]/95 backdrop-blur border-b border-gray-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* UST Emblem & Section Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-black font-black flex items-center justify-center text-sm shadow-md shadow-amber-500/20">
              UST
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                  {getSubtestIcon(currentSubtestKey)}
                  {currentSubtestMeta?.title}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Part {currentSubtestIndex + 1} of {activeSubtests.length}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                Strict Section Locking: Answers are permanently sealed upon advancing.
              </p>
            </div>
          </div>

          {/* Section Timer & Action Controls */}
          <div className="flex items-center gap-3">
            {/* Pacing Alert */}
            {questionPaceSeconds > 45 && (
              <div className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/70 border border-amber-800/60 px-2.5 py-1 rounded-lg animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                Pacing Alert: {questionPaceSeconds}s on item
              </div>
            )}

            {/* Scratchpad Button */}
            <button
              onClick={() => setIsScratchpadOpen(true)}
              className="px-3 py-1.5 bg-[#1e2230] hover:bg-[#282d3f] border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Open scratchpad for calculations"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scratchpad</span>
            </button>

            {/* Restart Button with Pre-Click Halfway Rule Notification */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (!isPastHalfway) {
                    setShowRestartConfirm(true);
                  }
                }}
                disabled={isPastHalfway}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isPastHalfway
                    ? 'bg-gray-800/30 text-gray-500 border border-gray-800 cursor-not-allowed opacity-60'
                    : isNearingHalfway
                    ? 'bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500 text-amber-300 shadow-sm shadow-amber-500/20'
                    : 'bg-[#1e2230] hover:bg-red-950/40 border border-gray-700 hover:border-red-500/50 text-gray-300 hover:text-red-300'
                }`}
                aria-label="Restart Examination"
              >
                {isPastHalfway ? (
                  <Lock className="w-3.5 h-3.5 text-gray-500" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="hidden sm:inline">
                  {isPastHalfway ? 'Restart Locked' : 'Restart Test'}
                </span>
                {isNearingHalfway && !isPastHalfway && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                )}
              </button>

              {/* Pre-Click Notification Tooltip Popup */}
              <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#151724] border border-amber-500/40 rounded-xl shadow-2xl text-[11px] text-gray-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                  <Info className="w-3.5 h-3.5" />
                  Halfway Restart Rule
                </div>
                <p className="leading-relaxed text-gray-300">
                  You can restart the test and reset the clock only during the <strong>first half</strong> (Parts 1–2 or under 50% answered).
                </p>
                <div className="mt-2 pt-2 border-t border-gray-800 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-gray-400">Status:</span>
                  {isPastHalfway ? (
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Locked (&gt;50%)
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold">
                      ✓ Available ({totalAnsweredAcrossExam}/{halfwayThreshold} items)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm ${
                isTimeCritical
                  ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                  : 'bg-[#1a1c28] border-gray-700 text-gray-100'
              }`}
            >
              <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-red-400' : 'text-amber-400'}`} />
              <span>{formatTime(sectionTimeRemaining)}</span>
            </div>

            {/* Exit Practice (if in drill mode) */}
            {isDrillMode && (
              <button
                onClick={onExitExam}
                className="text-xs text-gray-400 hover:text-white px-2 py-1"
              >
                Exit
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center Column: Question Stem & Options (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {currentQuestion ? (
            <div className="bg-[#141620] border border-gray-800/90 rounded-2xl p-6 sm:p-8 flex-1 flex flex-col justify-between shadow-xl">
              <div>
                {/* Question Metadata Bar */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      Question {currentQuestionIndex + 1} of {subtestQuestions.length}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-xs text-gray-400">{currentQuestion.topic}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        currentQuestion.difficulty === 'EASY'
                          ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
                          : currentQuestion.difficulty === 'MEDIUM'
                          ? 'bg-amber-950/70 text-amber-400 border border-amber-800/40'
                          : 'bg-red-950/70 text-red-400 border border-red-800/40'
                      }`}
                    >
                      {currentQuestion.difficulty}
                    </span>
                  </div>

                  {/* Top Action Controls: Quick Prev/Next + Flag */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="px-2.5 py-1 rounded-lg bg-[#1c1f2e] hover:bg-[#282d3f] text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1 transition border border-gray-700/60"
                      title="Previous Question (Left Arrow)"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Prev
                    </button>

                    {currentQuestionIndex < subtestQuestions.length - 1 ? (
                      <button
                        onClick={handleNextQuestion}
                        className="px-3.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-1 transition shadow-sm"
                        title="Next Question (Right Arrow or Enter)"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowSectionSubmitConfirm(true)}
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center gap-1 transition"
                      >
                        Submit
                        <Send className="w-3 h-3" />
                      </button>
                    )}

                    {/* Flag / Bookmark Button */}
                    <button
                      onClick={handleToggleFlag}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        flaggedQuestions[currentQuestion.id]
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                          : 'text-gray-400 hover:text-gray-200 bg-[#1c1f2e]'
                      }`}
                      title="Flag for Review (F)"
                    >
                      {flaggedQuestions[currentQuestion.id] ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden sm:inline">Flagged</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Flag</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Stimulus Passage if available */}
                {currentQuestion.stimulus && (
                  <div className="mb-4 p-4 rounded-xl bg-[#0f1118] border border-gray-800 text-gray-300 text-xs sm:text-sm italic leading-relaxed">
                    {currentQuestion.stimulus}
                  </div>
                )}

                {/* Question Content */}
                <div className="text-white text-base sm:text-lg font-medium leading-relaxed mb-5">
                  <MathRenderer content={currentQuestion.question} />
                </div>

                {/* Options List */}
                <div className="space-y-2.5 sm:space-y-3 pb-4">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = userAnswers[currentQuestion.id] === opt.id;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border flex items-start gap-3.5 transition group ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-amber-200 ring-1 ring-amber-500/40'
                            : 'bg-[#181b26] border-gray-800/90 text-gray-300 hover:bg-[#1f2332] hover:border-gray-700'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition ${
                            isSelected
                              ? 'bg-amber-500 text-black shadow-md'
                              : 'bg-[#252838] text-gray-400 group-hover:text-white'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <div className="text-xs sm:text-sm font-medium flex-1 pt-0.5">
                          <MathRenderer content={opt.text} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Navigation Buttons (Sticky Bar - Always Visible Without Scrolling) */}
              <div className="sticky bottom-0 z-20 mt-4 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 px-6 sm:px-8 py-3 bg-[#11131c]/95 backdrop-blur-md border-t border-gray-800 rounded-b-2xl shadow-2xl flex items-center justify-between gap-3">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 rounded-xl bg-[#1c1f2e] text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1.5 transition border border-gray-700/60"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2 text-xs">
                  {userAnswers[currentQuestion.id] ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Answer recorded
                    </span>
                  ) : (
                    <span className="text-gray-400">Not yet answered</span>
                  )}
                  <span className="hidden md:inline text-gray-400 text-[11px] font-mono">
                    [Keys: A-D | ←/→]
                  </span>
                </div>

                {currentQuestionIndex < subtestQuestions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSectionSubmitConfirm(true)}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    Complete Section
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">No questions available.</div>
          )}
        </div>

        {/* Right Column: Question Navigator & Section Progress (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#141620] border border-gray-800/90 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Section Question Palette</span>
              <span className="text-amber-400">
                {answeredCount} / {subtestQuestions.length} Done
              </span>
            </h3>

            {/* Question Badges Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2 mb-4">
              {subtestQuestions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered = !!userAnswers[q.id];
                const isFlagged = !!flaggedQuestions[q.id];

                let btnStyle = 'bg-[#1b1e2a] text-gray-400 border-gray-800 hover:border-gray-600';
                if (isCurrent) {
                  btnStyle = 'ring-2 ring-amber-400 bg-amber-500/20 text-amber-300 font-bold border-amber-500';
                } else if (isAnswered) {
                  btnStyle = 'bg-amber-500/80 text-black font-bold border-amber-500';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`relative h-10 rounded-xl border text-xs flex items-center justify-center font-medium transition ${btnStyle}`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-[#141620]"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-gray-800/80 grid grid-cols-2 gap-2 text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#1b1e2a] border border-gray-700 inline-block"></span>
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded ring-2 ring-amber-400 bg-amber-500/20 inline-block"></span>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                <span>Flagged</span>
              </div>
            </div>

            {/* Section Lock & Halfway Rule Notice */}
            <div className="mt-5 p-3 rounded-xl bg-amber-950/30 border border-amber-700/40 text-[11px] text-amber-300 flex flex-col gap-2.5">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  <strong>Strict Section Locking:</strong> Answers are permanently sealed upon advancing or time expiry.
                </span>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-amber-800/40 text-gray-300">
                {isPastHalfway ? (
                  <Lock className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                ) : (
                  <RotateCcw className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                )}
                <div>
                  <strong className="text-amber-300">Halfway Restart Policy:</strong> Resetting the mock test & clock is permitted <em>only</em> during the first half (Parts 1–2 / &lt;{halfwayThreshold} answered). Once halfway is crossed, restart is permanently locked.
                  <div className="mt-1 text-[10px] font-mono">
                    Eligibility:{' '}
                    {isPastHalfway ? (
                      <span className="text-red-400 font-bold">🔒 Locked (Past 50%)</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">
                        ✓ Active ({totalAnsweredAcrossExam}/{halfwayThreshold} answered)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Section Button */}
            <button
              onClick={() => setShowSectionSubmitConfirm(true)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#1f2334] hover:bg-amber-500 hover:text-black text-amber-300 border border-amber-500/40 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              {currentSubtestIndex < activeSubtests.length - 1
                ? 'Submit & Advance to Next Part'
                : 'Finalize & Submit Entire UST Exam'}
            </button>
          </div>
        </div>
      </main>

      {/* Confirmation Modal for Submitting Current Section */}
      {showSectionSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#141622] border border-amber-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">
                Submit {currentSubtestMeta?.title}?
              </h3>
              <p className="text-xs text-gray-300">
                You have answered <strong className="text-amber-400">{answeredCount}</strong> of{' '}
                <strong className="text-white">{subtestQuestions.length}</strong> items.
              </p>
              {subtestQuestions.length - answeredCount > 0 && (
                <p className="text-xs text-red-400 font-semibold">
                  Warning: You have {subtestQuestions.length - answeredCount} unanswered questions in this section!
                </p>
              )}
              <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-800">
                Once submitted, this section will be permanently locked and answers cannot be modified.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSectionSubmitConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-[#202436] hover:bg-[#2b3048] text-gray-300 text-xs font-semibold transition"
              >
                Return to Questions
              </button>
              <button
                onClick={advanceToNextSection}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition shadow-lg shadow-amber-500/20"
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Restarting Mock Exam & Resetting Clock */}
      {showRestartConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#141622] border border-amber-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">
                Restart Mock Exam & Reset Clock?
              </h3>
              <p className="text-xs text-gray-300">
                This will reset your examination progress, clear all recorded answers, restore section timers, and return to Question 1 of Part 1.
              </p>
              
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-700/50 text-[11px] text-amber-200 text-left space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Halfway Rule Reminder:
                </div>
                <p>
                  You are currently eligible to restart ({totalAnsweredAcrossExam} of {halfwayThreshold} answers allowed before lock). Once you reach Part 3 or exceed 50% answers, restart will be permanently sealed.
                </p>
              </div>

              <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-800">
                Exam timer is currently paused while this dialog is open.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowRestartConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#202436] hover:bg-[#2b3048] text-gray-300 text-xs font-semibold transition"
              >
                Resume Current Exam
              </button>
              <button
                onClick={handleRestartExam}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/30"
              >
                Confirm & Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scratchpad Modal */}
      <ScratchpadModal isOpen={isScratchpadOpen} onClose={() => setIsScratchpadOpen(false)} />
    </div>
  );
}
