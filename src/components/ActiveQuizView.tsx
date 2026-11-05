import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Compass,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Grid,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  X,
  Send,
  RotateCcw
} from 'lucide-react';
import { MCQQuestion, OptionId, QuizMode } from '../types/quiz';

interface ActiveQuizViewProps {
  title: string;
  sourceDocName: string;
  questions: MCQQuestion[];
  mode: QuizMode;
  initialTimeLimitSeconds?: number;
  onFinishQuiz: (results: {
    userAnswers: Record<string, OptionId>;
    timeSpentSeconds: number;
    bookmarkedQuestionIds: string[];
  }) => void;
  onExitQuiz: () => void;
}

export const ActiveQuizView: React.FC<ActiveQuizViewProps> = ({
  title,
  sourceDocName,
  questions,
  mode,
  initialTimeLimitSeconds = 0,
  onFinishQuiz,
  onExitQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, OptionId>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [showExplanationUntimed, setShowExplanationUntimed] = useState<boolean>(false);
  
  // Timer states
  const [timeRemaining, setTimeRemaining] = useState<number>(initialTimeLimitSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  
  // Modals
  const [showGridModal, setShowGridModal] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      if (mode === 'timed') {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto submit when time runs out
            handleFinalSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, initialTimeLimitSeconds]);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionId: OptionId) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleClearAnswer = () => {
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
  };

  const handleToggleBookmark = (qId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowExplanationUntimed(false);
    } else {
      setShowSubmitConfirm(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowExplanationUntimed(false);
    }
  };

  const handleFinalSubmit = useCallback(() => {
    setShowSubmitConfirm(false);
    const timeSpent = mode === 'timed' ? initialTimeLimitSeconds - timeRemaining : elapsedSeconds;
    onFinishQuiz({
      userAnswers,
      timeSpentSeconds: Math.max(1, timeSpent),
      bookmarkedQuestionIds: Array.from(bookmarkedIds),
    });
  }, [mode, initialTimeLimitSeconds, timeRemaining, elapsedSeconds, userAnswers, bookmarkedIds, onFinishQuiz]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSubmitConfirm || showGridModal || showExitConfirm) return;

      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (['1', 'a', 'A'].includes(e.key)) {
        handleSelectOption('A');
      } else if (['2', 'b', 'B'].includes(e.key)) {
        handleSelectOption('B');
      } else if (['3', 'c', 'C'].includes(e.key)) {
        handleSelectOption('C');
      } else if (['4', 'd', 'D'].includes(e.key)) {
        handleSelectOption('D');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalQuestions, showSubmitConfirm, showGridModal, showExitConfirm]);

  const isCurrentBookmarked = bookmarkedIds.has(currentQuestion.id);
  const currentSelectedOption = userAnswers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      {/* Top Test Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Exit & Quiz Info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Exit Exam</span>
            </button>

            <div className="border-l border-slate-200 dark:border-slate-800 pl-3 min-w-0">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                <span>{sourceDocName}</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>Question {currentIndex + 1} of {totalQuestions}</span>
              </p>
            </div>
          </div>

          {/* Right: Timer & Tools */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Timer Display */}
            {mode === 'timed' ? (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-sm font-semibold tabular-nums ${
                  timeRemaining < 120
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 animate-pulse'
                    : timeRemaining < 300
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-sm tabular-nums">
                <Compass className="w-4 h-4 text-indigo-500" />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>
            )}

            {/* Bookmark Question Button */}
            <button
              onClick={() => handleToggleBookmark(currentQuestion.id)}
              aria-label="Flag question for review"
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isCurrentBookmarked
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isCurrentBookmarked ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            {/* Question Grid Drawer Toggle */}
            <button
              onClick={() => setShowGridModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Grid className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Overview</span>
              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold ml-1">
                {answeredCount}/{totalQuestions}
              </span>
            </button>

            {/* Quick Submit Button */}
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Question Arena */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Question Meta Strip */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Question {currentIndex + 1}
              </span>
              <span aria-hidden="true">·</span>
              <span>{currentQuestion.topicTag || 'Core Subject'}</span>
              {currentQuestion.difficulty && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{currentQuestion.difficulty}</span>
                </>
              )}
            </div>

            {isCurrentBookmarked && (
              <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5" />
                Flagged for Review
              </span>
            )}
          </div>

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 leading-relaxed balance-text">
            {currentQuestion.question}
          </h2>

          {/* 4 Multiple Choice Options */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((option) => {
              const isSelected = currentSelectedOption === option.id;
              
              // In untimed mode when showing explanation
              const isCorrectAnswer = option.id === currentQuestion.correctAnswer;
              let optionStyles = 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850';

              if (mode === 'untimed' && showExplanationUntimed) {
                if (isCorrectAnswer) {
                  optionStyles = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100';
                } else if (isSelected && !isCorrectAnswer) {
                  optionStyles = 'border-rose-400 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100';
                }
              } else if (isSelected) {
                optionStyles = 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-500';
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 cursor-pointer ${optionStyles}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-colors ${
                      mode === 'untimed' && showExplanationUntimed && isCorrectAnswer
                        ? 'bg-emerald-600 text-white'
                        : mode === 'untimed' && showExplanationUntimed && isSelected && !isCorrectAnswer
                        ? 'bg-rose-600 text-white'
                        : isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {option.id}
                  </div>
                  <span className="text-sm sm:text-base text-slate-800 dark:text-slate-200 pt-0.5 leading-relaxed flex-1">
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Untimed Mode: Instant Explanation Accordion / Reveal */}
          {mode === 'untimed' && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowExplanationUntimed(!showExplanationUntimed)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
              >
                <Lightbulb className="w-4 h-4" />
                <span>
                  {showExplanationUntimed ? 'Hide Answer & Pedagogical Reasoning' : 'Reveal Answer & Pedagogical Reasoning'}
                </span>
              </button>

              {showExplanationUntimed && (
                <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Correct Answer: Option {currentQuestion.correctAnswer}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Sticky Action Deck */}
      <footer className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-3.5 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Previous button */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Middle: Clear answer or jump info */}
          <div className="flex items-center gap-2">
            {currentSelectedOption && (
              <button
                onClick={handleClearAnswer}
                className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Selection</span>
              </button>
            )}
          </div>

          {/* Next / Submit button */}
          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <span>Next Question</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="flex items-center gap-1.5 px-6 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-colors cursor-pointer"
            >
              <span>Finish & Submit</span>
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </footer>

      {/* Question Overview Grid Modal */}
      {showGridModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Question Overview Navigator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {answeredCount} answered · {unansweredCount} remaining · {bookmarkedIds.size} flagged
                </p>
              </div>
              <button
                onClick={() => setShowGridModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of question numbers */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-80 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isAnswered = !!userAnswers[q.id];
                const isCurrent = idx === currentIndex;
                const isFlagged = bookmarkedIds.has(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowGridModal(false);
                      setShowExplanationUntimed(false);
                    }}
                    className={`relative h-10 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900 bg-indigo-600 text-white'
                        : isAnswered
                        ? 'bg-slate-800 text-white dark:bg-slate-700'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-800 dark:bg-slate-700" /> Answered
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800 border" /> Unanswered
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Flagged
                </span>
              </div>
              <button
                onClick={() => setShowGridModal(false)}
                className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Dialog */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Ready to Submit Quiz?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your answers will be graded and verified explanations will be revealed.
                </p>
              </div>
            </div>

            {/* Status overview */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Questions Answered:</span>
                <span className="font-semibold font-mono">{answeredCount} of {totalQuestions}</span>
              </div>
              {unansweredCount > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
                  <span>Unanswered Questions:</span>
                  <span className="font-semibold font-mono">{unansweredCount}</span>
                </div>
              )}
              {bookmarkedIds.size > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400">
                  <span>Marked for Review:</span>
                  <span className="font-semibold font-mono">{bookmarkedIds.size}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Continue Quiz
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Confirm & See Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Leave Practice Session?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Unsubmitted test progress will be lost.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Keep Testing
              </button>
              <button
                type="button"
                onClick={onExitQuiz}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
