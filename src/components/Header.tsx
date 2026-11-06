import React, { useState } from 'react';
import { BookOpen, Moon, Sun, PlusCircle, LayoutDashboard, History, Layers, Menu, X } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNav = (tab: 'dashboard' | 'history' | 'sample-docs') => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  const handleMobileNewQuiz = () => {
    onOpenNewQuiz();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-500/20">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <button
            onClick={() => handleMobileNav('dashboard')}
            className="text-left group cursor-pointer"
          >
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              QuestPDF
            </span>
          </button>
        </div>

        {/* Zone 2: Desktop text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
            className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Quiz</span>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className={`flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
            className={`flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentTab === 'sample-docs'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : ''
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Sample Library</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle dark/light mode"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Desktop New Quiz Button */}
          <button
            onClick={onOpenNewQuiz}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-600/20 transition-all whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Quiz</span>
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200 dark:border-slate-700"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-lg px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2">
          <button
            onClick={() => handleMobileNav('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors text-left cursor-pointer min-h-[48px] ${
              currentTab === 'dashboard'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={handleMobileNewQuiz}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors text-left cursor-pointer min-h-[48px] my-1 shadow-xs"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Generate New Quiz from PDF</span>
          </button>

          <button
            onClick={() => handleMobileNav('history')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors text-left cursor-pointer min-h-[48px] ${
              currentTab === 'history'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-5 h-5" />
            <span>Quiz History & Analytics</span>
          </button>

          <button
            onClick={() => handleMobileNav('sample-docs')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors text-left cursor-pointer min-h-[48px] ${
              currentTab === 'sample-docs'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>Sample Curriculum Library</span>
          </button>
        </div>
      )}
    </header>
  );
};
