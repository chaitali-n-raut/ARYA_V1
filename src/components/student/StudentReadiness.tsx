import React from 'react';
import { StudentRecord } from '../../types';
import { readinessService, hasStudentRecordData } from '../../services/readinessService';
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
  Layers,
  Info,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface Props {
  student: StudentRecord;
  onNavigateTab: (tab: string) => void;
  onOpenResearch: () => void;
}

export const StudentReadiness: React.FC<Props> = ({ student, onNavigateTab, onOpenResearch }) => {
  const hasData = hasStudentRecordData(student);
  const evaluation = readinessService.evaluateStudentReadiness(student);

  return (
    <div className="space-y-6 max-w-5xl transition-colors">
      {!hasData && (
        <div className="bg-amber-50 dark:bg-[#251A0E] border border-amber-200 dark:border-[#4B3518] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-950 dark:text-amber-200">Zero Records Registered · Diagnostics Pending</div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400">
                Placement readiness scores will calculate once your profile is populated or your resume is uploaded.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('profile')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Complete Profile</span>
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">Placement Readiness Diagnostics</h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#EAF7F8] dark:bg-[#133330] text-[#2EA396] dark:text-[#58BDB2] font-semibold border border-[#58BDB2]/30 dark:border-[#27665E]">
              Rule-Based Readiness
            </span>
          </div>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
              A deterministic decision-support score from recorded student information. It is not a trained model or a placement probability.
          </p>
        </div>

        <button
          onClick={onOpenResearch}
          className="text-xs font-semibold text-[#58BDB2] hover:text-[#48a99f] flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Info className="w-4 h-4" />
          <span>Research & ML Methodology</span>
        </button>
      </div>

      {/* Main Composite Score & Tier Card */}
      <div className="bg-gradient-to-br from-[#EAF7F8] via-white to-[#DDF5F0]/40 dark:from-[#11312D] dark:via-[#142024] dark:to-[#0F1E22] p-6 md:p-8 rounded-3xl border border-[#58BDB2]/30 dark:border-[#27665E] shadow-xs transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 text-center md:text-left space-y-2">
            <div className="text-xs font-bold text-[#2EA396] dark:text-[#58BDB2] uppercase tracking-wider">
              Overall Readiness Score
            </div>
            <div className="text-6xl font-extrabold text-[#263238] dark:text-[#F1F5F9] tracking-tight">
              {evaluation.overallScore}
              <span className="text-2xl text-[#687572] dark:text-[#94A3B8] font-normal"> / 100</span>
            </div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-[#18282D] text-[#2EA396] dark:text-[#58BDB2] border border-[#58BDB2]/30 dark:border-[#27665E] shadow-xs">
              {evaluation.tier}
            </div>
          </div>

          <div className="md:col-span-8 space-y-3 border-t md:border-t-0 md:border-l border-[#58BDB2]/20 dark:border-[#27665E]/50 pt-4 md:pt-0 md:pl-8">
            <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#58BDB2]" />
              <span>Rule-Based Readiness Factors</span>
            </h3>
            <p className="text-xs text-[#263238]/80 dark:text-[#E2E8F0]/85 leading-relaxed">
              {evaluation.explainabilitySummary}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#687572] dark:text-[#94A3B8]">
              <span>Method: <strong className="text-[#263238] dark:text-[#F1F5F9]">Weighted rules</strong></span>
              <span>·</span>
              <span>Evaluated Candidate: <strong className="text-[#263238] dark:text-[#F1F5F9]">{student.Student_ID}</strong></span>
              <span>·</span>
              <span>Active Backlogs: <strong className={student.Backlogs > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}>{student.Backlogs}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Dimension Pillars Breakdown */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
          <Layers className="w-4 h-4 text-[#58BDB2]" />
          <span>Dimension Pillars & Weight Distribution</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluation.dimensions.map((dim) => (
            <div
              key={dim.name}
              className="p-4 rounded-xl bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] space-y-2.5 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#263238] dark:text-[#F1F5F9]">{dim.name}</span>
                  <span className="text-[11px] text-[#687572] dark:text-[#94A3B8] ml-1.5">({Math.round(dim.weight * 100)}% Weight)</span>
                </div>
                <span className="font-mono font-bold text-[#263238] dark:text-[#F1F5F9]">{dim.score} / 100</span>
              </div>

              <div className="w-full h-2 bg-neutral-200/70 dark:bg-[#1C2C31] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#58BDB2] rounded-full transition-all duration-500"
                  style={{ width: `${dim.score}%` }}
                />
              </div>

              <div className="text-[11px] text-[#687572] dark:text-[#94A3B8] flex items-center justify-between">
                <span>{dim.description}</span>
                <span className="font-medium text-[#2EA396] dark:text-[#58BDB2]">+{dim.weightedScore} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Factors are direct rule inputs, not SHAP/LIME attributions. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Factors */}
        <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center gap-2 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
            <CheckCircle2 className="w-4 h-4 text-[#2EA396] dark:text-[#58BDB2]" />
            <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">Factors Helping Readiness (+ Impact)</h3>
          </div>

          <div className="space-y-3">
            {evaluation.positiveFactors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#EAF7F8]/40 dark:bg-[#122D29]/60 border border-[#58BDB2]/20 dark:border-[#27665E] space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#263238] dark:text-[#F1F5F9]">{factor.name}</span>
                    <span className="font-mono font-bold text-[#2EA396] dark:text-[#58BDB2] text-[11px] bg-white dark:bg-[#16332E] px-2 py-0.5 rounded border border-[#58BDB2]/20 dark:border-[#27665E]">
                      Positive factor
                  </span>
                </div>
                <p className="text-[#687572] dark:text-[#94A3B8] text-[11px] leading-snug">{factor.detail}</p>
                <div className="text-[11px] text-[#2EA396] dark:text-[#58BDB2] font-medium pt-1">
                  💡 {factor.actionableAdvice}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Negative Factors / Areas to Strengthen */}
        <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center gap-2 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">Areas To Strengthen (- Impact)</h3>
          </div>

          <div className="space-y-3">
            {evaluation.negativeFactors.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-xs text-[#687572] dark:text-[#94A3B8] text-center">
                No recorded dimensions fall below the current rule-set threshold. This is not a placement outcome prediction.
              </div>
            ) : (
              evaluation.negativeFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-[#251A0E]/60 border border-amber-200/60 dark:border-[#4B3518] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#263238] dark:text-[#F1F5F9]">{factor.name}</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300 text-[11px] bg-white dark:bg-[#2D1F10] px-2 py-0.5 rounded border border-amber-200 dark:border-[#4B3518]">
                      Needs improvement
                    </span>
                  </div>
                  <p className="text-[#687572] dark:text-[#94A3B8] text-[11px] leading-snug">{factor.detail}</p>
                  <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium pt-1">
                    🎯 Recommendation: {factor.actionableAdvice}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Next Action Cards */}
      <div className="p-6 bg-[#DDF5F0]/40 dark:bg-[#112F2B]/60 rounded-2xl border border-[#58BDB2]/30 dark:border-[#27665E] flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <div>
          <h4 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">Bridge Identified Skill Gaps</h4>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-0.5">
            View targeted exercises, coursework recommendations, and your structured multi-week roadmap.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('skillgap')}
            className="px-4 py-2 bg-white dark:bg-[#142024] text-[#263238] dark:text-[#F1F5F9] border border-[#E4ECEA] dark:border-[#1F333A] rounded-xl text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-[#1C2D32] transition-colors cursor-pointer"
          >
            Skill-Gap Analysis
          </button>
          <button
            onClick={() => onNavigateTab('roadmap')}
            className="px-4 py-2 bg-[#58BDB2] text-white rounded-xl text-xs font-semibold hover:bg-[#48a99f] transition-colors cursor-pointer shadow-xs"
          >
            Open Roadmap
          </button>
        </div>
      </div>
    </div>
  );
};
