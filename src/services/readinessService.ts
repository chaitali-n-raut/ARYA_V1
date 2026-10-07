import {
  StudentRecord,
  ReadinessEvaluation,
  DimensionScore,
  ReadinessFactor,
  CareerPathRecommendation,
  SkillGapItem,
  RoadmapMilestone
} from '../types';

/** Current frontend decision support is deterministic and rule-based, not a trained ML model. */
export function hasStudentRecordData(student: StudentRecord | null | undefined): boolean {
  if (!student) return false;
  return Boolean(
    student.isProfileCompleted === true ||
    (Number.isFinite(student.CGPA) && student.CGPA > 0) ||
    (student.Technical_Skills?.length ?? 0) > 0 ||
    (student.Projects?.length ?? 0) > 0 ||
    (student.Certifications?.length ?? 0) > 0 ||
    (student.Internships?.length ?? 0) > 0 ||
    (student.Coding_Activity?.problemsSolved ?? 0) > 0 ||
    (student.Coding_Activity?.leetcodeSolved ?? 0) > 0 ||
    (student.Coding_Activity?.codechefSolved ?? 0) > 0 ||
    (student.Aptitude_Score ?? 0) > 0 ||
    (student.Communication_Score ?? 0) > 0 ||
    (student.Attendance_Percentage ?? 0) > 0 ||
    student.ResumeUploaded === true
  );
}

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const list = (items?: string[]) => items ?? [];

