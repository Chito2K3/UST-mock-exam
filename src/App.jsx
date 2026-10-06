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
  const [examMode, setExamMode] = useState('full'); // 'full' | 'drill'
  const [activeQuestions, setActiveQuestions] = useState(MOCK_QUESTIONS);
  const [activeSubtests, setActiveSubtests] = useState([
    'mental_ability',
    'english',
    'mathematics',
    'science',
  ]);
  const [examResults, setExamResults] = useState(null);
  const [isDrillModalOpen, setIsDrillModalOpen] = useState(false);

  // Start Full 4-Part Exam Simulation
  const handleStartFullExam = () => {
    setActiveQuestions(MOCK_QUESTIONS);
    setActiveSubtests(['mental_ability', 'english', 'mathematics', 'science']);
    setExamMode('full');
    setExamResults(null);
    setCurrentView('exam');
  };

  // Start Targeted Practice Drill
  const handleStartDrill = ({ subtest, difficulty }) => {
    let filtered = [...MOCK_QUESTIONS];

    if (subtest !== 'all') {
      filtered = filtered.filter((q) => q.subtest === subtest);
    }
    if (difficulty !== 'all') {
      filtered = filtered.filter((q) => q.difficulty === difficulty);
    }

    if (filtered.length === 0) {
      alert('No questions match this specific combination. Resetting to all questions for this subject.');
      filtered = MOCK_QUESTIONS.filter((q) => (subtest !== 'all' ? q.subtest === subtest : true));
    }

    const availableSubtests = Array.from(new Set(filtered.map((q) => q.subtest)));

    setActiveQuestions(filtered);
    setActiveSubtests(availableSubtests.length > 0 ? availableSubtests : ['mental_ability']);
    setExamMode('drill');
    setExamResults(null);
    setCurrentView('exam');
  };

  // Exam completed callback
  const handleFinishExam = (results) => {
    setExamResults(results);
    setCurrentView('results');
  };

  const handleRetakeExam = () => {
    handleStartFullExam();
  };

  const handleExitExam = () => {
    if (window.confirm('Are you sure you want to exit the exam? Your current attempt will be discarded.')) {
      setCurrentView('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#f1f1f5] flex flex-col selection:bg-amber-400 selection:text-black">
      {/* Header is shown on home and results */}
      {currentView !== 'exam' && (
        <Header
          currentView={currentView}
          onGoHome={() => setCurrentView('home')}
          onOpenDrillMode={() => setIsDrillModalOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1">
        {currentView === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <LandingHero
              onStartFullExam={handleStartFullExam}
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
            isDrillMode={examMode === 'drill'}
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

      {/* Footer is shown on home and results */}
      {currentView !== 'exam' && <Footer />}

      {/* Practice Drill Modal */}
      <PracticeDrillModal
        isOpen={isDrillModalOpen}
        onClose={() => setIsDrillModalOpen(false)}
        onStartDrill={handleStartDrill}
      />
    </div>
  );
}
