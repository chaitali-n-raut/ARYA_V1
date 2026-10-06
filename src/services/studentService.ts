import { StudentRecord } from '../types';

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
    const existingIdx = current.findIndex((s) => s.Student_ID.toUpperCase() === studentId.toUpperCase());
    if (existingIdx >= 0) {
      current[existingIdx] = raw;
    } else {
      current.push(raw);
    }
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

  public importStudents(records: StudentRecord[]): { added: number; updated: number } {
    const current = this.getStorage();
    let added = 0;
    let updated = 0;

    for (const rec of records) {
      const idx = current.findIndex((s) => s.Student_ID.toUpperCase() === rec.Student_ID.toUpperCase());
      if (idx >= 0) {
        current[idx] = { ...current[idx], ...rec, UpdatedAt: new Date().toISOString() };
        updated++;
      } else {
        current.push({ ...rec, UpdatedAt: new Date().toISOString() });
        added++;
      }
    }

    this.saveStorage(current);
    return { added, updated };
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
  }
}

export const studentService = new StudentService();
