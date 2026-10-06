import React, { useState } from 'react';
import { StudentRecord } from '../../types';
import { readinessService } from '../../services/readinessService';
import { placementService } from '../../services/placementService';
import { StudentResumeUploadModal } from './StudentResumeUploadModal';
import {
  TrendingUp,
  Target,
  Compass,
  Milestone,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  Code2,
  Upload,
  FileText,
  Lock
} from 'lucide-react';

interface Props {
  student: StudentRecord;
  onNavigateTab: (tab: string) => void;
  onUpdateStudent?: (updated: StudentRecord) => void;
}

export const StudentDashboard: React.FC<Props> = ({ student, onNavigateTab, onUpdateStudent }) => {
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  const readiness = readinessService.evaluateStudentReadiness(student);
  const careerPaths = readinessService.getCareerPathRecommendations(student);
  const gaps = readinessService.getSkillGaps(student);
  const drives = placementService.getAllDrives().slice(0, 3);
  const roadmap = readinessService.getPersonalizedRoadmap(student);

  // Check if profile is raw/incomplete
  const isProfileRaw =
    !student.isProfileCompleted && (student.CGPA === 0 || student.Technical_Skills.length === 0);

  // Profile completion calculation
  let completedFields = 0;
  const totalFields = 8;
  if (student.CGPA > 0) completedFields++;
  if (student.Technical_Skills?.length >= 3) completedFields++;
  if (student.Projects?.length >= 1) completedFields++;
  if (student.Certifications?.length >= 1) completedFields++;
  if ((student.Coding_Activity?.leetcodeSolved || 0) + (student.Coding_Activity?.codechefSolved || 0) > 0) completedFields++;
  if (student.Internships?.length >= 1) completedFields++;
  if (student.Communication_Score > 0) completedFields++;
  if (student.Target_Role) completedFields++;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  const handleResumeComplete = (updated: StudentRecord) => {
    if (onUpdateStudent) {
      onUpdateStudent(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Card */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">
              Welcome, {student.Full_Name}!
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#EAF7F8] dark:bg-[#153430] text-[#2EA396] dark:text-[#58BDB2] font-semibold border border-[#58BDB2]/20 dark:border-[#27665E]">
              {student.Student_ID}
            </span>
            {isProfileRaw ? (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
                Action Required
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                Profile Verified
              </span>
            )}
          </div>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8]">
            {student.Department} · {student.Branch} · Semester {student.Year * 2}
          </p>
        </div>

        {/* Profile Completion Widget */}
        <div className="w-full md:w-auto flex items-center gap-3 bg-[#F7FBFB] dark:bg-[#0D1518] p-3 rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
          <div className="text-right">
            <div className="text-xs font-semibold text-[#263238] dark:text-[#F1F5F9]">Profile Completion</div>
            <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">{completionPercentage}% Completed</div>
          </div>
          <div className="w-12 h-12 relative flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="currentColor"
                className="text-[#E4ECEA] dark:text-[#203238]"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="#58BDB2"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 18}
                strokeDashoffset={2 * Math.PI * 18 * (1 - completionPercentage / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-[#263238] dark:text-[#F1F5F9]">
              {completionPercentage}%
            </span>
          </div>

          <button
            onClick={() => setResumeModalOpen(true)}
            className="px-3 py-1.5 bg-[#58BDB2] text-white rounded-lg text-xs font-semibold hover:bg-[#48a99f] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Resume</span>
          </button>
        </div>
      </div>

      {/* ---------------- RAW STATE / PROFILE INCOMPLETE ONBOARDING BANNER ---------------- */}
      {isProfileRaw && (
        <div className="bg-gradient-to-r from-[#EAF7F8] via-white to-[#DDF5F0]/60 dark:from-[#11312D] dark:via-[#142226] dark:to-[#0F1E22] p-6 md:p-8 rounded-3xl border border-[#58BDB2]/40 dark:border-[#27665E] shadow-xs space-y-4 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#16272C] text-[#2EA396] dark:text-[#58BDB2] font-bold text-xs border border-[#58BDB2]/30 dark:border-[#27665E] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Raw Profile Detected · Step 1 of 2</span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-[#263238] dark:text-[#F1F5F9]">
                Upload Your Resume to Auto-Fill & Unlock Placement Readiness
              </h2>
              <p className="text-xs sm:text-sm text-[#687572] dark:text-[#94A3B8] max-w-2xl leading-relaxed">
                Your profile is currently raw. ARYA AI extracts your verified technical skills, project repositories, certifications, and academic performance from your resume to calculate your explainable readiness score and recommend placement drives.
              </p>
            </div>

            <div className="hidden lg:block shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#16272C] border border-[#58BDB2]/30 dark:border-[#27665E] flex items-center justify-center shadow-xs">
                <FileText className="w-8 h-8 text-[#58BDB2]" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setResumeModalOpen(true)}
              className="px-5 py-3 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Resume & Extract Attributes</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab('profile')}
              className="px-4 py-3 bg-white dark:bg-[#142024] text-[#263238] dark:text-[#F1F5F9] border border-[#E4ECEA] dark:border-[#1F333A] rounded-xl text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-[#1B2B30] transition-colors cursor-pointer"
            >
              Update Profile Manually
            </button>
          </div>
        </div>
      )}

      {/* Main Readiness & Priority Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Readiness Highlight Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#EAF7F8] via-white to-[#DDF5F0]/30 dark:bg-gradient-to-br dark:from-[#133330] dark:via-[#142024] dark:to-[#0F1D21] p-6 rounded-2xl border border-[#58BDB2]/30 dark:border-[#27665E] shadow-xs space-y-5 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2EA396] dark:text-[#58BDB2] uppercase tracking-wider">
              Placement Readiness AI
            </span>
            <span className="text-[10px] bg-white dark:bg-[#0D1518] px-2 py-0.5 rounded-full border border-[#58BDB2]/30 dark:border-[#27665E] text-[#687572] dark:text-[#94A3B8]">
              {isProfileRaw ? 'Awaiting Profile' : 'Verified Profile'}
            </span>
          </div>

          {isProfileRaw ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800/60">
                <Lock className="w-6 h-6" />
              </div>
              <div className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">Readiness Engine Locked</div>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8] max-w-xs mx-auto">
                Upload your resume or add your skills in the profile tab to calculate your readiness score and explainability factors.
              </p>
              <button
                onClick={() => setResumeModalOpen(true)}
                className="px-4 py-2 bg-[#58BDB2] text-white rounded-xl text-xs font-semibold hover:bg-[#48a99f] transition-colors cursor-pointer"
              >
                Upload Resume Now
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-3">
                <div className="text-5xl font-extrabold text-[#263238] dark:text-[#F1F5F9] tracking-tight">
                  {readiness.overallScore}
                  <span className="text-xl text-[#687572] dark:text-[#94A3B8] font-normal">/100</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#2EA396] dark:text-[#58BDB2]">{readiness.tier}</div>
                  <div className="text-xs text-[#687572] dark:text-[#94A3B8]">Model Confidence: 88%</div>
                </div>
              </div>

              {/* Quick dimension preview */}
              <div className="space-y-2 pt-2 border-t border-[#58BDB2]/20 dark:border-[#27665E]">
                {readiness.dimensions.slice(0, 3).map((dim) => (
                  <div key={dim.name} className="text-xs">
                    <div className="flex justify-between text-[#263238] dark:text-[#F1F5F9] mb-1 font-medium">
                      <span>{dim.name}</span>
                      <span className="font-mono">{dim.score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white dark:bg-[#0D1518] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#58BDB2] rounded-full"
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed pt-1">
                {readiness.explainabilitySummary}
              </p>

              <button
                onClick={() => onNavigateTab('readiness')}
                className="w-full py-2.5 px-4 bg-[#58BDB2] text-white rounded-xl text-xs font-semibold hover:bg-[#48a99f] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Explore Full XAI Factor Breakdown</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Right Col: Priority Next Steps & Agentic Recommendations (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#58BDB2]" />
              <span>Priority Action Items for Campus Placement</span>
            </h3>
            <span className="text-xs text-[#687572] dark:text-[#94A3B8]">
              Target: {student.Target_Role || 'Software Engineer'}
            </span>
          </div>

          <div className="space-y-3">
            {isProfileRaw && (
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-amber-900 dark:text-amber-200">Step 1: Ingest Resume or Complete Profile</div>
                  <div className="text-amber-800 dark:text-amber-300">
                    Add at least 3 technical skills and 1 project deliverable to unlock role matching and campus placement drives.
                  </div>
                </div>
              </div>
            )}

            {student.Backlogs > 0 && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-red-900 dark:text-red-200">Urgent: Clear Active Academic Backlog</div>
                  <div className="text-red-700 dark:text-red-300">
                    You have {student.Backlogs} active backlog. Most Tier-1 recruiters enforce 0 active backlogs cutoff.
                  </div>
                </div>
              </div>
            )}

            {!isProfileRaw &&
              readiness.negativeFactors.slice(0, 2).map((factor, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#F7FBFB] dark:bg-[#0D1518] border border-[#E4ECEA] dark:border-[#1F333A] flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#263238] dark:text-[#F1F5F9]">{factor.name}</div>
                    <div className="text-xs text-[#687572] dark:text-[#94A3B8]">{factor.actionableAdvice}</div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60 shrink-0">
                    {factor.contribution}%
                  </span>
                </div>
              ))}

            {/* Quick Roadmap Milestone Preview */}
            <div className="p-3.5 rounded-xl bg-[#EAF7F8]/60 dark:bg-[#133033]/60 border border-[#58BDB2]/30 dark:border-[#27665E] flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#263238] dark:text-[#F1F5F9]">Active Roadmap: {roadmap[0]?.title}</div>
                <div className="text-xs text-[#687572] dark:text-[#94A3B8]">
                  {roadmap[0]?.actionItems.filter((a) => a.completed).length} of {roadmap[0]?.actionItems.length} tasks completed
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('roadmap')}
                className="px-3 py-1.5 bg-white dark:bg-[#142024] text-[#2EA396] dark:text-[#58BDB2] border border-[#58BDB2]/30 dark:border-[#27665E] rounded-lg text-xs font-semibold hover:bg-[#EAF7F8] dark:hover:bg-[#1B3237] transition-colors cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Skills to Strengthen + Top Matched Roles + Drives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Box 1: Skills to Strengthen */}
        <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#58BDB2]" />
              <span>Identified Skill Gaps</span>
            </h4>
            <button
              onClick={() => onNavigateTab('skillgap')}
              className="text-[11px] text-[#58BDB2] font-semibold hover:underline cursor-pointer"
            >
              Analyze
            </button>
          </div>

          <div className="space-y-2">
            {gaps.slice(0, 3).map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-[#F7FBFB] dark:bg-[#0D1518] border border-[#E4ECEA] dark:border-[#1F333A] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#263238] dark:text-[#F1F5F9]">{item.skill}</span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded font-medium">
                    {item.importance} Priority
                  </span>
                </div>
                <p className="text-[11px] text-[#687572] dark:text-[#94A3B8] leading-snug">{item.suggestedAction}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Box 2: Recommended Career Paths */}
        <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Recommended Paths</span>
            </h4>
            <button
              onClick={() => onNavigateTab('careerpaths')}
              className="text-[11px] text-[#58BDB2] font-semibold hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {careerPaths.slice(0, 3).map((path) => (
              <div key={path.id} className="p-2.5 rounded-xl bg-[#F7FBFB] dark:bg-[#0D1518] border border-[#E4ECEA] dark:border-[#1F333A] text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#263238] dark:text-[#F1F5F9] truncate">{path.title}</span>
                  <span className="font-mono font-bold text-[#2EA396] dark:text-[#58BDB2] text-[11px] shrink-0">
                    {path.matchScore}% Match
                  </span>
                </div>
                <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
                  Salary Band: <span className="font-medium text-[#263238] dark:text-[#F1F5F9]">{path.salaryRange}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Box 3: Upcoming Placement Drives */}
        <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#58BDB2]" />
              <span>Eligible Placement Drives</span>
            </h4>
            <button
              onClick={() => onNavigateTab('placements')}
              className="text-[11px] text-[#58BDB2] font-semibold hover:underline cursor-pointer"
            >
              All Drives
            </button>
          </div>

          <div className="space-y-2.5">
            {drives.length === 0 ? (
              <div className="py-4 text-center text-[#687572] dark:text-[#94A3B8] text-xs">
                No active placement drives scheduled yet. Check announcements for updates.
              </div>
            ) : (
              drives.map((d) => (
                <div key={d.id} className="p-2.5 rounded-xl bg-[#F7FBFB] dark:bg-[#0D1518] border border-[#E4ECEA] dark:border-[#1F333A] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#263238] dark:text-[#F1F5F9] truncate">{d.companyName}</span>
                    <span className="text-[10px] bg-[#EAF7F8] dark:bg-[#153430] text-[#2EA396] dark:text-[#58BDB2] px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                      {d.packageLPA}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#687572] dark:text-[#94A3B8] flex items-center justify-between">
                    <span>{d.role.slice(0, 24)}...</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400">Due {d.applicationDeadline}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Resume Upload Modal */}
      <StudentResumeUploadModal
        isOpen={resumeModalOpen}
        student={student}
        onClose={() => setResumeModalOpen(false)}
        onComplete={handleResumeComplete}
      />
    </div>
  );
};
