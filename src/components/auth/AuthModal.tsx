import React, { useEffect, useState } from 'react';
import { UserRole } from '../../types';
import { authService } from '../../services/authService';
import { X, CheckCircle, GraduationCap, Users, AlertCircle, Copy } from 'lucide-react';

interface Props {
  isOpen: boolean;
  initialMode: 'login' | 'register' | 'institution';
  initialRole?: UserRole;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

type AuthMode = 'login' | 'register' | 'institution' | 'forgot';

export const AuthModal: React.FC<Props> = ({ isOpen, initialMode, initialRole, onClose, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole || 'student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [collegeName, setCollegeName] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [institutionRegistered, setInstitutionRegistered] = useState(false);
  const [generatedCollegeCode, setGeneratedCollegeCode] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setSelectedRole(initialRole || 'student');
    setError(null);
    setForgotSuccess(false);
    setInstitutionRegistered(false);
    setGeneratedCollegeCode('');
  }, [initialMode, initialRole, isOpen]);

  if (!isOpen) return null;

  const resetTo = (next: AuthMode, role: UserRole = 'student') => {
    setMode(next);
    setSelectedRole(role);
    setError(null);
    setForgotSuccess(false);
    setInstitutionRegistered(false);
    setGeneratedCollegeCode('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'forgot') {
      if (!email.trim()) return setError('Please enter your email address.');
      setForgotSuccess(true);
      return;
    }

    if (mode === 'login') {
      const res = await authService.loginWithCredentials(email, password);
      if (!res.success) return setError(res.error || 'Authentication failed.');
      onSuccess(res.user!.role);
      onClose();
      return;
    }

    if (!fullName.trim() || !email.trim() || password.length < 4) {
      return setError('Full name, email and a password of at least 4 characters are required.');
    }

    if (mode === 'institution') {
      if (!collegeName.trim()) return setError('Official institution name is required.');

      const res = await authService.submitInstitutionRequest({
        name: fullName.trim(),
        email: email.trim(),
        password,
        collegeName: collegeName.trim(),
        department,
        designation: 'Training & Placement Officer'
      });

      if (!res.success) return setError(res.error || 'Institution registration failed.');
      setGeneratedCollegeCode(res.collegeCode || '');
      setInstitutionRegistered(true);
      return;
    }

    if (!collegeName.trim()) return setError('College Name is required.');
    if (!collegeCode.trim()) return setError('College Code is required.');
    if (selectedRole === 'student' && !studentId.trim()) return setError('Student ID / university roll number is required.');
    if (!department.trim()) return setError('Academic department is required.');

    const res = await authService.registerUser({
      name: fullName.trim(),
      email: email.trim(),
      password,
      role: selectedRole,
      collegeName: collegeName.trim(),
      collegeCode: collegeCode.trim(),
      studentId: selectedRole === 'student' ? studentId.trim() : undefined,
      department
    });

    if (!res.success) return setError(res.error || 'Registration failed.');
    onSuccess(selectedRole);
    onClose();
  };

  const registerRoles = [
    { r: 'student' as UserRole, label: 'Student', icon: <GraduationCap className="w-4 h-4" /> },
    { r: 'faculty' as UserRole, label: 'Faculty', icon: <Users className="w-4 h-4" /> }
  ];

