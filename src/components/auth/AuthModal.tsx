import React, { useState } from 'react';
import { UserRole } from '../../types';
import { authService } from '../../services/authService';
import {
  X,
  CheckCircle,
  GraduationCap,
  Users,
  Building2,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  initialRole?: UserRole;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  initialMode,
  initialRole,
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole || 'student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [organization, setOrganization] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');

  // Optional student fields during registration (all default to 0)
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [initialCgpa, setInitialCgpa] = useState('');
  const [initialLeetcode, setInitialLeetcode] = useState('');
  const [initialCodechef, setInitialCodechef] = useState('');
  const [initialAptitude, setInitialAptitude] = useState('');
  const [initialCommunication, setInitialCommunication] = useState('');
  const [initialTargetRole, setInitialTargetRole] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Sync when initialRole changes
  React.useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  // Sync when initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'forgot') {
      if (!email) {
        setError('Please enter your email address.');
        return;
      }
      setForgotSuccess(true);
      return;
    }

    if (mode === 'login') {
      const res = authService.loginWithCredentials(email, password, selectedRole);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please verify credentials.');
        return;
      }

      onSuccess(res.user!.role);
      onClose();
    } else {
      // Register new user
      if (!fullName.trim()) {
        setError('Full legal name is required.');
        return;
      }
      if (!email.trim()) {
        setError('Email address is required.');
        return;
      }
      if (!password || password.length < 4) {
        setError('Password must be at least 4 characters long.');
        return;
      }

      const res = authService.registerUser({
        name: fullName.trim(),
        email: email.trim(),
        password: password,
        role: selectedRole,
        studentId: selectedRole === 'student' ? studentId.trim() || undefined : undefined,
        organization: selectedRole === 'recruiter' ? organization.trim() || undefined : undefined,
        department: (selectedRole === 'student' || selectedRole === 'faculty') ? department : undefined,
        // Pass optional initial numerical metrics (authService defaults these to 0)
        initialCgpa: initialCgpa ? parseFloat(initialCgpa) : 0,
        initialLeetcode: initialLeetcode ? parseInt(initialLeetcode, 10) : 0,
        initialCodechef: initialCodechef ? parseInt(initialCodechef, 10) : 0,
        initialAptitude: initialAptitude ? parseInt(initialAptitude, 10) : 0,
        initialCommunication: initialCommunication ? parseFloat(initialCommunication) : 0,
        initialTargetRole: initialTargetRole.trim() || undefined
      });

      if (!res.success) {
        setError(res.error || 'Registration failed.');
        return;
      }

      onSuccess(selectedRole);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#142024] rounded-2xl max-w-lg w-full shadow-2xl border border-[#E4ECEA] dark:border-[#1F333A] overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E4ECEA] dark:border-[#1F333A] flex items-center justify-between bg-[#F7FBFB] dark:bg-[#0E171A]">
          <div>
            <h3 className="text-lg font-bold text-[#263238] dark:text-[#F1F5F9]">
              {mode === 'login' ? 'Sign In to ARYA AI' : mode === 'register' ? 'Register New Account' : 'Reset Password'}
            </h3>
            <p className="text-xs text-[#687572] dark:text-[#94A3B8]">
              {mode === 'login'
                ? `Enter your registered credentials to open ${selectedRole.toUpperCase()} workspace`
                : mode === 'register'
                ? `Create a verified ${selectedRole.toUpperCase()} account in the database`
                : 'Enter your email to receive a password reset link'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9] rounded-lg hover:bg-neutral-200/50 dark:hover:bg-[#1E2E33] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {mode !== 'forgot' && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-[#263238] dark:text-[#F1F5F9] mb-2">
                Select Your Role Portal
              </label>
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
                {[
                  { r: 'student', label: 'Student', icon: <GraduationCap className="w-3.5 h-3.5" /> },
                  { r: 'faculty', label: 'Faculty', icon: <Users className="w-3.5 h-3.5" /> },
                  { r: 'tnp', label: 'T&P', icon: <Building2 className="w-3.5 h-3.5" /> },
                  { r: 'recruiter', label: 'Recruiter', icon: <Briefcase className="w-3.5 h-3.5" /> },
                  { r: 'admin', label: 'Admin', icon: <ShieldCheck className="w-3.5 h-3.5" /> }
                ].map((item) => (
                  <button
                    key={item.r}
                    type="button"
                    onClick={() => {
                      setSelectedRole(item.r as UserRole);
                      setError(null);
                    }}
                    className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedRole === item.r
                        ? 'bg-white dark:bg-[#1B2B30] text-[#263238] dark:text-[#F1F5F9] shadow-xs font-semibold border border-[#E4ECEA] dark:border-[#273E45]'
                        : 'text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9]'
                    }`}
                  >
                    <span className="text-[#58BDB2] mb-1">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-xl border border-red-200 dark:border-red-800/60 leading-relaxed space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Access Denied:</strong> {error}
                </div>
              </div>
              {mode === 'login' && error.toLowerCase().includes('not found') && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-xs font-bold text-[#2EA396] dark:text-[#58BDB2] hover:underline flex items-center gap-1 cursor-pointer pt-1"
                >
                  <span>Click here to register this account now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {forgotSuccess ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-[#58BDB2] mx-auto mb-3" />
              <h4 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">Reset Link Sent</h4>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-1 max-w-xs mx-auto">
                We have dispatched a password reset link to <strong>{email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setForgotSuccess(false);
                  setMode('login');
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold bg-[#58BDB2] text-white rounded-lg hover:bg-[#48a99f] transition-colors cursor-pointer shadow-xs"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-[#263238] dark:text-[#F1F5F9] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full legal name"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#1F333A] focus:outline-none focus:border-[#58BDB2] bg-[#F7FBFB] dark:bg-[#0E171A] text-[#263238] dark:text-[#F1F5F9]"
                  />
                </div>
              )}

              {selectedRole === 'student' && mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-[#263238] dark:text-[#F1F5F9] mb-1">
                    Student Roll Number / University ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    placeholder="e.g. 2026-CSE-042"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#1F333A] focus:outline-none focus:border-[#58BDB2] bg-[#F7FBFB] dark:bg-[#0E171A] text-[#263238] dark:text-[#F1F5F9]"
                  />
                </div>
              )}

              {selectedRole === 'recruiter' && mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-[#263238] dark:text-[#F1F5F9] mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#1F333A] focus:outline-none focus:border-[#58BDB2] bg-[#F7FBFB] dark:bg-[#0E171A] text-[#263238] dark:text-[#F1F5F9]"
                  />
                </div>
              )}

              {selectedRole === 'faculty' && mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-[#263238] dark:text-[#F1F5F9] mb-1">Academic Department *</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science and Engineering"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#1F333A] focus:outline-none focus:border-[#58BDB2] bg-[#F7FBFB] dark:bg-[#0E171A] text-[#263238] dark:text-[#F1F5F9]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#263238] dark:text-[#F1F5F9] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@university.edu"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#1F333A] focus:outline-none focus:border-[#58BDB2] bg-[#F7FBFB] dark:bg-[#0E171A] text-[#263238] dark:text-[#F1F5F9]"
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-[#263238] dark:text-[#F1F5F9]">Password *</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-[#58BDB2] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#1F333A] focus:outline-none focus:border-[#58BDB2] bg-[#F7FBFB] dark:bg-[#0E171A] text-[#263238] dark:text-[#F1F5F9]"
                  />
                </div>
              )}

              {/* Optional Student Information Section During Registration */}
              {mode === 'register' && selectedRole === 'student' && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                    className="flex items-center gap-1.5 text-xs text-[#2EA396] dark:text-[#58BDB2] hover:underline font-semibold cursor-pointer"
                  >
                    <span>{showOptionalFields ? 'Hide Optional Initial Scores' : '+ Optional: Enter LeetCode / CodeChef / Aptitude Now (Defaults to 0)'}</span>
                    {showOptionalFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showOptionalFields && (
                    <div className="mt-2.5 p-3.5 rounded-xl bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] grid grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="text-[11px] text-[#687572] dark:text-[#94A3B8] block mb-0.5">LeetCode Solved (Default: 0)</label>
                        <input
                          type="number"
                          min="0"
                          value={initialLeetcode}
                          onChange={(e) => setInitialLeetcode(e.target.value)}
                          placeholder="0"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-[#16272C] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#687572] dark:text-[#94A3B8] block mb-0.5">CodeChef Solved (Default: 0)</label>
                        <input
                          type="number"
                          min="0"
                          value={initialCodechef}
                          onChange={(e) => setInitialCodechef(e.target.value)}
                          placeholder="0"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-[#16272C] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#687572] dark:text-[#94A3B8] block mb-0.5">Cumulative GPA (Default: 0.0)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={initialCgpa}
                          onChange={(e) => setInitialCgpa(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-[#16272C] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#687572] dark:text-[#94A3B8] block mb-0.5">Aptitude Score % (Default: 0)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={initialAptitude}
                          onChange={(e) => setInitialAptitude(e.target.value)}
                          placeholder="0"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-[#16272C] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#687572] dark:text-[#94A3B8] block mb-0.5">Soft Skills (/10) (Default: 0)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={initialCommunication}
                          onChange={(e) => setInitialCommunication(e.target.value)}
                          placeholder="0"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-[#16272C] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#687572] dark:text-[#94A3B8] block mb-0.5">Target Role</label>
                        <input
                          type="text"
                          value={initialTargetRole}
                          onChange={(e) => setInitialTargetRole(e.target.value)}
                          placeholder="e.g. Software Engineer"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-[#16272C] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-2 text-[10px] text-[#687572] dark:text-[#94A3B8] bg-white dark:bg-[#142024] p-2 rounded-lg border border-[#E4ECEA] dark:border-[#1F333A]">
                        Note: All these values default to 0 if left blank. You can update them at any time after sign-in from your profile tab or by uploading your resume.
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#58BDB2] hover:bg-[#48a99f] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>
                  {mode === 'login'
                    ? `Sign In as ${selectedRole.toUpperCase()}`
                    : mode === 'register'
                    ? `Register ${selectedRole.toUpperCase()} Account`
                    : 'Send Reset Link'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Toggle between Login and Register */}
          <div className="mt-5 pt-4 border-t border-[#E4ECEA] dark:border-[#1F333A] text-center text-xs text-[#687572] dark:text-[#94A3B8]">
            {mode === 'login' ? (
              <div>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-[#58BDB2] font-semibold hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </div>
            ) : mode === 'register' ? (
              <div>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-[#58BDB2] font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-[#58BDB2] font-semibold hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
