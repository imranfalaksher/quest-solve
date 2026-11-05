import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { QuizCreatorModal } from './components/QuizCreatorModal';
import { ActiveQuizView } from './components/ActiveQuizView';
import { QuizResultsView } from './components/QuizResultsView';
import { SAMPLE_DOCUMENTS } from './data/sampleDocs';
import {
  getQuizAttempts,
  saveQuizAttempt,
  deleteQuizAttempt,
  calculateStats,
} from './services/storageService';
import { MCQQuestion, QuizAttempt, QuizMode, SampleDoc, OptionId } from './types/quiz';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('questpdf_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('questpdf_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('questpdf_theme', 'light');
    }
  }, [isDarkMode]);

  // Main navigation / view state
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'history' | 'sample-docs'>('dashboard');
  const [activeView, setActiveView] = useState<'dashboard' | 'active-quiz' | 'quiz-results'>('dashboard');

  // Modal & Creation state
  const [isCreatorOpen, setIsCreatorOpen] = useState<boolean>(false);
  const [preselectedSample, setPreselectedSample] = useState<SampleDoc | null>(null);

  // Active examination state
  const [activeQuizParams, setActiveQuizParams] = useState<{
    title: string;
    sourceDocName: string;
    questions: MCQQuestion[];
    mode: QuizMode;
    timeLimitSeconds: number;
  } | null>(null);

  // Results review state
  const [reviewAttempt, setReviewAttempt] = useState<QuizAttempt | null>(null);

  // Stored quiz history
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  // Load history on mount
  useEffect(() => {
    const loaded = getQuizAttempts();
    setAttempts(loaded);
  }, []);

  const stats = calculateStats(attempts);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleOpenNewQuiz = (sample?: SampleDoc) => {
    setPreselectedSample(sample || null);
    setIsCreatorOpen(true);
  };

  const handleStartQuiz = (params: {
    title: string;
    sourceDocName: string;
    questions: MCQQuestion[];
    mode: QuizMode;
    timeLimitSeconds: number;
  }) => {
    setActiveQuizParams(params);
    setIsCreatorOpen(false);
    setActiveView('active-quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishQuiz = (results: {
    userAnswers: Record<string, OptionId>;
    timeSpentSeconds: number;
    bookmarkedQuestionIds: string[];
  }) => {
    if (!activeQuizParams) return;

    // Calculate score
    let score = 0;
    activeQuizParams.questions.forEach((q) => {
      if (results.userAnswers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });

    const totalQuestions = activeQuizParams.questions.length;
    const percentage = Math.round((score / Math.max(1, totalQuestions)) * 100);

    const newAttempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      title: activeQuizParams.title,
      sourceDocName: activeQuizParams.sourceDocName,
      date: new Date().toISOString(),
      totalQuestions,
      score,
      percentage,
      timeSpentSeconds: results.timeSpentSeconds,
      mode: activeQuizParams.mode,
      userAnswers: results.userAnswers,
      questions: activeQuizParams.questions,
      bookmarkedQuestionIds: results.bookmarkedQuestionIds,
      timePerQuestionAverage: Math.round(results.timeSpentSeconds / Math.max(1, totalQuestions)),
    };

    saveQuizAttempt(newAttempt);
    setAttempts(getQuizAttempts());
    setReviewAttempt(newAttempt);
    setActiveView('quiz-results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReviewAttempt = (attempt: QuizAttempt) => {
    setReviewAttempt(attempt);
    setActiveView('quiz-results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetakeAttempt = (attempt: QuizAttempt) => {
    handleStartQuiz({
      title: `${attempt.title} (Retake)`,
      sourceDocName: attempt.sourceDocName,
      questions: attempt.questions,
      mode: attempt.mode,
      timeLimitSeconds: attempt.mode === 'timed' ? attempt.questions.length * 90 : 0,
    });
  };

  const handleDeleteAttempt = (id: string) => {
    deleteQuizAttempt(id);
    const updated = getQuizAttempts();
    setAttempts(updated);
    if (reviewAttempt?.id === id) {
      setReviewAttempt(null);
      setActiveView('dashboard');
    }
  };

  const handleToggleBookmark = (attemptId: string, questionId: string) => {
    const targetAttempt = attempts.find((a) => a.id === attemptId);
    if (!targetAttempt) return;

    const set = new Set(targetAttempt.bookmarkedQuestionIds);
    if (set.has(questionId)) {
      set.delete(questionId);
    } else {
      set.add(questionId);
    }

    const updatedAttempt: QuizAttempt = {
      ...targetAttempt,
      bookmarkedQuestionIds: Array.from(set),
    };

    saveQuizAttempt(updatedAttempt);
    const updatedList = getQuizAttempts();
    setAttempts(updatedList);

    if (reviewAttempt?.id === attemptId) {
      setReviewAttempt(updatedAttempt);
    }
  };

  const handleExitQuiz = () => {
    setActiveQuizParams(null);
    setActiveView('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar is hidden only during high-stakes active test taking */}
      {activeView !== 'active-quiz' && (
        <Header
          currentTab={currentTab}
          onNavigate={(tab) => {
            setCurrentTab(tab);
            setActiveView('dashboard');
          }}
          onOpenNewQuiz={() => handleOpenNewQuiz()}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />
      )}

      {/* Main View Router */}
      <div className="flex-1">
        {activeView === 'active-quiz' && activeQuizParams ? (
          <ActiveQuizView
            title={activeQuizParams.title}
            sourceDocName={activeQuizParams.sourceDocName}
            questions={activeQuizParams.questions}
            mode={activeQuizParams.mode}
            initialTimeLimitSeconds={activeQuizParams.timeLimitSeconds}
            onFinishQuiz={handleFinishQuiz}
            onExitQuiz={handleExitQuiz}
          />
        ) : activeView === 'quiz-results' && reviewAttempt ? (
          <QuizResultsView
            attempt={reviewAttempt}
            onRetake={() => handleRetakeAttempt(reviewAttempt)}
            onBackToDashboard={() => setActiveView('dashboard')}
            onToggleBookmark={handleToggleBookmark}
          />
        ) : (
          <DashboardView
            attempts={attempts}
            stats={stats}
            onOpenNewQuiz={() => handleOpenNewQuiz()}
            onReviewAttempt={handleReviewAttempt}
            onRetakeAttempt={handleRetakeAttempt}
            onDeleteAttempt={handleDeleteAttempt}
            onSelectSample={(sample) => handleOpenNewQuiz(sample)}
          />
        )}
      </div>

      {/* Quiz Creator & PDF Ingestion Modal */}
      <QuizCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onStartQuiz={handleStartQuiz}
        preselectedSample={preselectedSample}
      />

      {/* Footer (when not taking test) */}
      {activeView !== 'active-quiz' && (
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-slate-700 dark:text-slate-300">
                QuestPDF
              </span>
              <span aria-hidden="true">·</span>
              <span>AI-Powered Multiple Choice Assessment Engine</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Grounded in Source Documents</span>
              <span aria-hidden="true">·</span>
              <span>Pedagogical Reasonings & Distractor Analysis</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
