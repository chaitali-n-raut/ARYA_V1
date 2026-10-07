import { StudentRecord, ImportPreviewRow, ImportSummary } from '../types';

export class CsvParserService {
  /**
   * Generates a downloadable standard CSV template
   */
  public generateCsvTemplate(): string {
    const headers = [
      'Student_ID',
      'Full_Name',
      'Email',
      'Phone',
      'College',
      'Department',
      'Branch',
      'Year',
      'Section',
      'Graduation_Year',
      'CGPA',
      'Attendance_Percentage',
      'Backlogs',
      'Technical_Skills',
      'Certifications',
      'Internships',
      'Projects',
      'Coding_Platform',
      'Problems_Solved',
      'Contest_Rating',
      'Communication_Score',
      'Class_Teacher',
      'Mentor',
      'Assigned_Faculty_ID',
      'Location'
    ];
    return headers.join(',');
  }

  /**
   * Parse CSV text into preview rows and validate against existing records
   */
  public parseAndValidateCsv(
    csvContent: string,
    existingStudents: StudentRecord[]
  ): { previewRows: ImportPreviewRow[]; summary: ImportSummary } {
    const lines = csvContent
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      return {
        previewRows: [],
        summary: { totalRows: 0, validCount: 0, warningCount: 0, errorCount: 0, existingCount: 0, importedCount: 0 }
      };
    }

    // Split headers handling potential quotes
    const headers = this.parseCsvLine(lines[0]).map((h) => h.trim().toUpperCase());
    const studentIdIndex = headers.findIndex((h) => h === 'STUDENT_ID');

    if (studentIdIndex === -1) {
      throw new Error("Missing required column 'Student_ID' in CSV file header.");
    }

    const previewRows: ImportPreviewRow[] = [];
    const seenIdsInBatch = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const values = this.parseCsvLine(line);
      const rowNum = i + 1;

      const recordMap: Record<string, string> = {};
      headers.forEach((h, idx) => {
        recordMap[h] = values[idx] || '';
      });

      const rawId = (recordMap['STUDENT_ID'] || '').trim().toUpperCase();
      const fullName = (recordMap['FULL_NAME'] || '').trim();
      const email = (recordMap['EMAIL'] || '').trim();
      const branch = recordMap['BRANCH'] || recordMap['DEPARTMENT'] || '';

      const cgpaStr = recordMap['CGPA'] || '';
      const cgpa = parseFloat(cgpaStr);

      const attStr = recordMap['ATTENDANCE_PERCENTAGE'] || recordMap['ATTENDANCE'] || '';
      const attendance = parseFloat(attStr);

      const backlogsStr = recordMap['BACKLOGS'] || '';
      const backlogs = parseInt(backlogsStr, 10);

      const messages: string[] = [];
      let status: ImportPreviewRow['status'] = 'valid';

      // 1. Validate Student_ID
      if (!rawId) {
        messages.push('Student_ID is blank');
        status = 'error';
      } else if (seenIdsInBatch.has(rawId)) {
        messages.push(`Duplicate Student_ID '${rawId}' detected within this batch`);
        status = 'error';
      } else {
        seenIdsInBatch.add(rawId);
      }

      // 2. Validate Full_Name
      if (!fullName) {
        messages.push('Full Name is required');
        status = 'error';
      }

