import React, { useState } from 'react';
import { UserRole } from '../../types';
import { authService } from '../../services/authService';
import { authApiService } from '../../services/authApiService';
import {
  X,
  GraduationCap,
  Users,
  Building2,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  initialRole?: UserRole;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
  onLoginStatus?: (message: string) => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  initialMode,
  initialRole,
  onClose,
  onSuccess,
  onLoginStatus
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify' | 'forgot' | 'reset'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole || 'student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

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
    setFormNotice(null);
  }, [initialMode]);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((remaining) => Math.max(0, remaining - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormNotice(null);

    if (mode === 'forgot') {
      const result = await authApiService.requestPasswordReset({ email: email.trim().toLowerCase() });
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (result.data.deliveryStatus !== 'sent') {
        setError(result.data.deliveryStatus === 'not_configured'
          ? 'Password reset service is not configured. No reset email was sent.'
          : 'Password reset email could not be sent. Please try again later.');
        return;
      }
      setPendingEmail(email.trim().toLowerCase());
      setFormNotice('Password reset instructions were sent to the account email.');
      setMode('reset');
      return;
    }

    if (mode === 'reset') {
      if (!/^\d{6}$/.test(verificationCode)) {
        setError('Enter the 6-digit reset code from your email.');
        return;
      }
      if (password.length < 8) {
        setError('New password must be at least 8 characters.');
        return;
      }
      const result = await authApiService.resetPassword({
        email: pendingEmail,
        code: verificationCode,
        newPassword: password
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (!result.data.passwordReset) {
        setError('Password reset could not be confirmed. Check the code or request a new one.');
        return;
      }
      setPassword('');
      setVerificationCode('');
      setFormNotice('Password updated. Sign in with your new password.');
      setMode('login');
      return;
    }

    if (mode === 'verify') {
      if (!/^\d{6}$/.test(verificationCode)) {
        setError('Enter the 6-digit code sent to your email.');
        return;
      }
      const result = await authApiService.verifyEmail({ email: pendingEmail, code: verificationCode });
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (!result.data.emailVerified) {
        setError('Please verify your email before signing in.');
        return;
      }
      setVerificationCode('');
      setPassword('');
      setFormNotice('Email verified. You can now sign in. Email verification confirms email control only, not institutional role identity.');
      setMode('login');
      return;
    }

    if (mode === 'login') {
      if (authApiService.isConfigured()) {
        const result = await authApiService.login({ email: email.trim().toLowerCase(), password, role: selectedRole });
        if (!result.success) {
          setError(result.error);
          return;
        }
        if (!result.data.emailVerified || !result.data.user.emailVerified) {
          setError('Please verify your email before signing in.');
          return;
        }
        authService.setServerUser(result.data.user);
        onLoginStatus?.(result.data.loginNotificationStatus === 'sent'
          ? 'Login notification email was sent to your verified address.'
          : result.data.loginNotificationStatus === 'not_configured'
            ? 'Login notification service is not configured.'
            : 'Login notification email could not be sent.');
        onSuccess(result.data.user.role);
        setPassword('');
        onClose();
        return;
      }

      // Preserve existing local accounts for the prototype; this does not verify email ownership.
      const res = authService.loginWithCredentials(email, password, selectedRole);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please verify credentials.');
        return;
      }
      onLoginStatus?.('Prototype login succeeded. Email ownership is not verified, and login notification service is not configured.');
      onSuccess(res.user!.role);
      setPassword('');
      onClose();
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim() || !email.trim()) {
        setError(!fullName.trim() ? 'Full name is required.' : 'Email address is required.');
        return;
      }
      if (!password || password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (!authApiService.isConfigured()) {
        const result = authService.registerUser({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: selectedRole
        });
        setPassword('');
        if (!result.success) {
          setError(result.error || 'Unable to create this local demo account.');
          return;
        }
        onLoginStatus?.('Local Demo Authentication: this account and session are stored in browser localStorage. Real email verification requires backend configuration.');
        onSuccess(result.user!.role);
        onClose();
        return;
      }

      const result = await authApiService.register({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: selectedRole
      });
      setPassword('');
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (result.data.deliveryStatus !== 'sent') {
        setError(result.data.deliveryStatus === 'not_configured'
          ? 'Email verification service is not configured. No email was sent and no account was activated.'
          : 'Verification email could not be sent. No account was activated. Please try again later.');
        return;
      }
      setPendingEmail(email.trim().toLowerCase());
      setVerificationCode('');
      setResendCooldown(Math.max(0, result.data.resendAfterSeconds ?? 60));
      setFormNotice(`Verification code sent to ${email.trim().toLowerCase()}.`);
      setMode('verify');
      return;
    }

  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    const result = await authApiService.resendVerification({ email: pendingEmail });
    if (!result.success) {
      setError(result.error);
      return;
    }
    if (result.data.deliveryStatus !== 'sent') {
      setError(result.data.deliveryStatus === 'not_configured'
        ? 'Email verification service is not configured. No code was sent.'
        : 'A new verification email could not be sent.');
      return;
    }
    setResendCooldown(Math.max(0, result.data.resendAfterSeconds ?? 60));
    setFormNotice(`A new verification code was sent to ${pendingEmail}.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#142024] rounded-2xl max-w-lg w-full shadow-2xl border border-[#E4ECEA] dark:border-[#1F333A] overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E4ECEA] dark:border-[#1F333A] flex items-center justify-between bg-[#F7FBFB] dark:bg-[#0E171A]">
          <div>
            <h3 className="text-lg font-bold text-[#263238] dark:text-[#F1F5F9]">
              {mode === 'login' ? 'Sign In to ARYA AI'
                : mode === 'register' ? 'Register New Account'
                  : mode === 'verify' ? 'Verify Email Address'
                    : mode === 'reset' ? 'Set a New Password' : 'Reset Password'}
            </h3>
            <p className="text-xs text-[#687572] dark:text-[#94A3B8]">
              {mode === 'login'
                ? authApiService.isConfigured()
                  ? `Sign in to your ${selectedRole.toUpperCase()} account`
                  : 'Prototype login; email ownership is not verified in this mode'
                : mode === 'register'
                  ? `Request a ${selectedRole.toUpperCase()} account and email verification`
                  : mode === 'verify'
                    ? `Enter the 6-digit code sent to ${pendingEmail}`
                    : mode === 'reset'
                      ? `Enter the reset code sent to ${pendingEmail}`
                      : 'Request a password reset email'}
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
          {!authApiService.isConfigured() && (
            <div className="mb-4 p-3 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-[11px] text-amber-900 dark:text-amber-200">
              <strong>Local Demo Authentication</strong><br />
              Prototype mode — accounts are stored locally for demonstration. Real email verification will be enabled when the authentication backend is connected.
            </div>
          )}
          {(mode === 'login' || mode === 'register') && (
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

          {formNotice && (
            <div className="mb-4 p-3 rounded-xl border border-[#58BDB2]/30 bg-[#EAF7F8] dark:bg-[#122D29] text-xs text-[#263238] dark:text-[#F1F5F9]">
              {formNotice}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-xl border border-red-200 dark:border-red-800/60 leading-relaxed space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Request failed:</strong> {error}
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

              {(mode === 'login' || mode === 'register' || mode === 'forgot') && <div>
                <label className="block text-xs font-medium text-[#263238] dark:text-[#F1F5F9] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@university.edu"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#1F333A] focus:outline-none focus:border-[#58BDB2] bg-[#F7FBFB] dark:bg-[#0E171A] text-[#263238] dark:text-[#F1F5F9]"
                />
              </div>}

              {(mode === 'verify' || mode === 'reset') && (
                <div>
                  <label className="block text-xs font-medium text-[#263238] dark:text-[#F1F5F9] mb-1">Code sent to</label>
                  <div className="text-xs px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#1F333A] bg-[#F7FBFB] dark:bg-[#0E171A] text-[#263238] dark:text-[#F1F5F9]">{pendingEmail}</div>
                </div>
              )}

              {(mode === 'verify' || mode === 'reset') && (
                <div>
                  <label className="block text-xs font-medium text-[#263238] dark:text-[#F1F5F9] mb-1">6-digit {mode === 'verify' ? 'verification' : 'password reset'} code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#1F333A] focus:outline-none focus:border-[#58BDB2] bg-[#F7FBFB] dark:bg-[#0E171A] text-[#263238] dark:text-[#F1F5F9]"
                  />
                  {mode === 'verify' && (
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <button type="button" onClick={handleResendVerification} disabled={resendCooldown > 0} className="text-[#2EA396] dark:text-[#58BDB2] disabled:text-[#94A3B8] disabled:cursor-not-allowed">
                        {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                      </button>
                      <button type="button" onClick={() => { setEmail(pendingEmail); setMode('register'); setError(null); setFormNotice(null); }} className="text-[#687572] dark:text-[#94A3B8] hover:underline">Change email</button>
                    </div>
                  )}
                  {mode === 'reset' && <button type="button" onClick={() => { setEmail(pendingEmail); setMode('forgot'); setError(null); setFormNotice(null); }} className="mt-2 text-[11px] text-[#687572] dark:text-[#94A3B8] hover:underline">Request a new reset code</button>}
                </div>
              )}

              {(mode === 'login' || mode === 'register' || mode === 'reset') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-[#263238] dark:text-[#F1F5F9]">{mode === 'reset' ? 'New Password *' : 'Password *'}</label>
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
                    minLength={mode === 'login' ? 4 : 8}
                    placeholder={mode === 'reset' ? 'Choose a new password' : 'Enter your password'}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#1F333A] focus:outline-none focus:border-[#58BDB2] bg-[#F7FBFB] dark:bg-[#0E171A] text-[#263238] dark:text-[#F1F5F9]"
                  />
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
                      ? `Request ${selectedRole.toUpperCase()} Account`
                      : mode === 'verify'
                        ? 'Verify Email'
                        : mode === 'reset'
                          ? 'Update Password'
                          : 'Send Reset Link'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
          </form>

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
