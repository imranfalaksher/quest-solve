import React, { useState } from 'react';
import {
  PlusCircle,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  ArrowRight,
  Search,
  BookOpen,
  Trash2,
  RotateCcw,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import { QuizAttempt, QuizStats, SampleDoc } from '../types/quiz';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocs';

interface DashboardViewProps {
  attempts: QuizAttempt[];
  stats: QuizStats;
  onOpenNewQuiz: () => void;
  onReviewAttempt: (attempt: QuizAttempt) => void;
  onRetakeAttempt: (attempt: QuizAttempt) => void;
  onDeleteAttempt: (id: string) => void;
  onSelectSample: (sample: SampleDoc) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  attempts,
  stats,
  onOpenNewQuiz,
  onReviewAttempt,
  onRetakeAttempt,
  onDeleteAttempt,
  onSelectSample,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modeFilter, setModeFilter] = useState<'all' | 'timed' | 'untimed'>('all');

  const filteredAttempts = attempts.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.sourceDocName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = modeFilter === 'all' || a.mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome & Quick Launch */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>AI Practice & Assessment Platform</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
            Curriculum Mastery Through Intelligent Practice
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Upload your lecture slides, academic textbooks, or research papers. The AI extracts core theorems and distills rigorous multiple-choice assessments with in-depth reasoning explanations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={onOpenNewQuiz}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate New Quiz</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Performance KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Quizzes</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3">
            <div className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {stats.totalTests}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Completed exam sessions
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Questions Solved</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {stats.totalQuestionsAnswered}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Cumulative MCQs practiced
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Score</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3">
            <div className="font-mono text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {stats.averageScore}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Overall accuracy benchmark
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Score</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {stats.bestScore}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Personal best performance
            </p>
          </div>
        </div>
      </div>

      {/* Visual Performance Trend Summary */}
      {attempts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Historical Score Trajectory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualizing scores across your recent exam submissions (Target: 80%+ mastery)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> ≥80% Mastery
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500" /> 60-79% Proficient
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" /> &lt;60% Revision
              </span>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 items-end h-44 border-b border-slate-200 dark:border-slate-800 pb-2">
            {attempts.slice(0, 6).reverse().map((att) => {
              const heightPercent = Math.max(15, att.percentage);
              const barColor =
                att.percentage >= 80
                  ? 'bg-emerald-500 dark:bg-emerald-600'
                  : att.percentage >= 60
                  ? 'bg-indigo-500 dark:bg-indigo-600'
                  : 'bg-rose-500 dark:bg-rose-600';

              return (
                <div
                  key={att.id}
                  onClick={() => onReviewAttempt(att)}
                  className="flex flex-col items-center justify-end h-full group cursor-pointer"
                  title={`${att.title}: ${att.percentage}% (${att.score}/${att.totalQuestions})`}
                >
                  <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-1 tabular-nums group-hover:scale-110 transition-transform">
                    {att.percentage}%
                  </span>
                  <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800 rounded-t-lg h-32 flex items-end p-1">
                    <div
                      className={`w-full rounded-md transition-all duration-500 ${barColor}`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 truncate max-w-full text-center">
                    {new Date(att.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historical Quiz Performance Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Historical Quiz Logs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detailed record of all generated practice sessions and question reasonings
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search past quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white w-full sm:w-56"
              />
            </div>

            {/* Mode Filter */}
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setModeFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  modeFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setModeFilter('timed')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  modeFilter === 'timed'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Timed
              </button>
              <button
                onClick={() => setModeFilter('untimed')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  modeFilter === 'untimed'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Untimed
              </button>
            </div>
          </div>
        </div>

        {/* Table / Card Content */}
        {filteredAttempts.length === 0 ? (
          <div className="text-center py-12 p-6">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No historical quiz attempts found
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Generate a practice test from a PDF to see your analytics here.
            </p>
            <button
              onClick={onOpenNewQuiz}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer min-h-[40px]"
            >
              Generate First Quiz
            </button>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase font-semibold">
                    <th className="py-3 px-5">Date & Time</th>
                    <th className="py-3 px-5">Quiz Title & Document</th>
                    <th className="py-3 px-5">Questions</th>
                    <th className="py-3 px-5">Format</th>
                    <th className="py-3 px-5">Score & Accuracy</th>
                    <th className="py-3 px-5">Time Spent</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {filteredAttempts.map((att) => {
                    const isMastered = att.percentage >= 80;

                    return (
                      <tr
                        key={att.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Date */}
                        <td className="py-3.5 px-5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {new Date(att.date).toLocaleDateString()}{' '}
                          <span className="text-[11px] font-mono text-slate-500">
                            {new Date(att.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* Title & Doc */}
                        <td className="py-3.5 px-5 max-w-xs">
                          <button
                            onClick={() => onReviewAttempt(att)}
                            className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left truncate block max-w-xs cursor-pointer"
                          >
                            {att.title}
                          </button>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                            {att.sourceDocName}
                          </span>
                        </td>

                        {/* Question count */}
                        <td className="py-3.5 px-5 font-mono tabular-nums whitespace-nowrap text-slate-900 dark:text-slate-100 font-semibold">
                          {att.totalQuestions} MCQs
                        </td>

                        {/* Format */}
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                            {att.mode === 'timed' ? 'Timed Exam' : 'Untimed Practice'}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono font-bold text-sm tabular-nums ${
                                isMastered
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : att.percentage >= 60
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {att.percentage}%
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              ({att.score}/{att.totalQuestions})
                            </span>
                          </div>
                        </td>

                        {/* Time spent */}
                        <td className="py-3.5 px-5 font-mono tabular-nums whitespace-nowrap text-slate-700 dark:text-slate-300">
                          {formatDuration(att.timeSpentSeconds)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onReviewAttempt(att)}
                              className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition-colors cursor-pointer min-h-[32px]"
                            >
                              Review
                            </button>

                            <button
                              onClick={() => onRetakeAttempt(att)}
                              title="Retake Quiz"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors cursor-pointer min-h-[32px] min-w-[32px]"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onDeleteAttempt(att.id)}
                              title="Delete Record"
                              className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors cursor-pointer min-h-[32px] min-w-[32px]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Dedicated Card List View */}
            <div className="block md:hidden divide-y divide-slate-200 dark:divide-slate-800">
              {filteredAttempts.map((att) => {
                const isMastered = att.percentage >= 80;

                return (
                  <div key={att.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3
                          onClick={() => onReviewAttempt(att)}
                          className="font-bold text-sm text-slate-900 dark:text-white truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {att.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {att.sourceDocName}
                        </p>
                      </div>

                      <div
                        className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-sm shrink-0 ${
                          isMastered
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : att.percentage >= 60
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {att.percentage}%
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-1">
                      <span>{att.totalQuestions} MCQs · {att.mode === 'timed' ? 'Timed Exam' : 'Untimed Practice'}</span>
                      <span className="font-mono">{formatDuration(att.timeSpentSeconds)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-[11px] text-slate-400">
                        {new Date(att.date).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onReviewAttempt(att)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer min-h-[36px]"
                        >
                          Review Quiz
                        </button>
                        <button
                          onClick={() => onRetakeAttempt(att)}
                          aria-label="Retake Quiz"
                          className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteAttempt(att.id)}
                          aria-label="Delete Quiz"
                          className="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Pre-loaded Academic Sample Curricula Library */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Pre-Loaded Academic Curricula</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instant one-click practice modules ready for testing without needing to upload your own files
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_DOCUMENTS.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
            >
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  {doc.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {doc.summary}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  ~{doc.estimatedPages} pages syllabus
                </span>

                <button
                  onClick={() => onSelectSample(doc)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  <span>Practice Module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
