import { User, UserRole } from '../types';
import { studentService } from './studentService';

const AUTH_USER_KEY = 'arya_ai_current_user_v6';
const REGISTERED_USERS_KEY = 'arya_ai_registered_accounts_v6';

// Clean legacy keys to ensure no mock/auto-registered demo accounts persist in the browser
const LEGACY_KEYS = [
  'arya_ai_current_user',
  'arya_ai_registered_accounts',
  'arya_ai_current_user_v1',
  'arya_ai_current_user_v2',
  'arya_ai_current_user_v3',
  'arya_ai_current_user_v4',
  'arya_ai_current_user_v5',
  'arya_ai_registered_accounts_v1',
  'arya_ai_registered_accounts_v2',
  'arya_ai_registered_accounts_v3',
  'arya_ai_registered_accounts_v4',
  'arya_ai_registered_accounts_v5'
];

class AuthService {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Purge obsolete versions
      LEGACY_KEYS.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {
          // ignore
        }
      });

      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.currentUser = parsed?.isAuthenticated ? parsed : null;
      } else {
        this.currentUser = null;
      }
    } catch {
      this.currentUser = null;
    }
  }

  private saveUser(user: User | null) {
    this.currentUser = user;
    try {
      if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    } catch (e) {
      console.error(e);
    }
    this.notify();
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return !!this.currentUser?.isAuthenticated;
  }

  public subscribe(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.currentUser));
  }

  public getRegisteredUsers(): User[] {
    try {
      const stored = localStorage.getItem(REGISTERED_USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveRegisteredUser(user: User) {
    try {
      const users = this.getRegisteredUsers();
      const existingIdx = users.findIndex(
        (u) => u.email.toLowerCase() === user.email.toLowerCase() && u.role === user.role
      );
      if (existingIdx >= 0) {
        users[existingIdx] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Strict login: Checks the database.
   * If the account has not been explicitly created/registered, returns an error.
   * Does NOT auto-create any account!
   */
  public loginWithCredentials(
    email: string,
    pass: string,
    role: UserRole
  ): { success: boolean; user?: User; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your registered email address.' };
    }
    if (!pass) {
      return { success: false, error: 'Please enter your password.' };
    }

    const registered = this.getRegisteredUsers();
    const found = registered.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.role === role
    );

    if (!found) {
      return {
        success: false,
        error: `No registered ${role.toUpperCase()} account found with email "${cleanEmail}". Please check your email or click "Register here" below to create an account first.`
      };
    }

    // Verify password if stored
    if (found.password && found.password !== pass) {
      return {
        success: false,
        error: 'Incorrect password for this account. Please re-enter your password.'
      };
    }

    const authenticatedUser: User = {
      ...found,
      isAuthenticated: true
    };
    this.saveUser(authenticatedUser);
    return { success: true, user: authenticatedUser };
  }

  /**
   * Register a new user in the database
   */
  public registerUser(
    userData: Partial<User> & {
      password?: string;
      initialCgpa?: number;
      initialLeetcode?: number;
      initialCodechef?: number;
      initialAptitude?: number;
      initialCommunication?: number;
      initialBacklogs?: number;
      initialTargetRole?: string;
    }
  ): { success: boolean; user?: User; error?: string } {
    const role = userData.role || 'student';
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    const cleanName = (userData.name || '').trim();

    if (!cleanEmail) {
      return { success: false, error: 'Email address is required.' };
    }
    if (!cleanName) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!userData.password || userData.password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    // Check if account already exists
    const existing = this.getRegisteredUsers();
    const duplicate = existing.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.role === role
    );
    if (duplicate) {
      return {
        success: false,
        error: `An account with email "${cleanEmail}" is already registered as ${role.toUpperCase()}. Please sign in instead.`
      };
    }

    const studentId =
      role === 'student'
        ? (userData.studentId?.trim() || `STU-${Date.now().toString().slice(-4)}`).toUpperCase()
        : undefined;

    const designationByRole: Record<UserRole, string> = {
      student: 'Undergraduate Student',
      faculty: 'Faculty Mentor',
      tnp: 'Training & Placement Officer',
      recruiter: 'Talent Acquisition Partner',
      admin: 'Academic Administrator / HOD'
    };

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role,
      password: userData.password,
      studentId,
      department: userData.department || 'Computer Science and Engineering',
      designation: userData.designation || designationByRole[role],
      organization: userData.organization,
      isAuthenticated: true
    };

    if (role === 'student' && studentId) {
      // Create empty student record with clean ZERO defaults
      const raw = studentService.createRawStudent(
        studentId,
        newUser.name,
        newUser.email,
        newUser.department
      );

      // If user supplied initial values during registration, populate them cleanly
      const hasInitialInputs =
        userData.initialCgpa !== undefined ||
        userData.initialLeetcode !== undefined ||
        userData.initialCodechef !== undefined ||
        userData.initialAptitude !== undefined ||
        userData.initialCommunication !== undefined ||
        userData.initialBacklogs !== undefined ||
        userData.initialTargetRole;

      if (hasInitialInputs) {
        const lc = userData.initialLeetcode ?? 0;
        const cc = userData.initialCodechef ?? 0;
        studentService.updateStudent({
          ...raw,
          CGPA: userData.initialCgpa ?? 0,
          Backlogs: userData.initialBacklogs ?? 0,
          Aptitude_Score: userData.initialAptitude ?? 0,
          Communication_Score: userData.initialCommunication ?? 0,
          Target_Role: userData.initialTargetRole || raw.Target_Role || '',
          Coding_Activity: {
            ...raw.Coding_Activity,
            leetcodeSolved: lc,
            codechefSolved: cc,
            problemsSolved: lc + cc
          }
        });
      }
    }

    this.saveRegisteredUser(newUser);
    this.saveUser(newUser);
    return { success: true, user: newUser };
  }

  public logout(): void {
    this.saveUser(null);
  }

  public clearAllSessionData(): void {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(REGISTERED_USERS_KEY);
    this.currentUser = null;
    this.notify();
  }

  public canAccessRole(targetRole: UserRole): { allowed: boolean; reason?: string } {
    if (!this.currentUser || !this.currentUser.isAuthenticated) {
      return {
        allowed: false,
        reason: `Authentication required. Please sign in with your verified ${targetRole.toUpperCase()} account.`
      };
    }

    if (this.currentUser.role !== targetRole) {
      return {
        allowed: false,
        reason: `Access restricted. You are currently authenticated as "${this.currentUser.role.toUpperCase()}" (${this.currentUser.name}). This page requires a verified ${targetRole.toUpperCase()} account.`
      };
    }

    return { allowed: true };
  }
}

export const authService = new AuthService();
