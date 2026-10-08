import {
  StudentRecord,
  ReadinessEvaluation,
  DimensionScore,
  XAIFactor,
  CareerPathRecommendation,
  SkillGapItem,
  RoadmapMilestone
} from '../types';

export function hasStudentRecordData(student: StudentRecord | null | undefined): boolean {
  if (!student) return false;
  return Boolean(
    student.isProfileCompleted === true ||
    student.CGPA > 0 ||
    (student.Technical_Skills && student.Technical_Skills.length > 0) ||
    (student.Projects && student.Projects.length > 0) ||
    (student.Certifications && student.Certifications.length > 0) ||
    (student.Coding_Activity && student.Coding_Activity.problemsSolved > 0) ||
    student.Attendance_Percentage > 0 ||
    student.ResumeUploaded === true
  );
}

export class ReadinessService {
  /**
   * Transparent readiness calculation based on StudentRecord.
   * Explicitly labeled as Demo Readiness Assessment to fulfill the research guidelines.
   */
  public evaluateStudentReadiness(student: StudentRecord): ReadinessEvaluation {
    if (!hasStudentRecordData(student)) {
      return {
        overallScore: 0,
        tier: 'Early Stage',
        tierColor: '#94A3B8',
        dimensions: [
          { name: 'Academic Mastery', score: 0, weight: 0.25, weightedScore: 0, status: 'needs_improvement', description: 'Pending student record or faculty import' },
          { name: 'Technical Competency', score: 0, weight: 0.25, weightedScore: 0, status: 'needs_improvement', description: '0 verified technical competencies' },
          { name: 'Hands-on Projects', score: 0, weight: 0.20, weightedScore: 0, status: 'needs_improvement', description: '0 portfolio projects registered' },
          { name: 'Industry Certifications', score: 0, weight: 0.10, weightedScore: 0, status: 'needs_improvement', description: '0 industry credentials' },
          { name: 'Algorithmic & Coding Practice', score: 0, weight: 0.10, weightedScore: 0, status: 'needs_improvement', description: '0 problems solved' },
          { name: 'Communication & Soft Skills', score: 0, weight: 0.10, weightedScore: 0, status: 'needs_improvement', description: 'Not evaluated yet' }
        ],
        positiveFactors: [],
        negativeFactors: [
          {
            name: 'Profile Incomplete',
            impact: 'negative',
            contribution: -100,
            detail: 'No academic credentials, technical skills, or project deliverables found in this student account.',
            actionableAdvice: 'Upload your resume or complete your student profile to compute placement readiness diagnostics.'
          }
        ],
        explainabilitySummary:
          'Complete your profile or upload your resume to receive a personalized placement-readiness assessment.',
        modelConfidence: 0,
        isDemo: true
      };
    }

    // 1. Academic Performance (Weight: 20%)
    let academicRaw = (student.CGPA / 10) * 100;
    if (student.Backlogs > 0) {
      academicRaw = Math.max(0, academicRaw - student.Backlogs * 18);
    }
    const academicScore = Math.min(100, Math.round(academicRaw));

    // 2. Technical Skills (Weight: 20%)
    const skillCount = student.Technical_Skills?.length || 0;
    const technicalRaw = skillCount === 0 ? 0 : Math.min(100, skillCount * 14);
    const technicalScore = Math.round(technicalRaw);

    // 3. Projects (Weight: 15%)
    const projectCount = student.Projects?.length || 0;
    const projectRaw = projectCount === 0 ? 0 : Math.min(100, projectCount * 33);
    const projectScore = Math.round(projectRaw);

    // 4. Certifications (Weight: 10%)
    const certCount = student.Certifications?.length || 0;
    const certRaw = Math.min(100, certCount * 35);
    const certScore = Math.round(certRaw);

    // 5. Algorithmic Coding Practice (LeetCode & CodeChef) (Weight: 15%)
    const leetcodeSolved = student.Coding_Activity?.leetcodeSolved ?? student.Coding_Activity?.problemsSolved ?? 0;
    const codechefSolved = student.Coding_Activity?.codechefSolved ?? 0;
    const totalSolved = leetcodeSolved + codechefSolved;
    const rating = student.Coding_Activity?.contestRating || 0;
    const codingRaw = totalSolved === 0
      ? 0
      : Math.min(100, (totalSolved / 350) * 75 + (rating > 1200 ? ((rating - 1200) / 600) * 25 : 0));
    const codingScore = Math.min(100, Math.round(codingRaw));

    // 6. Quantitative & Logical Aptitude (Weight: 10%)
    const aptitudeScore = student.Aptitude_Score ? Math.min(100, Math.max(0, student.Aptitude_Score)) : 0;

    // 7. Communication & Soft Skills (Weight: 10%)
    const commRaw = student.Communication_Score ? (student.Communication_Score / 10) * 100 : 0;
    const commScore = Math.min(100, Math.round(commRaw));

    // Dimensions
    const dimensions: DimensionScore[] = [
      {
        name: 'Academic Mastery',
        score: academicScore,
        weight: 0.20,
        weightedScore: Number((academicScore * 0.20).toFixed(1)),
        status: academicScore >= 80 ? 'excellent' : academicScore >= 65 ? 'good' : 'moderate',
        description: `CGPA ${student.CGPA.toFixed(2)}, ${student.Backlogs} active backlogs`
      },
      {
        name: 'Technical Competency',
        score: technicalScore,
        weight: 0.20,
        weightedScore: Number((technicalScore * 0.20).toFixed(1)),
        status: technicalScore >= 75 ? 'excellent' : technicalScore >= 50 ? 'good' : 'needs_improvement',
        description: `${student.Technical_Skills.length} validated core competencies`
      },
      {
        name: 'Hands-on Projects',
        score: projectScore,
        weight: 0.15,
        weightedScore: Number((projectScore * 0.15).toFixed(1)),
        status: projectScore >= 70 ? 'excellent' : projectScore >= 50 ? 'good' : 'needs_improvement',
        description: `${student.Projects.length} application & domain projects registered`
      },
      {
        name: 'Industry Certifications',
        score: certScore,
        weight: 0.10,
        weightedScore: Number((certScore * 0.10).toFixed(1)),
        status: certScore >= 60 ? 'good' : 'moderate',
        description: `${student.Certifications.length} credentials earned`
      },
      {
        name: 'Algorithmic Coding (DSA)',
        score: codingScore,
        weight: 0.15,
        weightedScore: Number((codingScore * 0.15).toFixed(1)),
        status: codingScore >= 70 ? 'excellent' : codingScore >= 45 ? 'good' : 'needs_improvement',
        description: `${totalSolved} solved (LeetCode: ${leetcodeSolved}, CodeChef: ${codechefSolved})`
      },
      {
        name: 'Aptitude & Soft Skills',
        score: Math.round((aptitudeScore + commScore) / 2),
        weight: 0.20,
        weightedScore: Number((((aptitudeScore + commScore) / 2) * 0.20).toFixed(1)),
        status: (aptitudeScore + commScore) / 2 >= 70 ? 'excellent' : (aptitudeScore + commScore) / 2 >= 45 ? 'good' : 'needs_improvement',
        description: `Aptitude: ${aptitudeScore}%, Soft Skills: ${student.Communication_Score || 0}/10`
      }
    ];

    const overallScore = Math.min(
      100,
      Math.round(dimensions.reduce((acc, dim) => acc + dim.weightedScore, 0))
    );

    let tier: ReadinessEvaluation['tier'] = 'Moderate Readiness';
    let tierColor = '#58BDB2';

    if (overallScore >= 80 && student.Backlogs === 0) {
      tier = 'High Placement Readiness';
      tierColor = '#2EA396';
    } else if (overallScore >= 65 && student.Backlogs === 0) {
      tier = 'Moderate Readiness';
      tierColor = '#3B82F6';
    } else if (student.Backlogs > 0) {
      tier = 'Critical Intervention';
      tierColor = '#EF4444';
    } else {
      tier = 'Early Stage';
      tierColor = '#F59E0B';
    }

    // Explainable AI (XAI) factors (SHAP / LIME conceptual emulation)
    const positiveFactors: XAIFactor[] = [];
    const negativeFactors: XAIFactor[] = [];

    if (student.CGPA >= 8.5) {
      positiveFactors.push({
        name: 'Strong Academic Baseline',
        impact: 'positive',
        contribution: +15.8,
        detail: `CGPA of ${student.CGPA.toFixed(2)} places candidate in top tier for recruiter shortlists.`,
        actionableAdvice: 'Maintain academic momentum; eligible for all Tier-1 product drive cutoffs.'
      });
    }

    if (totalSolved >= 300) {
      positiveFactors.push({
        name: 'Robust Problem Solving Track Record',
        impact: 'positive',
        contribution: +12.4,
        detail: `${totalSolved} DSA problems solved across platforms demonstrates interview algorithmic readiness.`,
        actionableAdvice: 'Focus on company-specific high-frequency question sets and mock timed rounds.'
      });
    }

    if (student.Projects.length >= 2) {
      positiveFactors.push({
        name: 'Applied Practical Experience',
        impact: 'positive',
        contribution: +10.2,
        detail: `${student.Projects.length} deployed software projects provide concrete discussion points for technical interviews.`,
        actionableAdvice: 'Prepare architectural deep-dives and trade-off explanations for resume reviews.'
      });
    }

    if (student.Certifications.length >= 1) {
      positiveFactors.push({
        name: 'Verified Industry Credentials',
        impact: 'positive',
        contribution: +7.5,
        detail: `${student.Certifications.length} external credentials (${student.Certifications[0]}) substantiate continuous learning.`,
        actionableAdvice: 'Highlight relevant cloud and engineering competencies on professional profiles.'
      });
    }

    // Negative / Gap factors
    if (student.Backlogs > 0) {
      negativeFactors.push({
        name: 'Active Backlog Clearance Required',
        impact: 'negative',
        contribution: -22.0,
        detail: `${student.Backlogs} active academic backlog automatically breaches corporate placement eligibility for most campus drives.`,
        actionableAdvice: 'Immediate priority: register for supplementary examination window and contact mentor.'
      });
    }

    if (totalSolved < 200) {
      negativeFactors.push({
        name: 'Moderate Algorithmic Volume',
        impact: 'negative',
        contribution: -9.5,
        detail: `Current problem count (${totalSolved}) is below the 250+ threshold favored by high-tier tech recruiters.`,
        actionableAdvice: 'Follow the algorithmic roadmap focusing on LeetCode & CodeChef problem patterns.'
      });
    }

    if (student.Internships.length === 0) {
      negativeFactors.push({
        name: 'No Formal Industry Internship Recorded',
        impact: 'negative',
        contribution: -6.0,
        detail: 'Candidate lacks corporate internship experience on their central profile.',
        actionableAdvice: 'Prioritize university open-source contributions or apply for pre-placement micro-internships.'
      });
    }

    return {
      overallScore,
      tier,
      tierColor,
      dimensions,
      positiveFactors,
      negativeFactors,
      explainabilitySummary: `Your readiness score of ${overallScore}% reflects your current academic performance, technical skills, projects, certifications, coding practice, aptitude, and communication strengths.`,
      modelConfidence: 0.88,
      isDemo: true
    };
  }

