import {
  PlacementDrive,
  JobApplication,
  StudentRecord,
  NotificationItem,
  ApplicationStatus,
  User,
  UserRole
} from '../types';
import { studentService } from './studentService';
import { emitDataChange } from './dataEvents';

// v3 keys: the old v2 keys held pre-loaded demo drives and are purged on start-up.
const DRIVES_STORAGE_KEY = 'arya_ai_placement_drives_v3';
const APPLICATIONS_STORAGE_KEY = 'arya_ai_applications_v3';
const NOTIFICATIONS_STORAGE_KEY = 'arya_ai_notifications_v3';
const LEGACY_KEYS = [
  'arya_ai_placement_drives_v2',
  'arya_ai_applications_v2',
  'arya_ai_notifications_v2'
];

/** Roles allowed to create/edit/delete drives and move applications through the pipeline. */
const PLACEMENT_MANAGER_ROLES: UserRole[] = ['tnp', 'admin'];

type Actor = Pick<User, 'id' | 'name' | 'role'>;
export type ActionResult = { success: boolean; message: string };

export interface PlacementStats {
  totalStudents: number;
  totalDrives: number; // all drives incl. drafts
  publishedDrives: number;
  activeDrives: number; // published AND status Active
  totalApplications: number;
  shortlisted: number; // applications currently Shortlisted or beyond (Interview / Selected)
  selected: number;
  byStatus: Record<ApplicationStatus, number>;
  byCompany: { company: string; applications: number; selected: number }[];
}

class PlacementService {
  constructor() {
    LEGACY_KEYS.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
  }

