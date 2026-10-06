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
      'Location'
    ];

    const sampleRow1 = [
      'STU-2026-001',
      'Student Name A',
      'student.a@university.edu',
      '+91 99887 76655',
      'School of Computing & IT',
      'Computer Science and Engineering',
      'Computer Science & Engineering',
      '4',
      'CSE-A',
      '2026',
      '8.65',
      '94.0',
      '0',
      'Java;Spring Boot;PostgreSQL;Docker;AWS',
      'AWS Cloud Practitioner;Oracle Java SE',
      'Backend Intern @ Tech Firm (2 months)',
      'Campus Bus Tracking App;Distributed Cache Engine',
      'LeetCode',
      '310',
      '1680',
      '8.5',
      'Faculty Mentor',
      'Department Advisor',
      'Campus'
    ];

    const sampleRow2 = [
      'STU-2026-002',
      'Student Name B',
      'student.b@university.edu',
      '+91 98112 33445',
      'School of Computing & IT',
      'Information Technology',
      'Information Technology',
      '4',
      'IT-B',
      '2026',
      '7.40',
      '82.0',
      '0',
      'Python;Django;MySQL;Git;Tailwind CSS',
      'Coursera Python Data Structures',
      'Web Dev Trainee @ Software Inc (1 month)',
      'Student Attendance QR Scanner',
      'HackerRank',
      '140',
      '1420',
      '7.8',
      'Faculty Mentor',
      'Department Advisor',
      'Campus'
    ];

    return [
      headers.join(','),
      sampleRow1.join(','),
      sampleRow2.join(',')
    ].join('\n');
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
      const branch = recordMap['BRANCH'] || recordMap['DEPARTMENT'] || 'Computer Science & Engineering';

      const cgpaStr = recordMap['CGPA'] || '0';
      const cgpa = parseFloat(cgpaStr);

      const attStr = recordMap['ATTENDANCE_PERCENTAGE'] || recordMap['ATTENDANCE'] || '100';
      const attendance = parseFloat(attStr);

      const backlogsStr = recordMap['BACKLOGS'] || '0';
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

      // 5. Validate Attendance (0 to 100)
      if (isNaN(attendance) || attendance < 0 || attendance > 100) {
        messages.push(`Attendance must be between 0% and 100% (received: ${attStr})`);
        status = 'error';
      }

      // 6. Validate Backlogs
      if (isNaN(backlogs) || backlogs < 0) {
        messages.push(`Backlogs must be a non-negative integer (received: ${backlogsStr})`);
        status = 'error';
      }

      // Check if already in existing system
      const alreadyExists = existingStudents.some((s) => s.Student_ID.toUpperCase() === rawId);
      if (status !== 'error') {
        if (alreadyExists) {
          status = 'existing';
          messages.push('Existing student record will be updated');
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
        Phone: recordMap['PHONE'] || '+91 90000 00000',
        College: recordMap['COLLEGE'] || 'School of Computing & IT',
        Department: recordMap['DEPARTMENT'] || 'Computer Science and Engineering',
        Branch: branch,
        Year: parseInt(recordMap['YEAR'] || '4', 10) || 4,
        Section: recordMap['SECTION'] || 'A',
        Graduation_Year: parseInt(recordMap['GRADUATION_YEAR'] || '2026', 10) || 2026,
        CGPA: isNaN(cgpa) ? 7.0 : cgpa,
        Attendance_Percentage: isNaN(attendance) ? 85 : attendance,
        Backlogs: isNaN(backlogs) ? 0 : backlogs,
        Technical_Skills: parseList(recordMap['TECHNICAL_SKILLS']),
        Certifications: parseList(recordMap['CERTIFICATIONS']),
        Internships: parseList(recordMap['INTERNSHIPS']),
        Projects: parseList(recordMap['PROJECTS']),
        Coding_Activity: {
          platform: recordMap['CODING_PLATFORM'] || 'LeetCode',
          problemsSolved: parseInt(recordMap['PROBLEMS_SOLVED'] || '100', 10) || 100,
          contestRating: parseInt(recordMap['CONTEST_RATING'] || '1400', 10) || 1400
        },
        Communication_Score: parseFloat(recordMap['COMMUNICATION_SCORE'] || '7.5') || 7.5,
        Class_Teacher: recordMap['CLASS_TEACHER'] || recordMap['CLASS TEACHER'] || '',
        Mentor: recordMap['MENTOR'] || recordMap['FACULTY MENTOR'] || '',
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
      existingCount: previewRows.filter((r) => r.status === 'existing').length,
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
