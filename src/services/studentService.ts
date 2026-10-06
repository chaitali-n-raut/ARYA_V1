import { StudentRecord, User } from '../types';
import { emitDataChange } from './dataEvents';

const STORAGE_KEY = 'arya_ai_students_db_v6';

const OLD_STUDENT_KEYS = [
  'arya_ai_students_db',
  'arya_ai_students_db_v1',
  'arya_ai_students_db_v2',
  'arya_ai_students_db_v3',
  'arya_ai_students_db_v4',
  'arya_ai_students_db_v5'
];

/**
 * Empty baseline student record structure for new accounts
 */
export const RAW_DEFAULT_STUDENT: StudentRecord = {
  Student_ID: '',
  Full_Name: '',
  Email: '',
  Phone: '',
  College: 'School of Computing & Information Technology',
  Department: 'Computer Science and Engineering',
  Branch: 'Computer Science & Engineering',
  Year: 4,
  Section: 'A',
  Graduation_Year: 2026,
  CGPA: 0,
  Attendance_Percentage: 0,
  Backlogs: 0,
  Technical_Skills: [],
  Certifications: [],
  Internships: [],
  Projects: [],
  Coding_Activity: {
    platform: 'LeetCode',
    problemsSolved: 0,
    contestRating: 0,
    leetcodeSolved: 0,
    leetcodeRating: 0,
    codechefSolved: 0,
    codechefRating: 0
  },
  Aptitude_Score: 0,
  Communication_Score: 0,
  Class_Teacher: '',
  Mentor: '',
  Location: '',
  Target_Role: '',
  Bio: '',
  Mentorship_Notes: [],
  isProfileCompleted: false,
  ResumeUploaded: false,
  UpdatedAt: new Date().toISOString()
};

export const INITIAL_STUDENTS: StudentRecord[] = [];

export const SAMPLE_COHORT: StudentRecord[] = [];

class StudentService {
  constructor() {
    this.purgeOldKeys();
  }

  private purgeOldKeys() {
    OLD_STUDENT_KEYS.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
  }

