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
              A future backend may evaluate tabular classifiers for placement-readiness research. Those models are not included or run by this frontend; the current score uses deterministic weighted rules.
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
              <span>3. Planned Explainability Integration</span>
            </h4>
            <p>
              SHAP and LIME are proposed for a future model-backed explanation layer. They are not implemented in this repository. The current interface shows the recorded dimensions and rule-based factors used by its score:
            </p>
            <div className="p-3.5 bg-[#EAF7F8]/40 dark:bg-[#122D29]/40 border border-[#58BDB2]/20 dark:border-[#27665E] rounded-xl space-y-1 text-[11px]">
              <div><strong>Current factors:</strong> These are rule-based profile descriptions, not SHAP contributions or placement likelihood estimates.</div>
              <div><strong>Future work:</strong> SHAP/LIME integration requires a trained model and evaluation pipeline.</div>
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
              Current implementation: <strong>React + TypeScript</strong> with browser-local application services. A future architecture may add an API, database, and evaluated Python model service; those backend components are not present here.
              <br />
              The frontend applies role checks and student-ID matching in the UI. These checks improve navigation and data scoping in the prototype, but they are not server-side authorization and can be bypassed by a user who controls the browser.
            </p>
          </div>

          {/* Section 5: Current prototype storage and planned backend */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#58BDB2]" />
              <span>5. Data & Storage</span>
            </h4>
            <p>
              This version is a frontend prototype. Data is stored locally in the browser and is not yet synchronized across devices. The app's services use these localStorage areas:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Accounts and prototype credentials: <code>arya_ai_registered_accounts_v6</code></li>
              <li>Current-user session and role: <code>arya_ai_current_user_v6</code> for local prototype login (session record excludes the password); a future configured API owns its server session cookie</li>
              <li>Student records: <code>arya_ai_students_db_v6</code></li>
              <li>Imported dataset metadata: <code>arya_ai_student_datasets_v1</code></li>
              <li>Placement drives, applications, and notifications: <code>arya_ai_placement_drives_v2</code>, <code>arya_ai_applications_v2</code>, and <code>arya_ai_notifications_v2</code></li>
              <li>Theme preference: <code>arya_theme</code></li>
            </ul>
            <p className="text-[11px]">
              Account passwords are currently stored as plaintext in browser-local prototype account data. This is not secure production authentication. Roles are selected during registration and stored with the account; there is no server-side role verification. The interface does not display credentials; logout removes the current-user session while retaining accounts and application records.
            </p>
            <p className="text-[11px]">
              Older-version storage keys, if present, are left untouched and are not migrated automatically.
            </p>
            <div className="p-3.5 bg-[#EAF7F8]/40 dark:bg-[#122D29]/40 border border-[#58BDB2]/20 dark:border-[#27665E] rounded-xl text-[11px] font-semibold text-[#263238] dark:text-[#F1F5F9]">
              Planned production architecture: React Frontend<br />↓<br />Node.js / Express API<br />↓<br />Backend authentication + database<br />↓<br />ML / AI services
            </div>
          </div>

          {/* Section 6: Authentication and email integration status */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#58BDB2]" />
              <span>6. Authentication & Email Integration</span>
            </h4>
            <p>
              This repository currently contains a frontend authentication prototype, not a server or email provider. The optional <code>VITE_AUTH_API_URL</code> setting connects the interface to a separately deployed authentication API; without it, registration, email verification, login notification delivery, and password recovery are unavailable. The interface does not generate OTPs or claim an email was sent.
            </p>
            <p>
              A configured server is expected to own pending-account creation, six-digit verification codes, expiry and attempt limits, resend cooldowns, one-time use, password hashing, login notifications, and reset tokens. Provider credentials belong only in server-side environment variables. The frontend API contract is defined, but no server implementation exists in this working tree.
            </p>
            <p>
              Existing local prototype accounts still contain plaintext passwords in browser localStorage. Email verification is unavailable for those local accounts and would prove control of an email address only; it does not prove someone is a student, faculty member, T&P officer, recruiter, or administrator. Production role assignment requires separate institutional or organization approval. SMS is not implemented and may be added later as optional MFA.
            </p>
            <p className="text-[11px]">
              Frontend role checks are for prototype navigation only. A production service must enforce authorization and maintain authentication event records server-side without recording passwords or OTPs.
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
