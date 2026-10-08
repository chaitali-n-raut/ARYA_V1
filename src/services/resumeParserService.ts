import { ExtractedResumeData } from '../types';

const KNOWN_SKILLS = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Express', 'Python', 'Java', 'C++', 'C', 'C#',
  'Go', 'Rust', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS',
  'Azure', 'Google Cloud', 'Git', 'GitHub', 'CI/CD Pipelines', 'Tailwind CSS', 'HTML5', 'CSS3',
  'REST APIs', 'GraphQL', 'Next.js', 'Spring Boot', 'FastAPI', 'Django', 'Flask', 'Pandas',
  'NumPy', 'Scikit-learn', 'PyTorch', 'TensorFlow', 'SQL', 'Linux', 'Data Structures & Algorithms',
  'System Design', 'Microservices', 'Unit Testing', 'Jest', 'Cybersecurity', 'Wireshark'
];

const KNOWN_CERTIFICATIONS = [
  'AWS Certified Solutions Architect',
  'AWS Certified Cloud Practitioner',
  'Google Cloud Professional Data Engineer',
  'Google Cloud Associate Cloud Engineer',
  'Microsoft Certified: Azure Fundamentals',
  'DeepLearning.AI Machine Learning Specialization',
  'Meta Front-End Developer Specialization',
  'Oracle Certified Associate Java Programmer',
  'CompTIA Security+',
  'Cisco Certified Network Associate (CCNA)',
  'NPTEL Cloud Computing (Elite)',
  'Coursera Algorithmic Toolbox (UC San Diego)'
];

export class ResumeParserService {
  /**
   * Parse resume text into structured fields using heuristic extraction
   */
  public parseResumeText(text: string, originalFileName?: string): ExtractedResumeData {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

    // 1. Extract Email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : undefined;

    // 2. Extract Phone
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[\s-]?\d{10}|\b[6-9]\d{9}\b/);
    const phone = phoneMatch ? phoneMatch[0] : undefined;

    // 3. Extract Name (often first non-empty line or near email)
    let fullName: string | undefined = undefined;
    for (const line of lines.slice(0, 5)) {
      if (
        !line.includes('@') &&
        !line.includes('http') &&
        !line.match(/\d{5,}/) &&
        line.length > 3 &&
        line.length < 35 &&
        !line.toLowerCase().includes('resume') &&
        !line.toLowerCase().includes('curriculum')
      ) {
        fullName = line.replace(/[^a-zA-Z\s.]/g, '').trim();
        break;
      }
    }

    // 4. Extract CGPA / GPA
    let cgpa: number | undefined = undefined;
    const cgpaRegexes = [
      /CGPA[:\s]+([0-9]\.[0-9]{1,2})/i,
      /GPA[:\s]+([0-9]\.[0-9]{1,2})/i,
      /([0-9]\.[0-9]{1,2})\s*\/\s*10/i,
      /([0-9]\.[0-9]{1,2})\s*CGPA/i
    ];
    for (const rx of cgpaRegexes) {
      const match = text.match(rx);
      if (match && match[1]) {
        const val = parseFloat(match[1]);
        if (val >= 0 && val <= 10) {
          cgpa = val;
          break;
        }
      }
    }

    // 5. Extract Branch / Department
    let branch: string | undefined = undefined;
    if (text.match(/Computer Science|CSE/i)) {
      branch = 'Computer Science & Engineering';
    } else if (text.match(/Data Science|AI & DS|Artificial Intelligence/i)) {
      branch = 'Data Science & AI';
    } else if (text.match(/Information Technology|IT/i)) {
      branch = 'Information Technology';
    } else if (text.match(/Cybersecurity|Network/i)) {
      branch = 'Cybersecurity & Networks';
    }

    // 6. Extract Technical Skills
    const textLower = text.toLowerCase();
    const technicalSkills: string[] = [];
    KNOWN_SKILLS.forEach((skill) => {
      const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (pattern.test(text)) {
        if (!technicalSkills.includes(skill)) {
          technicalSkills.push(skill);
        }
      }
    });