      // 3. Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        messages.push('Invalid email address format');
        status = 'error';
      }

      // 4. Validate CGPA (0.0 to 10.0)
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
        messages.push(`CGPA must be a decimal between 0.0 and 10.0 (received: ${cgpaStr})`);
        status = 'error';
      }
      if (!cgpaStr.trim()) {
        messages.push('CGPA is required');
        status = 'error';
      }

      // 5. Validate Attendance (0 to 100)
      if (isNaN(attendance) || attendance < 0 || attendance > 100) {
        messages.push(`Attendance must be between 0% and 100% (received: ${attStr})`);
        status = 'error';
      }
      if (!attStr.trim()) {
        messages.push('Attendance is required');
        status = 'error';
      }

      // 6. Validate Backlogs
      if (isNaN(backlogs) || backlogs < 0) {
        messages.push(`Backlogs must be a non-negative integer (received: ${backlogsStr})`);
        status = 'error';
      }
      if (!backlogsStr.trim()) {
        messages.push('Backlogs is required');
        status = 'error';
      }

      const graduationYear = parseInt(recordMap['GRADUATION_YEAR'] || '', 10);
      if (!recordMap['GRADUATION_YEAR'] || isNaN(graduationYear)) {
        messages.push('Graduation_Year is required');
        status = 'error';
      }

      // Check if already in existing system
      const existingStudent = existingStudents.find((s) => s.Student_ID.trim().toUpperCase() === rawId);
      if (status !== 'error') {
        if (existingStudent) {
          status = 'error';
          messages.push(existingStudent.datasetId
            ? 'Student_ID already exists in another dataset.'
            : 'Student_ID already exists in student records.');
        } else if (cgpa < 6.0 || backlogs > 0) {
          status = 'warning';
          messages.push('Flagged for academic advisory review (CGPA < 6.0 or active backlog)');
        }
      }

      // Build StudentRecord structure
      const parseList = (str?: string) =>
        str ? str.split(';').map((s) => s.trim()).filter((s) => s.length > 0) : [];

      const rawRecord: Partial<StudentRecord> = {
        Student_ID: rawId,
        Full_Name: fullName,
        Email: email,
        Phone: recordMap['PHONE'] || '',
        College: recordMap['COLLEGE'] || '',
        Department: recordMap['DEPARTMENT'] || '',
        Branch: branch,
        Year: parseInt(recordMap['YEAR'] || '0', 10) || 0,
        Section: recordMap['SECTION'] || 'A',
        Graduation_Year: isNaN(graduationYear) ? 0 : graduationYear,
        CGPA: isNaN(cgpa) ? 0 : cgpa,
        Attendance_Percentage: isNaN(attendance) ? 0 : attendance,
        Backlogs: isNaN(backlogs) ? 0 : backlogs,
        Technical_Skills: parseList(recordMap['TECHNICAL_SKILLS']),
        Certifications: parseList(recordMap['CERTIFICATIONS']),
        Internships: parseList(recordMap['INTERNSHIPS']),
        Projects: parseList(recordMap['PROJECTS']),
        Coding_Activity: {
          platform: recordMap['CODING_PLATFORM'] || '',
          problemsSolved: parseInt(recordMap['PROBLEMS_SOLVED'] || '0', 10) || 0,
          contestRating: parseInt(recordMap['CONTEST_RATING'] || '0', 10) || 0
        },
        Communication_Score: parseFloat(recordMap['COMMUNICATION_SCORE'] || '0') || 0,
        Class_Teacher: recordMap['CLASS_TEACHER'] || recordMap['CLASS TEACHER'] || '',
        Mentor: recordMap['MENTOR'] || recordMap['FACULTY MENTOR'] || '',
        assignedFacultyId: recordMap['ASSIGNED_FACULTY_ID'] || '',
        Location: recordMap['LOCATION'] || ''
      };

      previewRows.push({
        rowNumber: rowNum,
        studentId: rawId,
        fullName,
        email,
        cgpa: isNaN(cgpa) ? 0 : cgpa,
        attendance: isNaN(attendance) ? 0 : attendance,
        backlogs: isNaN(backlogs) ? 0 : backlogs,
        branch,
        status,
        messages,
        rawRecord
      });
    }

    const summary: ImportSummary = {
      totalRows: previewRows.length,
      validCount: previewRows.filter((r) => r.status === 'valid').length,
      warningCount: previewRows.filter((r) => r.status === 'warning').length,
      errorCount: previewRows.filter((r) => r.status === 'error').length,
      existingCount: previewRows.filter((r) => r.messages.some((message) => message.startsWith('Student_ID already exists'))).length,
      importedCount: 0
    };

    return { previewRows, summary };
  }

  /**
   * Downloads error report CSV for all failed rows
   */
  public generateErrorReportCsv(errorRows: ImportPreviewRow[]): string {
    const headers = ['Row_Number', 'Student_ID', 'Full_Name', 'Email', 'Error_Messages'];
    const lines = errorRows.map((r) =>
      [
        r.rowNumber,
        `"${r.studentId}"`,
        `"${r.fullName}"`,
        `"${r.email}"`,
        `"${r.messages.join(' | ')}"`
      ].join(',')
    );
    return [headers.join(','), ...lines].join('\n');
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let insideQuotes = false;
    let entry = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(entry);
        entry = '';
      } else {
        entry += char;
      }
    }
    result.push(entry);
    return result;
  }
}

export const csvParserService = new CsvParserService();
