import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Home,
  Save,
  CheckCircle,
} from 'lucide-react';
import MathRenderer from './MathRenderer';
import ScratchpadModal from './ScratchpadModal';
import { SUBTEST_METADATA } from '../data/mockQuestions';
import { saveActiveSession, clearActiveSession } from '../utils/sessionStorage';
import ustSeal from '../assets/ust-seal.jpg';

export default function ExamEngine({
  questions,
  activeSubtests = ['mental_ability', 'english', 'mathematics', 'science'],
  onFinishExam,
  onExitExam,
  initialSessionState = null,
  examMetadata = {},
}) {
  // State for subtest and active question
  const [currentSubtestIndex, setCurrentSubtestIndex] = useState(() => {
    return initialSessionState?.currentSubtestIndex ?? 0;
  });

  const currentSubtestKey = activeSubtests[currentSubtestIndex] || activeSubtests[0];
  const currentSubtestMeta = SUBTEST_METADATA[currentSubtestKey];

  // Filter questions for the current subtest
  const subtestQuestions = questions.filter((q) => q.subtest === currentSubtestKey);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const idx = initialSessionState?.currentQuestionIndex ?? 0;
    return idx < subtestQuestions.length ? idx : 0;
  });

  const currentQuestion = subtestQuestions[currentQuestionIndex];

  // User answers and flags
  const [userAnswers, setUserAnswers] = useState(() => {
    return initialSessionState?.userAnswers ?? {};
  });

  const [flaggedQuestions, setFlaggedQuestions] = useState(() => {
    return initialSessionState?.flaggedQuestions ?? {};
  });

  // Timers: Section timer (countdown) & Question pacing timer
  const [sectionTimeRemaining, setSectionTimeRemaining] = useState(() => {
    if (initialSessionState?.sectionTimeRemaining !== undefined && initialSessionState.sectionTimeRemaining > 0) {
      return initialSessionState.sectionTimeRemaining;
    }
    return (currentSubtestMeta?.defaultDurationMinutes || 15) * 60;
  });

  const [questionPaceSeconds, setQuestionPaceSeconds] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(() => {
    return initialSessionState?.totalTimeSpent ?? 0;
  });

  // Modals
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [showSectionSubmitConfirm, setShowSectionSubmitConfirm] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showSaveAndExitConfirm, setShowSaveAndExitConfirm] = useState(false);
  const [showHomeExitConfirm, setShowHomeExitConfirm] = useState(false);

  // References to keep latest values inside tickers & unmount saves
  const latestStateRef = useRef({
    currentSubtestIndex,
    currentQuestionIndex,
    sectionTimeRemaining,
    totalTimeSpent,
    userAnswers,
    flaggedQuestions,
  });

  useEffect(() => {
    latestStateRef.current = {
      currentSubtestIndex,
      currentQuestionIndex,
      sectionTimeRemaining,
      totalTimeSpent,
      userAnswers,
      flaggedQuestions,
    };
  }, [
    currentSubtestIndex,
    currentQuestionIndex,
    sectionTimeRemaining,
    totalTimeSpent,
    userAnswers,
    flaggedQuestions,
  ]);

  // Centralized Session Saver
  const persistSession = useCallback((overrides = {}) => {
    const s = { ...latestStateRef.current, ...overrides };
    saveActiveSession({
      examMode: examMetadata.examMode || 'full',
      setName: examMetadata.setName || 'USTET Simulation',
      activeQuestions: questions,
      activeSubtests,
      currentSubtestIndex: s.currentSubtestIndex,
      currentQuestionIndex: s.currentQuestionIndex,
      sectionTimeRemaining: s.sectionTimeRemaining,
      totalTimeSpent: s.totalTimeSpent,
      userAnswers: s.userAnswers,
      flaggedQuestions: s.flaggedQuestions,
    });
  }, [examMetadata, questions, activeSubtests]);

  // Save immediately when answers or flags change
  useEffect(() => {
    persistSession();
  }, [userAnswers, flaggedQuestions, currentSubtestIndex, currentQuestionIndex, persistSession]);

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

  // Navigation and action handlers
  const handleSelectOption = useCallback((optionId) => {
    if (!currentQuestion) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  }, [currentQuestion]);

  const handleToggleFlag = useCallback(() => {
    if (!currentQuestion) return;
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  }, [currentQuestion]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < subtestQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionPaceSeconds(0);
    }
  }, [currentQuestionIndex, subtestQuestions.length]);

  const handlePrevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setQuestionPaceSeconds(0);
    }
  }, [currentQuestionIndex]);

  const handleJumpToQuestion = useCallback((index) => {
    setCurrentQuestionIndex(index);
    setQuestionPaceSeconds(0);
  }, []);

  const finishEntireExam = useCallback(() => {
    // Clear in-flight active exam storage
    clearActiveSession();

    onFinishExam({
      userAnswers,
      flaggedQuestions,
      totalTimeSeconds: totalTimeSpent,
    });
  }, [onFinishExam, userAnswers, flaggedQuestions, totalTimeSpent]);

  const advanceToNextSection = useCallback(() => {
    setShowSectionSubmitConfirm(false);
    if (currentSubtestIndex < activeSubtests.length - 1) {
      const nextIndex = currentSubtestIndex + 1;
      const nextSubtestKey = activeSubtests[nextIndex];
      const nextMeta = SUBTEST_METADATA[nextSubtestKey];
      const nextRemaining = (nextMeta?.defaultDurationMinutes || 15) * 60;
      setCurrentSubtestIndex(nextIndex);
      setCurrentQuestionIndex(0);
      setQuestionPaceSeconds(0);
      setSectionTimeRemaining(nextRemaining);

      // Persist the transition to next section
      persistSession({
        currentSubtestIndex: nextIndex,
        currentQuestionIndex: 0,
        sectionTimeRemaining: nextRemaining,
      });
    } else {
      // Final Section completed! Finish exam
      finishEntireExam();
    }
  }, [currentSubtestIndex, activeSubtests, finishEntireExam, persistSession]);

  // Restart Examination (Permitted only before halfway point)
  const handleRestartExam = () => {
    clearActiveSession();

    setUserAnswers({});
    setFlaggedQuestions({});
    setCurrentSubtestIndex(0);
    setCurrentQuestionIndex(0);
    const firstSubtestKey = activeSubtests[0];
    const firstSubtestMeta = SUBTEST_METADATA[firstSubtestKey];
    const initialTime = (firstSubtestMeta?.defaultDurationMinutes || 15) * 60;
    setSectionTimeRemaining(initialTime);
    setQuestionPaceSeconds(0);
    setTotalTimeSpent(0);
    setShowRestartConfirm(false);

    persistSession({
      currentSubtestIndex: 0,
      currentQuestionIndex: 0,
      sectionTimeRemaining: initialTime,
      totalTimeSpent: 0,
      userAnswers: {},
      flaggedQuestions: {},
    });
  };

  const advanceToNextSectionRef = useRef(advanceToNextSection);
  useEffect(() => {
    advanceToNextSectionRef.current = advanceToNextSection;
  });

  // Section timer tick & Periodic auto-save (every 4s)
  const isPaused = showRestartConfirm || showSaveAndExitConfirm || showHomeExitConfirm;

  useEffect(() => {
    if (isPaused) return;

    let tickCount = 0;
    const timer = setInterval(() => {
      setSectionTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            advanceToNextSectionRef.current();
          }, 0);
          return 0;
        }
        return prev - 1;
      });

      setQuestionPaceSeconds((prev) => prev + 1);
      setTotalTimeSpent((prev) => prev + 1);

      tickCount += 1;
      // Periodic background sync of remaining seconds every 4 seconds
      if (tickCount % 4 === 0) {
        persistSession();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, persistSession]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showSectionSubmitConfirm || showRestartConfirm || showSaveAndExitConfirm || showHomeExitConfirm) return;
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
  }, [
    showSectionSubmitConfirm,
    showRestartConfirm,
    showSaveAndExitConfirm,
    showHomeExitConfirm,
    currentQuestionIndex,
    subtestQuestions.length,
    handleNextQuestion,
    handlePrevQuestion,
    handleSelectOption,
    handleToggleFlag,
  ]);

  // Formatting helpers
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSubtestIcon = (key) => {
    switch (key) {
      case 'mental_ability':
        return <Brain className="w-4 h-4 text-amber-400" />;
      case 'english':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'mathematics':
        return <Calculator className="w-4 h-4 text-red-400" />;
      case 'science':
        return <Atom className="w-4 h-4 text-emerald-400" />;
      default:
        return <Brain className="w-4 h-4 text-amber-400" />;
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
          <div
            onClick={() => setShowHomeExitConfirm(true)}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="Return to Main Page"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-md shadow-amber-500/25 group-hover:scale-105 transition shrink-0">
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
                <span className="text-white font-extrabold text-sm sm:text-base flex items-center gap-1.5 group-hover:text-amber-400 transition">
                  {getSubtestIcon(currentSubtestKey)}
                  {currentSubtestMeta?.title}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Part {currentSubtestIndex + 1} of {activeSubtests.length}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                Strict Section Locking: Answers are sealed upon advancing.
              </p>
            </div>
          </div>

          {/* Section Timer & Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Pacing Alert */}
            {questionPaceSeconds > 45 && (
              <div className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/70 border border-amber-800/60 px-2.5 py-1 rounded-lg animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                Pacing Alert: {questionPaceSeconds}s on item
              </div>
            )}

            {/* Save & Pause Session Button */}
            <button
              onClick={() => {
                persistSession();
                setShowSaveAndExitConfirm(true);
              }}
              className="px-3 py-1.5 bg-[#1e2230] hover:bg-emerald-950/60 border border-emerald-500/40 hover:border-emerald-500 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer group"
              title="Save your session, pause the timer, and resume later"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
              <span className="hidden sm:inline">Save & Pause</span>
            </button>

            {/* Return to Home / Main Page Button */}
            <button
              onClick={() => setShowHomeExitConfirm(true)}
              className="px-3 py-1.5 bg-[#1e2230] hover:bg-[#25293d] border border-gray-700/80 hover:border-amber-500/50 text-gray-300 hover:text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer group"
              title="Return to Main Page"
              aria-label="Return to Home"
            >
              <Home className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-400 transition" />
              <span className="hidden sm:inline">Home</span>
            </button>

            {/* Scratchpad Button */}
            <button
              onClick={() => setIsScratchpadOpen((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isScratchpadOpen
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 ring-1 ring-amber-500/30'
                  : 'bg-[#1e2230] hover:bg-[#282d3f] border border-amber-500/30 text-amber-300'
              }`}
              title={isScratchpadOpen ? 'Close scratchpad' : 'Open scratchpad for arithmetic'}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scratchpad</span>
              {isScratchpadOpen && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>}
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
                    ? 'bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500 text-amber-300 shadow-sm shadow-amber-500/20 cursor-pointer'
                    : 'bg-[#1e2230] hover:bg-red-950/40 border border-gray-700 hover:border-red-500/50 text-gray-300 hover:text-red-300 cursor-pointer'
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
          </div>
        </div>
      </header>

      {/* Main Examination Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Active Question Workspace (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {currentQuestion ? (
            <div className="bg-[#141620] border border-gray-800/90 rounded-2xl p-6 sm:p-8 flex flex-col justify-between flex-1 shadow-xl">
              <div className="space-y-6">
                {/* Question Metadata Header */}
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      Question {currentQuestionIndex + 1} of {subtestQuestions.length}
                    </span>
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

                  <button
                    onClick={handleToggleFlag}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      flaggedQuestions[currentQuestion.id]
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                        : 'text-gray-400 hover:text-gray-200 bg-[#1c1f2e]'
                    }`}
                    title="Flag for Review (F)"
                  >
                    {flaggedQuestions[currentQuestion.id] ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Flagged</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Flag</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Stimulus Passage / Reading Text if available */}
                {currentQuestion.stimulus && (
                  <div className="p-4 bg-[#1a1d29] border border-gray-800 rounded-xl text-xs sm:text-sm text-gray-300 leading-relaxed font-serif max-h-60 overflow-y-auto">
                    <MathRenderer content={currentQuestion.stimulus} />
                  </div>
                )}

                {/* Question Stem */}
                <div className="text-base sm:text-lg text-white font-medium leading-relaxed">
                  <MathRenderer content={currentQuestion.question} />
                </div>

                {/* Answer Choices */}
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = userAnswers[currentQuestion.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border flex items-start gap-3.5 transition group cursor-pointer ${
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
                        <div className="flex-1 text-sm pt-0.5 leading-relaxed text-gray-200">
                          <MathRenderer content={opt.text} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons Bottom Bar */}
              <div className="pt-6 border-t border-gray-800/80 flex items-center justify-between gap-4 mt-8">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    currentQuestionIndex === 0
                      ? 'text-gray-600 bg-gray-900/40 border border-gray-800 cursor-not-allowed'
                      : 'text-gray-300 bg-[#1e2230] hover:bg-[#282d3f] border border-gray-700 cursor-pointer'
                  }`}
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
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2 mb-4 max-h-[300px] overflow-y-auto pr-1">
              {subtestQuestions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered = !!userAnswers[q.id];
                const isFlagged = !!flaggedQuestions[q.id];

                let btnStyle = 'bg-[#1b1e2a] text-gray-400 border-gray-800 hover:border-gray-600 cursor-pointer';
                if (isCurrent) {
                  btnStyle = 'ring-2 ring-amber-400 bg-amber-500/20 text-amber-300 font-bold border-amber-500 cursor-pointer';
                } else if (isAnswered) {
                  btnStyle = 'bg-amber-500/80 text-black font-bold border-amber-500 cursor-pointer';
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
                  <strong className="text-amber-300">Halfway Restart Policy:</strong> Resetting the mock test & clock is permitted <em>only</em> during the first half (Parts 1–2 / &lt;{halfwayThreshold} answered).
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
              className="mt-4 w-full py-2.5 rounded-xl bg-[#1f2334] hover:bg-amber-500 hover:text-black text-amber-300 border border-amber-500/40 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
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
                className="flex-1 py-2 rounded-xl bg-[#202436] hover:bg-[#2b3048] text-gray-300 text-xs font-semibold transition cursor-pointer"
              >
                Return to Questions
              </button>
              <button
                onClick={advanceToNextSection}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save & Pause Session Modal */}
      {showSaveAndExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#141622] border border-emerald-500/50 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-extrabold text-white">
                Exam Session Saved & Paused
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Your examination state has been saved securely to this computer!
              </p>

              <div className="bg-[#1a1d2c] border border-gray-800 rounded-xl p-3 text-xs space-y-1.5 text-left font-mono">
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-400">Current Part:</span>
                  <span className="text-white font-bold">Part {currentSubtestIndex + 1}: {currentSubtestMeta?.title}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-400">Current Item:</span>
                  <span className="text-amber-400 font-bold">Question {currentQuestionIndex + 1} of {subtestQuestions.length}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-400">Remaining Timer:</span>
                  <span className="text-emerald-400 font-bold">{formatTime(sectionTimeRemaining)}</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 pt-1">
                You can safely close your browser or turn off your computer. When you return, the app will let you resume from this exact point.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSaveAndExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#202436] hover:bg-[#2b3048] text-gray-300 text-xs font-semibold transition cursor-pointer"
              >
                Resume Testing Now
              </button>
              <button
                onClick={() => {
                  persistSession();
                  onExitExam();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black text-xs font-black transition shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                Exit to Home Screen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return to Home Safeguard Modal */}
      {showHomeExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#141622] border border-amber-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Home className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">
                Leave Active Examination?
              </h3>
              <p className="text-xs text-gray-300">
                Would you like to save your exam progress before returning to the home screen?
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  persistSession();
                  setShowHomeExitConfirm(false);
                  onExitExam();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black text-xs font-black transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Session & Exit to Home
              </button>

              <button
                onClick={() => setShowHomeExitConfirm(false)}
                className="w-full py-2 rounded-xl bg-[#202436] hover:bg-[#2b3048] text-gray-300 text-xs font-semibold transition cursor-pointer"
              >
                Stay in Exam
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Discard exam session? All progress and recorded answers will be deleted.')) {
                    clearActiveSession();
                    setShowHomeExitConfirm(false);
                    onExitExam();
                  }
                }}
                className="w-full py-2 text-red-400 hover:text-red-300 text-[11px] font-semibold transition cursor-pointer"
              >
                Discard Progress & Exit
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
                className="flex-1 py-2.5 rounded-xl bg-[#202436] hover:bg-[#2b3048] text-gray-300 text-xs font-semibold transition cursor-pointer"
              >
                Resume Current Exam
              </button>
              <button
                onClick={handleRestartExam}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Confirm & Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scratchpad Modal / Docked Drawer */}
      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={subtestQuestions.length}
        onNextQuestion={handleNextQuestion}
        onPrevQuestion={handlePrevQuestion}
        onSelectOption={handleSelectOption}
        selectedOption={userAnswers[currentQuestion?.id]}
        isFlagged={!!flaggedQuestions[currentQuestion?.id]}
        onToggleFlag={handleToggleFlag}
      />
    </div>
  );
}
