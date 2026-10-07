import React, { useState, useEffect } from 'react';
import { User, StudentRecord, UserRole } from './types';
import { authService } from './services/authService';
import { authApiService } from './services/authApiService';
import { studentService } from './services/studentService';
import { placementService } from './services/placementService';

// Common Components
import { RoleSwitcherBanner } from './components/common/RoleSwitcherBanner';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { ResearchModal } from './components/research/ResearchModal';

// Landing
import { LandingPage } from './components/landing/LandingPage';

// Student Components
import { StudentLayout } from './components/student/StudentLayout';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentProfile } from './components/student/StudentProfile';
import { StudentReadiness } from './components/student/StudentReadiness';
import { StudentSkillGap } from './components/student/StudentSkillGap';
import { StudentCareerPaths } from './components/student/StudentCareerPaths';
import { StudentRoadmap } from './components/student/StudentRoadmap';
import { StudentPlacements } from './components/student/StudentPlacements';
import { StudentApplications } from './components/student/StudentApplications';
import { StudentAnalytics } from './components/student/StudentAnalytics';
import { StudentNotifications } from './components/student/StudentNotifications';

// Other Role Portals
import { FacultyPortal } from './components/faculty/FacultyPortal';
import { TnpPortal } from './components/tnp/TnpPortal';
import { RecruiterPortal } from './components/recruiter/RecruiterPortal';
import { AdminPortal } from './components/admin/AdminPortal';

