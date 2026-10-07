import { User, UserRole } from '../types';
import { studentService } from './studentService';

const AUTH_USER_KEY = 'arya_ai_current_user_v6';
const REGISTERED_USERS_KEY = 'arya_ai_registered_accounts_v6';

export class AuthService {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  private readonly validRoles: UserRole[] = ['student', 'faculty', 'tnp', 'recruiter', 'admin'];

  private withoutPassword(user: User): User {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  private createUserId(): string {
    return `usr-${crypto.randomUUID()}`;
  }

  constructor() {
    if (!import.meta.env?.VITE_AUTH_API_URL?.trim()) this.init();
  }

  private init() {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        const registered = this.getRegisteredUsers().find((user) =>
          user.id === parsed?.id && user.email === parsed?.email && user.role === parsed?.role
        );
        this.currentUser = parsed?.isAuthenticated && registered
          ? this.withoutPassword({ ...registered, isAuthenticated: true })
          : null;
        // Rewrite legacy session objects without their plaintext password field.
        if (this.currentUser) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser));
        else localStorage.removeItem(AUTH_USER_KEY);
      } else {
        this.currentUser = null;
      }
    } catch {
      this.currentUser = null;
    }
  }

  private saveUser(user: User | null) {
    this.currentUser = user ? this.withoutPassword(user) : null;
    try {
      if (this.currentUser) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser));
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

  /** Keep a verified API user in memory only; the server owns the session cookie. */
  public setServerUser(user: Omit<User, 'password' | 'isAuthenticated'> | null): void {
    this.currentUser = user?.emailVerified ? { ...user, isAuthenticated: true } : null;
    this.notify();
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

  private getRegisteredUsers(): User[] {
    try {
      const stored = localStorage.getItem(REGISTERED_USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveRegisteredUser(user: User): boolean {
    try {
      const users = this.getRegisteredUsers();
      const { isAuthenticated: _sessionFlag, ...accountRecord } = user;
      const existingIdx = users.findIndex(
        (u) => u.email.toLowerCase() === user.email.toLowerCase()
      );
      if (existingIdx >= 0) {
        users[existingIdx] = accountRecord;
      } else {
        users.push(accountRecord);
      }
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /**
   * Prototype login: validates against browser-local registered account records.
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
    const found = registered.find((u) => u.email.toLowerCase() === cleanEmail && u.role === role);

    if (!found) {
      return {
        success: false,
        error: `No registered ${role.toUpperCase()} account found with email "${cleanEmail}". Please check your email or click "Register here" below to create an account first.`
      };
    }

    // Registered accounts must have a matching password; missing credentials never bypass login.
    if (!found.password || found.password !== pass) {
      return {
        success: false,
        error: 'Incorrect password for this account. Please re-enter your password.'
      };
    }

    const authenticatedUser = this.withoutPassword({ ...found, isAuthenticated: true });
    this.saveUser(authenticatedUser);
    return { success: true, user: authenticatedUser };
  }

  /**
   * Register a new user in browser-local prototype storage.
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
    const role = userData.role;
    if (!role || !this.validRoles.includes(role)) {
      return { success: false, error: 'Select a valid account role.' };
    }
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    const cleanName = (userData.name || '').trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Enter a valid email address.' };
    }
    if (!cleanName) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!userData.password || userData.password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    // Check if account already exists
    const existing = this.getRegisteredUsers();
    const duplicate = existing.find((u) => u.email.toLowerCase() === cleanEmail);
    if (duplicate) {
      return {
        success: false,
        error: 'An account with this email already exists.'
      };
    }

    const studentId =
      role === 'student'
        ? (userData.studentId?.trim() || `STU-${this.createUserId().replace(/[^a-z0-9]/gi, '').slice(-8)}`).toUpperCase()
        : undefined;

    const designationByRole: Record<UserRole, string> = {
      student: 'Undergraduate Student',
      faculty: 'Faculty Mentor',
      tnp: 'Training & Placement Officer',
      recruiter: 'Talent Acquisition Partner',
      admin: 'Academic Administrator / HOD'
    };

    const newUser: User = {
      id: this.createUserId(),
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

    if (!this.saveRegisteredUser(newUser)) {
      return { success: false, error: 'Unable to save this account in browser storage. Please try again.' };
    }
    const safeUser = this.withoutPassword(newUser);
    this.saveUser(safeUser);
    return { success: true, user: safeUser };
  }

  public logout(): void {
    this.saveUser(null);
  }

  public canAccessRole(targetRole: UserRole): { allowed: boolean; reason?: string } {
    if (!this.currentUser || !this.currentUser.isAuthenticated) {
      return {
        allowed: false,
        reason: `Authentication required. Please sign in with a registered ${targetRole.toUpperCase()} account.`
      };
    }

    if (this.currentUser.role !== targetRole) {
      return {
        allowed: false,
        reason: `Access restricted. You are currently signed in as "${this.currentUser.role.toUpperCase()}" (${this.currentUser.name}). This page requires the ${targetRole.toUpperCase()} role.`
      };
    }

    return { allowed: true };
  }
}

export const authService = new AuthService();
