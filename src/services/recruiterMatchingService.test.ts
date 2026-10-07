import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PlacementDrive, StudentRecord } from '../types';
import { placementService } from './placementService';
import { matchCandidatesToDrive } from './recruiterMatchingService';
import { readinessService } from './readinessService';

function makeStudent(overrides: Partial<StudentRecord> = {}): StudentRecord {
  return {
    Student_ID: 'S-001',
    Full_Name: 'Candidate One',
    Email: 'candidate.one@example.test',
    Phone: '',
    College: 'Test College',
    Department: 'Computer Science',
    Branch: 'Computer Science & Engineering',
    Year: 4,
    Section: 'A',
    Graduation_Year: 2026,
    CGPA: 9,
    Attendance_Percentage: 92,
    Backlogs: 0,
    Technical_Skills: ['Python', 'SQL', 'Power BI'],
    Certifications: ['Python certification'],
    Internships: [],
    Projects: ['Analytics dashboard using Power BI and SQL'],
    Coding_Activity: { platform: 'LeetCode', problemsSolved: 120, contestRating: 1500 },
    Aptitude_Score: 85,
    Communication_Score: 8,
    Class_Teacher: '',
    Mentor: '',
    Location: '',
    ...overrides
  };
}

function makeDrive(overrides: Partial<PlacementDrive> = {}): PlacementDrive {
  return {
    id: 'drive-1',
    companyName: 'Opportunity from stored drive',
    logoText: 'OS',
    role: 'Data Analyst',
    packageLPA: 'As listed',
    jobType: 'Full-time',
    location: 'Campus',
    driveDate: '2026-10-15',
    applicationDeadline: '2026-10-10',
    eligibility: {
      minCGPA: 7,
      maxBacklogs: 0,
      allowedBranches: ['Computer Science & Engineering'],
      graduationYear: 2026
    },
    requiredSkills: ['Python', 'SQL', 'Power BI'],
    description: '',
    totalOpenings: 1,
    status: 'Active',
    isDemo: false,
    ...overrides
  };
}

describe('recruiter candidate matching', () => {
  it('ranks a high-readiness student with an exact skill match ahead of a similarly ready poor match', () => {
    const strongMatch = makeStudent({ Student_ID: 'S-001', Technical_Skills: ['python', 'SQL', 'Power BI'] });
    const poorMatch = makeStudent({ Student_ID: 'S-002', Technical_Skills: ['Java', 'HTML', 'Excel'] });
    const result = matchCandidatesToDrive([poorMatch, strongMatch], makeDrive());

    assert.equal(result.eligibleCandidates[0].student.Student_ID, 'S-001');
    assert.equal(result.eligibleCandidates[0].skillMatchPercent, 100);
    assert.equal(result.eligibleCandidates[1].skillMatchPercent, 0);
    assert.ok((result.eligibleCandidates[0].matchScore ?? 0) > (result.eligibleCandidates[1].matchScore ?? 0));
    assert.deepEqual(result.eligibleCandidates[0].matchingSkills, ['Python', 'SQL', 'Power BI']);
  });

  it('excludes students below CGPA and from an unapproved branch before ranking', () => {
    const lowCgpa = makeStudent({ Student_ID: 'S-003', CGPA: 6.5 });
    const wrongBranch = makeStudent({ Student_ID: 'S-004', Branch: 'Mechanical Engineering' });
    const result = matchCandidatesToDrive([lowCgpa, wrongBranch], makeDrive());

    assert.equal(result.eligibleCandidates.length, 0);
    assert.match(result.excludedCandidates[0].eligibilityReasons.join(' '), /CGPA/);
    assert.match(result.excludedCandidates[1].eligibilityReasons.join(' '), /Branch/);
  });

  it('uses exact normalized skill matching and does not infer Power BI from Excel', () => {
    const student = makeStudent({ Technical_Skills: ['python', 'SQL', 'Excel'] });
    const result = matchCandidatesToDrive([student], makeDrive());

    assert.deepEqual(result.eligibleCandidates[0].matchingSkills, ['Python', 'SQL']);
    assert.deepEqual(result.eligibleCandidates[0].unrecordedRequiredSkills, ['Power BI']);
    assert.ok(Math.abs((result.eligibleCandidates[0].skillMatchPercent ?? 0) - 200 / 3) < 1e-9);
  });

  it('does not assume missing skill, project, or certification information', () => {
    const student = makeStudent({
      Technical_Skills: [],
      Projects: [],
      Certifications: [],
      CGPA: 0,
      Attendance_Percentage: 0,
      Coding_Activity: { platform: '', problemsSolved: 0, contestRating: 0 },
      Aptitude_Score: 0,
      Communication_Score: 0
    });
    const drive = makeDrive({ eligibility: { ...makeDrive().eligibility, minCGPA: 0 } });
    const candidate = matchCandidatesToDrive([student], drive).eligibleCandidates[0];

    assert.equal(candidate.skillMatchPercent, null);
    assert.equal(candidate.skillInformationAvailable, false);
    assert.deepEqual(candidate.unrecordedRequiredSkills, []);
    assert.equal(candidate.projectRelevancePercent, null);
    assert.equal(candidate.certificationRelevancePercent, null);
    assert.equal(candidate.readinessScore, null);
    assert.equal(candidate.matchScore, null);
  });

  it('returns an honest empty result for no students and de-duplicates student IDs', () => {
    assert.deepEqual(matchCandidatesToDrive([], makeDrive()).eligibleCandidates, []);
    const student = makeStudent();
    const result = matchCandidatesToDrive([student, { ...student, Full_Name: 'Duplicate record' }], makeDrive());
    assert.equal(result.uniqueStudentCount, 1);
    assert.equal(result.eligibleCandidates.length, 1);
  });

  it('shares the existing readiness calculation for the same student record', () => {
    const student = makeStudent();
    const result = matchCandidatesToDrive([student], makeDrive());
    assert.equal(result.eligibleCandidates[0].readinessScore, readinessService.evaluateStudentReadiness(student).overallScore);
  });

  it('retains the existing duplicate application guard and creates only one application', () => {
    const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    const storage = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key)
      }
    });

    try {
      const { id: _id, ...driveInput } = makeDrive();
      const drive = placementService.createDrive(driveInput);
      const student = makeStudent();
      assert.equal(placementService.applyToDrive(student, drive).success, true);
      assert.equal(placementService.applyToDrive(student, drive).message, 'Already Applied');
      assert.equal(placementService.getApplicationsForDrive(drive.id).length, 1);
    } finally {
      if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
      else Reflect.deleteProperty(globalThis, 'localStorage');
    }
  });
});
