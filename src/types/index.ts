export type UserRole = 'student' | 'faculty' | 'tnp' | 'recruiter' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** True only when confirmed by the authentication server; absent for local prototype accounts. */
  emailVerified?: boolean;
  /** Prototype account credential only; must never be copied into the current-user session object. */
  password?: string;
  avatar?: string;
  department?: string;
  studentId?: string; // Links to StudentRecord.Student_ID
  designation?: string;
  organization?: string;
  isAuthenticated?: boolean;
}

export interface StudentRecord {
  Student_ID: string;
  datasetId?: string;
  Full_Name: string;
  Email: string;
  Phone: string;
  College: string;
  Department: string;
  Branch: string;
  Year: number;
  Section: string;
  Graduation_Year: number;
  CGPA: number;
  Attendance_Percentage: number;
  Backlogs: number;
  Semester_Grades?: { sem: string; sgpa: number }[];
  Technical_Skills: string[];
  Certifications: string[];
  Internships: string[];
  Projects: string[];
  Coding_Activity: {
    platform: string;
    problemsSolved: number;
    contestRating: number;
    leetcodeSolved?: number;
    leetcodeRating?: number;
    codechefSolved?: number;
    codechefRating?: number;
    profileUrl?: string;
  };
  Aptitude_Score: number; // 0 - 100 scale (default 0)
  Communication_Score: number; // 0 - 10 scale (default 0)
  Class_Teacher: string;
  Mentor: string;
  assignedFacultyId?: string;
  Location: string;
  Target_Role?: string;
  Bio?: string;
  Mentorship_Notes?: string[];
  UpdatedAt?: string;
  isProfileCompleted?: boolean;
  ResumeUploaded?: boolean;
  ResumeFileName?: string;
}

export interface StudentDataset {
  datasetId: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  uploadedById: string;
  recordCount: number;
}

export interface ExtractedResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  cgpa?: number;
  branch?: string;
  technicalSkills: string[];
  certifications: string[];
  projects: string[];
  internships: string[];
  codingProfiles?: {
    platform: string;
    problemsSolved: number;
    contestRating?: number;
    leetcodeSolved?: number;
    leetcodeRating?: number;
    codechefSolved?: number;
    codechefRating?: number;
  };
  aptitudeScore?: number;
  communicationScore?: number;
  targetRole?: string;
  bio?: string;
}

export interface DimensionScore {
  name: string;
  score: number; // 0 - 100
  weight: number; // 0.0 - 1.0
  weightedScore: number;
  status: 'excellent' | 'good' | 'moderate' | 'needs_improvement';
  description: string;
}

export interface ReadinessFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  detail: string;
  actionableAdvice: string;
}

export interface ReadinessEvaluation {
  overallScore: number; // 0 - 100
  tier: 'High Placement Readiness' | 'Moderate Readiness' | 'Early Stage' | 'Critical Intervention';
  tierColor: string;
  dimensions: DimensionScore[];
  positiveFactors: ReadinessFactor[];
  negativeFactors: ReadinessFactor[];
  explainabilitySummary: string;
}

export interface CareerPathRecommendation {
  id: string;
  title: string;
  category: string;
  matchScore: number; // 0 - 100
  salaryRange: string;
  growthOutlook: string;
  requiredSkills: string[];
  studentMatchingSkills: string[];
  studentMissingSkills: string[];
  overview: string;
  typicalEmployers: string[];
}

export interface SkillGapItem {
  skill: string;
  category: 'Technical' | 'Soft Skill' | 'Domain' | 'Tooling';
  importance: 'High' | 'Medium' | 'Low';
  currentProficiency: 'None' | 'Beginner' | 'Intermediate' | 'Proficient';
  targetProficiency: 'Intermediate' | 'Proficient' | 'Advanced';
  suggestedAction: string;
  estimatedWeeks: number;
}

export interface RoadmapMilestone {
  id: string;
  weekRange: string;
  title: string;
  description: string;
  skillsCovered: string[];
  actionItems: { id: string; text: string; completed: boolean }[];
  status: 'completed' | 'in_progress' | 'upcoming';
}

export interface PlacementDrive {
  id: string;
  companyName: string;
  logoText: string;
  role: string;
  packageLPA: string;
  jobType: 'Full-time' | 'Internship + PPO' | 'Specialist';
  location: string;
  driveDate: string;
  applicationDeadline: string;
  eligibility: {
    minCGPA: number;
    maxBacklogs: number;
    allowedBranches: string[];
    graduationYear: number;
  };
  requiredSkills: string[];
  selectionProcess?: string[];
  description: string;
  totalOpenings: number;
  status?: 'Active' | 'Upcoming' | 'Closed';
  bondDetails?: string;
  createdBy?: string;
  createdAt?: string;
  contactEmail?: string;
  isDemo: boolean;
}

export interface JobApplication {
  id: string;
  applicationId: string;
  driveId: string;
  studentId: string;
  companyName: string;
  role: string;
  packageLPA: string;
  appliedDate: string;
  status: 'Applied' | 'Shortlisted' | 'Assessment Round' | 'Technical Interview' | 'HR Round' | 'Selected' | 'Declined';
  stageNotes: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'alert' | 'drive' | 'roadmap' | 'mentor' | 'agentic';
  read: boolean;
  actionUrl?: string;
}

export interface ImportPreviewRow {
  rowNumber: number;
  studentId: string;
  fullName: string;
  email: string;
  cgpa: number;
  attendance: number;
  backlogs: number;
  branch: string;
  status: 'valid' | 'warning' | 'error' | 'existing';
  messages: string[];
  rawRecord: Partial<StudentRecord>;
}

export interface ImportSummary {
  totalRows: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  existingCount: number;
  importedCount: number;
}
