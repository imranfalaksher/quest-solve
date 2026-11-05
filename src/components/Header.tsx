import React from 'react';
import { BookOpen, Moon, Sun, PlusCircle, LayoutDashboard, History, Layers } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'history' | 'sample-docs';
  onNavigate: (tab: 'dashboard' | 'history' | 'sample-docs') => void;
  onOpenNewQuiz: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenNewQuiz,
  isDarkMode,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/90 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-left group cursor-pointer"
          >
            <span className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              QuestPDF
            </span>
          </button>
        </div>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'dashboard'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : ''
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={onOpenNewQuiz}
            className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Quiz</span>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className={`flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'history'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : ''
            }`}
          >
            <History className="w-4 h-4" />
            <span>Quiz History</span>
          </button>

          <button
            onClick={() => onNavigate('sample-docs')}
            className={`flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'sample-docs'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : ''
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Sample Library</span>
          </button>
        </nav>

        {/* Zone 3: Primary action & Theme Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle dark/light mode"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={onOpenNewQuiz}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-600/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Quiz</span>
          </button>
        </div>
      </div>
    </header>
  );
};
