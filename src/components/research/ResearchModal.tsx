import React from 'react';
import { X, ShieldCheck, Cpu, Database, BookOpen, AlertCircle, Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#142024] rounded-2xl max-w-3xl w-full shadow-2xl border border-[#E4ECEA] dark:border-[#1F333A] overflow-hidden max-h-[90vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-[#E4ECEA] dark:border-[#1F333A] flex items-center justify-between bg-[#F7FBFB] dark:bg-[#0E171A]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] flex items-center justify-center font-bold border border-[#58BDB2]/30 dark:border-[#27665E]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">
                Academic Research Methodology & Technical Whitepaper
              </h3>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8]">
                ARYA AI: Academic Readiness & Youth Analytics AI (Final-Year B.Tech CSE Project)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9] rounded-lg hover:bg-neutral-200/50 dark:hover:bg-[#1E2E33] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
          {/* Honest Disclosure Banner */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-[#251A0E] border border-amber-200 dark:border-[#4B3518] text-amber-900 dark:text-amber-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs text-amber-950 dark:text-amber-100">
              <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Academic Disclosure & Empirical Status</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              In strict accordance with academic integrity guidelines, full empirical evaluation on held-out institutional benchmarks is ongoing. Current readiness figures in this prototype are calculated transparently via heuristic weighted baselines. The system does <strong>not</strong> make unsupported real-world accuracy claims (such as 95% or 99%).
            </p>
          </div>

          {/* Section 1: Abstract & Core Motivation */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#58BDB2]" />
              <span>1. Problem Statement & Research Motivation</span>
            </h4>
            <p>
              Higher education institutions possess vast quantities of fragmented student data—including semester-wise GPA, attendance, coding repository activity, external certifications, capstone deliverables, and faculty mentorship observations. Traditionally, this information is utilized strictly for administrative compliance rather than converted into predictive, actionable placement intelligence. Students lack explainable insight into their readiness tiers, while training and placement officers are overwhelmed by manual profile auditing.
            </p>
          </div>

          {/* Section 2: Planned Machine Learning Architecture */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#58BDB2]" />
              <span>2. Supervised Ensemble Model Architecture (Planned Backend)</span>
            </h4>
            <p>
              The complete production architecture employs tabular gradient-boosted decision trees and ensemble classifiers to predict multi-class placement readiness:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A] space-y-1">
                <div className="font-bold text-[#263238] dark:text-[#F1F5F9]">Candidate Algorithms</div>
                <ul className="list-disc list-inside text-[11px] space-y-0.5">
                  <li>LightGBM (Light Gradient Boosting Machine)</li>
                  <li>XGBoost (Extreme Gradient Boosting)</li>
                  <li>Random Forest Ensembles</li>
                  <li>CatBoost (Categorical Feature Handling)</li>
                </ul>
              </div>

              <div className="p-3 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A] space-y-1">
                <div className="font-bold text-[#263238] dark:text-[#F1F5F9]">Input Feature Vectors (22 Attributes)</div>
                <ul className="list-disc list-inside text-[11px] space-y-0.5">
                  <li>Academics: CGPA, SGPA Delta, Active Backlogs</li>
                  <li>Practical: Project Volume, Tech Stack Breadth</li>
                  <li>Coding: Problems Solved, Contest ELO Rating</li>
                  <li>Professional: Certifications, Soft Skills Rating</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Explainable AI (XAI) with SHAP and LIME */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8B5CF6]" />
              <span>3. Explainability Layer: SHAP & LIME Interpretability</span>
            </h4>
            <p>
              To eliminate opaque "black-box" decision making that causes anxiety among undergraduate students, ARYA AI incorporates SHAP (SHapley Additive exPlanations) and LIME (Local Interpretable Model-agnostic Explanations):
            </p>
            <div className="p-3.5 bg-[#EAF7F8]/40 dark:bg-[#122D29]/40 border border-[#58BDB2]/20 dark:border-[#27665E] rounded-xl space-y-1 text-[11px]">
              <div>• <strong>Positive Shapley Contributions:</strong> Highlights verified strengths (e.g. high competitive programming score or accredited cloud credentials) that increase placement likelihood.</div>
              <div>• <strong>Negative / Deficiency Penalties:</strong> Isolates the exact criteria suppressing a student's score (e.g. single academic backlog or low project portfolio count) and attaches actionable mitigation guidance.</div>
            </div>
          </div>

          {/* Section 4: System Architecture & Integration Workflow */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#58BDB2]" />
              <span>4. Data Flow & Security Principles</span>
            </h4>
            <p>
              The system architecture conceptually decouples:
              <br />
              <strong>Client Interface</strong> (React + TypeScript + Tailwind) &rarr; <strong>REST API Gateway</strong> (Node.js/Express) &rarr; <strong>Central Relational Database</strong> &rarr; <strong>Python ML Service</strong> (Scikit-Learn, LightGBM, SHAP).
              <br />
              All student records are secured via Student_ID primary binding with role-based access control (RBAC) ensuring students access only their authorized profile.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E4ECEA] dark:border-[#1F333A] bg-[#F7FBFB] dark:bg-[#0E171A] flex items-center justify-between transition-colors">
          <span className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
            ARYA AI Research Documentation · Computer Science & Engineering
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#58BDB2] text-white rounded-xl text-xs font-semibold hover:bg-[#48a99f] transition-colors cursor-pointer shadow-xs"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};
