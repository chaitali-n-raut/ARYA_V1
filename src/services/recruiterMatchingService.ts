import { PlacementDrive, StudentRecord } from '../types';
import { placementService } from './placementService';
import { hasStudentRecordData, readinessService } from './readinessService';

export interface CandidateMatch {
  student: StudentRecord;
  eligibilityReasons: string[];
  readinessScore: number | null;
  skillMatchPercent: number | null;
  matchingSkills: string[];
  unrecordedRequiredSkills: string[];
  skillInformationAvailable: boolean;
  projectRelevancePercent: number | null;
  certificationRelevancePercent: number | null;
  matchScore: number | null;
}

export interface CandidateMatchingResult {
  eligibleCandidates: CandidateMatch[];
  excludedCandidates: CandidateMatch[];
  uniqueStudentCount: number;
}

const normalizeSkill = (skill: string) => skill.normalize('NFKC').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
const normalizeSkills = (skills: string[] = []) => {
  const seen = new Set<string>();
  return skills.flatMap((skill) => {
    const normalized = normalizeSkill(skill);
    if (!normalized || seen.has(normalized)) return [];
    seen.add(normalized);
    return [skill.trim()];
  });
};

function includesSkillPhrase(text: string, skill: string): boolean {
  const escaped = skill.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  if (!escaped) return false;
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, 'i').test(text);
}

function relevancePercent(items: string[], requiredSkills: string[]): number | null {
  const recordedItems = items.map((item) => item.trim()).filter(Boolean);
  if (recordedItems.length === 0 || requiredSkills.length === 0) return null;
  const matchedCount = requiredSkills.filter((skill) => recordedItems.some((item) => includesSkillPhrase(item, skill))).length;
  return (matchedCount / requiredSkills.length) * 100;
}

function uniqueStudents(students: StudentRecord[]): StudentRecord[] {
  const seen = new Set<string>();
  return students.filter((student) => {
    const id = student.Student_ID?.trim().toLocaleUpperCase();
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function evaluateCandidate(student: StudentRecord, drive: PlacementDrive): CandidateMatch {
  const eligibility = placementService.checkEligibility(student, drive);
  const requiredSkills = normalizeSkills(drive.requiredSkills);
  const recordedSkills = normalizeSkills(student.Technical_Skills);
  const skillInformationAvailable = recordedSkills.length > 0;
  const recordedSkillKeys = new Set(recordedSkills.map(normalizeSkill));
  const matchingSkills = skillInformationAvailable
    ? requiredSkills.filter((skill) => recordedSkillKeys.has(normalizeSkill(skill)))
    : [];
  const skillMatchPercent = skillInformationAvailable && requiredSkills.length > 0
    ? (matchingSkills.length / requiredSkills.length) * 100
    : null;
  const unrecordedRequiredSkills = skillInformationAvailable && requiredSkills.length > 0
    ? requiredSkills.filter((skill) => !recordedSkillKeys.has(normalizeSkill(skill)))
    : [];
  const readinessScore = hasStudentRecordData(student)
    ? readinessService.evaluateStudentReadiness(student).overallScore
    : null;
  const projectRelevancePercent = relevancePercent(student.Projects ?? [], requiredSkills);
  const certificationRelevancePercent = relevancePercent(student.Certifications ?? [], requiredSkills);

  // Fixed base weights; dimensions without recorded evidence are omitted and remaining weights normalized.
  const dimensions = [
    { score: readinessScore, weight: 0.5 },
    { score: skillMatchPercent, weight: 0.3 },
    { score: projectRelevancePercent, weight: 0.1 },
    { score: certificationRelevancePercent, weight: 0.1 }
  ].filter((dimension): dimension is { score: number; weight: number } => dimension.score !== null);
  const availableWeight = dimensions.reduce((total, dimension) => total + dimension.weight, 0);
  const matchScore = availableWeight > 0
    ? Math.round(dimensions.reduce((total, dimension) => total + dimension.score * dimension.weight, 0) / availableWeight)
    : null;

  return {
    student,
    eligibilityReasons: eligibility.reasons,
    readinessScore,
    skillMatchPercent,
    matchingSkills,
    unrecordedRequiredSkills,
    skillInformationAvailable,
    projectRelevancePercent,
    certificationRelevancePercent,
    matchScore
  };
}

function sortCandidates(candidates: CandidateMatch[]): CandidateMatch[] {
  return candidates.sort((a, b) => {
    if (a.matchScore === null && b.matchScore !== null) return 1;
    if (a.matchScore !== null && b.matchScore === null) return -1;
    const scoreDifference = (b.matchScore ?? -1) - (a.matchScore ?? -1);
    if (scoreDifference !== 0) return scoreDifference;
    return (b.readinessScore ?? -1) - (a.readinessScore ?? -1);
  });
}

export function matchCandidatesToDrive(students: StudentRecord[], drive: PlacementDrive): CandidateMatchingResult {
  const evaluated = uniqueStudents(students).map((student) => evaluateCandidate(student, drive));
  return {
    eligibleCandidates: sortCandidates(evaluated.filter((candidate) => candidate.eligibilityReasons.length === 0)),
    excludedCandidates: evaluated.filter((candidate) => candidate.eligibilityReasons.length > 0),
    uniqueStudentCount: evaluated.length
  };
}

export const recruiterMatchingService = { matchCandidatesToDrive };
