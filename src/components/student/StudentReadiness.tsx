import React, { useEffect, useState } from 'react';
import { StudentRecord } from '../../types';
import {
  readinessService,
  hasStudentRecordData
} from '../../services/readinessService';
import { apiClient } from '../../services/apiClient';
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  UserCheck,
  Target,
  BookOpen,
  Briefcase,
  Code2,
  MessageCircle
} from 'lucide-react';

interface Props {
  student: StudentRecord;
  onNavigateTab: (tab: string) => void;
}

interface GuidanceItem {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  category: string;
}

interface GuidanceState {
  loading: boolean;
  error?: string;
  summary?: string;
  guidance: GuidanceItem[];
}

const categoryIcon = (category: string) => {
  const value = category.toLowerCase();

  if (value.includes('technical')) {
    return <Code2 className="w-4 h-4" />;
  }

  if (value.includes('project')) {
    return <BookOpen className="w-4 h-4" />;
  }

  if (value.includes('experience')) {
    return <Briefcase className="w-4 h-4" />;
  }

  if (value.includes('communication')) {
    return <MessageCircle className="w-4 h-4" />;
  }

  return <Target className="w-4 h-4" />;
};

export const StudentReadiness: React.FC<Props> = ({
  student,
  onNavigateTab
}) => {
  const hasData = hasStudentRecordData(student);

  const evaluation =
    readinessService.evaluateStudentReadiness(student);

  const [guidanceState, setGuidanceState] =
    useState<GuidanceState>({
      loading: false,
      guidance: []
    });

  useEffect(() => {
    let cancelled = false;

    if (!hasData) {
      setGuidanceState({
        loading: false,
        guidance: []
      });

      return;
    }

    setGuidanceState({
      loading: true,
      guidance: []
    });

    apiClient
      .coach(student.Student_ID)
      .then((result) => {
        if (cancelled) return;

        setGuidanceState({
          loading: false,
          summary: result.summary,
          guidance: Array.isArray(result.guidance)
            ? result.guidance
            : []
        });
      })
      .catch(() => {
        if (cancelled) return;

        setGuidanceState({
          loading: false,
          error:
            'Personalized guidance is temporarily unavailable. Please try again.',
          guidance: []
        });
      });

    return () => {
      cancelled = true;
    };
  }, [
    student.Student_ID,
    student.UpdatedAt,
    hasData
  ]);

  return (
    <div className="space-y-6 max-w-5xl transition-colors">

      {/* Incomplete profile */}
      {!hasData && (
        <div className="bg-amber-50 dark:bg-[#251A0E] border border-amber-200 dark:border-[#4B3518] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">

          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />

            <div>
              <div className="text-xs font-bold text-amber-950 dark:text-amber-200">
                Complete your profile to view your readiness
              </div>

              <div className="text-[11px] text-amber-700 dark:text-amber-400">
                Add your academic, skill, project, and experience information to receive personalized recommendations.
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

      {/* Header */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs transition-colors">

        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#58BDB2]" />

          <h2 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">
            Placement Readiness
          </h2>

          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#EAF7F8] dark:bg-[#133330] text-[#2EA396] dark:text-[#58BDB2] font-semibold border border-[#58BDB2]/30 dark:border-[#27665E]">
            Current Assessment
          </span>
        </div>

        <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-2 max-w-2xl leading-relaxed">
          Review your current placement preparation and the areas that can make the biggest difference to your progress.
        </p>
      </div>

      {/* Main score */}
      <div className="bg-gradient-to-br from-[#EAF7F8] via-white to-[#DDF5F0]/40 dark:from-[#11312D] dark:via-[#142024] dark:to-[#0F1E22] p-6 md:p-8 rounded-3xl border border-[#58BDB2]/30 dark:border-[#27665E] shadow-xs transition-colors">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

          <div className="md:col-span-4 text-center md:text-left space-y-2">

            <div className="text-xs font-bold text-[#2EA396] dark:text-[#58BDB2] uppercase tracking-wider">
              Placement Readiness Score
            </div>

            <div className="text-6xl font-extrabold text-[#263238] dark:text-[#F1F5F9] tracking-tight">
              {evaluation.overallScore}
              <span className="text-2xl text-[#687572] dark:text-[#94A3B8] font-normal">
                {' '} / 100
              </span>
            </div>

            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-[#18282D] text-[#2EA396] dark:text-[#58BDB2] border border-[#58BDB2]/30 dark:border-[#27665E] shadow-xs">
              {evaluation.tier}
            </div>
          </div>

          <div className="md:col-span-8 space-y-3 border-t md:border-t-0 md:border-l border-[#58BDB2]/20 dark:border-[#27665E]/50 pt-4 md:pt-0 md:pl-8">

            <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">
              Your current position
            </h3>

            <p className="text-xs text-[#263238]/80 dark:text-[#E2E8F0]/85 leading-relaxed">
              {evaluation.tier === 'High Placement Readiness'
                ? 'Your profile has a strong foundation for placement preparation. Focus on interview performance and role-specific preparation.'
                : evaluation.tier === 'Moderate Readiness'
                ? 'Your profile is developing well. Strengthen the areas below to improve your placement preparation.'
                : evaluation.tier === 'Critical Intervention'
                ? 'A few important areas need immediate attention. Start with the highest-priority recommendations below.'
                : 'Your placement preparation is still developing. Focus on the recommended areas and build progress consistently.'}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-white/80 dark:bg-[#18282D] border border-[#E4ECEA] dark:border-[#1F333A] text-[#687572] dark:text-[#94A3B8]">
                Student ID: {student.Student_ID}
              </span>

              <span className={`text-[11px] px-2.5 py-1 rounded-lg border ${
                student.Backlogs > 0
                  ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
                  : 'bg-white/80 dark:bg-[#18282D] border-[#E4ECEA] dark:border-[#1F333A] text-[#687572] dark:text-[#94A3B8]'
              }`}>
                Active Backlogs: {student.Backlogs}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">

        <div className="flex items-center gap-2 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
          <Layers className="w-4 h-4 text-[#58BDB2]" />

          <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">
            Readiness Areas
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {evaluation.dimensions.map((dim) => (
            <div
              key={dim.name}
              className="p-4 rounded-xl bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] space-y-2.5 transition-colors"
            >

              <div className="flex items-center justify-between text-xs">

                <span className="font-bold text-[#263238] dark:text-[#F1F5F9]">
                  {dim.name}
                </span>

                <span className="font-mono font-bold text-[#263238] dark:text-[#F1F5F9]">
                  {dim.score} / 100
                </span>
              </div>

              <div className="w-full h-2 bg-neutral-200/70 dark:bg-[#1C2C31] rounded-full overflow-hidden">

                <div
                  className="h-full bg-[#58BDB2] rounded-full transition-all duration-500"
                  style={{
                    width: `${dim.score}%`
                  }}
                />

              </div>

              <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
                {dim.description}
              </div>

            </div>
          ))}

        </div>
      </div>

      {/* Personalized guidance */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">

        <div className="flex items-center justify-between gap-4 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">

          <div>
            <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">
              Personalized Guidance
            </h3>

            <p className="text-[11px] text-[#687572] dark:text-[#94A3B8] mt-1">
              Recommendations based on your current profile and placement preparation.
            </p>
          </div>

          <Target className="w-5 h-5 text-[#58BDB2] shrink-0" />

        </div>

        {guidanceState.loading && (
          <div className="p-5 rounded-xl bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A]">

            <div className="flex items-center gap-3">

              <div className="w-4 h-4 border-2 border-[#58BDB2]/30 border-t-[#58BDB2] rounded-full animate-spin" />

              <span className="text-xs text-[#687572] dark:text-[#94A3B8]">
                Preparing your recommendations...
              </span>

            </div>

          </div>
        )}

        {guidanceState.error && !guidanceState.loading && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-[#251A0E] border border-amber-200 dark:border-[#4B3518] text-xs text-amber-800 dark:text-amber-300">
            {guidanceState.error}
          </div>
        )}

        {guidanceState.summary && !guidanceState.loading && (
          <div className="p-4 rounded-xl bg-[#EAF7F8]/50 dark:bg-[#122D29]/60 border border-[#58BDB2]/20 dark:border-[#27665E]">

            <p className="text-xs leading-relaxed text-[#263238] dark:text-[#E2E8F0]">
              {guidanceState.summary}
            </p>

          </div>
        )}

        {!guidanceState.loading &&
          guidanceState.guidance.length > 0 && (
            <div className="space-y-3">

              {guidanceState.guidance.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] transition-colors"
                >

                  <div className="flex items-start gap-3">

                    <div className="w-9 h-9 rounded-xl bg-[#EAF7F8] dark:bg-[#133330] text-[#2EA396] dark:text-[#58BDB2] flex items-center justify-center shrink-0">
                      {categoryIcon(item.category)}
                    </div>

                    <div className="flex-1 min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h4 className="text-xs font-bold text-[#263238] dark:text-[#F1F5F9]">
                          {item.title}
                        </h4>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            item.priority === 'High'
                              ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                              : item.priority === 'Medium'
                              ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                              : 'bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {item.priority} Priority
                        </span>

                      </div>

                      <p className="text-[11px] text-[#687572] dark:text-[#94A3B8] leading-relaxed mt-1.5">
                        {item.description}
                      </p>

                      <div className="mt-2.5 p-3 rounded-lg bg-white dark:bg-[#142024] border border-[#E4ECEA] dark:border-[#1F333A]">

                        <div className="text-[10px] uppercase tracking-wide font-bold text-[#2EA396] dark:text-[#58BDB2] mb-1">
                          Recommended Action
                        </div>

                        <p className="text-[11px] text-[#263238] dark:text-[#E2E8F0] leading-relaxed">
                          {item.action}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        {!guidanceState.loading &&
          !guidanceState.error &&
          guidanceState.guidance.length === 0 &&
          hasData && (
            <div className="p-5 rounded-xl bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-center">

              <CheckCircle2 className="w-7 h-7 text-[#58BDB2] mx-auto mb-2" />

              <p className="text-xs font-semibold text-[#263238] dark:text-[#F1F5F9]">
                Your profile is in good shape.
              </p>

              <p className="text-[11px] text-[#687572] dark:text-[#94A3B8] mt-1">
                Continue practicing and prepare specifically for the roles you want to pursue.
              </p>

            </div>
          )}

      </div>

      {/* Positive areas */}
      {evaluation.positiveFactors.length > 0 && (
        <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">

          <div className="flex items-center gap-2 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">

            <CheckCircle2 className="w-4 h-4 text-[#2EA396] dark:text-[#58BDB2]" />

            <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">
              Strengths Supporting Your Readiness
            </h3>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {evaluation.positiveFactors.slice(0, 4).map(
              (factor, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#EAF7F8]/40 dark:bg-[#122D29]/60 border border-[#58BDB2]/20 dark:border-[#27665E]"
                >

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2EA396] dark:text-[#58BDB2]" />

                    <span className="font-bold text-xs text-[#263238] dark:text-[#F1F5F9]">
                      {factor.name}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#687572] dark:text-[#94A3B8] leading-snug mt-2">
                    {factor.detail}
                  </p>

                </div>
              )
            )}

          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-6 bg-[#DDF5F0]/40 dark:bg-[#112F2B]/60 rounded-2xl border border-[#58BDB2]/30 dark:border-[#27665E] flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">

        <div>

          <h4 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">
            Continue improving your placement profile
          </h4>

          <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-0.5">
            Use your skill gaps and roadmap to turn these recommendations into measurable progress.
          </p>

        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() => onNavigateTab('skillgap')}
            className="px-4 py-2 bg-white dark:bg-[#142024] text-[#263238] dark:text-[#F1F5F9] border border-[#E4ECEA] dark:border-[#1F333A] rounded-xl text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-[#1C2D32] transition-colors cursor-pointer"
          >
            View Skill Gaps
          </button>

          <button
            onClick={() => onNavigateTab('roadmap')}
            className="px-4 py-2 bg-[#58BDB2] text-white rounded-xl text-xs font-semibold hover:bg-[#48a99f] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            Open Roadmap
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

    </div>
  );
};