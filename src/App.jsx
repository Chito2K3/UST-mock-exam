import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingHero from './components/LandingHero';
import ExamEngine from './components/ExamEngine';
import ResultAnalytics from './components/ResultAnalytics';
import PracticeDrillModal from './components/PracticeDrillModal';
import ExamStartModal from './components/ExamStartModal';
import { MOCK_QUESTIONS, SUBTEST_METADATA } from './data/mockQuestions';

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

  const clearSavedExamProgress = () => {
    try {
      localStorage.removeItem('ustet_user_answers');
      localStorage.removeItem('ustet_flagged');
    } catch {
      // Ignore
    }
  };

  // Request Full 4-Part Exam or Tiered Complete Exam Set
  const handleRequestExamSet = (difficultyTier = 'all') => {
    let filtered = [...MOCK_QUESTIONS];
    if (difficultyTier !== 'all') {
      filtered = filtered.filter((q) => q.difficulty === difficultyTier);
    }
    const isFull = difficultyTier === 'all';

    setPendingExam({
      title: isFull
        ? 'USTET Full 4-Part Simulation'
        : `USTET Complete ${difficultyTier} Mock Set`,
      badge: isFull ? 'Official Simulation' : `${difficultyTier} Tier Set`,
      subtitle: isFull
        ? 'All 4 standard sections with authentic timing and sequential section locking'
        : `Targeted difficulty set covering all 4 standard USTET examination areas`,
      itemCount: filtered.length,
      partsCount: 4,
      durationMinutes: 165,
      subjects: [
        'Part 1: Mental Ability (30m)',
        'Part 2: English Proficiency (45m)',
        'Part 3: Mathematics (45m)',
        'Part 4: Science (45m)',
      ],
      calculatorAllowed: false,
      onConfirm: () => {
        clearSavedExamProgress();
        setActiveQuestions(filtered);
        setActiveSubtests(['mental_ability', 'english', 'mathematics', 'science']);
        setExamMode(isFull ? 'full' : `tier-${difficultyTier}`);
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
      subjects: [`${meta?.title || 'Subject'} (${filtered.length} Items)`],
      calculatorAllowed: false,
      onConfirm: () => {
        clearSavedExamProgress();
        setActiveQuestions(filtered);
        setActiveSubtests([subtestKey]);
        setExamMode('subject');
        setExamResults(null);
        setCurrentView('exam');
        setPendingExam(null);
      },
    });
  };

  // Request Targeted Custom Drill
  const handleRequestDrill = ({ subtest, difficulty }) => {
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

    const availableSubtests = Array.from(new Set(filtered.map((q) => q.subtest)));
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
      itemCount: filtered.length,
      partsCount: activeSubs.length,
      durationMinutes: totalMinutes,
      subjects: activeSubs.map(
        (k) =>
          `${SUBTEST_METADATA[k]?.title || k} (${
            filtered.filter((q) => q.subtest === k).length
          } items)`
      ),
      calculatorAllowed: false,
      onConfirm: () => {
        clearSavedExamProgress();
        setActiveQuestions(filtered);
        setActiveSubtests(activeSubs);
        setExamMode('drill');
        setExamResults(null);
        setCurrentView('exam');
        setPendingExam(null);
      },
    });
  };

  const handleFinishExam = (results) => {
    setExamResults(results);
    setCurrentView('results');
  };

  const handleRetakeExam = () => {
    handleRequestExamSet('all');
  };

  const handleExitExam = () => {
    if (window.confirm('Are you sure you want to exit the exam? Your current progress will be reset.')) {
      clearSavedExamProgress();
      setCurrentView('home');
    }
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
              onStartFullExam={() => handleRequestExamSet('all')}
              onStartTierExam={handleRequestExamSet}
              onStartSubjectExam={handleRequestSubjectExam}
              onOpenDrillMode={() => setIsDrillModalOpen(true)}
            />
          </div>
        )}

        {currentView === 'exam' && (
          <ExamEngine
            questions={activeQuestions}
            activeSubtests={activeSubtests}
            onFinishExam={handleFinishExam}
            onExitExam={handleExitExam}
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
    </div>
  );
}