    // 7. Extract Certifications
    const certifications: string[] = [];
    KNOWN_CERTIFICATIONS.forEach((cert) => {
      if (text.toLowerCase().includes(cert.toLowerCase())) {
        certifications.push(cert);
      }
    });
    // Fallback: look for "Certified" or "Specialization" mentions
    lines.forEach((line) => {
      if (
        (line.toLowerCase().includes('certified') || line.toLowerCase().includes('certificate') || line.toLowerCase().includes('specialization')) &&
        line.length < 80 &&
        !certifications.some((c) => line.includes(c))
      ) {
        const clean = line.replace(/^[•\-\*]\s*/, '').trim();
        if (clean.length > 5 && certifications.length < 4) {
          certifications.push(clean);
        }
      }
    });

    // 8. Extract Projects
    const projects: string[] = [];
    let inProjectSection = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineUpper = line.toUpperCase();

      if (lineUpper.includes('PROJECT') || lineUpper.includes('ACADEMIC WORK')) {
        inProjectSection = true;
        continue;
      }
      if (inProjectSection && (lineUpper.includes('EXPERIENCE') || lineUpper.includes('EDUCATION') || lineUpper.includes('SKILLS') || lineUpper.includes('CERTIFICATION'))) {
        inProjectSection = false;
        break;
      }

