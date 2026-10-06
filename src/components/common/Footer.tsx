import React from 'react';
import { UserRole } from '../../types';
import { GraduationCap, BookOpen, ShieldCheck, Mail, ArrowUpRight } from 'lucide-react';

interface Props {
  onNavigateRole: (role: UserRole) => void;
  onOpenResearch: () => void;
}

export const Footer: React.FC<Props> = ({ onNavigateRole, onOpenResearch }) => {
  return (
    <footer className="bg-white dark:bg-[#0B1215] border-t border-[#E4ECEA] dark:border-[#1F333A] pt-14 pb-10 px-6 text-[#687572] dark:text-[#94A3B8] transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#E4ECEA] dark:border-[#1F333A]">
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-1 space-y-3">
            <div className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">
              <span className="text-[#58BDB2]">ARYA</span> AI
            </div>
            <p className="text-xs font-semibold text-[#58BDB2] tracking-wide">
              Academic Readiness & Youth Analytics AI
            </p>
            <p className="text-xs leading-relaxed text-[#687572] dark:text-[#94A3B8]">
              A university-industry career intelligence platform transforming fragmented student records into explainable placement readiness, targeted skill-gap diagnostics, and proactive roadmaps.
            </p>
            <div className="text-xs text-[#263238] dark:text-[#F1F5F9] font-medium pt-1">
              Final-Year B.Tech Computer Science Engineering Project
            </div>
          </div>

          {/* Col 2: Ecosystem Portals */}
          <div>
            <h3 className="text-sm font-semibold text-[#263238] dark:text-[#F1F5F9] mb-3">Institutional Roles</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateRole('student')}
                  className="hover:text-[#58BDB2] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Student Workspace</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateRole('faculty')}
                  className="hover:text-[#58BDB2] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Faculty / Mentor Portal</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateRole('tnp')}
                  className="hover:text-[#58BDB2] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Training & Placement (T&P)</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateRole('recruiter')}
                  className="hover:text-[#58BDB2] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Recruiter Candidate Matching</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateRole('admin')}
                  className="hover:text-[#58BDB2] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>University Administration / HOD</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Intelligence Modules */}
          <div>
            <h3 className="text-sm font-semibold text-[#263238] dark:text-[#F1F5F9] mb-3">Core Intelligence</h3>
            <ul className="space-y-2 text-xs">
              <li className="text-[#687572] dark:text-[#94A3B8]">Explainable Readiness Score (XAI)</li>
              <li className="text-[#687572] dark:text-[#94A3B8]">Curated Skill-Gap Diagnostics</li>
              <li className="text-[#687572] dark:text-[#94A3B8]">Role Trajectory & Salary Bands</li>
              <li className="text-[#687572] dark:text-[#94A3B8]">Personalized Learning Roadmaps</li>
              <li className="text-[#687572] dark:text-[#94A3B8]">Two-Stage Recruiter Filtering</li>
              <li>
                <button
                  onClick={onOpenResearch}
                  className="text-[#58BDB2] font-semibold hover:underline cursor-pointer"
                >
                  View ML Architecture & Methodology
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Research Disclosure */}
          <div>
            <h3 className="text-sm font-semibold text-[#263238] dark:text-[#F1F5F9] mb-3">Academic Integrity Notice</h3>
            <p className="text-xs leading-relaxed text-[#687572] dark:text-[#94A3B8] mb-3">
              Readiness diagnostics and explainable scoring are computed directly from verified student records, course credentials, coding assessments, and mentor observations without hardcoded assumptions.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#263238] dark:text-[#F1F5F9]">
              <ShieldCheck className="w-4 h-4 text-[#58BDB2]" />
              <span>Ethical AI · SHAP/LIME Explainability</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#687572] dark:text-[#94A3B8] gap-3">
          <div>
            &copy; {new Date().getFullYear()} ARYA AI. Academic Readiness & Youth Analytics AI. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Academic Open Prototype</span>
            <span>·</span>
            <span>University Ecosystem Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