  /**
   * Recommend career paths matching student competencies
   */
  public getCareerPathRecommendations(student: StudentRecord): CareerPathRecommendation[] {
    const studentSkillsLower = student.Technical_Skills.map((s) => s.toLowerCase());

    const catalog: Array<{
      id: string;
      title: string;
      category: string;
      required: string[];
      salary: string;
      outlook: string;
      overview: string;
      employers: string[];
    }> = [
      {
        id: 'cp-fullstack',
        title: 'Full-Stack Software Engineer',
        category: 'Web & Distributed Systems',
        required: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs', 'Git'],
        salary: '₹8.5 - ₹16.0 LPA',
        outlook: 'Very High (+22% YoY Demand)',
        overview: 'Designs, develops, and maintains end-to-end web applications, modern microservices, and client experiences.',
        employers: ['Thoughtworks', 'Zomato', 'Atlassian', 'Infosys', 'Deloitte Digital']
      },
      {
        id: 'cp-ml-ds',
        title: 'Machine Learning / Data Scientist',
        category: 'Applied AI & Analytics',
        required: ['Python', 'SQL', 'Scikit-learn', 'PyTorch', 'Pandas', 'FastAPI', 'MLOps'],
        salary: '₹10.0 - ₹20.0 LPA',
        outlook: 'High Demand (+28% YoY)',
        overview: 'Develops predictive statistical models, machine learning pipelines, and integrates intelligent inference into enterprise systems.',
        employers: ['Amazon AWS', 'Fractal Analytics', 'Tiger Analytics', 'Mu Sigma', 'Microsoft']
      },
      {
        id: 'cp-cloud-devops',
        title: 'Cloud & DevOps Associate',
        category: 'Cloud Infrastructure',
        required: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'CI/CD Pipelines', 'Terraform', 'Python'],
        salary: '₹8.0 - ₹15.0 LPA',
        outlook: 'High Demand (+24% YoY)',
        overview: 'Automates deployment pipelines, ensures cloud resilience, and configures scalable infrastructure as code.',
        employers: ['Accenture Cloud', 'Cognizant', 'Wipro Digital', 'Persistent Systems', 'TCS']
      },
      {
        id: 'cp-backend-java',
        title: 'Enterprise Java / Backend Developer',
        category: 'Enterprise Software',
        required: ['Java', 'Spring Boot', 'MySQL', 'REST APIs', 'Microservices', 'Git'],
        salary: '₹7.5 - ₹14.0 LPA',
        outlook: 'Steady (+16% YoY)',
        overview: 'Builds enterprise-grade backend services, transactional systems, and high-throughput financial architectures.',
        employers: ['Oracle', 'Societe Generale', 'Morgan Stanley', 'Cognizant', 'Capgemini']
      },
      {
        id: 'cp-cybersec',
        title: 'Cybersecurity & SOC Analyst',
        category: 'Security & Posture',
        required: ['Network Security', 'Linux', 'Wireshark', 'Python Scripting', 'Docker', 'SIEM / Splunk'],
        salary: '₹8.0 - ₹15.5 LPA',
        outlook: 'Exponential (+32% YoY)',
        overview: 'Monitors corporate security operations, conducts vulnerability assessments, and defends cloud perimeter infrastructure.',
        employers: ['PwC Cyber', 'EY GDS', 'Quick Heal', 'Cisco Systems', 'Wipro']
      }
    ];