  private getStorage(): StudentRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
        return INITIAL_STUDENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_STUDENTS;
    }
  }

  private saveStorage(students: StudentRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      emitDataChange();
    } catch (e) {
      console.error('Failed to save students to localStorage', e);
    }
  }

  public getAllStudents(): StudentRecord[] {
    return this.getStorage();
  }

  public getStudentById(studentId: string): StudentRecord | null {
    const students = this.getStorage();
    const found = students.find((s) => s.Student_ID.toUpperCase() === studentId.trim().toUpperCase());
    return found || null;
  }

  public createRawStudent(studentId: string, fullName: string, email: string, department?: string): StudentRecord {
    const raw: StudentRecord = {
      Student_ID: studentId.toUpperCase(),
      Full_Name: fullName,
      Email: email,
      Phone: '',
      College: 'School of Computing & Information Technology',
      Department: department || 'Computer Science and Engineering',
      Branch: department || 'Computer Science & Engineering',
      Year: 4,
      Section: 'A',
      Graduation_Year: 2026,
      CGPA: 0,
      Attendance_Percentage: 0,
      Backlogs: 0,
      Technical_Skills: [],
      Certifications: [],
      Internships: [],
      Projects: [],
      Coding_Activity: {
        platform: 'LeetCode',
        problemsSolved: 0,
        contestRating: 0,
        leetcodeSolved: 0,
        leetcodeRating: 0,
        codechefSolved: 0,
        codechefRating: 0
      },
      Aptitude_Score: 0,
      Communication_Score: 0,
      Class_Teacher: '',
      Mentor: '',
      Location: '',
      Target_Role: '',
      Bio: '',
      Mentorship_Notes: [],
      isProfileCompleted: false,
      ResumeUploaded: false,
      UpdatedAt: new Date().toISOString()
    };

    const current = this.getStorage();
    const existing = current.find((s) => s.Student_ID.toUpperCase() === studentId.toUpperCase());
    // Never overwrite an existing record (e.g. one created from a mentor's CSV)
    if (existing) return existing;
    current.push(raw);
    this.saveStorage(current);
    return raw;
  }

  public updateStudent(updatedRecord: StudentRecord): boolean {
    const students = this.getStorage();
    const index = students.findIndex((s) => s.Student_ID.toUpperCase() === updatedRecord.Student_ID.toUpperCase());
    if (index === -1) {
      students.push({ ...updatedRecord, UpdatedAt: new Date().toISOString() });
      this.saveStorage(students);
      return true;
    }
    students[index] = {
      ...updatedRecord,
      UpdatedAt: new Date().toISOString()
    };
    this.saveStorage(students);
    return true;
  }

  /**
   * Imports one CSV as an isolated batch.
   * Duplicate rule: a Student_ID that already exists ANYWHERE in the system
   * (another batch, or a self-registered profile) is SKIPPED - never overwritten,
   * never duplicated. Every stored record is tagged with its batch id.
   */
  public importBatch(
    records: StudentRecord[],
    batchId: string,
    uploader: Pick<User, 'name' | 'email'>
  ): { added: number; skippedIds: string[] } {
    const current = this.getStorage();
    const existingIds = new Set(current.map((s) => s.Student_ID.toUpperCase()));
    const skippedIds: string[] = [];
    let added = 0;
    const now = new Date().toISOString();

    for (const rec of records) {
      const id = rec.Student_ID.toUpperCase();
      if (existingIds.has(id)) {
        skippedIds.push(id);
        continue;
      }
      existingIds.add(id);
      current.push({
        ...rec,
        Student_ID: id,
        // Rows with no mentor are assigned to the faculty member who uploaded them
        Mentor: rec.Mentor?.trim() ? rec.Mentor.trim() : uploader.name,
        Mentor_Email: rec.Mentor?.trim() ? rec.Mentor_Email : rec.Mentor_Email || uploader.email,
        Import_Batch_ID: batchId,
        UpdatedAt: now
      });
      added++;
    }

    this.saveStorage(current);
    return { added, skippedIds };
  }

  /** Removes ONLY the records that belong to the given batch. Returns what was removed. */
  public deleteByBatch(batchId: string): StudentRecord[] {
    const current = this.getStorage();
    const removed = current.filter((s) => s.Import_Batch_ID === batchId);
    if (removed.length === 0) return [];
    this.saveStorage(current.filter((s) => s.Import_Batch_ID !== batchId));
    return removed;
  }

  public countByBatch(batchId: string): number {
    return this.getStorage().filter((s) => s.Import_Batch_ID === batchId).length;
  }

  // ---------------- Mentor relationship (data-driven) ----------------

  /** True when the student's stored mentor mapping points at this faculty user. */
  public isAssignedTo(student: StudentRecord, mentor: Pick<User, 'name' | 'email'>): boolean {
    const norm = (v?: string) => (v || '').trim().toLowerCase();
    const mentorEmail = norm(mentor.email);
    const mentorName = norm(mentor.name);
    if (norm(student.Mentor_Email) && norm(student.Mentor_Email) === mentorEmail) return true;
    const m = norm(student.Mentor);
    return !!m && (m === mentorName || m === mentorEmail);
  }

  public getStudentsForMentor(mentor: Pick<User, 'name' | 'email'>): StudentRecord[] {
    return this.getStorage().filter((s) => this.isAssignedTo(s, mentor));
  }

  /** Reassigning a mentor immediately changes what each faculty member can see. */
  public assignMentor(studentId: string, mentorName: string, mentorEmail?: string): boolean {
    const students = this.getStorage();
    const idx = students.findIndex((s) => s.Student_ID.toUpperCase() === studentId.toUpperCase());
    if (idx === -1) return false;
    students[idx] = {
      ...students[idx],
      Mentor: mentorName,
      Mentor_Email: mentorEmail || '',
      UpdatedAt: new Date().toISOString()
    };
    this.saveStorage(students);
    return true;
  }

  public addMentoringNote(studentId: string, note: string): boolean {
    const student = this.getStudentById(studentId);
    if (!student) return false;
    const dateStr = new Date().toISOString().split('T')[0];
    const updatedNotes = [
      `${dateStr}: ${note}`,
      ...(student.Mentorship_Notes || [])
    ];
    return this.updateStudent({
      ...student,
      Mentorship_Notes: updatedNotes
    });
  }

  public resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEY);
    emitDataChange();
  }

  /** Removes every student record (used by Clean Slate). */
  public removeAll(): void {
    this.saveStorage([]);
  }
}

export const studentService = new StudentService();
