import React, { useState } from 'react';
import { StudentRecord } from '../../types';
import { readinessService } from '../../services/readinessService';
import { Target, CheckCircle2, Clock, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  student: StudentRecord;
  onNavigateTab: (tab: string) => void;
}

export const StudentSkillGap: React.FC<Props> = ({ student, onNavigateTab }) => {
  const [targetRole, setTargetRole] = useState(student.Target_Role || 'Full-Stack Software Engineer');
  const careerPaths = readinessService.getCareerPathRecommendations(student);
  const selectedPath = careerPaths.find((p) => p.title === targetRole) || careerPaths[0];
  const gaps = readinessService.getSkillGaps(student, targetRole);

  const missingCount = selectedPath.studentMissingSkills.length;
  const matchPercent = selectedPath.matchScore;

  return (
    <div className="space-y-6 max-w-5xl transition-colors">
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">Skill-Gap Diagnostic Engine</h2>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-0.5">
            Compares your demonstrated competencies against current corporate recruitment benchmarks.
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex items-center gap-2 text-xs">
          <label className="text-[#687572] dark:text-[#94A3B8] font-medium shrink-0">Target Role:</label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-xl text-xs font-semibold text-[#263238] dark:text-[#F1F5F9] focus:outline-none focus:border-[#58BDB2]"
          >
            {careerPaths.map((cp) => (
              <option key={cp.id} value={cp.title} className="bg-white dark:bg-[#142024] text-[#263238] dark:text-[#F1F5F9]">
                {cp.title} ({cp.matchScore}% Match)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alignment Overview Banner */}
      <div className="bg-gradient-to-r from-[#EAF7F8] via-white to-[#DDF5F0]/40 dark:from-[#11312D] dark:via-[#142024] dark:to-[#0F1E22] p-6 rounded-2xl border border-[#58BDB2]/30 dark:border-[#27665E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="text-xs font-bold text-[#2EA396] dark:text-[#58BDB2] uppercase tracking-wider">
            Current Profile Alignment
          </div>
          <div className="text-2xl font-extrabold text-[#263238] dark:text-[#F1F5F9]">
            {targetRole}
          </div>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] max-w-xl">
            {selectedPath.overview}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-white dark:bg-[#16272C] p-3.5 rounded-xl border border-[#58BDB2]/30 dark:border-[#27665E] shadow-xs">
          <div className="text-right">
            <div className="text-2xl font-extrabold text-[#2EA396] dark:text-[#58BDB2]">{matchPercent}%</div>
            <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">Competency Match</div>
          </div>
          <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-700" />
          <div className="text-left">
            <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">{missingCount}</div>
            <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">Skills to Acquire</div>
          </div>
        </div>
      </div>

      {/* Side-by-side Competency Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Acquired Skills */}
        <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
            <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2EA396] dark:text-[#58BDB2]" />
              <span>Validated Matching Skills ({selectedPath.studentMatchingSkills.length})</span>
            </h3>
          </div>

          <div className="space-y-2">
            {selectedPath.studentMatchingSkills.length === 0 ? (
              <p className="text-xs text-[#687572] dark:text-[#94A3B8] italic p-2">
                No matching skills found yet for this target role. Add skills in your profile.
              </p>
            ) : (
              selectedPath.studentMatchingSkills.map((skill) => (
                <div
                  key={skill}
                  className="p-3 rounded-xl bg-[#EAF7F8]/40 dark:bg-[#122D29]/60 border border-[#58BDB2]/20 dark:border-[#27665E] flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-[#263238] dark:text-[#F1F5F9]">{skill}</span>
                  <span className="text-[10px] bg-white dark:bg-[#16332E] text-[#2EA396] dark:text-[#58BDB2] px-2 py-0.5 rounded-full border border-[#58BDB2]/30 dark:border-[#27665E] font-medium">
                    Verified in Profile
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Missing / Gap Skills */}
        <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
            <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Identified Gaps to Bridge ({selectedPath.studentMissingSkills.length})</span>
            </h3>
          </div>

          <div className="space-y-2">
            {selectedPath.studentMissingSkills.length === 0 ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold p-2">
                All benchmark skills are met for this role!
              </p>
            ) : (
              selectedPath.studentMissingSkills.map((skill) => (
                <div
                  key={skill}
                  className="p-3 rounded-xl bg-amber-50/40 dark:bg-[#251A0E]/60 border border-amber-200/50 dark:border-[#4B3518] flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-[#263238] dark:text-[#F1F5F9]">{skill}</span>
                  <span className="text-[10px] bg-white dark:bg-[#2D1F10] text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-[#4B3518] font-medium">
                    Missing from Profile
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Actionable Learning Interventions Table */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
          <Sparkles className="w-4 h-4 text-[#58BDB2]" />
          <span>Recommended Learning Interventions</span>
        </h3>

        <div className="space-y-3">
          {gaps.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#263238] dark:text-[#F1F5F9]">{item.skill}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    item.importance === 'High'
                      ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                      : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50'
                  }`}>
                    {item.importance} Priority
                  </span>
                  <span className="text-[10px] text-[#687572] dark:text-[#94A3B8]">({item.category})</span>
                </div>
                <p className="text-[#687572] dark:text-[#94A3B8] leading-relaxed">{item.suggestedAction}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-[#687572] dark:text-[#94A3B8] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#58BDB2]" />
                  <span>~{item.estimatedWeeks} wks</span>
                </span>
                <button
                  onClick={() => onNavigateTab('roadmap')}
                  className="px-3 py-1.5 bg-white dark:bg-[#142024] text-[#2EA396] dark:text-[#58BDB2] border border-[#58BDB2]/30 dark:border-[#27665E] rounded-lg font-semibold hover:bg-[#EAF7F8] dark:hover:bg-[#1C2E33] transition-colors cursor-pointer"
                >
                  Add to Roadmap
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
