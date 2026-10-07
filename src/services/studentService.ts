import { StudentDataset, StudentRecord, User } from '../types';

const STORAGE_KEY = 'arya_ai_students_db_v6';
const DATASETS_STORAGE_KEY = 'arya_ai_student_datasets_v1';

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

  public getDatasetsUploadedBy(uploadedById: string): StudentDataset[] {
    try {
      const datasets = JSON.parse(localStorage.getItem(DATASETS_STORAGE_KEY) || '[]') as StudentDataset[];
      const students = this.getStorage();
      return datasets
        .filter((dataset) => dataset.uploadedById === uploadedById)
        .map((dataset) => ({
          ...dataset,
          recordCount: students.filter((student) => student.datasetId === dataset.datasetId).length
        }))
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    } catch {
      return [];
    }
  }

  public getDatasetById(datasetId: string): StudentDataset | null {
    try {
      const datasets = JSON.parse(localStorage.getItem(DATASETS_STORAGE_KEY) || '[]') as StudentDataset[];
      return datasets.find((dataset) => dataset.datasetId === datasetId) || null;
    } catch {
      return null;
    }
  }

  public getStudentsInDataset(datasetId: string): StudentRecord[] {
    return this.getStorage().filter((student) => student.datasetId === datasetId);
  }

  public createDatasetImport(
    fileName: string,
    uploadedBy: string,
    uploadedById: string,
    records: StudentRecord[]
  ): StudentDataset {
    const currentStudentsRaw = localStorage.getItem(STORAGE_KEY);
    const currentStudents = currentStudentsRaw ? JSON.parse(currentStudentsRaw) as StudentRecord[] : [];
    if (!Array.isArray(currentStudents)) throw new Error('Student records could not be read safely.');
    const existingIds = new Set(currentStudents.map((student) => student.Student_ID.trim().toUpperCase()));
    const batchIds = new Set<string>();
    const duplicateIds: string[] = [];

    for (const record of records) {
      const studentId = record.Student_ID.trim().toUpperCase();
      if (!studentId || existingIds.has(studentId) || batchIds.has(studentId)) duplicateIds.push(record.Student_ID);
      batchIds.add(studentId);
    }

    if (duplicateIds.length > 0) {
      throw new Error(`Student_ID already exists in another dataset or student record: ${duplicateIds.join(', ')}`);
    }
    if (records.length === 0) throw new Error('No valid student records to import.');

    const datasetId = `dataset-${typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`}`;
    const dataset: StudentDataset = {
      datasetId,
      fileName,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
      uploadedById,
      recordCount: records.length
    };
    const importedStudents = records.map((record) => ({
      ...record,
      datasetId,
      UpdatedAt: new Date().toISOString()
    }));
    const storedDatasets = JSON.parse(localStorage.getItem(DATASETS_STORAGE_KEY) || '[]') as StudentDataset[];
    const oldStudents = localStorage.getItem(STORAGE_KEY);
    const oldDatasets = localStorage.getItem(DATASETS_STORAGE_KEY);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...currentStudents, ...importedStudents]));
      localStorage.setItem(DATASETS_STORAGE_KEY, JSON.stringify([...storedDatasets, dataset]));
    } catch (error) {
      if (oldStudents === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, oldStudents);
      if (oldDatasets === null) localStorage.removeItem(DATASETS_STORAGE_KEY);
      else localStorage.setItem(DATASETS_STORAGE_KEY, oldDatasets);
      throw error;
    }

    return dataset;
  }

  public deleteDataset(datasetId: string, uploadedById: string): boolean {
    let datasets: StudentDataset[];
    try {
      datasets = JSON.parse(localStorage.getItem(DATASETS_STORAGE_KEY) || '[]') as StudentDataset[];
    } catch {
      return false;
    }
    const target = datasets.find((dataset) => dataset.datasetId === datasetId && dataset.uploadedById === uploadedById);
    if (!target) return false;

    const oldStudents = localStorage.getItem(STORAGE_KEY);
    const oldDatasets = localStorage.getItem(DATASETS_STORAGE_KEY);
    let currentStudents: StudentRecord[];
    try {
      currentStudents = oldStudents ? JSON.parse(oldStudents) as StudentRecord[] : [];
      if (!Array.isArray(currentStudents)) return false;
    } catch {
      return false;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentStudents.filter((student) => student.datasetId !== datasetId)));
      localStorage.setItem(DATASETS_STORAGE_KEY, JSON.stringify(datasets.filter((dataset) => dataset.datasetId !== datasetId)));
      return true;
    } catch (error) {
      if (oldStudents === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, oldStudents);
      if (oldDatasets === null) localStorage.removeItem(DATASETS_STORAGE_KEY);
      else localStorage.setItem(DATASETS_STORAGE_KEY, oldDatasets);
      throw error;
    }
  }

  public isAssignedToFaculty(student: StudentRecord, faculty: User): boolean {
    const assignedId = student.assignedFacultyId?.trim().toLowerCase();
    if (assignedId) return assignedId === faculty.id.trim().toLowerCase();

    const mentor = student.Mentor?.trim().toLowerCase();
    return Boolean(mentor && [faculty.name, faculty.email, faculty.id]
      .some((identity) => identity.trim().toLowerCase() === mentor));
  }

  public getStudentsForFaculty(faculty: User): StudentRecord[] {
    const ownedDatasetIds = new Set(this.getDatasetsUploadedBy(faculty.id).map((dataset) => dataset.datasetId));
    const availableStudents = this.getStorage().filter((student) =>
      this.isAssignedToFaculty(student, faculty) || Boolean(student.datasetId && ownedDatasetIds.has(student.datasetId))
    );
    return this.uniqueStudents(availableStudents);
  }

  public getAssignedStudentsForFaculty(faculty: User): StudentRecord[] {
    return this.uniqueStudents(this.getStorage().filter((student) => this.isAssignedToFaculty(student, faculty)));
  }

  private uniqueStudents(students: StudentRecord[]): StudentRecord[] {
    const seenStudentIds = new Set<string>();
    return students.filter((student) => {
      const studentId = student.Student_ID.trim().toUpperCase();
      if (!studentId || seenStudentIds.has(studentId)) return false;
      seenStudentIds.add(studentId);
      return true;
    });
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
    localStorage.removeItem(DATASETS_STORAGE_KEY);
  }
}

export const studentService = new StudentService();