      if (inProjectSection) {
        if (
          (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || (line.includes('|') && line.length < 75)) &&
          line.length > 15
        ) {
          const cleanProject = line.replace(/^[•\-\*]\s*/, '').trim();
          if (projects.length < 4 && !projects.includes(cleanProject)) {
            projects.push(cleanProject);
          }
        }
      }
    }

    // 9. Extract Internships / Experience
    const internships: string[] = [];
    let inExpSection = false;
    for (const line of lines) {
      const lineUpper = line.toUpperCase();
      if (lineUpper.includes('EXPERIENCE') || lineUpper.includes('INTERNSHIP') || lineUpper.includes('WORK HISTORY')) {
        inExpSection = true;
        continue;
      }
      if (inExpSection && (lineUpper.includes('PROJECT') || lineUpper.includes('EDUCATION') || lineUpper.includes('SKILLS'))) {
        inExpSection = false;
        break;
      }
      if (inExpSection && (line.toLowerCase().includes('intern') || line.toLowerCase().includes('developer') || line.toLowerCase().includes('trainee') || line.toLowerCase().includes('engineer'))) {
        const clean = line.replace(/^[•\-\*]\s*/, '').trim();
        if (clean.length > 8 && internships.length < 4) {
          internships.push(clean);
        }
      }
    }

    // 10. Coding Activity Profiles extraction (LeetCode, CodeChef, HackerRank)
    let leetcodeSolved = 0;
    let leetcodeRating = 0;
    let codechefSolved = 0;
    let codechefRating = 0;

    // Leetcode extraction
    const lcSolvedMatch = text.match(/LeetCode[:\s\-\–]+(?:Solved\s*)?([0-9]{1,4})/i) ||
      text.match(/([0-9]{1,4})\+?\s*(?:problems|questions)?\s*(?:solved\s*)?on\s*LeetCode/i);
    if (lcSolvedMatch && lcSolvedMatch[1]) {
      leetcodeSolved = parseInt(lcSolvedMatch[1], 10) || 0;
    }

    const lcRatingMatch = text.match(/LeetCode[:\s\w\(\)]*Rating[:\s]+([0-9]{3,4})/i);
    if (lcRatingMatch && lcRatingMatch[1]) {
      leetcodeRating = parseInt(lcRatingMatch[1], 10) || 0;
    }

    // CodeChef extraction
    const ccSolvedMatch = text.match(/CodeChef[:\s\-\–]+(?:Solved\s*)?([0-9]{1,4})/i) ||
      text.match(/([0-9]{1,4})\+?\s*(?:problems|questions)?\s*(?:solved\s*)?on\s*CodeChef/i);
    if (ccSolvedMatch && ccSolvedMatch[1]) {
      codechefSolved = parseInt(ccSolvedMatch[1], 10) || 0;
    }

    const ccRatingMatch = text.match(/CodeChef[:\s\w\(\)]*Rating[:\s]+([0-9]{3,4})/i) ||
      text.match(/CodeChef[:\s]+([0-9]\s*★|star)/i);
    if (ccRatingMatch && ccRatingMatch[1]) {
      codechefRating = parseInt(ccRatingMatch[1].replace(/\D/g, ''), 10) || 0;
    }

    // General fallback for problems solved if not specifically tagged
    let generalSolved = leetcodeSolved + codechefSolved;
    if (generalSolved === 0) {
      const genSolvedMatch = text.match(/([0-9]{2,4})\+?\s*(?:problems|questions|dsa problems)\s*solved/i);
      if (genSolvedMatch && genSolvedMatch[1]) {
        generalSolved = parseInt(genSolvedMatch[1], 10) || 0;
        leetcodeSolved = generalSolved;
      }
    }

    // 11. Aptitude Score extraction
    let aptitudeScore = 0;
    const aptMatch = text.match(/Aptitude[:\s]+([0-9]{1,3})%?/i) ||
      text.match(/Aptitude\s*(?:Score|Test)[:\s]+([0-9]{1,3})/i);
    if (aptMatch && aptMatch[1]) {
      aptitudeScore = Math.min(100, parseInt(aptMatch[1], 10) || 0);
    }

    // 12. Soft Skills / Communication Score extraction
    let communicationScore = 0;
    const commMatch = text.match(/Communication[:\s]+([0-9]\.?[0-9]?)\s*\/\s*10/i) ||
      text.match(/Soft\s*Skills[:\s]+([0-9]\.?[0-9]?)\s*\/\s*10/i);
    if (commMatch && commMatch[1]) {
      communicationScore = parseFloat(commMatch[1]) || 0;
    }

    return {
      fullName,
      email,
      phone,
      cgpa: cgpa || 0,
      branch: branch || '',
      technicalSkills,
      certifications,
      projects,
      internships,
      codingProfiles: {
        platform: text.toLowerCase().includes('codechef') ? 'CodeChef' : 'LeetCode',
        problemsSolved: generalSolved,
        contestRating: leetcodeRating || codechefRating || 0,
        leetcodeSolved,
        leetcodeRating,
        codechefSolved,
        codechefRating
      },
      aptitudeScore,
      communicationScore,
      targetRole: technicalSkills.includes('Python') && technicalSkills.includes('SQL')
        ? 'Data Science & AI'
        : technicalSkills.length > 0
        ? 'Software Engineer'
        : '',
      bio: fullName
        ? `${fullName} is an undergraduate student in ${branch || 'Technology'} with proficiencies in ${technicalSkills.slice(0, 4).join(', ')}.`
        : ''
    };
  }

  /**
   * Generates a standard resume template text for formatting reference
   */
  public getSampleResumeText(): string {
    return `ENGINEERING CANDIDATE
Email: student.candidate@university.edu | Phone: +91 99887 76655
Location: University Campus | GitHub: github.com/student-dev

EDUCATION
Bachelor of Technology in Computer Science & Engineering
School of Computing & IT
Graduation: May 2026 | CGPA: 8.50 / 10.0 | Attendance: 90%

TECHNICAL SKILLS
Languages: Java, Python, TypeScript, JavaScript, SQL, C++
Frameworks & Libraries: React, Node.js, Spring Boot, FastAPI, Tailwind CSS
Databases & Cloud: PostgreSQL, MongoDB, Docker, AWS, Git, CI/CD
Core Competencies: Data Structures & Algorithms, System Design, REST APIs

PROJECTS
• Real-Time Transit Tracking Dashboard (React, Node.js, PostgreSQL, Docker)
  Architected real-time tracking dashboard with sub-second updates and responsive UI.
• Distributed Key-Value Storage Engine (Java, Multithreading, Socket Programming)
  Implemented distributed cache replication with LRU eviction policy.
• Automated Document Entity Extractor (Python, FastAPI, Scikit-learn)
  Built machine learning pipeline parsing unstructured text files into normalized schemas.

INTERNSHIPS & WORK EXPERIENCE
• Software Engineering Intern @ Tech Solutions (Summer 2025)
  Developed microservices, reduced database query latency, and wrote integration tests.

CERTIFICATIONS
• AWS Certified Solutions Architect Associate (Amazon Web Services)
• Oracle Certified Associate Java Programmer (Oracle Corporation)

CODING & PROBLEM SOLVING
• LeetCode: Solved 250+ algorithmic problems (Rating: 1650)
• CodeChef: Solved 120+ problems (Rating: 1580)
• Aptitude Test Score: 85%
• Communication / Soft Skills: 8.5 / 10`;
  }
}

export const resumeParserService = new ResumeParserService();