  // ---------------- raw storage (the "database") ----------------
  private read<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? (JSON.parse(data) as T[]) : [];
    } catch {
      return [];
    }
  }

  private write<T>(key: string, value: T[]): void {
    localStorage.setItem(key, JSON.stringify(value));
    emitDataChange();
  }

  private getDrives(): PlacementDrive[] {
    // Drives saved before the draft/publish feature existed are treated as published.
    return this.read<PlacementDrive>(DRIVES_STORAGE_KEY).map((d) => ({
      ...d,
      published: d.published ?? true
    }));
  }

  private getApplications(): JobApplication[] {
    return this.read<JobApplication>(APPLICATIONS_STORAGE_KEY);
  }

  private getNotifications(): NotificationItem[] {
    return this.read<NotificationItem>(NOTIFICATIONS_STORAGE_KEY);
  }

  private canManage(actor?: Actor): boolean {
    return !!actor && PLACEMENT_MANAGER_ROLES.includes(actor.role);
  }

  private denied(): ActionResult {
    return { success: false, message: 'Permission denied: only the T&P Officer can manage placement drives and applications.' };
  }

  // ---------------- drives ----------------

  /** Every drive including drafts - for T&P / admin screens only. */
  public getAllDrives(): PlacementDrive[] {
    return this.getDrives();
  }

  /** What students are allowed to see: published and not closed. Drafts never leak. */
  public getPublishedDrives(): PlacementDrive[] {
    return this.getDrives().filter((d) => d.published && (d.status || 'Active') !== 'Closed');
  }

  public getDriveById(id: string): PlacementDrive | null {
    return this.getDrives().find((d) => d.id === id) || null;
  }

  public createDrive(drive: Omit<PlacementDrive, 'id'>, actor?: Actor): PlacementDrive | null {
    if (!this.canManage(actor)) return null;
    const drives = this.getDrives();
    const now = new Date().toISOString();
    const newDrive: PlacementDrive = {
      ...drive,
      id: `drive-${Date.now()}`,
      status: drive.status || 'Active',
      createdAt: now,
      publishedAt: drive.published ? now : undefined
    };
    drives.unshift(newDrive);
    this.write(DRIVES_STORAGE_KEY, drives);
    if (newDrive.published) this.notifyEligibleStudents(newDrive);
    return newDrive;
  }

  public updateDrive(id: string, patch: Partial<PlacementDrive>, actor?: Actor): boolean {
    if (!this.canManage(actor)) return false;
    const drives = this.getDrives();
    const idx = drives.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    const wasPublished = drives[idx].published;
    drives[idx] = { ...drives[idx], ...patch };
    if (!wasPublished && drives[idx].published) drives[idx].publishedAt = new Date().toISOString();
    this.write(DRIVES_STORAGE_KEY, drives);
    if (!wasPublished && drives[idx].published) this.notifyEligibleStudents(drives[idx]);
    return true;
  }

  public setPublished(id: string, published: boolean, actor?: Actor): boolean {
    return this.updateDrive(id, { published }, actor);
  }

  /** Deleting a drive also removes the applications that were submitted to it. */
  public deleteDrive(id: string, actor?: Actor): boolean {
    if (!this.canManage(actor)) return false;
    const drives = this.getDrives();
    const filtered = drives.filter((d) => d.id !== id);
    if (filtered.length === drives.length) return false;
    this.write(DRIVES_STORAGE_KEY, filtered);
    this.write(
      APPLICATIONS_STORAGE_KEY,
      this.getApplications().filter((a) => a.driveId !== id)
    );
    return true;
  }

  /** Clean-slate helper: wipes drives, applications and notifications (not users/roles). */
  public clearAll(): void {
    this.write(DRIVES_STORAGE_KEY, []);
    this.write(APPLICATIONS_STORAGE_KEY, []);
    this.write(NOTIFICATIONS_STORAGE_KEY, []);
  }

  // ---------------- eligibility ----------------

  public checkEligibility(student: StudentRecord, drive: PlacementDrive): { eligible: boolean; reasons: string[] } {
    const reasons: string[] = [];
    const e = drive.eligibility;

    if (student.CGPA < e.minCGPA) {
      reasons.push(`CGPA (${student.CGPA.toFixed(2)}) is below required minimum ${e.minCGPA}`);
    }
    if (student.Backlogs > e.maxBacklogs) {
      reasons.push(`Student has ${student.Backlogs} active backlogs (maximum permitted: ${e.maxBacklogs})`);
    }
    const norm = (v: string) => (v || '').trim().toLowerCase();
    if (e.allowedBranches?.length && !e.allowedBranches.some((b) => norm(b) === norm(student.Branch))) {
      reasons.push(`Branch '${student.Branch || 'not set'}' is not in the approved branches list`);
    }
    if (e.graduationYear && student.Graduation_Year !== e.graduationYear) {
      reasons.push(`Graduation year ${student.Graduation_Year || 'not set'} does not match required batch ${e.graduationYear}`);
    }

    return { eligible: reasons.length === 0, reasons };
  }

  public isDeadlinePassed(drive: PlacementDrive): boolean {
    if (!drive.applicationDeadline) return false;
    const end = new Date(`${drive.applicationDeadline}T23:59:59`);
    return !isNaN(end.getTime()) && end.getTime() < Date.now();
  }

  /** Published drives with the student's live eligibility computed from their profile. */
  public getDrivesForStudent(student: StudentRecord): {
    drive: PlacementDrive;
    eligible: boolean;
    reasons: string[];
  }[] {
    return this.getPublishedDrives().map((drive) => ({ drive, ...this.checkEligibility(student, drive) }));
  }

  // ---------------- applications ----------------

  public getAllApplications(): JobApplication[] {
    return this.getApplications();
  }

  public getApplicationsForDrive(driveId: string): JobApplication[] {
    return this.getApplications().filter((a) => a.driveId === driveId);
  }

  public getApplicationsByStudent(studentId: string): JobApplication[] {
    const id = studentId.trim().toUpperCase();
    return this.getApplications().filter((a) => a.studentId.toUpperCase() === id);
  }

  /**
   * Faculty view: applications of students currently mapped to this mentor.
   * The mapping is looked up live from the student records - reassigning a student
   * moves their applications to the new mentor automatically.
   */
  public getApplicationsForMentor(mentor: Pick<User, 'name' | 'email'>): JobApplication[] {
    const mine = new Set(studentService.getStudentsForMentor(mentor).map((s) => s.Student_ID.toUpperCase()));
    return this.getApplications().filter((a) => mine.has(a.studentId.toUpperCase()));
  }

  public applyToDrive(student: StudentRecord, drive: PlacementDrive): ActionResult {
    // Re-read from the store so a drive unpublished / deleted meanwhile cannot be applied to
    const live = this.getDriveById(drive.id);
    if (!live || !live.published || (live.status || 'Active') === 'Closed') {
      return { success: false, message: 'This drive is no longer open for applications.' };
    }
    if (this.isDeadlinePassed(live)) {
      return { success: false, message: `The application deadline (${live.applicationDeadline}) has passed.` };
    }

    const apps = this.getApplications();
    const already = apps.find(
      (a) => a.studentId.toUpperCase() === student.Student_ID.toUpperCase() && a.driveId === live.id
    );
    if (already) {
      return { success: false, message: 'You have already submitted an application for this placement drive.' };
    }

    const { eligible, reasons } = this.checkEligibility(student, live);
    if (!eligible) {
      return { success: false, message: `Eligibility criteria not met: ${reasons.join(', ')}` };
    }

    const now = new Date();
    const newApp: JobApplication = {
      id: `app-${now.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
      driveId: live.id,
      studentId: student.Student_ID,
      studentName: student.Full_Name,
      companyName: live.companyName,
      role: live.role,
      packageLPA: live.packageLPA,
      appliedDate: now.toISOString().split('T')[0],
      appliedAt: now.toISOString(),
      status: 'Applied',
      stageNotes: 'Application received. Awaiting review by the T&P Cell.',
      resumeFileName: student.ResumeUploaded ? student.ResumeFileName : undefined
    };

    apps.unshift(newApp);
    this.write(APPLICATIONS_STORAGE_KEY, apps);
    return { success: true, message: `Successfully applied to ${live.companyName} for ${live.role}!` };
  }

  /** Only the T&P Officer / Admin may move an application through the pipeline. */
  public updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    notes: string | undefined,
    actor?: Actor
  ): boolean {
    if (!this.canManage(actor)) return false;
    const apps = this.getApplications();
    const idx = apps.findIndex((a) => a.id === applicationId);
    if (idx === -1) return false;
    apps[idx] = {
      ...apps[idx],
      status,
      stageNotes: notes ? notes : apps[idx].stageNotes,
      updatedAt: new Date().toISOString()
    };
    this.write(APPLICATIONS_STORAGE_KEY, apps);

    const a = apps[idx];
    this.broadcastAnnouncement(
      `Application Status: ${a.companyName} · ${status}`,
      notes
        ? `T&P Cell updated your application for ${a.companyName} (${a.role}) to "${status}". Remarks: "${notes}"`
        : `T&P Cell updated your application for ${a.companyName} (${a.role}) to "${status}".`,
      'alert',
      a.studentId
    );
    return true;
  }

  /** Used when a CSV batch is deleted: its students' applications go with them. */
  public deleteApplicationsForStudents(studentIds: string[]): number {
    const ids = new Set(studentIds.map((i) => i.toUpperCase()));
    const apps = this.getApplications();
    const kept = apps.filter((a) => !ids.has(a.studentId.toUpperCase()));
    if (kept.length !== apps.length) this.write(APPLICATIONS_STORAGE_KEY, kept);
    return apps.length - kept.length;
  }

  // ---------------- statistics (always derived from stored records) ----------------

  public getStats(students: StudentRecord[], applications: JobApplication[] = this.getApplications()): PlacementStats {
    const drives = this.getDrives();
    const byStatus: Record<ApplicationStatus, number> = {
      Applied: 0,
      'Under Review': 0,
      Shortlisted: 0,
      Interview: 0,
      Selected: 0,
      Rejected: 0
    };
    const companies = new Map<string, { applications: number; selected: number }>();
    applications.forEach((a) => {
      if (byStatus[a.status] !== undefined) byStatus[a.status]++;
      const c = companies.get(a.companyName) || { applications: 0, selected: 0 };
      c.applications++;
      if (a.status === 'Selected') c.selected++;
      companies.set(a.companyName, c);
    });

    return {
      totalStudents: students.length,
      totalDrives: drives.length,
      publishedDrives: drives.filter((d) => d.published).length,
      activeDrives: drives.filter((d) => d.published && (d.status || 'Active') === 'Active').length,
      totalApplications: applications.length,
      shortlisted: byStatus.Shortlisted + byStatus.Interview + byStatus.Selected,
      selected: byStatus.Selected,
      byStatus,
      byCompany: Array.from(companies.entries())
        .map(([company, v]) => ({ company, ...v }))
        .sort((a, b) => b.applications - a.applications)
    };
  }

  // ---------------- notifications ----------------

  private notifyEligibleStudents(drive: PlacementDrive): void {
    const students = studentService.getAllStudents();
    const items = this.getNotifications();
    const stamp = Date.now();
    students.forEach((s, i) => {
      if (!this.checkEligibility(s, drive).eligible) return;
      items.unshift({
        id: `notif-${stamp}-${i}`,
        title: `New Placement Drive: ${drive.companyName} (${drive.role})`,
        message: `${drive.companyName} is hiring for ${drive.role} (${drive.packageLPA}). You meet the eligibility criteria. Apply before ${drive.applicationDeadline}.`,
        timestamp: new Date().toLocaleString(),
        type: 'drive',
        read: false,
        studentId: s.Student_ID
      });
    });
    this.write(NOTIFICATIONS_STORAGE_KEY, items);
  }

  /** studentId set -> private to that student; omitted -> visible to everyone. */
  public broadcastAnnouncement(
    title: string,
    message: string,
    type: NotificationItem['type'] = 'drive',
    studentId?: string
  ): void {
    const items = this.getNotifications();
    items.unshift({
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      message,
      timestamp: new Date().toLocaleString(),
      type,
      read: false,
      studentId
    });
    this.write(NOTIFICATIONS_STORAGE_KEY, items);
  }

  public getNotificationsForStudent(studentId: string): NotificationItem[] {
    const id = studentId.trim().toUpperCase();
    return this.getNotifications().filter((n) => !n.studentId || n.studentId.toUpperCase() === id);
  }

  public markNotificationAsRead(id: string): void {
    const items = this.getNotifications();
    const idx = items.findIndex((n) => n.id === id);
    if (idx >= 0) {
      items[idx].read = true;
      this.write(NOTIFICATIONS_STORAGE_KEY, items);
    }
  }

  public exportEligibleStudentsCsv(students: StudentRecord[], drive: PlacementDrive): string {
    const headers = [
      'Student_ID',
      'Full_Name',
      'Email',
      'Phone',
      'Branch',
      'CGPA',
      'Backlogs',
      'Attendance_Percentage',
      'Technical_Skills',
      'Projects_Count',
      'Eligibility_Status'
    ];

    const rows = students.map((s) => {
      const { eligible, reasons } = this.checkEligibility(s, drive);
      return [
        s.Student_ID,
        `"${s.Full_Name.replace(/"/g, '""')}"`,
        s.Email,
        s.Phone || 'N/A',
        `"${s.Branch}"`,
        s.CGPA.toFixed(2),
        s.Backlogs,
        s.Attendance_Percentage,
        `"${s.Technical_Skills.join('; ')}"`,
        s.Projects.length,
        eligible ? 'ELIGIBLE' : `DISQUALIFIED (${reasons.join(' | ')})`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Recruiter 2-Stage Matching:
   * Stage 1: Hard eligibility filters (CGPA, Backlogs, Branch)
   * Stage 2: Fit score based on required skills & project volume
   */
  public matchCandidatesForRole(
    allStudents: StudentRecord[],
    criteria: {
      minCGPA: number;
      maxBacklogs: number;
      branches: string[];
      requiredSkills: string[];
    }
  ): Array<{
    student: StudentRecord;
    stage1Passed: boolean;
    stage1FailReasons: string[];
    stage2FitScore: number;
    matchingSkills: string[];
    missingSkills: string[];
    readinessScore: number;
  }> {
    return allStudents.map((stu) => {
      const failReasons: string[] = [];
      if (stu.CGPA < criteria.minCGPA) failReasons.push(`CGPA ${stu.CGPA.toFixed(2)} < ${criteria.minCGPA}`);
      if (stu.Backlogs > criteria.maxBacklogs) failReasons.push(`${stu.Backlogs} Backlogs > ${criteria.maxBacklogs}`);
      if (criteria.branches.length > 0 && !criteria.branches.includes(stu.Branch)) {
        failReasons.push(`Branch ${stu.Branch} not in filter`);
      }

      const stage1Passed = failReasons.length === 0;

      const studentSkillsLower = stu.Technical_Skills.map((s) => s.toLowerCase());
      const matchingSkills = criteria.requiredSkills.filter((req) =>
        studentSkillsLower.some((s) => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))
      );
      const missingSkills = criteria.requiredSkills.filter(
        (req) => !studentSkillsLower.some((s) => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))
      );

      const skillFitPercent = criteria.requiredSkills.length > 0
        ? (matchingSkills.length / criteria.requiredSkills.length) * 60
        : 60;
      const projectBonus = Math.min(20, stu.Projects.length * 7);
      const codingBonus = Math.min(20, (stu.Coding_Activity.problemsSolved / 400) * 20);

      const stage2FitScore = Math.min(100, Math.round(skillFitPercent + projectBonus + codingBonus));
      const readinessScore = Math.round((stu.CGPA / 10) * 40 + (stu.Technical_Skills.length * 5) + (stu.Projects.length * 10));

      return {
        student: stu,
        stage1Passed,
        stage1FailReasons: failReasons,
        stage2FitScore,
        matchingSkills,
        missingSkills,
        readinessScore: Math.min(98, readinessScore)
      };
    }).sort((a, b) => {
      // Hard filter passes come first, then ranked by stage2FitScore
      if (a.stage1Passed && !b.stage1Passed) return -1;
      if (!a.stage1Passed && b.stage1Passed) return 1;
      return b.stage2FitScore - a.stage2FitScore;
    });
  }
}

export const placementService = new PlacementService();
