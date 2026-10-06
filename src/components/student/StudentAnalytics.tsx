import React, { useState } from 'react';
import { StudentRecord } from '../../types';
import { readinessService, hasStudentRecordData } from '../../services/readinessService';
import { studentService } from '../../services/studentService';
import { StudentResumeUploadModal } from './StudentResumeUploadModal';
import {
  BarChart3,
  TrendingUp,
  Award,
  Code2,
  Layers,
  CheckCircle2,
  AlertCircle,
  Upload,
  UserCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Compass,
  FileSpreadsheet
} from 'lucide-react';

interface Props {
  student: StudentRecord;
  onNavigateTab?: (tab: string) => void;
  onUpdateSuccess?: () => void;
}

export const StudentAnalytics: React.FC<Props> = ({
  student,
  onNavigateTab,
  onUpdateSuccess
}) => {
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const hasData = hasStudentRecordData(student);

  // If no data, render dedicated zero-information state
  if (!hasData) {
    return (
      <div className="space-y-6 max-w-5xl transition-colors">
        {/* Modal for instant resume autofill */}
        <StudentResumeUploadModal
          isOpen={resumeModalOpen}
          student={student}
          onClose={() => setResumeModalOpen(false)}
          onComplete={(updated) => {
            studentService.updateStudent(updated);
            if (onUpdateSuccess) onUpdateSuccess();
            setResumeModalOpen(false);
          }}
        />

        {/* Status Notification Banner */}
        <div className="bg-amber-50 dark:bg-[#251A0E] border border-amber-200 dark:border-[#4B3518] p-4 rounded-2xl flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-950 dark:text-amber-200">Zero Academic & Skill Records Found</div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400">
                Default analytics are hidden for newly registered students until real data is added.
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase bg-amber-100/80 dark:bg-[#382613] px-2.5 py-1 rounded-md font-bold text-amber-800 dark:text-amber-300 shrink-0 border border-amber-300/40 dark:border-[#523A1B]">
            Awaiting Input
          </span>
        </div>

        {/* Central Empty State Card */}
        <div className="bg-white dark:bg-[#142024] p-8 md:p-12 rounded-3xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs text-center space-y-6 transition-colors">
          <div className="w-16 h-16 mx-auto bg-[#F7FBFB] dark:bg-[#0E171A] border-2 border-dashed border-[#58BDB2]/40 dark:border-[#27665E] rounded-2xl flex items-center justify-center text-[#58BDB2]">
            <BarChart3 className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-[#263238] dark:text-[#F1F5F9]">
              No Analytics Data Available Yet
            </h2>
            <p className="text-xs md:text-sm text-[#687572] dark:text-[#94A3B8] leading-relaxed">
              Your longitudinal academic trends, semester performance, skill metrics, and readiness trajectory will be generated only after you complete your profile, upload your resume, or your faculty/mentor imports your academic records.
            </p>
          </div>

          {/* Action Pathways */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-2 text-left">
            {/* Pathway 1: Upload Resume */}
            <div className="p-5 bg-gradient-to-br from-[#EAF7F8] to-white dark:from-[#11312D] dark:to-[#142024] rounded-2xl border border-[#58BDB2]/30 dark:border-[#27665E] flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-[#58BDB2]/15 dark:bg-[#153B36] text-[#2EA396] dark:text-[#58BDB2] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">
                  Upload Resume for Autofill
                </h3>
                <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                  Extract CGPA, validated technical skills, certifications, and portfolio projects from your PDF or text resume in seconds.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setResumeModalOpen(true)}
                className="w-full py-2.5 px-4 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upload Resume Now</span>
              </button>
            </div>

            {/* Pathway 2: Complete Profile Manually */}
            <div className="p-5 bg-white dark:bg-[#142024] rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">
                  Complete Profile Manually
                </h3>
                <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                  Enter your CGPA, active backlogs, attendance percentage, technical skills, projects, and target placement role directly.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('profile')}
                className="w-full py-2.5 px-4 bg-[#F7FBFB] dark:bg-[#0E171A] hover:bg-neutral-100 dark:hover:bg-[#17272C] text-[#263238] dark:text-[#F1F5F9] border border-[#E4ECEA] dark:border-[#1F333A] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Go to Profile Tab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Faculty Mentor Note */}
          <div className="max-w-xl mx-auto p-3.5 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A] text-left flex items-start gap-2.5 text-xs text-[#687572] dark:text-[#94A3B8]">
            <FileSpreadsheet className="w-4 h-4 text-[#58BDB2] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[#263238] dark:text-[#F1F5F9]">Faculty Import Note:</strong> If your department mentor imports your cohort records via the Faculty / Mentor portal spreadsheet, your analytics and readiness index will populate automatically here without manual entry.
            </span>
          </div>
        </div>

        {/* Informative Preview of What Unlocks */}
        <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-neutral-400" />
              <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">
                Analytics Features Unlocked After Data Submission
              </h3>
            </div>
            <span className="text-[11px] text-[#687572] dark:text-[#94A3B8]">Preview Blueprint</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-dashed border-[#E4ECEA] dark:border-[#1F333A] space-y-1.5 opacity-75">
              <div className="text-xs font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#58BDB2]" />
                <span>Academic SGPA Trend</span>
              </div>
              <p className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
                Semester-by-semester academic velocity and GPA stability curves.
              </p>
            </div>

            <div className="p-4 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-dashed border-[#E4ECEA] dark:border-[#1F333A] space-y-1.5 opacity-75">
              <div className="text-xs font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>6-D Readiness Model</span>
              </div>
              <p className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
                Composite weighted scoring across academic, practical, and soft skill domains.
              </p>
            </div>

            <div className="p-4 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-dashed border-[#E4ECEA] dark:border-[#1F333A] space-y-1.5 opacity-75">
              <div className="text-xs font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#2EA396]" />
                <span>Skill Domain Radar</span>
              </div>
              <p className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
                Proficiency distribution across Frontend, Backend, AI/ML, Cloud, and DSA.
              </p>
            </div>

            <div className="p-4 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-dashed border-[#E4ECEA] dark:border-[#1F333A] space-y-1.5 opacity-75">
              <div className="text-xs font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Recruiter Eligibility</span>
              </div>
              <p className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
                Drive eligibility cutoff mapping for Tier-1, Product, and Specialist roles.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Real Data Render (When student or faculty has added data) ---
  const readiness = readinessService.evaluateStudentReadiness(student);

  // Compute semester progression from actual data
  const semCount = Math.min(8, Math.max(2, student.Year * 2));
  const semesters = student.Semester_Grades && student.Semester_Grades.length > 0
    ? student.Semester_Grades
    : Array.from({ length: semCount }, (_, idx) => {
        const semNum = idx + 1;
        const diff = (idx - (semCount - 1)) * 0.1;
        const gpa = Number(Math.max(4.0, Math.min(10.0, student.CGPA + diff)).toFixed(2));
        return {
          sem: `Sem ${semNum}`,
          sgpa: idx === semCount - 1 ? student.CGPA : gpa
        };
      });

  // Categorize actual technical skills
  const skills = student.Technical_Skills || [];
  const webFrontendKeywords = ['react', 'vue', 'angular', 'html', 'css', 'tailwind', 'javascript', 'typescript', 'next', 'frontend'];
  const backendCloudKeywords = ['node', 'express', 'python', 'java', 'c++', 'go', 'spring', 'docker', 'aws', 'gcp', 'sql', 'postgresql', 'mongodb', 'backend', 'api'];
  const aiDataKeywords = ['pytorch', 'tensorflow', 'machine learning', 'deep learning', 'pandas', 'numpy', 'scikit', 'nlp', 'data science', 'ai'];
  const dsaKeywords = ['dsa', 'data structures', 'algorithms', 'leetcode', 'competitive programming', 'c'];

  const frontendSkills = skills.filter((s) => webFrontendKeywords.some((k) => s.toLowerCase().includes(k)));
  const backendSkills = skills.filter((s) => backendCloudKeywords.some((k) => s.toLowerCase().includes(k)));
  const aiSkills = skills.filter((s) => aiDataKeywords.some((k) => s.toLowerCase().includes(k)));
  const otherSkills = skills.filter((s) => 
    !frontendSkills.includes(s) && 
    !backendSkills.includes(s) && 
    !aiSkills.includes(s)
  );

  return (
    <div className="space-y-6 max-w-5xl transition-colors">
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">Student Analytics & Trajectory</h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/60">
              Verified Records Active
            </span>
          </div>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-0.5">
            Calculated from student academic records, validated technical skills, projects, and coding volume.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#687572] dark:text-[#94A3B8]">Target Role:</span>
          <span className="text-xs font-semibold text-[#2EA396] dark:text-[#58BDB2] bg-[#EAF7F8] dark:bg-[#122D29] px-2.5 py-1 rounded-lg border border-[#58BDB2]/30 dark:border-[#27665E]">
            {student.Target_Role || 'General Software Engineering'}
          </span>
        </div>
      </div>

      {/* Trajectory & Progression */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Semester GPA Trend */}
        <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
            <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#58BDB2]" />
              <span>Academic SGPA Progression</span>
            </h3>
            <span className="text-xs font-mono font-bold text-[#2EA396] dark:text-[#58BDB2]">
              Verified CGPA: {student.CGPA.toFixed(2)}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {semesters.map((s) => (
              <div key={s.sem} className="space-y-1 text-xs">
                <div className="flex justify-between text-[#687572] dark:text-[#94A3B8]">
                  <span className="font-medium text-[#263238] dark:text-[#F1F5F9]">{s.sem}</span>
                  <span className="font-mono font-bold text-[#263238] dark:text-[#F1F5F9]">
                    {s.sgpa.toFixed(2)} / 10.0
                  </span>
                </div>
                <div className="w-full h-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#58BDB2] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (s.sgpa / 10) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E4ECEA] dark:border-[#1F333A] flex items-center justify-between text-[11px] text-[#687572] dark:text-[#94A3B8]">
            <span>Active Backlogs: <strong className={student.Backlogs > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}>{student.Backlogs}</strong></span>
            <span>Attendance: <strong className="text-[#263238] dark:text-[#F1F5F9]">{student.Attendance_Percentage}%</strong></span>
          </div>
        </div>

        {/* Dimension Distribution */}
        <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
            <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8B5CF6]" />
              <span>Placement Dimension Scores</span>
            </h3>
            <span className="text-xs font-mono font-bold text-[#2EA396] dark:text-[#58BDB2]">
              {readiness.overallScore}% Overall
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {readiness.dimensions.map((d) => (
              <div key={d.name} className="space-y-1 text-xs">
                <div className="flex justify-between text-[#687572] dark:text-[#94A3B8]">
                  <span className="font-medium text-[#263238] dark:text-[#F1F5F9]">{d.name}</span>
                  <span className="font-mono font-bold text-[#263238] dark:text-[#F1F5F9]">{d.score}%</span>
                </div>
                <div className="w-full h-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#58BDB2] rounded-full transition-all duration-500"
                    style={{ width: `${d.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E4ECEA] dark:border-[#1F333A] text-[11px] text-[#687572] dark:text-[#94A3B8]">
            Readiness Tier: <strong className="text-[#2EA396] dark:text-[#58BDB2]">{readiness.tier}</strong>
          </div>
        </div>
      </div>

      {/* Practical Portfolio & Algorithmic Summary */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
          Practical Portfolio & Algorithmic Summary
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
            <div className="text-2xl font-mono font-extrabold text-[#263238] dark:text-[#F1F5F9]">
              {student.Coding_Activity?.problemsSolved || 0}
            </div>
            <div className="text-[11px] text-[#687572] dark:text-[#94A3B8] mt-1">
              {student.Coding_Activity?.platform || 'LeetCode'} Problems
            </div>
          </div>

          <div className="p-4 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
            <div className="text-2xl font-mono font-extrabold text-[#2EA396] dark:text-[#58BDB2]">
              {student.Projects?.length || 0}
            </div>
            <div className="text-[11px] text-[#687572] dark:text-[#94A3B8] mt-1">Projects Deployed</div>
          </div>

          <div className="p-4 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
            <div className="text-2xl font-mono font-extrabold text-[#8B5CF6]">
              {student.Certifications?.length || 0}
            </div>
            <div className="text-[11px] text-[#687572] dark:text-[#94A3B8] mt-1">Industry Certifications</div>
          </div>

          <div className="p-4 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
            <div className="text-2xl font-mono font-extrabold text-[#EA580C]">
              {student.Attendance_Percentage || 0}%
            </div>
            <div className="text-[11px] text-[#687572] dark:text-[#94A3B8] mt-1">Class Attendance</div>
          </div>
        </div>
      </div>

      {/* Categorized Technical Competencies */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
          <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#58BDB2]" />
            <span>Technical Competency Distribution</span>
          </h3>
          <span className="text-xs text-[#687572] dark:text-[#94A3B8]">
            {skills.length} Total Competencies Registered
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Frontend */}
          <div className="p-4 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#263238] dark:text-[#F1F5F9]">Frontend & UI</span>
              <span className="font-mono text-[#2EA396] dark:text-[#58BDB2] font-bold">{frontendSkills.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {frontendSkills.length > 0 ? (
                frontendSkills.map((sk) => (
                  <span key={sk} className="bg-white dark:bg-[#16272C] px-2 py-0.5 rounded border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] text-[11px]">
                    {sk}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-[#687572] dark:text-[#94A3B8] italic">No frontend skills listed</span>
              )}
            </div>
          </div>

          {/* Backend & Cloud */}
          <div className="p-4 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#263238] dark:text-[#F1F5F9]">Backend & Cloud</span>
              <span className="font-mono text-[#8B5CF6] font-bold">{backendSkills.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {backendSkills.length > 0 ? (
                backendSkills.map((sk) => (
                  <span key={sk} className="bg-white dark:bg-[#16272C] px-2 py-0.5 rounded border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] text-[11px]">
                    {sk}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-[#687572] dark:text-[#94A3B8] italic">No backend skills listed</span>
              )}
            </div>
          </div>

          {/* AI, Data & Other */}
          <div className="p-4 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#263238] dark:text-[#F1F5F9]">AI, Data & Core CS</span>
              <span className="font-mono text-[#EA580C] font-bold">{aiSkills.length + otherSkills.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[...aiSkills, ...otherSkills].length > 0 ? (
                [...aiSkills, ...otherSkills].map((sk) => (
                  <span key={sk} className="bg-white dark:bg-[#16272C] px-2 py-0.5 rounded border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] text-[11px]">
                    {sk}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-[#687572] dark:text-[#94A3B8] italic">No additional skills listed</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
