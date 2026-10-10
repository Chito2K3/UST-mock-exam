import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingHero from './components/LandingHero';
import ExamEngine from './components/ExamEngine';
import ResultAnalytics from './components/ResultAnalytics';
import PracticeDrillModal from './components/PracticeDrillModal';
import ExamStartModal from './components/ExamStartModal';
import ResumeExamModal from './components/ResumeExamModal';
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
      titleText = 'USTET Balanced Mock Set A';
      badgeText = 'Curated Set A';
      subtitleText = '135 authentic items balanced across Mental Ability, English, Math, and Science';
    } else if (chosenSet === 'set_b') {
      titleText = 'USTET Balanced Mock Set B';
      badgeText = 'Curated Set B';
      subtitleText = '135 authentic items balanced across all 4 USTET subject domains';
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
      itemCount: chosenSet === 'express' ? 60 : chosenSet === 'set_a' || chosenSet === 'set_b' ? 135 : basePool.length,
      partsCount: 4,
      durationMinutes: chosenSet === 'express' ? 45 : chosenSet === 'set_a' || chosenSet === 'set_b' ? 90 : 165,
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

        let preparedQuestions;
        if (isFull) {
          preparedQuestions = generateQuestionSet(basePool, {
            setId: selectedSet,
            shuffleQuestions,
            randomizeChoices,
          });
        } else {
          preparedQuestions = shuffleQuestionsBySubtest(basePool, {
            shuffleQuestions,
            randomizeChoices,
          });
        }

        const subs = ['mental_ability', 'english', 'mathematics', 'science'];
        setActiveQuestions(preparedQuestions);
        setActiveSubtests(subs);
        setExamMode(isFull ? selectedSet : `tier-${difficultyTier}`);
        setExamMetadata({
          examMode: isFull ? selectedSet : `tier-${difficultyTier}`,
          setName: titleText,
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
    const filtered = MOCK_QUESTIONS.filter((q) => q.subtest === subtestKey);

    setPendingExam({
      title: `${meta?.title || 'Subject'} Examination`,
      badge: 'Single Subject Focus',
      subtitle: `${meta?.subtitle || 'Full-length subject section test'}`,
      itemCount: filtered.length,
      partsCount: 1,
      durationMinutes: meta?.defaultDurationMinutes || 45,
      allowSetSelection: false,
      subjects: [`${meta?.title || 'Subject'} (${filtered.length} Items)`],
      calculatorAllowed: false,
      onConfirm: ({ shuffleQuestions = true, randomizeChoices = true } = {}) => {
        clearActiveSession();
        setSavedSession(null);
        setInitialSessionState(null);

        const preparedQuestions = shuffleQuestionsBySubtest(filtered, {
          shuffleQuestions,
          randomizeChoices,
        });

        setActiveQuestions(preparedQuestions);
        setActiveSubtests([subtestKey]);
        setExamMode('subject');
        setExamMetadata({
          examMode: 'subject',
          setName: `${meta?.title} Section Exam`,
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
