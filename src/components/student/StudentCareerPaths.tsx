import React from 'react';
import { StudentRecord } from '../../types';
import { readinessService } from '../../services/readinessService';
import { Compass, TrendingUp, Building, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  student: StudentRecord;
  onNavigateTab: (tab: string) => void;
}

export const StudentCareerPaths: React.FC<Props> = ({ student, onNavigateTab }) => {
  const careerPaths = readinessService.getCareerPathRecommendations(student);

  return (
    <div className="space-y-6 max-w-5xl transition-colors">
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">Recommended Career Paths</h2>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-0.5">
            Data-driven role trajectories aligned with your academic standing, project portfolio, and technical proficiencies.
          </p>
        </div>

        <div className="text-[11px] bg-[#EAF7F8] dark:bg-[#133330] text-[#2EA396] dark:text-[#58BDB2] font-semibold px-3 py-1.5 rounded-xl border border-[#58BDB2]/30 dark:border-[#27665E]">
          Ranked by Competency Fit
        </div>
      </div>

      {/* Role Cards List */}
      <div className="space-y-4">
        {careerPaths.map((path, idx) => (
          <div
            key={path.id}
            className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] hover:border-[#58BDB2] dark:hover:border-[#58BDB2] transition-all hover:shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#58BDB2]">0{idx + 1}.</span>
                  <h3 className="text-lg font-bold text-[#263238] dark:text-[#F1F5F9]">{path.title}</h3>
                  <span className="text-[10px] bg-neutral-100 dark:bg-[#1B2B30] text-[#687572] dark:text-[#94A3B8] px-2 py-0.5 rounded font-medium">
                    {path.category}
                  </span>
                </div>
                <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed max-w-2xl">{path.overview}</p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl font-extrabold text-[#2EA396] dark:text-[#58BDB2]">{path.matchScore}%</div>
                <div className="text-[10px] text-[#687572] dark:text-[#94A3B8]">Profile Alignment</div>
              </div>
            </div>

            {/* Metrics & Market Context */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
                <div className="text-[#687572] dark:text-[#94A3B8] text-[11px] mb-0.5">Indicative Salary Band</div>
                <div className="font-bold text-[#263238] dark:text-[#F1F5F9]">{path.salaryRange}</div>
                <div className="text-[10px] text-[#687572] dark:text-[#94A3B8] italic">Market Benchmark Guidance</div>
              </div>

              <div className="p-3 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
                <div className="text-[#687572] dark:text-[#94A3B8] text-[11px] mb-0.5">Hiring Velocity</div>
                <div className="font-bold text-[#2EA396] dark:text-[#58BDB2]">{path.growthOutlook}</div>
                <div className="text-[10px] text-[#687572] dark:text-[#94A3B8]">Tier-1 & Enterprise Demand</div>
              </div>

              <div className="p-3 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
                <div className="text-[#687572] dark:text-[#94A3B8] text-[11px] mb-0.5">Frequent Campus Recruiters</div>
                <div className="font-medium text-[#263238] dark:text-[#F1F5F9] truncate">{path.typicalEmployers.join(', ')}</div>
                <div className="text-[10px] text-[#687572] dark:text-[#94A3B8]">Active Placement Partners</div>
              </div>
            </div>

            {/* Skills breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[#687572] dark:text-[#94A3B8] font-semibold text-[11px] mr-1">Matching Skills:</span>
                {path.studentMatchingSkills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] font-medium text-[11px] border border-[#58BDB2]/20 dark:border-[#27665E]"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{s}</span>
                  </span>
                ))}
              </div>

              {path.studentMissingSkills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[#687572] dark:text-[#94A3B8] font-semibold text-[11px] mr-1">Skills to Bridge:</span>
                  {path.studentMissingSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-[#251A0E] text-amber-800 dark:text-amber-300 font-medium text-[11px] border border-amber-200 dark:border-[#4B3518]"
                    >
                      <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>{s}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#E4ECEA] dark:border-[#1F333A]">
              <span className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
                {path.studentMissingSkills.length === 0
                  ? 'All core competency requirements met!'
                  : `${path.studentMissingSkills.length} key competencies remaining for full alignment`}
              </span>

              <button
                onClick={() => onNavigateTab('roadmap')}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#58BDB2] text-white rounded-xl text-xs font-semibold hover:bg-[#48a99f] transition-colors cursor-pointer shadow-xs"
              >
                <span>Generate Roadmap for this Path</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