import { ShieldAlert, ArrowRight, LogIn } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [currentView, setCurrentView] = useState<string>('landing');
  const [studentTab, setStudentTab] = useState<string>('dashboard');
  const [currentStudent, setCurrentStudent] = useState<StudentRecord | null>(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authDefaultRole, setAuthDefaultRole] = useState<UserRole>('student');
  const [researchModalOpen, setResearchModalOpen] = useState(false);

  // Authorization barrier alert
  const [authBarrierMessage, setAuthBarrierMessage] = useState<string | null>(null);
  const [loginStatusMessage, setLoginStatusMessage] = useState<string | null>(null);

  // Unread notifications count
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // Subscribe to auth state
  useEffect(() => {
    if (authApiService.isConfigured()) {
      void authApiService.getSession().then((result) => {
        if (result.success && result.data.user.emailVerified) {
          authService.setServerUser(result.data.user);
        } else {
          authService.setServerUser(null);
        }
      });
    }
    const unsubscribe = authService.subscribe((user) => {
      setCurrentUser(user);
      if (user && user.isAuthenticated && user.role === 'student') {
        const stuId = user.studentId || `STU-${(user.id || '2026').slice(-4)}`;
        let stu = studentService.getStudentById(stuId);
        if (!stu) {
          stu = studentService.createRawStudent(stuId, user.name, user.email, user.department);
        }
        setCurrentStudent(stu);
      } else {
        setCurrentStudent(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update student record reference whenever current user changes
  useEffect(() => {
    if (currentUser && currentUser.isAuthenticated && currentUser.role === 'student') {
      const stuId = currentUser.studentId || `STU-${(currentUser.id || '2026').slice(-4)}`;
      let stu = studentService.getStudentById(stuId);
      if (!stu) {
        stu = studentService.createRawStudent(stuId, currentUser.name, currentUser.email, currentUser.department);
      }
      setCurrentStudent(stu);

      // Check unread notifications
      const notifs = placementService.getNotificationsForStudent(stu.Student_ID);
      setUnreadNotifs(notifs.filter((n) => !n.read).length);
    }
  }, [currentUser]);

  const refreshStudentState = () => {
    if (currentStudent) {
      const refreshed = studentService.getStudentById(currentStudent.Student_ID);
      if (refreshed) setCurrentStudent(refreshed);
    }
  };

  const refreshNotificationsBadge = () => {
    if (currentStudent) {
      const notifs = placementService.getNotificationsForStudent(currentStudent.Student_ID);
      setUnreadNotifs(notifs.filter((n) => !n.read).length);
    }
  };

  /**
   * Protected Role Navigation Guard:
   * Only allows access to a role portal if user is logged in AND their role matches!
   */
  const handleNavigateView = (view: string) => {
    setAuthBarrierMessage(null);

    if (view === 'landing') {
      setCurrentView('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetRole = view as UserRole;
    const accessCheck = authService.canAccessRole(targetRole);

    if (!accessCheck.allowed) {
      // User is either not authenticated or lacks this role
      setAuthDefaultRole(targetRole);
      setAuthMode('login');
      setAuthModalOpen(true);
      setAuthBarrierMessage(accessCheck.reason || 'Authentication required to open this portal.');
      return;
    }

    // Access granted
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateRole = (role: UserRole) => {
    handleNavigateView(role);
  };

  const handleOpenAuth = (mode: 'login' | 'register', defaultRole?: UserRole) => {
    setAuthMode(mode);
    if (defaultRole) {
      setAuthDefaultRole(defaultRole);
    }
    setAuthBarrierMessage(null);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    if (authApiService.isConfigured()) void authApiService.logout();
    authService.logout();
    setCurrentView('landing');
    setAuthBarrierMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F7FBFB] dark:bg-[#0B1215] text-[#263238] dark:text-[#F1F5F9] flex flex-col font-sans scroll-smooth transition-colors">
      {/* Universal Role Status / Access Switcher */}
      <RoleSwitcherBanner
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={handleNavigateView}
        onOpenAuthForRole={(role) => handleOpenAuth('login', role)}
        onLogout={handleLogout}
      />

      {/* Main Content Router */}
      {currentView === 'landing' && (
        <div className="flex-1 flex flex-col">
          <Header
            currentUser={currentUser}
            currentView={currentView}
            onNavigate={handleNavigateView}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
          />

          {authBarrierMessage && (
            <div className="bg-amber-50 dark:bg-[#271C10] border-b border-amber-200 dark:border-[#4E3416] text-amber-900 dark:text-amber-200 px-6 py-3 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <span>{authBarrierMessage}</span>
              </div>
              <button
                onClick={() => setAuthBarrierMessage(null)}
                className="text-amber-800 dark:text-amber-300 font-bold hover:underline cursor-pointer ml-3"
              >
                Dismiss
              </button>
            </div>
          )}

          <main className="flex-1">
            <LandingPage
              currentUser={currentUser}
              onNavigateRole={handleNavigateRole}
              onOpenAuth={handleOpenAuth}
              onOpenResearch={() => setResearchModalOpen(true)}
            />
          </main>
          <Footer
            onNavigateRole={handleNavigateRole}
            onOpenResearch={() => setResearchModalOpen(true)}
          />
        </div>
      )}

      {/* ----------------- PROTECTED STUDENT PORTAL ----------------- */}
      {currentView === 'student' && (
        currentUser && currentUser.isAuthenticated && currentUser.role === 'student' && currentStudent ? (
          <div className="flex-1 flex flex-col">
            <StudentLayout
              currentUser={currentUser}
              student={currentStudent}
              currentTab={studentTab}
              onSelectTab={setStudentTab}
              unreadNotifsCount={unreadNotifs}
              onLogout={handleLogout}
            >
              {studentTab === 'dashboard' && (
                <StudentDashboard
                  student={currentStudent}
                  onNavigateTab={(tab) => setStudentTab(tab)}
                  onUpdateStudent={(updated) => {
                    studentService.updateStudent(updated);
                    refreshStudentState();
                  }}
                />
              )}
              {studentTab === 'profile' && (
                <StudentProfile
                  student={currentStudent}
                  onUpdateSuccess={refreshStudentState}
                />
              )}
              {studentTab === 'readiness' && (
                <StudentReadiness
                  student={currentStudent}
                  onNavigateTab={(tab) => setStudentTab(tab)}
                  onOpenResearch={() => setResearchModalOpen(true)}
                />
              )}
              {studentTab === 'skillgap' && (
                <StudentSkillGap
                  student={currentStudent}
                  onNavigateTab={(tab) => setStudentTab(tab)}
                />
              )}
              {studentTab === 'careerpaths' && (
                <StudentCareerPaths
                  student={currentStudent}
                  onNavigateTab={(tab) => setStudentTab(tab)}
                />
              )}
              {studentTab === 'roadmap' && (
                <StudentRoadmap student={currentStudent} />
              )}
              {studentTab === 'placements' && (
                <StudentPlacements
                  student={currentStudent}
                  onNavigateTab={(tab) => setStudentTab(tab)}
                />
              )}
              {studentTab === 'applications' && (
                <StudentApplications
                  student={currentStudent}
                  onNavigateTab={(tab) => setStudentTab(tab)}
                />
              )}
              {studentTab === 'analytics' && (
                <StudentAnalytics
                  student={currentStudent}
                  onNavigateTab={(tab) => setStudentTab(tab)}
                  onUpdateSuccess={refreshStudentState}
                />
              )}
              {studentTab === 'notifications' && (
                <StudentNotifications
                  student={currentStudent}
                  onRefreshBadge={refreshNotificationsBadge}
                />
              )}
            </StudentLayout>
          </div>
        ) : (
          <UnauthorizedBarrier
            requiredRole="student"
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('login', 'student')}
            onReturnHome={() => setCurrentView('landing')}
          />
        )
      )}

      {/* ----------------- PROTECTED FACULTY PORTAL ----------------- */}
      {currentView === 'faculty' && (
        currentUser && currentUser.isAuthenticated && currentUser.role === 'faculty' ? (
          <div className="flex-1">
            <FacultyPortal currentUser={currentUser} />
          </div>
        ) : (
          <UnauthorizedBarrier
            requiredRole="faculty"
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('login', 'faculty')}
            onReturnHome={() => setCurrentView('landing')}
          />
        )
      )}

      {/* ----------------- PROTECTED T&P PORTAL ----------------- */}
      {currentView === 'tnp' && (
        currentUser && currentUser.isAuthenticated && currentUser.role === 'tnp' ? (
          <div className="flex-1">
            <TnpPortal currentUser={currentUser} />
          </div>
        ) : (
          <UnauthorizedBarrier
            requiredRole="tnp"
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('login', 'tnp')}
            onReturnHome={() => setCurrentView('landing')}
          />
        )
      )}

      {/* ----------------- PROTECTED RECRUITER PORTAL ----------------- */}
      {currentView === 'recruiter' && (
        currentUser && currentUser.isAuthenticated && currentUser.role === 'recruiter' ? (
          <div className="flex-1">
            <RecruiterPortal currentUser={currentUser} />
          </div>
        ) : (
          <UnauthorizedBarrier
            requiredRole="recruiter"
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('login', 'recruiter')}
            onReturnHome={() => setCurrentView('landing')}
          />
        )
      )}

      {/* ----------------- PROTECTED ADMIN PORTAL ----------------- */}
      {currentView === 'admin' && (
        currentUser && currentUser.isAuthenticated && currentUser.role === 'admin' ? (
          <div className="flex-1">
            <AdminPortal currentUser={currentUser} />
          </div>
        ) : (
          <UnauthorizedBarrier
            requiredRole="admin"
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('login', 'admin')}
            onReturnHome={() => setCurrentView('landing')}
          />
        )
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        initialRole={authDefaultRole}
        onClose={() => setAuthModalOpen(false)}
        onLoginStatus={setLoginStatusMessage}
        onSuccess={(authenticatedRole) => {
          // Immediately redirect to the authorized role page
          setCurrentView(authenticatedRole);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {loginStatusMessage && (
        <div role="status" className="fixed bottom-5 right-5 z-[60] max-w-sm rounded-xl border border-[#58BDB2]/30 bg-white dark:bg-[#142024] px-4 py-3 text-xs text-[#263238] dark:text-[#F1F5F9] shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <span>{loginStatusMessage}</span>
            <button type="button" onClick={() => setLoginStatusMessage(null)} aria-label="Dismiss login status" className="text-[#687572] hover:text-[#263238]">×</button>
          </div>
        </div>
      )}

      <ResearchModal
        isOpen={researchModalOpen}
        onClose={() => setResearchModalOpen(false)}
      />
    </div>
  );
}

/**
 * Clean, secure Unauthorized Access Barrier component
 */
function UnauthorizedBarrier({
  requiredRole,
  currentUser,
  onOpenAuth,
  onReturnHome
}: {
  requiredRole: UserRole;
  currentUser: User | null;
  onOpenAuth: () => void;
  onReturnHome: () => void;
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#F7FBFB] dark:bg-[#0B1215] transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-[#142024] p-8 rounded-3xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-lg text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800/60">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">Role Authorization Required</h2>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
            {currentUser && currentUser.isAuthenticated ? (
              <>
                You are currently signed in as <strong>{currentUser.name}</strong> with the <strong>{currentUser.role.toUpperCase()}</strong> role. This section requires <strong>{requiredRole.toUpperCase()}</strong> credentials.
              </>
            ) : (
              <>
                Access to the <strong>{requiredRole.toUpperCase()}</strong> workspace requires valid institutional registration or sign in.
              </>
            )}
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={onOpenAuth}
            className="w-full py-2.5 px-4 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Register as {requiredRole.toUpperCase()}</span>
          </button>

          <button
            onClick={onReturnHome}
            className="w-full py-2 px-4 bg-neutral-100 dark:bg-[#1E2E33] hover:bg-neutral-200 dark:hover:bg-[#253940] text-[#263238] dark:text-[#F1F5F9] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Return to Public Home
          </button>
        </div>
      </div>
    </div>
  );
}
