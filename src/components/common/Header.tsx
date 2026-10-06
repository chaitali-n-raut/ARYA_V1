import React from 'react';
import { User, UserRole } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, ArrowRight, UserCheck, LogOut, Sun, Moon } from 'lucide-react';

interface Props {
  currentUser: User | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode: 'login' | 'register', defaultRole?: UserRole) => void;
  onLogout: () => void;
}

export const Header: React.FC<Props> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenAuth,
  onLogout
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const scrollToSection = (id: string) => {
    if (currentView !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B1215]/95 backdrop-blur-md border-b border-[#E4ECEA] dark:border-[#1F333A] px-6 py-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-2xl font-extrabold tracking-tight text-[#263238] dark:text-[#F1F5F9] flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <span className="text-[#58BDB2]">ARYA</span>
          <span>AI</span>
        </button>

        {/* Zone 2: clean text navigation links with smooth scrolling */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#687572] dark:text-[#94A3B8]">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors hover:text-[#263238] dark:hover:text-[#F1F5F9] cursor-pointer ${
              currentView === 'landing' ? 'text-[#58BDB2] dark:text-[#58BDB2] font-semibold' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="transition-colors hover:text-[#263238] dark:hover:text-[#F1F5F9] cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="transition-colors hover:text-[#263238] dark:hover:text-[#F1F5F9] cursor-pointer"
          >
            Readiness AI
          </button>
          <button
            onClick={() => scrollToSection('why-choose')}
            className="transition-colors hover:text-[#263238] dark:hover:text-[#F1F5F9] cursor-pointer"
          >
            Why ARYA
          </button>
          <button
            onClick={() => scrollToSection('research')}
            className="transition-colors hover:text-[#263238] dark:hover:text-[#F1F5F9] cursor-pointer"
          >
            Research & XAI
          </button>
        </nav>

        {/* Zone 3: actions & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Day / Night Theme Button */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Day (Light) Mode' : 'Switch to Night (Dark) Mode'}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer bg-[#F7FBFB] dark:bg-[#152226] border-[#E4ECEA] dark:border-[#22353B] text-[#263238] dark:text-[#F1F5F9] hover:bg-neutral-100 dark:hover:bg-[#1B2B30]"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Day</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline">Night</span>
              </>
            )}
          </button>

          {currentUser && currentUser.isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-[#263238] dark:text-[#F1F5F9]">{currentUser.name}</span>
                <span className="text-[10px] font-semibold text-[#2EA396] dark:text-[#58BDB2] uppercase tracking-wider">
                  {currentUser.role} Account
                </span>
              </div>

              <button
                onClick={() => onNavigate(currentUser.role)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#58BDB2] hover:bg-[#48a99f] rounded-xl shadow-xs hover:shadow transition-all cursor-pointer whitespace-nowrap"
              >
                <span>My {currentUser.role.toUpperCase()} Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 text-[#687572] dark:text-[#94A3B8] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-2 text-sm font-semibold text-[#263238] dark:text-[#F1F5F9] hover:text-[#58BDB2] dark:hover:text-[#58BDB2] transition-colors cursor-pointer"
              >
                Sign In
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#58BDB2] hover:bg-[#48a99f] rounded-xl shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
