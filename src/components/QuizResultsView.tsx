import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  LayoutDashboard,
  Printer,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen
} from 'lucide-react';
import { QuizAttempt, OptionId } from '../types/quiz';

interface QuizResultsViewProps {
  attempt: QuizAttempt;
  onRetake: () => void;
  onBackToDashboard: () => void;
  onToggleBookmark: (attemptId: string, questionId: string) => void;
}

export const QuizResultsView: React.FC<QuizResultsViewProps> = ({
  attempt,
  onRetake,
  onBackToDashboard,
  onToggleBookmark,
}) => {
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct' | 'bookmarked'>('all');
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  const toggleExpand = (qId: string) => {
    setExpandedExplanations((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const isQuestionCorrect = (qId: string, correct: OptionId) => {
    return attempt.userAnswers[qId] === correct;
  };

  const correctQuestions = attempt.questions.filter((q) => isQuestionCorrect(q.id, q.correctAnswer));
  const incorrectQuestions = attempt.questions.filter((q) => !isQuestionCorrect(q.id, q.correctAnswer));
  const bookmarkedQuestions = attempt.questions.filter((q) => attempt.bookmarkedQuestionIds.includes(q.id));

  // Determine filtered list
  const filteredQuestions = attempt.questions.filter((q) => {
    if (filter === 'incorrect') return !isQuestionCorrect(q.id, q.correctAnswer);
    if (filter === 'correct') return isQuestionCorrect(q.id, q.correctAnswer);
    if (filter === 'bookmarked') return attempt.bookmarkedQuestionIds.includes(q.id);
    return true;
  });

  // Performance tier
  let tierLabel = 'Needs Revision';
  let tierColor = 'text-rose-600 dark:text-rose-400';
  let tierBg = 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900';

  if (attempt.percentage >= 85) {
    tierLabel = 'Curriculum Mastery';
    tierColor = 'text-emerald-600 dark:text-emerald-400';
    tierBg = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900';
  } else if (attempt.percentage >= 70) {
    tierLabel = 'Proficient Comprehension';
    tierColor = 'text-indigo-600 dark:text-indigo-400';
    tierBg = 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900';
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button
            onClick={onBackToDashboard}
            className="text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors mb-1"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
            <span aria-hidden="true">/</span>
            <span>Quiz Assessment Breakdown</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
            {attempt.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Source: {attempt.sourceDocName}</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Mode: {attempt.mode === 'timed' ? 'Timed Exam' : 'Self-Paced Practice'}</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Completed on {new Date(attempt.date).toLocaleDateString()}</span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer min-h-[38px]"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Print Report</span>
          </button>

          <button
            onClick={onRetake}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer min-h-[38px]"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Retake Quiz</span>
          </button>

          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer min-h-[38px]"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Score & Diagnostic Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Scorecard */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col xs:flex-row items-start xs:items-center gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 flex flex-col items-center justify-center shrink-0">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {attempt.percentage}%
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Score
            </span>
          </div>

          <div className="space-y-2">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${tierBg} ${tierColor}`}>
              <Award className="w-3.5 h-3.5" />
              <span>{tierLabel}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {attempt.score} of {attempt.totalQuestions} Questions Answered Correctly
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {attempt.percentage >= 70
                ? 'Strong grasp of central concepts and distractor analysis.'
                : 'Review the detailed pedagogical explanations below to shore up weak topics.'}
            </p>
          </div>
        </div>

        {/* Metric 1: Time Spent */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Time Spent</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {formatTime(attempt.timeSpentSeconds)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Average ~{Math.round(attempt.timeSpentSeconds / Math.max(1, attempt.totalQuestions))}s per question
            </p>
          </div>
        </div>

        {/* Metric 2: Accuracy & Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Review Flagged</span>
            <Bookmark className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {bookmarkedQuestions.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {bookmarkedQuestions.length === 1 ? '1 question' : `${bookmarkedQuestions.length} questions`} saved for study
            </p>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="space-y-4">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Question Review & Pedagogical Reasonings</span>
          </div>

          {/* Interactive filter segmented control - Mobile scrollable */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({attempt.totalQuestions})
            </button>

            <button
              onClick={() => setFilter('incorrect')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'incorrect'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Incorrect ({incorrectQuestions.length})
            </button>

            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'correct'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Correct ({correctQuestions.length})
            </button>

            <button
              onClick={() => setFilter('bookmarked')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'bookmarked'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Flagged ({bookmarkedQuestions.length})
            </button>
          </div>
        </div>

        {/* Question Cards List */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No questions found in this view
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Switch filter to view all questions and answers.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const userChoice = attempt.userAnswers[q.id];
              const isCorrect = userChoice === q.correctAnswer;
              const isFlagged = attempt.bookmarkedQuestionIds.includes(q.id);
              const isExpanded = expandedExplanations[q.id] ?? true; // Default expanded for comprehensive learning

              return (
                <div
                  key={q.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs space-y-4 transition-all ${
                    isCorrect
                      ? 'border-slate-200 dark:border-slate-800'
                      : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        Q{q.questionNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        {q.topicTag || 'Core Curriculum'}
                      </span>
                      {q.difficulty && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{q.difficulty}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Correct (+1)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                          <XCircle className="w-4 h-4" />
                          <span>Incorrect (0)</span>
                        </span>
                      )}

                      <button
                        onClick={() => onToggleBookmark(attempt.id, q.id)}
                        className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                          isFlagged ? 'text-amber-500' : 'text-slate-400'
                        }`}
                        title={isFlagged ? 'Remove bookmark' : 'Flag for revision'}
                      >
                        {isFlagged ? (
                          <BookmarkCheck className="w-4 h-4" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                    {q.question}
                  </p>

                  {/* 4 Options Grid */}
                  <div className="space-y-2 pt-1">
                    {q.options.map((opt) => {
                      const isOptionCorrect = opt.id === q.correctAnswer;
                      const isOptionChosen = userChoice === opt.id;

                      let optClass = 'border-2 border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100';
                      let badge = null;

                      if (isOptionCorrect) {
                        optClass = 'border-2 border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500';
                        badge = (
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 ml-auto whitespace-nowrap bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                            Correct Answer
                          </span>
                        );
                      } else if (isOptionChosen && !isOptionCorrect) {
                        optClass = 'border-2 border-rose-500 bg-rose-50/90 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100 ring-1 ring-rose-400';
                        badge = (
                          <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 ml-auto whitespace-nowrap bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded">
                            Your Answer
                          </span>
                        );
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 sm:p-3.5 rounded-xl transition-all flex items-start gap-3 text-xs sm:text-sm ${optClass}`}
                        >
                          <span
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center font-bold font-mono text-xs shrink-0 ${
                              isOptionCorrect
                                ? 'bg-emerald-600 text-white'
                                : isOptionChosen && !isOptionCorrect
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className="flex-1 pt-0.5 leading-relaxed font-semibold text-slate-900 dark:text-white">
                            {opt.text}
                          </span>
                          {badge}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pedagogical Explanation Box */}
                  <div className="pt-2">
                    <button
                      onClick={() => toggleExpand(q.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                      <span>Reasoning & Explanation</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5 animate-in fade-in">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>PDF Grounded Rationale</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Nav / Re-test CTA */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        >
          ← Return to Performance Dashboard
        </button>

        <button
          onClick={onRetake}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake This Quiz ({attempt.totalQuestions} Questions)</span>
        </button>
      </div>
    </div>
  );
};
