import { PlacementDrive, JobApplication, StudentRecord, NotificationItem } from '../types';
import { readinessService } from './readinessService';

const DRIVES_STORAGE_KEY = 'arya_ai_placement_drives_v2';
const APPLICATIONS_STORAGE_KEY = 'arya_ai_applications_v2';
const NOTIFICATIONS_STORAGE_KEY = 'arya_ai_notifications_v2';

export const INITIAL_DRIVES: PlacementDrive[] = [];


export const INITIAL_APPLICATIONS: JobApplication[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-welcome',
    title: 'Welcome to ARYA AI Placement & Career Engine',
    message: 'Complete your profile or upload your resume to generate your real-time placement readiness score and explore matching campus drives.',
    timestamp: 'Just now',
    type: 'agentic',
    read: false
  }
];

class PlacementService {
  private getDrives(): PlacementDrive[] {
    try {
      const data = localStorage.getItem(DRIVES_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(DRIVES_STORAGE_KEY, JSON.stringify(INITIAL_DRIVES));
        return INITIAL_DRIVES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_DRIVES;
    }
  }

  private getApplications(): JobApplication[] {
    try {
      const data = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_APPLICATIONS));
        return INITIAL_APPLICATIONS;
      }
      const applications = JSON.parse(data) as JobApplication[];
      const normalized = applications.map((application) => ({
        ...application,
        applicationId: application.applicationId || application.id
      }));
      if (normalized.some((application, index) => application.applicationId !== applications[index].applicationId)) {
        localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(normalized));
      }
      return normalized;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  }

  private getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
        return INITIAL_NOTIFICATIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  public getAllDrives(): PlacementDrive[] {
    return this.getDrives();
  }

  public getPublishedDrives(): PlacementDrive[] {
    return this.getDrives().filter((drive) => !drive.isDemo && (drive.status || 'Active') !== 'Closed');
  }

  public getDriveById(id: string): PlacementDrive | null {
    return this.getDrives().find((d) => d.id === id) || null;
  }

  public createDrive(drive: Omit<PlacementDrive, 'id'>): PlacementDrive {
    const drives = this.getDrives();
    const newDrive: PlacementDrive = {
      ...drive,
      id: `drive-${Date.now()}`,
      status: drive.status || 'Active',
      createdAt: drive.createdAt || new Date().toISOString()
    };
    drives.unshift(newDrive);
    localStorage.setItem(DRIVES_STORAGE_KEY, JSON.stringify(drives));

    // Post an automatic notification to students about new placement drive
    this.broadcastAnnouncement(
      `New Placement Drive: ${newDrive.companyName} (${newDrive.role})`,
      `${newDrive.companyName} has opened registration for ${newDrive.role} offering ${newDrive.packageLPA}. Deadline to apply is ${newDrive.applicationDeadline}.`,
      'drive'
    );

    return newDrive;
  }

  public updateDrive(id: string, updatedDrive: Partial<PlacementDrive>): boolean {
    const drives = this.getDrives();
    const idx = drives.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    drives[idx] = { ...drives[idx], ...updatedDrive };
    localStorage.setItem(DRIVES_STORAGE_KEY, JSON.stringify(drives));
    return true;
  }

  public deleteDrive(id: string): boolean {
    const drives = this.getDrives();
    const filtered = drives.filter((d) => d.id !== id);
    if (filtered.length === drives.length) return false;
    localStorage.setItem(DRIVES_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  public clearAllDrives(): void {
    localStorage.setItem(DRIVES_STORAGE_KEY, JSON.stringify([]));
  }

  public clearDemoData(): void {
    const drives = this.getDrives();
    const demoDriveIds = new Set(drives.filter((drive) => drive.isDemo).map((drive) => drive.id));
    localStorage.setItem(DRIVES_STORAGE_KEY, JSON.stringify(drives.filter((drive) => !drive.isDemo)));
    localStorage.setItem(
      APPLICATIONS_STORAGE_KEY,
      JSON.stringify(this.getApplications().filter((application) => !demoDriveIds.has(application.driveId)))
    );
  }

  public resetToDefaultDrives(): void {
    localStorage.setItem(DRIVES_STORAGE_KEY, JSON.stringify(INITIAL_DRIVES));
  }

  public getAllApplications(): JobApplication[] {
    return this.getApplications();
  }

  public getApplicationsForDrive(driveId: string): JobApplication[] {
    return this.getApplications().filter((a) => a.driveId === driveId);
  }

  public checkEligibility(student: StudentRecord, drive: PlacementDrive): { eligible: boolean; reasons: string[] } {
    const reasons: string[] = [];

    if (student.CGPA < drive.eligibility.minCGPA) {
      reasons.push(`CGPA (${student.CGPA.toFixed(2)}) is below required minimum ${drive.eligibility.minCGPA}`);
    }
    if (student.Backlogs > drive.eligibility.maxBacklogs) {
      reasons.push(`Student has ${student.Backlogs} active backlogs (maximum permitted: ${drive.eligibility.maxBacklogs})`);
    }
    if (student.Graduation_Year !== drive.eligibility.graduationYear) {
      reasons.push(`Graduation year (${student.Graduation_Year}) does not match required year ${drive.eligibility.graduationYear}`);
    }
    if (!drive.eligibility.allowedBranches.includes(student.Branch)) {
      reasons.push(`Branch '${student.Branch}' is not in the approved branches list`);
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }

  public getApplicationsByStudent(studentId: string): JobApplication[] {
    const all = this.getApplications();
    return all.filter((a) => a.studentId.trim().toUpperCase() === studentId.trim().toUpperCase());
  }

  public applyToDrive(student: StudentRecord, drive: PlacementDrive): { success: boolean; message: string } {
    const apps = this.getApplications();
    const already = apps.find(
      (application) => application.studentId.trim().toUpperCase() === student.Student_ID.trim().toUpperCase() && application.driveId === drive.id
    );
    if (already) return { success: false, message: 'Already Applied' };

    const publishedDrive = this.getDrives().find((candidate) => candidate.id === drive.id && !candidate.isDemo);
    if (!publishedDrive || (publishedDrive.status || 'Active') !== 'Active') {
      return { success: false, message: 'This placement drive is not currently open for applications.' };
    }

    const { eligible, reasons } = this.checkEligibility(student, publishedDrive);
    if (!eligible) {
      return { success: false, message: `Eligibility criteria not met: ${reasons.join(', ')}` };
    }

    const applicationId = `app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newApp: JobApplication = {
      id: applicationId,
      applicationId,
      driveId: publishedDrive.id,
      studentId: student.Student_ID,
      companyName: publishedDrive.companyName,
      role: publishedDrive.role,
      packageLPA: publishedDrive.packageLPA,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Applied',
      stageNotes: 'Application received and verified by T&P portal. Ready for recruiter shortlisting.'
    };
    apps.unshift(newApp);
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(apps));
    return { success: true, message: `Successfully applied to ${drive.companyName} for ${drive.role}!` };
  }

  public updateApplicationStatus(applicationId: string, status: JobApplication['status'], notes?: string): boolean {
    const apps = this.getApplications();
    const idx = apps.findIndex((a) => a.id === applicationId);
    if (idx === -1) return false;
    apps[idx].status = status;
    if (notes) apps[idx].stageNotes = notes;
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(apps));

    // Post an announcement/notification for student
    const notifMsg = notes
      ? `T&P Cell updated your application for ${apps[idx].companyName} (${apps[idx].role}) to "${status}". Remarks: "${notes}"`
      : `T&P Cell updated your application for ${apps[idx].companyName} (${apps[idx].role}) to "${status}".`;

    this.broadcastAnnouncement(
      `Application Status: ${apps[idx].companyName} · ${status}`,
      notifMsg,
      'alert'
    );

    return true;
  }

  public broadcastAnnouncement(
    title: string,
    message: string,
    type: NotificationItem['type'] = 'drive'
  ): void {
    const items = this.getNotifications();
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      timestamp: 'Just now',
      type,
      read: false
    };
    items.unshift(newNotif);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
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

  public getNotificationsForStudent(_studentId: string): NotificationItem[] {
    return this.getNotifications();
  }

  public markNotificationAsRead(id: string): void {
    const items = this.getNotifications();
    const idx = items.findIndex((n) => n.id === id);
    if (idx >= 0) {
      items[idx].read = true;
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
    }
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

      const studentSkillsLower = (stu.Technical_Skills ?? []).map((s) => s.toLowerCase());
      const matchingSkills = criteria.requiredSkills.filter((req) =>
        studentSkillsLower.some((s) => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))
      );
      const missingSkills = criteria.requiredSkills.filter(
        (req) => !studentSkillsLower.some((s) => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))
      );

      const skillFitPercent = criteria.requiredSkills.length > 0
        ? (matchingSkills.length / criteria.requiredSkills.length) * 60
        : 60;
      const projectBonus = Math.min(20, (stu.Projects?.length ?? 0) * 7);
      const codingBonus = Math.min(20, ((stu.Coding_Activity?.problemsSolved ?? 0) / 400) * 20);

      const stage2FitScore = Math.min(100, Math.round(skillFitPercent + projectBonus + codingBonus));
      const readinessScore = readinessService.evaluateStudentReadiness(stu).overallScore;

      return {
        student: stu,
        stage1Passed,
        stage1FailReasons: failReasons,
        stage2FitScore,
        matchingSkills,
        missingSkills,
        readinessScore
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
