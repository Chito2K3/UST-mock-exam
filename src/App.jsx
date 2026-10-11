import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingHero from './components/LandingHero';
import ExamEngine from './components/ExamEngine';
import ResultAnalytics from './components/ResultAnalytics';
import PracticeDrillModal from './components/PracticeDrillModal';
import ExamStartModal from './components/ExamStartModal';
import ResumeExamModal from './components/ResumeExamModal';
import QuestionnaireGeneratorModal from './components/QuestionnaireGeneratorModal';
import { MOCK_QUESTIONS, SUBTEST_METADATA } from './data/mockQuestions';
import {
  loadActiveSession,
  clearActiveSession,
  hasActiveSession,
} from './utils/sessionStorage';
import {
  shuffleQuestionsBySubtest,
  generateQuestionSet,
} from './utils/randomizer';
import { generateExamSet } from './utils/questionGenerator.js';
import { SUBTEST_SPECS } from './data/setRegistry.js';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'exam' | 'results'
  const [examMode, setExamMode] = useState('full');
  const [activeQuestions, setActiveQuestions] = useState(MOCK_QUESTIONS);
  const [activeSubtests, setActiveSubtests] = useState([
    'mental_ability',
    'english',
    'mathematics',
    'science',
  ]);
  const [examResults, setExamResults] = useState(null);
  const [isDrillModalOpen, setIsDrillModalOpen] = useState(false);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [generatorInitialScope, setGeneratorInitialScope] = useState('full');
  const [pendingExam, setPendingExam] = useState(null);

  // Session Persistence State
  const [savedSession, setSavedSession] = useState(() => loadActiveSession());
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(() => hasActiveSession());
  const [initialSessionState, setInitialSessionState] = useState(null);
  const [examMetadata, setExamMetadata] = useState({});


  // Resume In-Progress Exam Session
  const handleResumeSession = () => {
    const session = savedSession || loadActiveSession();
    if (!session) return;

    setActiveQuestions(session.activeQuestions);
    setActiveSubtests(session.activeSubtests);
    setExamMode(session.examMode || 'full');
    setExamMetadata({
      examMode: session.examMode || 'full',
      setName: session.setName || 'USTET Simulation',
    });
    setInitialSessionState(session);
    setExamResults(null);
    setIsResumeModalOpen(false);
    setCurrentView('exam');
  };

  // Discard Saved Session
  const handleDiscardSession = () => {
    clearActiveSession();
    setSavedSession(null);
    setIsResumeModalOpen(false);
    setInitialSessionState(null);
  };

  // Request Full 4-Part Simulation or Modular Sets
  const handleRequestExamSet = (difficultyTier = 'all', chosenSet = 'full') => {
    let basePool = [...MOCK_QUESTIONS];
    if (difficultyTier !== 'all') {
      basePool = basePool.filter((q) => q.difficulty === difficultyTier);
    }
    const isFull = difficultyTier === 'all';

    let titleText = 'USTET Full 4-Part Simulation';
    let badgeText = 'Official Simulation';
    let subtitleText = 'All 4 standard sections with authentic timing, question shuffling, and section locking';

    if (chosenSet === 'set_a') {
      titleText = 'USTET Full Mock Set A';
      badgeText = 'Curated Set A';
      subtitleText = '270 authentic items balanced across Mental Ability, English, Math, and Science';
    } else if (chosenSet === 'set_b') {
      titleText = 'USTET Brand-New Mock Set B';
      badgeText = 'Curated Set B (100% New)';
      subtitleText = '270 brand-new items with zero repeats from Set A';
    } else if (chosenSet === 'express') {
      titleText = 'USTET Express Diagnostic Set';
      badgeText = 'Express Set';
      subtitleText = '60 high-yield questions (15 items per subtest) for quick assessment';
    } else if (difficultyTier !== 'all') {
      titleText = `USTET Complete ${difficultyTier} Mock Set`;
      badgeText = `${difficultyTier} Tier Set`;
      subtitleText = `Targeted difficulty set covering all 4 standard USTET examination areas`;
    }

    setPendingExam({
      title: titleText,
      badge: badgeText,
      subtitle: subtitleText,
      itemCount: chosenSet === 'express' ? 60 : 270,
      partsCount: 4,
      durationMinutes: chosenSet === 'express' ? 45 : 165,
      allowSetSelection: isFull,
      subjects: [
        'Part 1: Mental Ability',
        'Part 2: English Proficiency',
        'Part 3: Mathematics (No Calculator)',
        'Part 4: Science',
      ],
      calculatorAllowed: false,
      onConfirm: ({ shuffleQuestions = true, randomizeChoices = true, selectedSet = chosenSet } = {}) => {
        clearActiveSession();
        setSavedSession(null);
        setInitialSessionState(null);

        const examBundle = generateExamSet({
          scope: 'full',
          setId: isFull ? selectedSet : 'dynamic',
          lengthMode: selectedSet === 'express' ? 'express' : 'standard',
          shuffleQuestions,
          randomizeChoices,
          difficultyTier,
        });

        const preparedQuestions = examBundle.questions;
        const subs = examBundle.activeSubtests;
        setActiveQuestions(preparedQuestions);
        setActiveSubtests(subs);
        setExamMode(isFull ? selectedSet : `tier-${difficultyTier}`);
        setExamMetadata({
          examMode: isFull ? selectedSet : `tier-${difficultyTier}`,
          setName: examBundle.setName || titleText,
        });
        setExamResults(null);
        setCurrentView('exam');
        setPendingExam(null);
      },
    });
  };

  // Request full subject-specific test
  const handleRequestSubjectExam = (subtestKey) => {
    const meta = SUBTEST_METADATA[subtestKey];
    const spec = SUBTEST_SPECS[subtestKey];
    const targetCount = spec?.standardItems || 70;
    const durationMins = meta?.defaultDurationMinutes || spec?.standardMinutes || 45;

    setPendingExam({
      title: `${meta?.title || 'Subject'} Examination`,
      badge: 'Single Subject Focus',
      subtitle: `${meta?.subtitle || 'Full-length subject section test'}`,
      itemCount: targetCount,
      partsCount: 1,
      durationMinutes: durationMins,
      allowSetSelection: true,
      subjects: [`${meta?.title || 'Subject'} (${targetCount} Items)`],
      calculatorAllowed: false,
      onConfirm: ({ shuffleQuestions = true, randomizeChoices = true, selectedSet = 'dynamic' } = {}) => {
        clearActiveSession();
        setSavedSession(null);
        setInitialSessionState(null);

        const examBundle = generateExamSet({
          scope: subtestKey,
          setId: selectedSet === 'full' ? 'dynamic' : selectedSet,
          lengthMode: selectedSet === 'express' ? 'express' : 'standard',
          shuffleQuestions,
          randomizeChoices,
        });

        setActiveQuestions(examBundle.questions);
        setActiveSubtests([subtestKey]);
        setExamMode(`subject-${subtestKey}`);
        setExamMetadata({
          examMode: `subject-${subtestKey}`,
          setName: `${meta?.title} (${examBundle.badge || 'Standard'})`,
        });
        setExamResults(null);
        setCurrentView('exam');
        setPendingExam(null);
      },
    });
  };

  // Request Targeted Custom Drill
  const handleRequestDrill = ({
    subtest,
    difficulty,
    itemLimit = 'all',
    shuffleQuestions = true,
    randomizeChoices = true,
  }) => {
    let filtered = [...MOCK_QUESTIONS];

    if (subtest !== 'all') {
      filtered = filtered.filter((q) => q.subtest === subtest);
    }
    if (difficulty !== 'all') {
      filtered = filtered.filter((q) => q.difficulty === difficulty);
    }

    if (filtered.length === 0) {
      filtered = MOCK_QUESTIONS.filter((q) => (subtest !== 'all' ? q.subtest === subtest : true));
    }

    let prepared = shuffleQuestionsBySubtest(filtered, {
      shuffleQuestions,
      randomizeChoices,
    });

    if (itemLimit !== 'all') {
      const limit = parseInt(itemLimit, 10);
      if (!isNaN(limit) && limit > 0 && limit < prepared.length) {
        prepared = prepared.slice(0, limit);
      }
    }

    const availableSubtests = Array.from(new Set(prepared.map((q) => q.subtest)));
    const activeSubs = availableSubtests.length > 0 ? availableSubtests : ['mental_ability'];
    const totalMinutes = activeSubs.reduce(
      (acc, k) => acc + (SUBTEST_METADATA[k]?.defaultDurationMinutes || 15),
      0
    );

    setPendingExam({
      title: 'Targeted Practice Drill',
      badge: difficulty === 'all' ? 'Custom Drill' : `${difficulty} Drill`,
      subtitle:
        subtest === 'all'
          ? 'Comprehensive Multi-Subject Drill Session'
          : `${SUBTEST_METADATA[subtest]?.title || 'Subject'} Drill Session`,
      itemCount: prepared.length,
      partsCount: activeSubs.length,
      durationMinutes: totalMinutes,
      allowSetSelection: false,
      subjects: activeSubs.map(
        (k) =>
          `${SUBTEST_METADATA[k]?.title || k} (${
            prepared.filter((q) => q.subtest === k).length
          } items)`
      ),
      calculatorAllowed: false,
      onConfirm: () => {
        clearActiveSession();
        setSavedSession(null);
        setInitialSessionState(null);

        setActiveQuestions(prepared);
        setActiveSubtests(activeSubs);
        setExamMode('drill');
        setExamMetadata({
          examMode: 'drill',
          setName: 'Targeted Practice Drill',
        });
        setExamResults(null);
        setCurrentView('exam');
        setPendingExam(null);
      },
    });
  };

  const handleFinishExam = (results) => {
    clearActiveSession();
    setSavedSession(null);
    setInitialSessionState(null);
    setExamResults(results);
    setCurrentView('results');
  };

  const handleOpenGenerator = (scope = 'full') => {
    setGeneratorInitialScope(scope);
    setIsGeneratorModalOpen(true);
  };

  const handleLaunchGeneratedExam = (examBundle) => {
    clearActiveSession();
    setSavedSession(null);
    setInitialSessionState(null);

    setActiveQuestions(examBundle.questions);
    setActiveSubtests(examBundle.activeSubtests);
    setExamMode(examBundle.scope === 'full' ? examBundle.setId : `subject-${examBundle.scope}`);
    setExamMetadata({
      examMode: examBundle.scope === 'full' ? examBundle.setId : `subject-${examBundle.scope}`,
      setName: examBundle.setName || examBundle.title,
    });
    setExamResults(null);
    setIsGeneratorModalOpen(false);
    setCurrentView('exam');
  };

  const handleRetakeExam = () => {
    handleRequestExamSet('all', 'full');
  };

  const handleExitExam = () => {
    const active = loadActiveSession();
    setSavedSession(active);
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#f1f1f5] flex flex-col selection:bg-amber-400 selection:text-black">
      {currentView !== 'exam' && (
        <Header
          currentView={currentView}
          onGoHome={() => setCurrentView('home')}
          onOpenDrillMode={() => setIsDrillModalOpen(true)}
          onOpenGenerator={handleOpenGenerator}
        />
      )}

      <div className="flex-1">
        {currentView === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <LandingHero
              onStartFullExam={() => handleRequestExamSet('all', 'full')}
              onStartSetExam={(setId) => handleRequestExamSet('all', setId)}
              onStartTierExam={handleRequestExamSet}
              onStartSubjectExam={handleRequestSubjectExam}
              onOpenDrillMode={() => setIsDrillModalOpen(true)}
              onOpenGenerator={handleOpenGenerator}
              savedSession={savedSession}
              onResumeSavedSession={handleResumeSession}
              onDiscardSavedSession={handleDiscardSession}
            />
          </div>
        )}

        {currentView === 'exam' && (
          <ExamEngine
            questions={activeQuestions}
            activeSubtests={activeSubtests}
            onFinishExam={handleFinishExam}
            onExitExam={handleExitExam}
            initialSessionState={initialSessionState}
            examMetadata={examMetadata}
          />
        )}

        {currentView === 'results' && examResults && (
          <ResultAnalytics
            examResults={examResults}
            questions={activeQuestions}
            onRetakeExam={handleRetakeExam}
            onOpenDrillMode={() => setIsDrillModalOpen(true)}
            isDrillMode={examMode !== 'full'}
          />
        )}
      </div>

      {currentView !== 'exam' && <Footer />}

      <PracticeDrillModal
        isOpen={isDrillModalOpen}
        onClose={() => setIsDrillModalOpen(false)}
        onStartDrill={handleRequestDrill}
      />

      <QuestionnaireGeneratorModal
        isOpen={isGeneratorModalOpen}
        initialScope={generatorInitialScope}
        onClose={() => setIsGeneratorModalOpen(false)}
        onLaunchExam={handleLaunchGeneratedExam}
      />

      <ExamStartModal
        isOpen={!!pendingExam}
        config={pendingExam}
        onConfirm={pendingExam?.onConfirm}
        onClose={() => setPendingExam(null)}
      />

      <ResumeExamModal
        isOpen={isResumeModalOpen && currentView === 'home'}
        session={savedSession}
        onResume={handleResumeSession}
        onDismiss={() => setIsResumeModalOpen(false)}
        onDiscard={handleDiscardSession}
      />
    </div>
  );
}