  const inputClass = 'w-full text-xs px-3 py-2.5 rounded-lg border border-[#DDE8E5] dark:border-[#294047] bg-[#F7FBFB] dark:bg-[#0E171A] text-[#263238] dark:text-[#F1F5F9] outline-none focus:border-[#58BDB2]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#142024] rounded-2xl max-w-lg w-full shadow-2xl border border-[#E4ECEA] dark:border-[#1F333A] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4ECEA] dark:border-[#1F333A] flex items-center justify-between bg-[#F7FBFB] dark:bg-[#0E171A]">
          <div>
            <h3 className="text-lg font-bold text-[#263238] dark:text-[#F1F5F9]">
              {mode === 'login' ? 'Sign In to ARYA AI' : mode === 'register' ? 'Join Your Institution' : mode === 'institution' ? 'Register Your Institution' : 'Reset Password'}
            </h3>
            <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-0.5">
              {mode === 'login'
                ? 'Sign in with only your registered email and password'
                : mode === 'register'
                ? 'Students and faculty use their College Name and College Code only during registration'
                : mode === 'institution'
                ? 'Register your institution and receive its unique College Code immediately'
                : 'Enter your email to request password reset instructions'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-[#687572] hover:text-[#263238] dark:hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[82vh] overflow-y-auto">
          {mode === 'register' && (
            <div className="mb-5">
              <label className="block text-xs font-semibold mb-2 text-[#263238] dark:text-[#F1F5F9]">Register As</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
                {registerRoles.map(item => (
                  <button
                    key={item.r}
                    type="button"
                    onClick={() => { setSelectedRole(item.r); setError(null); }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-medium cursor-pointer ${selectedRole === item.r ? 'bg-white dark:bg-[#1B2B30] shadow-xs text-[#263238] dark:text-white border border-[#E4ECEA] dark:border-[#273E45]' : 'text-[#687572] dark:text-[#94A3B8]'}`}
                  >
                    <span className="text-[#58BDB2]">{item.icon}</span>{item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-800/60 flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          {institutionRegistered ? (
            <div className="text-center py-5">
              <CheckCircle className="w-12 h-12 text-[#58BDB2] mx-auto mb-3" />
              <h4 className="font-bold text-[#263238] dark:text-white">Institution Registered Successfully</h4>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-2 leading-relaxed">
                Your institution is now active. The T&P account can sign in immediately using the email and password used during registration.
              </p>

              <div className="mt-5 p-4 rounded-xl bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#DDE8E5] dark:border-[#294047]">
                <div className="text-[10px] uppercase tracking-wider font-bold text-[#687572] dark:text-[#94A3B8]">College Code</div>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span className="text-xl font-extrabold font-mono tracking-widest text-[#2EA396] dark:text-[#58BDB2]">{generatedCollegeCode}</span>
                  <button
                    type="button"
                    title="Copy College Code"
                    onClick={() => navigator.clipboard?.writeText(generatedCollegeCode)}
                    className="p-1.5 rounded-lg border border-[#DDE8E5] dark:border-[#294047] cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#687572] dark:text-[#94A3B8] mt-3">
                Give this College Code to your students and faculty. They must enter both the exact College Name and this code during registration. It is never required during sign-in.
              </p>
              <button type="button" onClick={onClose} className="mt-5 px-5 py-2.5 text-xs font-semibold bg-[#58BDB2] text-white rounded-lg cursor-pointer">Close</button>
            </div>
          ) : forgotSuccess ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-[#58BDB2] mx-auto mb-3" />
              <h4 className="font-bold">Reset Request Received</h4>
              <p className="text-xs text-[#687572] mt-2">If the account exists, reset instructions will be sent to the registered email.</p>
              <button type="button" onClick={() => resetTo('login')} className="mt-5 px-5 py-2.5 text-xs font-semibold bg-[#58BDB2] text-white rounded-lg cursor-pointer">Back to Sign In</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'institution' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#263238] dark:text-white">Official Institution Name *</label>
                    <input required value={collegeName} onChange={e => setCollegeName(e.target.value)} placeholder="e.g. ABC Institute of Technology" className={inputClass} />
                  </div>
                  <div className="p-3 rounded-xl bg-[#EAF7F8] dark:bg-[#122D29] border border-[#58BDB2]/30 text-[11px] text-[#2EA396] dark:text-[#9BE5DD]">
                    Your institution becomes active immediately and the system generates a unique College Code for you.
                  </div>
                </>
              )}

              {mode !== 'login' && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#263238] dark:text-white">Full Name *</label>
                  <input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder={mode === 'institution' ? 'Training & Placement Officer name' : 'Your full name'} className={inputClass} />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#263238] dark:text-white">Email *</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} autoComplete="email" />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#263238] dark:text-white">Password *</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 4 characters" className={inputClass} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#263238] dark:text-white">College Name *</label>
                    <input required value={collegeName} onChange={e => setCollegeName(e.target.value)} placeholder="Enter the exact registered college name" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#263238] dark:text-white">College Code *</label>
                    <input required value={collegeCode} onChange={e => setCollegeCode(e.target.value.toUpperCase())} placeholder="e.g. ARYA-7F2A9C" className={`${inputClass} font-mono tracking-wider`} />
                    <p className="text-[10px] text-[#687572] dark:text-[#94A3B8] mt-1">Use the code provided by your institution. College Name and College Code must match.</p>
                  </div>
                  {selectedRole === 'student' && (
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-[#263238] dark:text-white">Student ID / Roll Number *</label>
                      <input required value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="e.g. CSE2026001" className={inputClass} />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#263238] dark:text-white">Department *</label>
                    <input required value={department} onChange={e => setDepartment(e.target.value)} className={inputClass} />
                  </div>
                </>
              )}

              {mode === 'institution' && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#263238] dark:text-white">Department / Office</label>
                  <input value={department} onChange={e => setDepartment(e.target.value)} className={inputClass} />
                </div>
              )}

              <button type="submit" className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors">
                {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Register Institution'}
              </button>

              <div className="pt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px]">
                {mode === 'login' && (
                  <>
                    <button type="button" onClick={() => resetTo('forgot')} className="text-[#2EA396] hover:underline cursor-pointer">Forgot password?</button>
                    <button type="button" onClick={() => resetTo('register', 'student')} className="text-[#2EA396] hover:underline cursor-pointer">Register Student / Faculty</button>
                    <button type="button" onClick={() => resetTo('institution')} className="text-[#2EA396] hover:underline cursor-pointer">Register Your Institution</button>
                  </>
                )}
                {mode === 'register' && (
                  <>
                    <button type="button" onClick={() => resetTo('login')} className="text-[#2EA396] hover:underline cursor-pointer">Already have an account? Sign In</button>
                    <button type="button" onClick={() => resetTo('institution')} className="text-[#2EA396] hover:underline cursor-pointer">Register Your Institution</button>
                  </>
                )}
                {mode === 'institution' && <button type="button" onClick={() => resetTo('login')} className="text-[#2EA396] hover:underline cursor-pointer">Back to Sign In</button>}
                {mode === 'forgot' && <button type="button" onClick={() => resetTo('login')} className="text-[#2EA396] hover:underline cursor-pointer">Back to Sign In</button>}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