export class ReadinessService {
  /**
   * Builds a reproducible weighted score from fields present on this student record.
   * Dimensions without a usable value are omitted and remaining weights are normalized.
   * This is readiness-oriented decision support, not placement probability or model inference.
   */
  public evaluateStudentReadiness(student: StudentRecord): ReadinessEvaluation {
    const skills = list(student.Technical_Skills);
    const projects = list(student.Projects);
    const certifications = list(student.Certifications);
    const internships = list(student.Internships);
    const coding = student.Coding_Activity;
    const solved = coding
      ? (coding.leetcodeSolved ?? coding.problemsSolved ?? 0) + (coding.codechefSolved ?? 0)
      : 0;
    const dimensions: DimensionScore[] = [];

    const addDimension = (name: string, score: number, weight: number, description: string) => {
      const bounded = Math.round(clamp(score));
      dimensions.push({
        name,
        score: bounded,
        weight,
        weightedScore: 0,
        status: bounded >= 80 ? 'excellent' : bounded >= 65 ? 'good' : bounded >= 45 ? 'moderate' : 'needs_improvement',
        description
      });
    };

    if (Number.isFinite(student.CGPA) && student.CGPA > 0) {
      const cgpa = clamp((student.CGPA / 10) * 100);
      const backlogCount = Number.isFinite(student.Backlogs) ? Math.max(0, student.Backlogs) : 0;
      addDimension('Academic Record', clamp(cgpa - backlogCount * 18), 0.25,
        `CGPA ${student.CGPA.toFixed(2)} / 10; ${backlogCount} recorded backlogs`);
    }
    if (Number.isFinite(student.Attendance_Percentage) && student.Attendance_Percentage > 0) {
      addDimension('Attendance', student.Attendance_Percentage, 0.10,
        `${clamp(student.Attendance_Percentage)}% recorded attendance`);
    }
    if (student.Technical_Skills !== undefined) {
      addDimension('Technical Skills', Math.min(100, skills.length * 14), 0.20,
        `${skills.length} skills listed in the student record`);
    }
    if (student.Projects !== undefined) {
      addDimension('Projects', Math.min(100, projects.length * 33), 0.15,
        `${projects.length} projects listed in the student record`);
    }
    if (student.Certifications !== undefined) {
      addDimension('Certifications', Math.min(100, certifications.length * 35), 0.10,
        `${certifications.length} certifications listed in the student record`);
    }
    if (coding) {
      const codingScore = solved > 0
        ? Math.min(100, (solved / 350) * 75 + (coding.contestRating > 1200 ? ((coding.contestRating - 1200) / 600) * 25 : 0))
        : 0;
      addDimension('Coding Activity', codingScore, 0.10,
        `${solved} problems recorded${coding.contestRating ? `; contest rating ${coding.contestRating}` : ''}`);
    }
    if (student.Aptitude_Score > 0) {
      addDimension('Aptitude', student.Aptitude_Score, 0.05, `Recorded aptitude score: ${student.Aptitude_Score} / 100`);
    }
    if (student.Communication_Score > 0) {
      addDimension('Communication Assessment', (student.Communication_Score / 10) * 100, 0.05,
        `Recorded assessment: ${student.Communication_Score} / 10`);
    }
    if (internships.length > 0) {
      addDimension('Internships', Math.min(100, internships.length * 50), 0.05,
        `${internships.length} internships listed in the student record`);
    }

    if (dimensions.length === 0) {
      return {
        overallScore: 0,
        tier: 'Early Stage',
        tierColor: '#94A3B8',
        dimensions: [],
        positiveFactors: [],
        negativeFactors: [],
        explainabilitySummary: 'No usable academic, attendance, or experience values are recorded yet. Add or import student information to calculate a readiness score.'
      };
    }

    const totalWeight = dimensions.reduce((sum, dimension) => sum + dimension.weight, 0);
    dimensions.forEach((dimension) => {
      dimension.weight = dimension.weight / totalWeight;
      dimension.weightedScore = Number((dimension.score * dimension.weight).toFixed(1));
    });
    const overallScore = clamp(Math.round(dimensions.reduce((sum, dimension) => sum + dimension.weightedScore, 0)));
    const backlogCount = Number.isFinite(student.Backlogs) ? Math.max(0, student.Backlogs) : 0;
    const tier: ReadinessEvaluation['tier'] = backlogCount > 0
      ? 'Critical Intervention'
      : overallScore >= 80
        ? 'High Placement Readiness'
        : overallScore >= 55
          ? 'Moderate Readiness'
          : 'Early Stage';
    const tierColor = tier === 'High Placement Readiness' ? '#2EA396'
      : tier === 'Moderate Readiness' ? '#3B82F6'
        : tier === 'Critical Intervention' ? '#EF4444' : '#F59E0B';

    const factorFor = (dimension: DimensionScore): ReadinessFactor => ({
      name: dimension.name,
      impact: dimension.score >= 70 ? 'positive' : dimension.score < 50 ? 'negative' : 'neutral',
      detail: dimension.description,
      actionableAdvice: dimension.score < 50
        ? this.actionForDimension(dimension.name)
        : dimension.score >= 70
          ? 'Maintain this area and keep the supporting profile information current.'
          : 'This recorded area is developing; review it alongside your target role requirements.'
    });
    const positiveFactors = dimensions.filter((dimension) => dimension.score >= 70).map(factorFor);
    const negativeFactors = dimensions.filter((dimension) => dimension.score < 50).map(factorFor);
    const explainabilitySummary = `Rule-based readiness score: ${overallScore}/100 (${tier}). It uses ${dimensions.length} recorded dimension${dimensions.length === 1 ? '' : 's'}; dimensions without usable values are excluded and the available weights are normalized. This score is not a placement probability.`;

    return {
      overallScore,
      tier,
      tierColor,
      dimensions,
      positiveFactors,
      negativeFactors,
      explainabilitySummary
    };
  }

  private actionForDimension(name: string): string {
    const actions: Record<string, string> = {
      'Academic Record': 'Review the recorded CGPA and backlog details with your faculty mentor, then plan the next academic improvement step.',
      Attendance: 'Review attendance with your faculty mentor and make a plan to attend upcoming classes consistently.',
      'Technical Skills': 'Add evidence of skills you have actually practiced, then choose one target-role skill to develop next.',
      Projects: 'Build or document a project that demonstrates a skill relevant to your selected role.',
      Certifications: 'Consider a relevant course or certification and add it after completion.',
      'Coding Activity': 'Set a steady coding practice goal and update the record with completed work.',
      Aptitude: 'Practice aptitude topics and update this field after a new assessment.',
      'Communication Assessment': 'Ask for a new communication assessment and practice explaining your project work.',
      Internships: 'Record relevant internship experience when completed; do not treat missing entries as proof of no experience.'
    };
    return actions[name] ?? 'Review this profile area and update it with verified information.';
  }

