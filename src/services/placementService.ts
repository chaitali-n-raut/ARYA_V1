import { PlacementDrive, JobApplication, StudentRecord, NotificationItem } from '../types';

const DRIVES_STORAGE_KEY = 'arya_ai_placement_drives_v2';
const APPLICATIONS_STORAGE_KEY = 'arya_ai_applications_v2';
const NOTIFICATIONS_STORAGE_KEY = 'arya_ai_notifications_v2';

export const INITIAL_DRIVES: PlacementDrive[] = [
  {
    id: 'drive-001',
    companyName: 'Thoughtworks Technologies',
    logoText: 'TW',
    role: 'Graduate Consultant / Software Developer',
    packageLPA: '₹12.0 - ₹14.5 LPA',
    jobType: 'Full-time',
    location: 'Bangalore / Pune / Hyderabad',
    driveDate: '2026-10-14',
    applicationDeadline: '2026-10-05',
    eligibility: {
      minCGPA: 7.5,
      maxBacklogs: 0,
      allowedBranches: ['Computer Science & Engineering', 'Data Science & AI', 'Information Technology'],
      graduationYear: 2026
    },
    requiredSkills: ['React', 'Node.js', 'Clean Code', 'TDD', 'Data Structures & Algorithms'],
    description: 'Looking for agile, passionate engineers who value clean craft, continuous integration, diversity, and collaborative problem-solving.',
    totalOpenings: 35,
    isDemo: true
  },
  {
    id: 'drive-002',
    companyName: 'CloudScale Dynamics & AI',
    logoText: 'CSD',
    role: 'Cloud Solutions Associate',
    packageLPA: '₹11.0 - ₹13.5 LPA',
    jobType: 'Full-time',
    location: 'Bangalore / Remote',
    driveDate: '2026-10-18',
    applicationDeadline: '2026-10-08',
    eligibility: {
      minCGPA: 7.0,
      maxBacklogs: 0,
      allowedBranches: ['Computer Science & Engineering', 'Information Technology', 'Cybersecurity & Networks'],
      graduationYear: 2026
    },
    requiredSkills: ['Docker', 'AWS', 'Linux Administration', 'Python', 'PostgreSQL'],
    description: 'Join the infrastructure engineering squad optimizing distributed microservices, multi-region observability, and Kubernetes clusters.',
    totalOpenings: 20,
    isDemo: true
  },
  {
    id: 'drive-003',
    companyName: 'Zomato Engineering',
    logoText: 'ZOM',
    role: 'Software Development Engineer - I (Frontend / FullStack)',
    packageLPA: '₹16.0 - ₹18.5 LPA',
    jobType: 'Full-time',
    location: 'Gurgaon, India',
    driveDate: '2026-10-25',
    applicationDeadline: '2026-10-12',
    eligibility: {
      minCGPA: 8.0,
      maxBacklogs: 0,
      allowedBranches: ['Computer Science & Engineering', 'Data Science & AI', 'Information Technology'],
      graduationYear: 2026
    },
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Performance Optimization', 'REST APIs'],
    description: 'Work on high-scale customer apps serving millions of active food & grocery delivery orders every day.',
    totalOpenings: 15,
    isDemo: true
  },
  {
    id: 'drive-004',
    companyName: 'Fractal Analytics & AI',
    logoText: 'FRC',
    role: 'Associate Data Scientist / ML Engineer',
    packageLPA: '₹10.5 - ₹13.0 LPA',
    jobType: 'Full-time',
    location: 'Mumbai / Bangalore',
    driveDate: '2026-10-28',
    applicationDeadline: '2026-10-15',
    eligibility: {
      minCGPA: 8.0,
      maxBacklogs: 0,
      allowedBranches: ['Data Science & AI', 'Computer Science & Engineering'],
      graduationYear: 2026
    },
    requiredSkills: ['Python', 'SQL', 'PyTorch', 'Scikit-learn', 'Pandas', 'FastAPI'],
    description: 'Empower Fortune 500 enterprises with generative AI prototypes, customer churn models, and pricing intelligence.',
    totalOpenings: 25,
    isDemo: true
  },
  {
    id: 'drive-005',
    companyName: 'Infosys Specialist Programmer',
    logoText: 'INF',
    role: 'Specialist Programmer (Power Programmer)',
    packageLPA: '₹9.5 LPA',
    jobType: 'Specialist',
    location: 'Pan-India',
    driveDate: '2026-11-04',
    applicationDeadline: '2026-10-20',
    eligibility: {
      minCGPA: 6.5,
      maxBacklogs: 0,
      allowedBranches: ['Computer Science & Engineering', 'Information Technology', 'Data Science & AI', 'Cybersecurity & Networks'],
      graduationYear: 2026
    },
    requiredSkills: ['Data Structures & Algorithms', 'Competitive Programming', 'Java / Python / C++'],
    description: 'Elite programming track within Infosys focusing on complex architecture design, algorithm development, and digital transformation.',
    totalOpenings: 50,
    isDemo: true
  }
];

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
      return JSON.parse(data);
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
    return all.filter((a) => a.studentId.toUpperCase() === studentId.trim().toUpperCase());
  }

  public applyToDrive(student: StudentRecord, drive: PlacementDrive): { success: boolean; message: string } {
    const apps = this.getApplications();
    const already = apps.find(
      (a) => a.studentId.toUpperCase() === student.Student_ID.toUpperCase() && a.driveId === drive.id
    );

    if (already) {
      return { success: false, message: 'You have already submitted an application for this placement drive.' };
    }

    const { eligible, reasons } = this.checkEligibility(student, drive);
    if (!eligible) {
      return { success: false, message: `Eligibility criteria not met: ${reasons.join(', ')}` };
    }

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      driveId: drive.id,
      studentId: student.Student_ID,
      companyName: drive.companyName,
      role: drive.role,
      packageLPA: drive.packageLPA,
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
