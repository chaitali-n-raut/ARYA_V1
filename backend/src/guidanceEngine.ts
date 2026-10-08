export interface LocalModelResult {
  placement_probability?: number;
  prediction?: string;
  confidence?: number;
  priority_features?: string[];
  selected_model?: string;
}

export interface GuidanceItem {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  category: string;
}

interface StudentProfile {
  CGPA?: number;
  Backlogs?: number;
  Technical_Skills?: string[];
  Projects?: string[];
  Certifications?: string[];
  Internships?: string[];
  Internship_Months?: number;
  Aptitude_Score?: number;
  Communication_Score?: number;
  Coding_Activity?: {
    problemsSolved?: number;
    contestRating?: number;
    leetcodeSolved?: number;
    codechefSolved?: number;
    leetcodeRating?: number;
    codechefRating?: number;
  };
  Hackathons_Participated?: number;
  Hackathons_Won?: number;
  Github_Projects?: number;
  Resume_Score?: number;
  Training_Hours?: number;
  Mock_Interview_Score?: number;
  Target_Role?: string;
  Branch?: string;
  Department?: string;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function scoreTechnicalSkills(student: StudentProfile) {
  const skills = Array.isArray(student.Technical_Skills)
    ? student.Technical_Skills.length
    : 0;

  return clamp(skills * 14);
}

function scoreProjects(student: StudentProfile) {
  const projects = Array.isArray(student.Projects)
    ? student.Projects.length
    : 0;

  return clamp(projects * 33);
}

function scoreCertifications(student: StudentProfile) {
  const certifications = Array.isArray(student.Certifications)
    ? student.Certifications.length
    : 0;

  return clamp(certifications * 35);
}

function scoreCoding(student: StudentProfile) {
  const coding = student.Coding_Activity || {};

  const leetcode =
    Number(coding.leetcodeSolved ?? coding.problemsSolved ?? 0);

  const codechef =
    Number(coding.codechefSolved ?? 0);

  const totalSolved = leetcode + codechef;

  const rating = Math.max(
    Number(coding.contestRating ?? 0),
    Number(coding.leetcodeRating ?? 0),
    Number(coding.codechefRating ?? 0)
  );

  if (totalSolved === 0) {
    return 0;
  }

  const solvedScore = (totalSolved / 350) * 75;

  const ratingScore =
    rating > 1200
      ? ((rating - 1200) / 600) * 25
      : 0;

  return clamp(Math.round(solvedScore + ratingScore));
}

function scoreAcademics(student: StudentProfile) {
  const cgpa = Number(student.CGPA ?? 0);
  const backlogs = Number(student.Backlogs ?? 0);

  let score = (cgpa / 10) * 100;

  if (backlogs > 0) {
    score -= backlogs * 18;
  }

  return clamp(Math.round(score));
}

function scoreCommunication(student: StudentProfile) {
  const value = Number(student.Communication_Score ?? 0);

  if (value <= 10) {
    return clamp(value * 10);
  }

  return clamp(value);
}

function scoreAptitude(student: StudentProfile) {
  return clamp(Number(student.Aptitude_Score ?? 0));
}

function scoreInternship(student: StudentProfile) {
  const internships = Array.isArray(student.Internships)
    ? student.Internships.length
    : 0;

  const months = Number(student.Internship_Months ?? 0);

  if (internships === 0 && months === 0) {
    return 0;
  }

  if (months >= 6) {
    return 100;
  }

  if (months >= 3 || internships >= 1) {
    return 70;
  }

  return 40;
}

function scoreResume(student: StudentProfile) {
  const value = Number(student.Resume_Score ?? 0);

  if (value > 0) {
    return clamp(value);
  }

  return student.Projects && student.Projects.length > 0 ? 60 : 25;
}

function addGuidance(
  list: GuidanceItem[],
  item: GuidanceItem
) {
  if (!list.some((existing) => existing.id === item.id)) {
    list.push(item);
  }
}

export function generateLocalGuidance(
  student: StudentProfile,
  model: LocalModelResult
): {
  summary: string;
  guidance: GuidanceItem[];
} {
  const placementProbability = clamp(
    Number(model.placement_probability ?? 0) * 100
  );

  const academicScore = scoreAcademics(student);
  const technicalScore = scoreTechnicalSkills(student);
  const projectScore = scoreProjects(student);
  const certificationScore = scoreCertifications(student);
  const codingScore = scoreCoding(student);
  const communicationScore = scoreCommunication(student);
  const aptitudeScore = scoreAptitude(student);
  const internshipScore = scoreInternship(student);
  const resumeScore = scoreResume(student);

  const guidance: GuidanceItem[] = [];

  /*
   * Academic readiness
   */
  if (Number(student.Backlogs ?? 0) > 0) {
    addGuidance(guidance, {
      id: 'backlogs',
      title: 'Clear active academic backlogs',
      description:
        'Academic eligibility can affect access to campus placement opportunities.',
      priority: 'High',
      action:
        'Prioritize pending subjects and work toward clearing all active backlogs.',
      category: 'Academics'
    });
  }

  /*
   * Technical skills
   */
  if (technicalScore < 50) {
    addGuidance(guidance, {
      id: 'technical-foundation',
      title: 'Strengthen technical skills',
      description:
        'Your current technical-skill coverage can be improved for placement preparation.',
      priority: 'High',
      action:
        'Choose one target role and build strong working knowledge of the core technologies required for it.',
      category: 'Technical Skills'
    });
  } else if (technicalScore < 75) {
    addGuidance(guidance, {
      id: 'technical-depth',
      title: 'Build deeper technical expertise',
      description:
        'You have a useful technical foundation, but deeper practical knowledge can improve interview readiness.',
      priority: 'Medium',
      action:
        'Practice advanced problems and build practical features using your strongest technologies.',
      category: 'Technical Skills'
    });
  }

  /*
   * Projects
   */
  if (projectScore < 50) {
    addGuidance(guidance, {
      id: 'projects',
      title: 'Build your project portfolio',
      description:
        'Practical projects provide evidence of your ability to apply technical knowledge.',
      priority: 'High',
      action:
        'Complete at least one end-to-end project related to your target role and document your contribution clearly.',
      category: 'Projects'
    });
  } else if (projectScore < 100) {
    addGuidance(guidance, {
      id: 'project-depth',
      title: 'Improve project depth',
      description:
        'Your project experience can be strengthened with more substantial implementation work.',
      priority: 'Medium',
      action:
        'Add testing, deployment, documentation, measurable outcomes, and technical design details to your strongest project.',
      category: 'Projects'
    });
  }

  /*
   * Internship / practical exposure
   */
  if (internshipScore === 0) {
    addGuidance(guidance, {
      id: 'internship',
      title: 'Gain practical experience',
      description:
        'Practical industry exposure can strengthen your placement profile.',
      priority: 'High',
      action:
        'Apply for internships, live projects, campus projects, or other opportunities where you can demonstrate real-world implementation.',
      category: 'Experience'
    });
  }

  /*
   * Coding practice
   */
  if (codingScore < 45) {
    addGuidance(guidance, {
      id: 'coding',
      title: 'Increase coding practice',
      description:
        'More structured problem-solving practice can improve technical interview preparation.',
      priority: 'High',
      action:
        'Follow a regular DSA practice schedule and focus on arrays, strings, hash maps, recursion, sorting, searching, and common interview patterns.',
      category: 'Coding'
    });
  } else if (codingScore < 70) {
    addGuidance(guidance, {
      id: 'coding-interview',
      title: 'Strengthen interview problem solving',
      description:
        'Your coding practice is developing and can be improved further with timed practice.',
      priority: 'Medium',
      action:
        'Practice medium-level problems under time limits and review your solutions for efficiency.',
      category: 'Coding'
    });
  }

  /*
   * Certifications
   */
  if (certificationScore < 35) {
    addGuidance(guidance, {
      id: 'certifications',
      title: 'Add relevant certifications',
      description:
        'Relevant certifications can provide additional evidence of structured learning.',
      priority: 'Low',
      action:
        'Complete one certification that directly supports your target role rather than collecting unrelated credentials.',
      category: 'Certifications'
    });
  }

  /*
   * Communication
   */
  if (communicationScore < 60) {
    addGuidance(guidance, {
      id: 'communication',
      title: 'Improve interview communication',
      description:
        'Clear communication is important during technical and behavioral interviews.',
      priority: 'High',
      action:
        'Practice explaining projects, technical decisions, strengths, weaknesses, and common behavioral questions aloud.',
      category: 'Communication'
    });
  }

  /*
   * Aptitude
   */
  if (aptitudeScore > 0 && aptitudeScore < 60) {
    addGuidance(guidance, {
      id: 'aptitude',
      title: 'Improve aptitude preparation',
      description:
        'A stronger aptitude foundation can help with assessment and screening rounds.',
      priority: 'Medium',
      action:
        'Practice quantitative aptitude, logical reasoning, data interpretation, and timed mock assessments.',
      category: 'Aptitude'
    });
  }

  /*
   * Resume
   */
  if (resumeScore < 60) {
    addGuidance(guidance, {
      id: 'resume',
      title: 'Strengthen your resume',
      description:
        'Your resume should clearly communicate your strongest skills and measurable project outcomes.',
      priority: 'Medium',
      action:
        'Use concise achievement-focused bullets and highlight your strongest projects, skills, certifications, and practical experience.',
      category: 'Resume'
    });
  }

  /*
   * If the profile is already strong, provide preparation guidance
   * instead of inventing weaknesses.
   */
  if (
    guidance.length === 0 ||
    (
      placementProbability >= 70 &&
      academicScore >= 70 &&
      technicalScore >= 70 &&
      projectScore >= 70
    )
  ) {
    addGuidance(guidance, {
      id: 'placement-preparation',
      title: 'Focus on placement execution',
      description:
        'Your profile has a solid foundation. The next step is converting preparation into interview performance.',
      priority: 'Medium',
      action:
        'Practice mock interviews, tailor your resume to each role, and prepare company-specific technical and behavioral questions.',
      category: 'Placement Preparation'
    });
  }

  /*
   * Sort by priority.
   */
  const priorityOrder: Record<GuidanceItem['priority'], number> = {
    High: 1,
    Medium: 2,
    Low: 3
  };

  guidance.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  /*
   * Keep the student-facing guidance focused.
   */
  const selectedGuidance = guidance.slice(0, 5);

  let summary =
    'Your current profile has several areas that can be strengthened before placement season.';

  if (placementProbability >= 70) {
    summary =
      'Your profile shows a strong placement foundation. Focus on interview execution and role-specific preparation.';
  } else if (placementProbability >= 45) {
    summary =
      'Your profile is developing. Strengthening the highest-priority areas below can improve your placement preparation.';
  } else {
    summary =
      'Your profile is at an early preparation stage. Focus first on the high-priority areas below and build progress consistently.';
  }

  return {
    summary,
    guidance: selectedGuidance
  };
}