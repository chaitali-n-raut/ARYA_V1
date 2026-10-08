import React from 'react';
import { User, UserRole } from '../../types';
import { authService } from '../../services/authService';
import { studentService } from '../../services/studentService';
import { useTheme } from '../../context/ThemeContext';
import {
  GraduationCap,
  Users,
  Briefcase,
  Building2,
  RotateCcw,
  Lock,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

interface Props {
  currentUser: User | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuthForRole: (role: UserRole) => void;
  onLogout: () => void;
}

export const RoleSwitcherBanner: React.FC<Props> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenAuthForRole,
  onLogout
}) => {
  const { theme, toggleTheme } = useTheme();

  const roles: { role: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    { role: 'student', label: 'Student', icon: <GraduationCap className="w-3.5 h-3.5" />, desc: 'B.Tech Student Portal' },
    { role: 'faculty', label: 'Faculty / Mentor', icon: <Users className="w-3.5 h-3.5" />, desc: 'Mentor Roster & Upload' },
    { role: 'tnp', label: 'T&P Officer', icon: <Building2 className="w-3.5 h-3.5" />, desc: 'Campus Placement Drives' },
    { role: 'recruiter', label: 'Recruiter', icon: <Briefcase className="w-3.5 h-3.5" />, desc: '2-Stage Candidate Matching' },
  ];

  const handleRoleClick = (role: UserRole) => {
    if (!currentUser || !currentUser.isAuthenticated) {
      onOpenAuthForRole(role);
      return;
    }

    if (currentUser.role === role) {
      onNavigate(role);
    } else {
      onOpenAuthForRole(role);
    }
  };

  const handleClearSession = () => {
    authService.clearAllSessionData();
    studentService.resetToDefault();
    window.location.reload();
  };

  const isDark = theme === 'dark';

  return (
    <div className="text-xs border-b py-2 px-4 sticky top-0 z-50 transition-colors backdrop-blur-md bg-white/95 dark:bg-[#142024]/95 text-[#263238] dark:text-[#F1F5F9] border-[#E4ECEA] dark:border-[#1F333A] shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Status / Real Identity */}
        <div className="flex items-center gap-2">
          {currentUser && currentUser.isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-[#263238] dark:text-[#F1F5F9]">
                {currentUser.name}
              </span>
              <span className="text-[10px] bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] px-2 py-0.5 rounded font-mono uppercase font-bold border border-[#58BDB2]/30 dark:border-[#27665E]">
                {currentUser.role}
              </span>
              {currentUser.studentId && (
                <span className="text-[10px] font-mono text-[#687572] dark:text-[#94A3B8]">
                  ({currentUser.studentId})
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[#687572] dark:text-[#94A3B8]">
              <Lock className="w-3 h-3 text-amber-500" />
              <span className="text-[11px] font-medium">
                Campus Gateway · Sign in or register to access verified role workspaces
              </span>
            </div>
          )}
        </div>

        {/* Role Portals Navigation & Theme Toggle */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {roles.map((r) => {
            const isCurrentRole = currentUser?.isAuthenticated && currentUser.role === r.role;
            const isViewingThisRole = isCurrentRole && currentView === r.role;

            return (
              <button
                key={r.role}
                onClick={() => handleRoleClick(r.role)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap text-xs font-medium cursor-pointer ${
                  isViewingThisRole
                    ? 'bg-[#58BDB2] text-white shadow-xs font-semibold'
                    : isCurrentRole
                    ? 'bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] border border-[#58BDB2]/30 dark:border-[#27665E]'
                    : 'text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9] hover:bg-neutral-100 dark:hover:bg-[#1B2B30]'
                }`}
                title={
                  currentUser?.isAuthenticated && currentUser.role === r.role
                    ? `Open your ${r.label} portal`
                    : `Sign in to verified ${r.label} portal`
                }
              >
                {r.icon}
                <span>{r.label}</span>
                {!isCurrentRole && (
                  <Lock className="w-2.5 h-2.5 opacity-60 text-amber-500" />
                )}
              </button>
            );
          })}

          <div className="h-4 w-px mx-1 hidden md:block bg-neutral-200 dark:bg-neutral-700" />

          {/* Theme Day / Night Switcher */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Day (Light) Mode' : 'Switch to Night (Dark) Mode'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border bg-white dark:bg-[#1B2B30] border-[#E4ECEA] dark:border-[#273D44] text-[#263238] dark:text-[#F1F5F9] hover:bg-neutral-50 dark:hover:bg-[#22353C] shadow-2xs"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-semibold text-amber-300">Day View</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[11px] font-semibold text-indigo-600">Night View</span>
              </>
            )}
          </button>

          {currentView !== 'landing' && (
            <button
              onClick={() => onNavigate('landing')}
              className="px-2 py-1 rounded-lg transition-colors whitespace-nowrap text-xs cursor-pointer text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9] hover:bg-neutral-100 dark:hover:bg-[#1B2B30]"
            >
              Home
            </button>
          )}

          {currentUser?.isAuthenticated && (
            <button
              onClick={onLogout}
              className="px-2 py-1 rounded-lg transition-colors whitespace-nowrap text-xs cursor-pointer flex items-center gap-1 text-[#687572] dark:text-[#94A3B8] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          )}

          <button
            onClick={handleClearSession}
            title="Reset active browser storage session"
            className="flex items-center gap-1 px-1.5 py-1 rounded-lg transition-colors text-xs cursor-pointer text-[#687572] dark:text-[#94A3B8] hover:text-amber-600 dark:hover:text-amber-400 hover:bg-neutral-100 dark:hover:bg-[#1B2B30]"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
