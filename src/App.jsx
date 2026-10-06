import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingHero from './components/LandingHero';
import ExamEngine from './components/ExamEngine';
import ResultAnalytics from './components/ResultAnalytics';
import PracticeDrillModal from './components/PracticeDrillModal';
import { MOCK_QUESTIONS } from './data/mockQuestions';

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

  // Start Full 4-Part Exam (or Tiered Complete Exam Set)
  const handleStartExamSet = (difficultyTier = 'all') => {
    let filtered = [...MOCK_QUESTIONS];
    if (difficultyTier !== 'all') {
      filtered = filtered.filter((q) => q.difficulty === difficultyTier);
    }
    setActiveQuestions(filtered);
    setActiveSubtests(['mental_ability', 'english', 'mathematics', 'science']);
    setExamMode(difficultyTier === 'all' ? 'full' : `tier-${difficultyTier}`);
    setExamResults(null);
    setCurrentView('exam');
  };

  // Start full subject-specific test
  const handleStartSubjectExam = (subtestKey) => {
    const filtered = MOCK_QUESTIONS.filter((q) => q.subtest === subtestKey);
    setActiveQuestions(filtered);
    setActiveSubtests([subtestKey]);
    setExamMode('subject');
    setExamResults(null);
    setCurrentView('exam');
  };

  // Start Targeted Custom Drill
  const handleStartDrill = ({ subtest, difficulty }) => {
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

    setActiveQuestions(filtered);
    setActiveSubtests(availableSubtests.length > 0 ? availableSubtests : ['mental_ability']);
    setExamMode('drill');
    setExamResults(null);
    setCurrentView('exam');
  };

  const handleFinishExam = (results) => {
    setExamResults(results);
    setCurrentView('results');
  };

  const handleRetakeExam = () => {
    handleStartExamSet('all');
  };

  const handleExitExam = () => {
    if (window.confirm('Are you sure you want to exit the exam? Your current progress will be reset.')) {
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
              onStartFullExam={() => handleStartExamSet('all')}
              onStartTierExam={handleStartExamSet}
              onStartSubjectExam={handleStartSubjectExam}
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
            isDrillMode={examMode !== 'full'}
          />
        )}

        {currentView === 'results' && examResults && (
          <ResultAnalytics
            examResults={examResults}
            questions={activeQuestions}
            onRetakeExam={handleRetakeExam}
            onOpenDrillMode={() => setIsDrillModalOpen(true)}
          />
        )}
      </div>

      {currentView !== 'exam' && <Footer />}

      <PracticeDrillModal
        isOpen={isDrillModalOpen}
        onClose={() => setIsDrillModalOpen(false)}
        onStartDrill={handleStartDrill}
      />
    </div>
  );
}
