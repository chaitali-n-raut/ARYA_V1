import React, { useState } from 'react';
import { User, StudentRecord } from '../../types';
import { studentService } from '../../services/studentService';
import { placementService } from '../../services/placementService';
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Sparkles,
  Award,
  Layers,
  Star,
  Users,
  Building
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const RecruiterPortal: React.FC<Props> = ({ currentUser }) => {
  const [allStudents] = useState<StudentRecord[]>(studentService.getAllStudents());

  // Filter criteria for 2-stage match
  const [minCgpa, setMinCgpa] = useState(7.5);
  const [maxBacklogs, setMaxBacklogs] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [skillInput, setSkillInput] = useState('React, TypeScript, Docker, Node.js');
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);

  const requiredSkills = skillInput
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const branches =
    selectedBranch === 'all'
      ? []
      : [selectedBranch];

  const matchedCandidates = placementService.matchCandidatesForRole(allStudents, {
    minCGPA: minCgpa,
    maxBacklogs: maxBacklogs,
    branches,
    requiredSkills
  });

  const toggleShortlist = (studentId: string) => {
    setShortlistedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 transition-colors">
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">Recruiter Candidate Matching Engine</h1>
            <span className="text-[11px] font-semibold bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] px-2.5 py-0.5 rounded-full border border-[#58BDB2]/30 dark:border-[#27665E]">
              {currentUser.organization || 'Corporate Recruitment Portal'}
            </span>
          </div>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-1">
            Logged in as <strong className="text-[#263238] dark:text-[#F1F5F9]">{currentUser.name}</strong> · Two-stage screening: hard eligibility gating followed by explainable skill-fit ranking.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#F7FBFB] dark:bg-[#0E171A] px-4 py-2 rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          <div className="text-xs">
            <span className="text-[#687572] dark:text-[#94A3B8]">Shortlisted Candidates:</span>{' '}
            <strong className="text-[#263238] dark:text-[#F1F5F9] font-mono">{shortlistedIds.length}</strong>
          </div>
        </div>
      </div>

      {/* 2-Stage Filter Configuration Panel */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
          <Filter className="w-4 h-4 text-[#58BDB2]" />
          <span>Stage 1 (Hard Eligibility) & Stage 2 (Skill Fit) Parameters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-medium block mb-1">Stage 1: Minimum CGPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={minCgpa}
              onChange={(e) => setMinCgpa(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg font-mono font-bold text-[#263238] dark:text-[#F1F5F9] focus:outline-none focus:border-[#58BDB2]"
            />
          </div>

          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-medium block mb-1">Stage 1: Max Backlogs Permitted</label>
            <input
              type="number"
              min="0"
              value={maxBacklogs}
              onChange={(e) => setMaxBacklogs(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg font-mono font-bold text-[#263238] dark:text-[#F1F5F9] focus:outline-none focus:border-[#58BDB2]"
            />
          </div>

          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-medium block mb-1">Target Department / Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg text-[#263238] dark:text-[#F1F5F9] focus:outline-none focus:border-[#58BDB2]"
            >
              <option value="all">All Tech Disciplines</option>
              <option value="Computer Science & Engineering">CSE Only</option>
              <option value="Data Science & AI">Data Science & AI Only</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Cybersecurity & Networks">Cybersecurity</option>
            </select>
          </div>

          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-medium block mb-1">Stage 2: Target Skills (Comma Separated)</label>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg text-[#263238] dark:text-[#F1F5F9] focus:outline-none focus:border-[#58BDB2]"
            />
          </div>
        </div>
      </div>

      {/* Candidates Ranked Table */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
          <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#58BDB2]" />
            <span>Ranked Candidates ({matchedCandidates.length})</span>
          </h3>
          <span className="text-xs text-[#687572] dark:text-[#94A3B8]">
            Eligibility Gates Passed: {matchedCandidates.filter((c) => c.stage1Passed).length} candidates
          </span>
        </div>

        <div className="space-y-4">
          {matchedCandidates.map((item, idx) => {
            const isShortlisted = shortlistedIds.includes(item.student.Student_ID);

            return (
              <div
                key={item.student.Student_ID}
                className={`p-5 rounded-2xl border transition-all ${
                  !item.stage1Passed
                    ? 'bg-neutral-50/70 dark:bg-[#12191C]/70 border-neutral-200 dark:border-neutral-800 opacity-60'
                    : isShortlisted
                    ? 'bg-[#EAF7F8]/40 dark:bg-[#122D29]/40 border-[#58BDB2] shadow-xs'
                    : 'bg-white dark:bg-[#142024] border-[#E4ECEA] dark:border-[#1F333A] hover:border-[#58BDB2]/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#58BDB2]">#{idx + 1}</span>
                      <h4 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">{item.student.Full_Name}</h4>
                      <span className="text-xs font-mono text-[#687572] dark:text-[#94A3B8]">({item.student.Student_ID})</span>
                      {item.stage1Passed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Stage 1 Passed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800/60">
                          <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                          <span>Gate Filter Failed: {item.stage1FailReasons.join(', ')}</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#687572] dark:text-[#94A3B8]">
                      {item.student.Branch} · CGPA <strong className="text-[#263238] dark:text-[#F1F5F9]">{item.student.CGPA.toFixed(2)}</strong> · {item.student.Backlogs} Backlogs · {item.student.Coding_Activity.problemsSolved} DSA Solved
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-extrabold font-mono text-[#2EA396] dark:text-[#58BDB2]">{item.stage2FitScore}%</div>
                      <div className="text-[10px] text-[#687572] dark:text-[#94A3B8]">AI Role Fit Score</div>
                    </div>

                    <button
                      onClick={() => toggleShortlist(item.student.Student_ID)}
                      disabled={!item.stage1Passed}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        !item.stage1Passed
                          ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                          : isShortlisted
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-[#16272C] border border-[#58BDB2] text-[#2EA396] dark:text-[#58BDB2] hover:bg-[#EAF7F8] dark:hover:bg-[#1E3B37]'
                      }`}
                    >
                      {isShortlisted ? '✓ Shortlisted' : '+ Shortlist'}
                    </button>
                  </div>
                </div>

                {/* Match Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#687572] dark:text-[#94A3B8] font-semibold text-[11px] block mb-1">
                      Matched Competencies ({item.matchingSkills.length} of {requiredSkills.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.matchingSkills.length > 0 ? (
                        item.matchingSkills.map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] rounded font-medium text-[11px] border border-[#58BDB2]/20 dark:border-[#27665E]">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[#687572] dark:text-[#94A3B8] italic text-[11px]">No direct keyword overlap</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[#687572] dark:text-[#94A3B8] font-semibold text-[11px] block mb-1">
                      Candidate Portfolio Highlights:
                    </span>
                    <div className="text-[#263238] dark:text-[#F1F5F9] text-[11px] truncate">
                      {item.student.Projects[0] || 'No primary project listed'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
