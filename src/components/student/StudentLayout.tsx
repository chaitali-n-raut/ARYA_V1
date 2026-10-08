import React from 'react';
import { User, StudentRecord } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  UserCheck,
  TrendingUp,
  Target,
  Compass,
  Milestone,
  Briefcase,
  Send,
  BarChart2,
  Bell,
  LogOut,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';

interface Props {
  currentUser: User;
  student: StudentRecord;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreadNotifsCount: number;
  onLogout: () => void;
  children: React.ReactNode;
}

export const StudentLayout: React.FC<Props> = ({
  currentUser,
  student,
  currentTab,
  onSelectTab,
  unreadNotifsCount,
  onLogout,
  children
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'readiness', label: 'Readiness', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'skillgap', label: 'Skill Gaps', icon: <Target className="w-4 h-4" /> },
    { id: 'careerpaths', label: 'Career Paths', icon: <Compass className="w-4 h-4" /> },
    { id: 'roadmap', label: 'Learning Roadmap', icon: <Milestone className="w-4 h-4" /> },
    { id: 'placements', label: 'Placement Drives', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'applications', label: 'My Applications', icon: <Send className="w-4 h-4" /> },
    { id: 'profile', label: 'Update Profile', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      badge: unreadNotifsCount > 0 ? String(unreadNotifsCount) : undefined
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7FBFB] dark:bg-[#0F171A] text-[#263238] dark:text-[#F1F5F9] flex flex-col md:flex-row transition-colors">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#142024] border-r border-[#E4ECEA] dark:border-[#1F333A] flex flex-col shrink-0 transition-colors">
        {/* User Identity Lockup */}
        <div className="p-5 border-b border-[#E4ECEA] dark:border-[#1F333A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF7F8] dark:bg-[#153430] text-[#2EA396] dark:text-[#58BDB2] font-bold flex items-center justify-center text-sm border border-[#58BDB2]/30 dark:border-[#27665E]">
              {currentUser.name.trim().split(/\s+/).map((n) => n[0]).join('')}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] truncate">{currentUser.name}</h3>
              <p className="text-[11px] font-mono text-[#687572] dark:text-[#94A3B8] truncate">{student.Student_ID}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-[#1E3036] flex items-center justify-between text-[11px] text-[#687572] dark:text-[#94A3B8]">
            <span>{student.Branch.split('&')[0]} · Yr {student.Year}</span>
            <span className="font-semibold text-[#2EA396] dark:text-[#58BDB2]">CGPA {student.CGPA.toFixed(2)}</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#EAF7F8] dark:bg-[#153430] text-[#2EA396] dark:text-[#58BDB2] font-semibold border border-[#58BDB2]/20 dark:border-[#27665E]'
                    : 'text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9] hover:bg-neutral-50 dark:hover:bg-[#1B2B30]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={active ? 'text-[#58BDB2]' : 'text-[#687572] dark:text-[#94A3B8]'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      active
                        ? 'bg-[#58BDB2] text-white'
                        : 'bg-[#EAF7F8] dark:bg-[#10272B] text-[#2EA396] dark:text-[#58BDB2]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mentor Association Notice */}
        <div className="p-4 m-3 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A] text-[11px] text-[#687572] dark:text-[#94A3B8]">
          <div className="font-semibold text-[#263238] dark:text-[#F1F5F9]">Assigned Mentor:</div>
          <div>{student.Mentor || 'Faculty Advisory Department'}</div>
          <div className="text-[10px] text-[#2EA396] dark:text-[#58BDB2] mt-0.5">Section: {student.Section}</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto">
        {/* Top Breadcrumb & Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#E4ECEA] dark:border-[#1F333A] mb-6">
          <div className="flex items-center gap-2 text-xs text-[#687572] dark:text-[#94A3B8]">
            <span>Student Workspace</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-[#263238] dark:text-[#F1F5F9] capitalize">{currentTab}</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Day / Night Theme Toggle inside Workspace */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Day View' : 'Switch to Night View'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer bg-white dark:bg-[#142024] border-[#E4ECEA] dark:border-[#22353B] text-[#263238] dark:text-[#F1F5F9] hover:bg-neutral-50 dark:hover:bg-[#1B2B30]"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span className="font-semibold">Day View</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-semibold">Night View</span>
                </>
              )}
            </button>

            <span className="text-[#687572] dark:text-[#94A3B8] hidden sm:inline">
              Authenticated as <strong>{currentUser.email}</strong>
            </span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs text-[#687572] dark:text-[#94A3B8] hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
};
