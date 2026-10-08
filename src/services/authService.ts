import { User, UserRole } from '../types';
import { apiClient } from './apiClient';

class AuthService {
  private currentUser: User | null = null;
  private currentTenant: any = null;
  private listeners: ((user: User | null) => void)[] = [];

  public async init(): Promise<void> {
    try {
      const res = await apiClient.me();
      this.currentUser = res.user;
      this.currentTenant = res.tenant;
    } catch {
      this.currentUser = null;
      this.currentTenant = null;
    }
    this.notify();
  }

  public getCurrentUser(): User | null { return this.currentUser; }
  public getCurrentTenant(): any { return this.currentTenant; }
  public isAuthenticated(): boolean { return !!this.currentUser?.isAuthenticated; }
  public subscribe(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => { this.listeners = this.listeners.filter(cb => cb !== callback); };
  }
  private notify() { this.listeners.forEach(cb => cb(this.currentUser)); }

  public async getRegisteredUsers(role?: UserRole): Promise<User[]> {
    try { return await apiClient.users(role); } catch { return []; }
  }

  /** Sign-in deliberately has NO college/college-code field. */
  public async loginWithCredentials(email: string, pass: string): Promise<{success:boolean;user?:User;error?:string}> {
    if (!email.trim()) return { success:false, error:'Please enter your registered email address.' };
    if (!pass) return { success:false, error:'Please enter your password.' };
    try {
      const res = await apiClient.login({ email: email.trim().toLowerCase(), password: pass });
      this.currentUser = res.user;
      this.currentTenant = res.tenant;
      this.notify();
      return { success:true, user:res.user };
    } catch (e:any) {
      return { success:false, error:e.message || 'Authentication failed.' };
    }
  }

  public async submitInstitutionRequest(data: {
    collegeName: string;
    name: string;
    email: string;
    password: string;
    designation?: string;
    department?: string;
  }): Promise<{success:boolean;collegeCode?:string;tenant?:any;user?:User;error?:string}> {
    try {
      const res = await apiClient.submitInstitutionRequest(data);
      return { success:true, collegeCode:res.collegeCode, tenant:res.tenant, user:res.user };
    } catch(e:any) {
      return { success:false, error:e.message || 'Institution registration failed.' };
    }
  }

  /** Student/faculty registration requires the institution's College Code. */
  public async registerUser(userData: Partial<User> & {
    password?:string;
    collegeName?:string;
    collegeCode?:string;
    tenantId?:string;
    initialCgpa?:number;
    initialLeetcode?:number;
    initialCodechef?:number;
    initialAptitude?:number;
    initialCommunication?:number;
    initialBacklogs?:number;
    initialTargetRole?:string;
  }): Promise<{success:boolean;user?:User;error?:string}> {
    const role = userData.role || 'student';
    if (!['student','faculty'].includes(role)) return {success:false,error:'Only Student and Faculty accounts can be self-registered.'};
    if (!userData.email?.trim()) return {success:false,error:'Email address is required.'};
    if (!userData.name?.trim()) return {success:false,error:'Full name is required.'};
    if (!userData.password || userData.password.length < 4) return {success:false,error:'Password must be at least 4 characters.'};
    if (!userData.collegeName?.trim()) return {success:false,error:'College Name is required.'};
    if (!userData.collegeCode?.trim()) return {success:false,error:'College Code is required.'};
    try {
      const res = await apiClient.register({
        ...userData,
        role,
        email:userData.email.trim().toLowerCase(),
        name:userData.name.trim(),
        collegeName:userData.collegeName.trim(),
        collegeCode:userData.collegeCode.trim().toUpperCase()
      });
      this.currentUser=res.user;
      this.currentTenant=res.tenant;
      this.notify();
      return {success:true,user:res.user};
    } catch (e:any) {
      return {success:false,error:e.message || 'Registration failed.'};
    }
  }

  public async logout(): Promise<void> {
    try { await apiClient.logout(); }
    finally {
      this.currentUser=null;
      this.currentTenant=null;
      this.notify();
    }
  }

  public clearAllSessionData(): void {
    this.currentUser=null;
    this.currentTenant=null;
    this.notify();
  }

  public canAccessRole(targetRole: UserRole): {allowed:boolean;reason?:string} {
    if (!this.currentUser?.isAuthenticated) return {allowed:false,reason:`Authentication required. Please sign in with your verified ${targetRole.toUpperCase()} account.`};
    if (this.currentUser.role !== targetRole) return {allowed:false,reason:`Access restricted. You are currently authenticated as "${this.currentUser.role.toUpperCase()}" (${this.currentUser.name}). This page requires a verified ${targetRole.toUpperCase()} account.`};
    return {allowed:true};
  }
}

export const authService = new AuthService();