  /** Rule-based role alignment against an explicit, small reference skill catalog. */
  public getCareerPathRecommendations(student: StudentRecord): CareerPathRecommendation[] {
    const recordedSkills = list(student.Technical_Skills).filter((skill) => skill.trim().length > 0);
    if (recordedSkills.length === 0) return [];
    const normalizedSkills = recordedSkills.map((skill) => skill.toLowerCase());
    const catalog = [
      { id: 'cp-fullstack', title: 'Full-Stack Software Engineer', category: 'Web & Distributed Systems', required: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs', 'Git'], overview: 'Builds and maintains client and server applications.' },
      { id: 'cp-ml-ds', title: 'Machine Learning / Data Scientist', category: 'Applied AI & Analytics', required: ['Python', 'SQL', 'Scikit-learn', 'PyTorch', 'Pandas', 'FastAPI', 'MLOps'], overview: 'Works with data analysis and machine-learning systems.' },
      { id: 'cp-cloud-devops', title: 'Cloud & DevOps Associate', category: 'Cloud Infrastructure', required: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'CI/CD Pipelines', 'Terraform', 'Python'], overview: 'Works with deployment automation and cloud infrastructure.' },
      { id: 'cp-backend-java', title: 'Enterprise Java / Backend Developer', category: 'Enterprise Software', required: ['Java', 'Spring Boot', 'MySQL', 'REST APIs', 'Microservices', 'Git'], overview: 'Builds backend services and enterprise applications.' },
      { id: 'cp-cybersec', title: 'Cybersecurity & SOC Analyst', category: 'Security', required: ['Network Security', 'Linux', 'Wireshark', 'Python Scripting', 'Docker', 'SIEM / Splunk'], overview: 'Works with security monitoring and vulnerability assessment.' }
    ];
    return catalog.map((item) => {
      const matches = item.required.filter((required) => normalizedSkills.some((skill) => skill.includes(required.toLowerCase()) || required.toLowerCase().includes(skill)));
      const missing = item.required.filter((required) => !matches.includes(required));
      return {
        id: item.id,
        title: item.title,
        category: item.category,
        matchScore: Math.round((matches.length / item.required.length) * 100),
        salaryRange: 'Not estimated by this prototype',
        growthOutlook: 'Not estimated by this prototype',
        requiredSkills: item.required,
        studentMatchingSkills: matches,
        studentMissingSkills: missing,
        overview: item.overview,
        typicalEmployers: []
      };
    }).sort((a, b) => b.matchScore - a.matchScore || a.title.localeCompare(b.title));
  }

  /** Missing skills here mean "not recorded in this profile", not proof the student lacks them. */
  public getSkillGaps(student: StudentRecord, targetRole?: string): SkillGapItem[] {
    const paths = this.getCareerPathRecommendations(student);
    const roleTitle = targetRole || student.Target_Role;
    if (paths.length === 0) return [];
    const selected = roleTitle
      ? paths.find((path) => path.title.toLowerCase() === roleTitle.toLowerCase())
      : paths.find((path) => path.title === 'Full-Stack Software Engineer');
    if (!selected) return [];
    return selected.studentMissingSkills.map((skill, index) => ({
      skill,
      category: 'Technical',
      importance: index < 3 ? 'High' : 'Medium',
      currentProficiency: 'None',
      targetProficiency: 'Proficient',
      suggestedAction: `Develop and document a small practical exercise or project demonstrating ${skill}.`,
      estimatedWeeks: 3
    }));
  }

  /** Generates unchecked actions from recorded weaknesses and profile gaps. */
  public getPersonalizedRoadmap(student: StudentRecord): RoadmapMilestone[] {
    const evaluation = this.evaluateStudentReadiness(student);
    const gaps = this.getSkillGaps(student);
    const actions = [
      ...evaluation.negativeFactors.map((factor) => ({ text: factor.actionableAdvice, skill: factor.name })),
      ...gaps.slice(0, 3).map((gap) => ({ text: gap.suggestedAction, skill: gap.skill }))
    ].filter((item, index, all) => item.text && all.findIndex((candidate) => candidate.text === item.text) === index);
    if (actions.length === 0) {
      actions.push({ text: 'Review your profile and selected role; update records when you complete new work.', skill: 'Profile review' });
    }
    return [{
      id: 'profile-roadmap',
      weekRange: 'Next steps',
      title: 'Actions based on your current profile',
      description: 'Suggestions are generated from recorded readiness factors and role-skill gaps. Mark an action complete only after you have done it.',
      skillsCovered: actions.map((action) => action.skill),
      status: 'in_progress',
      actionItems: actions.map((action, index) => ({ id: `profile-action-${index + 1}`, text: action.text, completed: false }))
    }];
  }
}

export const readinessService = new ReadinessService();