    return catalog.map((item) => {
      const matching = item.required.filter((req) =>
        studentSkillsLower.some((s) => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))
      );
      const missing = item.required.filter(
        (req) => !studentSkillsLower.some((s) => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))
      );

      const matchScore = Math.round((matching.length / item.required.length) * 100);

      return {
        id: item.id,
        title: item.title,
        category: item.category,
        matchScore,
        salaryRange: item.salary,
        growthOutlook: item.outlook,
        requiredSkills: item.required,
        studentMatchingSkills: matching,
        studentMissingSkills: missing,
        overview: item.overview,
        typicalEmployers: item.employers
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Diagnostic skill-gap breakdown for the student
   */
  public getSkillGaps(student: StudentRecord, targetRole?: string): SkillGapItem[] {
    const roleTitle = targetRole || student.Target_Role || 'Full-Stack Software Engineer';
    const paths = this.getCareerPathRecommendations(student);
    const selected = paths.find((p) => p.title.toLowerCase().includes(roleTitle.toLowerCase())) || paths[0];

    const missing = selected.studentMissingSkills;
    const matching = selected.studentMatchingSkills;

    const items: SkillGapItem[] = [];

    // Gaps (missing)
    missing.forEach((skill) => {
      items.push({
        skill,
        category: 'Technical',
        importance: 'High',
        currentProficiency: 'None',
        targetProficiency: 'Proficient',
        suggestedAction: `Complete 1 capstone project and 10 targeted exercises demonstrating ${skill}.`,
        estimatedWeeks: 3
      });
    });

    // Strengthen existing (matching)
    matching.slice(0, 3).forEach((skill) => {
      items.push({
        skill,
        category: 'Technical',
        importance: 'Medium',
        currentProficiency: 'Intermediate',
        targetProficiency: 'Advanced',
        suggestedAction: `Deepen interview problem solving and architecture patterns in ${skill}.`,
        estimatedWeeks: 2
      });
    });

    // Universal Soft skill diagnostic
    if (student.Communication_Score < 8.0) {
      items.push({
        skill: 'Technical Communication & Behavioral Rounds',
        category: 'Soft Skill',
        importance: 'High',
        currentProficiency: 'Intermediate',
        targetProficiency: 'Proficient',
        suggestedAction: 'Attend university placement mock group discussions and STAR-format interview sessions.',
        estimatedWeeks: 2
      });
    }

    return items;
  }

  /**
   * Personalized structured multi-week roadmap
   */
  public getPersonalizedRoadmap(student: StudentRecord): RoadmapMilestone[] {
    const gaps = this.getSkillGaps(student);
    const topMissing = gaps.filter((g) => g.currentProficiency === 'None').map((g) => g.skill);

    return [
      {
        id: 'mile-1',
        weekRange: 'Weeks 1 – 2',
        title: 'Core Algorithmic Foundations & Interview Warmup',
        description: 'Solidify High-Frequency Data Structures (Arrays, HashMaps, Two-Pointers, Recursion) and optimize code quality.',
        skillsCovered: ['Data Structures', 'Algorithmic Optimization', 'Complexity Analysis'],
        status: student.Coding_Activity.problemsSolved > 200 ? 'completed' : 'in_progress',
        actionItems: [
          { id: 'act-1-1', text: 'Solve 25 Medium problems on Blind 75 list', completed: student.Coding_Activity.problemsSolved > 150 },
          { id: 'act-1-2', text: 'Submit solutions in under 25 minutes per problem', completed: student.Coding_Activity.problemsSolved > 250 },
          { id: 'act-1-3', text: 'Review Space/Time Big-O complexity cheat sheet', completed: true }
        ]
      },
      {
        id: 'mile-2',
        weekRange: 'Weeks 3 – 4',
        title: `Target Skill Acquisition: ${topMissing.slice(0, 2).join(' & ') || 'Advanced Engineering Patterns'}`,
        description: 'Bridge the primary identified skill gaps through structured practical modules and small milestone builds.',
        skillsCovered: topMissing.length > 0 ? topMissing.slice(0, 3) : ['System Design', 'Microservices', 'Containerization'],
        status: 'in_progress',
        actionItems: [
          { id: 'act-2-1', text: `Complete hands-on tutorial on ${topMissing[0] || 'Modern Cloud Architecture'}`, completed: false },
          { id: 'act-2-2', text: 'Integrate into an existing repository or create proof-of-concept branch', completed: false },
          { id: 'act-2-3', text: 'Write technical documentation explaining design trade-offs', completed: false }
        ]
      },
      {
        id: 'mile-3',
        weekRange: 'Weeks 5 – 6',
        title: 'Full Portfolio Showcase & End-to-End Deployment',
        description: 'Refactor capstone projects with clean README, live deployment URL, CI/CD pipeline, and unit tests.',
        skillsCovered: ['Docker', 'CI/CD Pipelines', 'System Design', 'Git Workflow'],
        status: 'upcoming',
        actionItems: [
          { id: 'act-3-1', text: 'Deploy ARYA AI / capstone project to a live public cloud hosting service', completed: true },
          { id: 'act-3-2', text: 'Record a 2-minute Loom/video demonstration of project architecture', completed: false },
          { id: 'act-3-3', text: 'Ensure GitHub repository has informative badges and clear setup instructions', completed: false }
        ]
      },
      {
        id: 'mile-4',
        weekRange: 'Weeks 7 – 8',
        title: 'Mock Placement Drives, Behavioral Interviews & Recruiter Readiness',
        description: 'Participate in university mock placement drives, technical panel simulations, and resume polishing.',
        skillsCovered: ['STAR Methodology', 'System Design Interviews', 'Salary Negotiation', 'Resume Tailoring'],
        status: 'upcoming',
        actionItems: [
          { id: 'act-4-1', text: 'Complete 2 faculty/mentor mock interview evaluations', completed: false },
          { id: 'act-4-2', text: 'Verify profile data in T&P central portal with 0 pending discrepancies', completed: true },
          { id: 'act-4-3', text: 'Apply for eligible Tier-1 and Tier-2 placement drives', completed: false }
        ]
      }
    ];
  }
}

export const readinessService = new ReadinessService();
