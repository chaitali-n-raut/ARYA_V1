import React from 'react';
import { User, UserRole } from '../../types';
import hero3dImage from '../../assets/images/hero_3d_student_1790307690154.jpg';
import studentTabletImage from '../../assets/images/student_with_tablet_1790307701748.jpg';
import campusLearningImage from '../../assets/images/campus_learning_3d_1790307711187.jpg';
import {
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Target,
  Compass,
  FileSpreadsheet,
  Briefcase,
  BarChart3,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  Building,
  GraduationCap,
  Play,
  Lock
} from 'lucide-react';

interface Props {
  currentUser: User | null;
  onNavigateRole: (role: UserRole) => void;
  onOpenAuth: (mode: 'login' | 'register', defaultRole?: UserRole) => void;
  onOpenResearch: () => void;
}

export const LandingPage: React.FC<Props> = ({
  currentUser,
  onNavigateRole,
  onOpenAuth,
  onOpenResearch
}) => {
  const handleProtectedRoleClick = (role: UserRole) => {
    if (currentUser?.isAuthenticated && currentUser.role === role) {
      onNavigateRole(role);
    } else {
      // Require registration/login for this specific role
      onOpenAuth('login', role);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FBFB] dark:bg-[#0B1215] text-[#263238] dark:text-[#F1F5F9] overflow-x-hidden transition-colors">
      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF7F8] dark:bg-[#133330] border border-[#58BDB2]/30 dark:border-[#27665E] text-xs font-semibold text-[#2EA396] dark:text-[#58BDB2]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Readiness & Youth Analytics AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#263238] dark:text-[#F1F5F9] leading-[1.12]">
              Smarter Learning <br />
              <span className="text-[#58BDB2]">For A Brighter</span> <br />
              Placement Future!
            </h1>

            <p className="text-base sm:text-lg text-[#687572] dark:text-[#94A3B8] max-w-xl leading-relaxed">
              Transform academic performance, coding activity, and hands-on projects into an explainable placement readiness score. Discover skill gaps, unlock personalized roadmaps, and match with top recruiters.
            </p>

            {/* CTAs with authentication requirement */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => handleProtectedRoleClick('student')}
                className="flex items-center gap-2.5 px-6 py-3.5 text-base font-semibold text-white bg-[#58BDB2] hover:bg-[#48a99f] rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                <span>Explore Student Readiness</span>
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleProtectedRoleClick('faculty')}
                className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#263238] dark:text-[#F1F5F9] bg-white dark:bg-[#142024] hover:bg-neutral-50 dark:hover:bg-[#1B2B30] border border-[#E4ECEA] dark:border-[#1F333A] rounded-2xl shadow-xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#58BDB2]" />
                <span>Faculty / Mentor Portal</span>
              </button>
            </div>

            {/* Genuine Platform Architecture Guarantees */}
            <div className="pt-4 flex flex-wrap items-center gap-3 text-xs text-[#687572] dark:text-[#94A3B8]">
              <div className="flex items-center gap-1.5 bg-[#EAF7F8] dark:bg-[#133330] px-3 py-1.5 rounded-xl border border-[#58BDB2]/30 dark:border-[#27665E] text-[#2EA396] dark:text-[#58BDB2] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Explainable XAI Scoring</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white dark:bg-[#142024] px-3 py-1.5 rounded-xl border border-[#E4ECEA] dark:border-[#1F333A] font-medium text-[#263238] dark:text-[#F1F5F9]">
                <FileSpreadsheet className="w-4 h-4 text-[#58BDB2]" />
                <span>Raw Spreadsheets & Resume Extraction</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white dark:bg-[#142024] px-3 py-1.5 rounded-xl border border-[#E4ECEA] dark:border-[#1F333A] font-medium text-[#263238] dark:text-[#F1F5F9]">
                <CheckCircle2 className="w-4 h-4 text-[#58BDB2]" />
                <span>Zero Pre-seeded Fake Data</span>
              </div>
            </div>
          </div>

          {/* Right Hero: 3D Student Illustration with Decorative Elements */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#DDF5F0] via-[#EAF7F8] to-transparent dark:from-[#11312D] dark:via-[#14282E] rounded-3xl blur-2xl -z-10 opacity-70 transform rotate-2 scale-95" />

            <div className="relative w-full max-w-md bg-white/70 dark:bg-[#142024]/80 backdrop-blur-xs p-3 rounded-3xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-lg">
              <img
                src={hero3dImage}
                alt="ARYA AI Student Character 3D Illustration"
                className="w-full h-auto rounded-2xl object-cover shadow-xs"
                referrerPolicy="no-referrer"
              />

              {/* Development note pill ensuring transparency */}
              <div className="mt-2 py-1.5 px-3 bg-[#EAF7F8] dark:bg-[#10272B] rounded-xl flex items-center justify-between text-[11px] text-[#2EA396] dark:text-[#58BDB2] font-medium border border-[#58BDB2]/20 dark:border-[#204E48]">
                <span>Build Your Own Future</span>
                <span className="text-[#687572] dark:text-[#94A3B8]">Official ARYA AI Asset</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- CORE FEATURES GRID ----------------- */}
      <section id="features" className="py-20 px-6 bg-white dark:bg-[#0F171A] border-y border-[#E4ECEA] dark:border-[#1F333A] transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#263238] dark:text-[#F1F5F9]">
              Our Core Features
            </h2>
            <p className="text-sm text-[#687572] dark:text-[#94A3B8] leading-relaxed">
              From academic diagnostic modeling to personalized learning milestones and recruiter matching, ARYA AI connects all stages of the campus placement lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div
              onClick={() => handleProtectedRoleClick('student')}
              className="bg-[#F7FBFB] dark:bg-[#142024] p-8 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] hover:border-[#58BDB2] dark:hover:border-[#58BDB2] transition-all hover:shadow-sm space-y-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#EAF7F8] dark:bg-[#153430] text-[#58BDB2] flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center justify-between">
                <span>Explainable Readiness Score</span>
                <ArrowUpRight className="w-4 h-4 text-[#58BDB2] opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                Evaluates academics, attendance, technical skills, projects, certifications, and coding problem frequency using transparent SHAP/LIME feature contributions.
              </p>
            </div>

            {/* Card 2 (Mint highlighted card) */}
            <div
              onClick={() => handleProtectedRoleClick('student')}
              className="bg-[#DDF5F0]/80 dark:bg-[#133A35]/80 p-8 rounded-2xl border border-[#58BDB2]/40 dark:border-[#256B62] hover:border-[#58BDB2] dark:hover:border-[#58BDB2] transition-all hover:shadow-md space-y-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1A4540] text-[#2EA396] dark:text-[#58BDB2] flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center justify-between">
                <span>Skill-Gap Diagnostics</span>
                <ArrowUpRight className="w-4 h-4 text-[#2EA396] dark:text-[#58BDB2] opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-[#263238]/80 dark:text-[#E2E8F0]/90 leading-relaxed font-medium">
                Compares individual student profiles directly against real industry role competency baselines to identify priority areas for intervention.
              </p>
            </div>

            {/* Card 3 */}
            <div
              onClick={() => handleProtectedRoleClick('student')}
              className="bg-[#F7FBFB] dark:bg-[#142024] p-8 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] hover:border-[#58BDB2] dark:hover:border-[#58BDB2] transition-all hover:shadow-sm space-y-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F0EDFA] dark:bg-[#201D38] text-[#8B5CF6] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center justify-between">
                <span>Personalized Learning Roadmaps</span>
                <ArrowUpRight className="w-4 h-4 text-[#8B5CF6] opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                Step-by-step multi-week milestones detailing target topics, algorithmic exercises, and capstone repository requirements tailored to student gaps.
              </p>
            </div>

            {/* Card 4 */}
            <div
              onClick={() => handleProtectedRoleClick('recruiter')}
              className="bg-[#F7FBFB] dark:bg-[#142024] p-8 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] hover:border-[#58BDB2] dark:hover:border-[#58BDB2] transition-all hover:shadow-sm space-y-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#EAF7F8] dark:bg-[#153430] text-[#58BDB2] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center justify-between">
                <span>Recruiter Candidate Matching</span>
                <ArrowUpRight className="w-4 h-4 text-[#58BDB2] opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                Automated eligibility checking against CGPA cutoffs, backlog limitations, and branch criteria with 2-stage role competency scoring.
              </p>
            </div>

            {/* Card 5 */}
            <div
              onClick={() => handleProtectedRoleClick('faculty')}
              className="bg-[#F7FBFB] dark:bg-[#142024] p-8 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] hover:border-[#58BDB2] dark:hover:border-[#58BDB2] transition-all hover:shadow-sm space-y-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F8EDE7] dark:bg-[#332018] text-[#EA580C] flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center justify-between">
                <span>Faculty Spreadsheet Ingestion</span>
                <ArrowUpRight className="w-4 h-4 text-[#EA580C] opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                Enables mentors and class teachers to upload institutional CSV/XLSX spreadsheets with full record validation, error logs, and duplicate detection.
              </p>
            </div>

            {/* Card 6 */}
            <div
              onClick={() => handleProtectedRoleClick('admin')}
              className="bg-[#F7FBFB] dark:bg-[#142024] p-8 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] hover:border-[#58BDB2] dark:hover:border-[#58BDB2] transition-all hover:shadow-sm space-y-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#EAF7F8] dark:bg-[#153430] text-[#58BDB2] flex items-center justify-center group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center justify-between">
                <span>University & T&P Analytics</span>
                <ArrowUpRight className="w-4 h-4 text-[#58BDB2] opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                Departmental cohort intelligence, recruiter conversion metrics, and NAAC/NBA accreditation readiness reporting for HODs and leadership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- WHY CHOOSE ARYA AI? ----------------- */}
      <section id="why-choose" className="py-20 px-6 bg-[#DDF5F0]/30 dark:bg-[#102326]/40 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 4 Cards */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#263238] dark:text-[#F1F5F9] mb-3">
                  Why Academic Institutions Choose ARYA AI?
                </h2>
                <p className="text-sm text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                  Unlike traditional ERPs that merely store grades, ARYA AI activates student academic and practical data to forecast placement success and provide early intervention.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">
                    <CheckCircle2 className="w-4 h-4 text-[#58BDB2]" />
                    <span>Explainable AI (XAI)</span>
                  </div>
                  <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                    Clear SHAP and LIME-style explanations show why a student received a score and what actions will increase it.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">
                    <CheckCircle2 className="w-4 h-4 text-[#58BDB2]" />
                    <span>Spreadsheet Compatible</span>
                  </div>
                  <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                    Faculty mentors can continue using existing CSV/Excel workflows with instant column parsing and automated error reports.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">
                    <CheckCircle2 className="w-4 h-4 text-[#58BDB2]" />
                    <span>Proactive Early Intervention</span>
                  </div>
                  <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                    Flags students with low attendance or backlogs in 3rd year before final placement drives commence.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">
                    <CheckCircle2 className="w-4 h-4 text-[#58BDB2]" />
                    <span>2-Stage Recruiter Match</span>
                  </div>
                  <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                    Applies hard eligibility cutoffs first, then intelligently ranks verified candidates by role competency fit.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Character Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm bg-white dark:bg-[#142024] p-3 rounded-3xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-md">
                <img
                  src={studentTabletImage}
                  alt="Student using tablet with ARYA AI"
                  className="w-full h-auto rounded-2xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="p-3 text-center">
                  <h4 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">Interactive Student Portal</h4>
                  <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-0.5">Empowering every undergraduate with personal career intelligence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- ABOUT & VISION SECTION ----------------- */}
      <section id="how-it-works" className="py-20 px-6 bg-white dark:bg-[#0B1215] border-t border-[#E4ECEA] dark:border-[#1F333A] transition-colors">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Main Container with Mint Background */}
          <div className="bg-[#DDF5F0]/60 dark:bg-[#133531]/70 p-8 sm:p-12 rounded-3xl border border-[#58BDB2]/30 dark:border-[#27665E] space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-block px-3 py-1 bg-white dark:bg-[#142024] text-[#263238] dark:text-[#F1F5F9] rounded-full text-xs font-bold border border-[#E4ECEA] dark:border-[#1F333A]">
                  About ARYA AI
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#263238] dark:text-[#F1F5F9]">
                  Empowering Students For A Brighter Placement Future!
                </h2>

                <p className="text-xs sm:text-sm text-[#263238]/80 dark:text-[#E2E8F0]/85 leading-relaxed font-normal">
                  ARYA AI is an academic intelligence platform designed to help university students prepare smarter for campus placements and technical hiring exams. By unifying academic grades, coding platform metrics, certifications, and mentor notes into a central model, ARYA AI eliminates guesswork from career planning.
                </p>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleProtectedRoleClick('student')}
                    className="px-5 py-2.5 bg-[#58BDB2] text-white rounded-xl text-xs font-semibold hover:bg-[#48a99f] transition-colors cursor-pointer shadow-xs"
                  >
                    Open Student Portal
                  </button>

                  <button
                    onClick={onOpenResearch}
                    className="px-5 py-2.5 bg-white dark:bg-[#142024] text-[#263238] dark:text-[#F1F5F9] rounded-xl text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-[#1B2B30] border border-[#E4ECEA] dark:border-[#1F333A] transition-colors cursor-pointer"
                  >
                    Academic Research Details
                  </button>
                </div>
              </div>

              {/* Graphic / Media Preview */}
              <div className="lg:col-span-5 relative">
                <div className="rounded-2xl overflow-hidden shadow-md border border-white dark:border-[#22353B]">
                  <img
                    src={campusLearningImage}
                    alt="Campus study environment"
                    className="w-full h-48 sm:h-56 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="bg-white dark:bg-[#142024] p-3 flex items-center justify-between text-xs text-[#263238] dark:text-[#F1F5F9]">
                    <span className="font-semibold">Interactive Platform Overview</span>
                    <span className="text-[#58BDB2] font-medium flex items-center gap-1">
                      <Play className="w-3.5 h-3.5 fill-current" /> Interactive Overview
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 2 Mission & Vision Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-2">
                <h4 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">Our Mission</h4>
                <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                  Provide transparent, data-driven career diagnostic resources to every university student, ensuring equal visibility and personalized growth roadmaps regardless of branch or initial background.
                </p>
              </div>

              <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-2">
                <h4 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">Our Vision</h4>
                <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                  Build a smarter, more confident generation of engineering and technology graduates by bridging the communication gap between universities, students, mentors, and corporate recruiters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- RESEARCH, XAI & TRUST SECTION ----------------- */}
      <section id="research" className="py-16 px-6 bg-[#F7FBFB] dark:bg-[#0F171A] border-t border-[#E4ECEA] dark:border-[#1F333A] transition-colors">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#58BDB2]">
              <ShieldCheck className="w-4 h-4" />
              <span>Academic Integrity & Research Foundation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#263238] dark:text-[#F1F5F9]">
              Explainable AI & Machine Learning Pipeline
            </h2>
            <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
              Designed as a final-year B.Tech engineering capstone project. In accordance with honest empirical guidelines, full real-world validation on held-out institutional cohorts is ongoing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] space-y-3">
              <span className="text-xs font-semibold text-[#58BDB2]">Phase 1: Feature Extraction</span>
              <h4 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">Standardized Student Schema</h4>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                Aggregates 22 attributes across academic metrics (CGPA, backlogs), coding frequency (LeetCode, HackerRank), certifications, project deliverables, and soft skills.
              </p>
            </div>

            <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] space-y-3">
              <span className="text-xs font-semibold text-[#58BDB2]">Phase 2: Supervised Ensembles</span>
              <h4 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">Planned ML Architecture</h4>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                Evaluates Gradient Boosting, XGBoost, Random Forest, and LightGBM for binary and multi-tier placement probability classification.
              </p>
            </div>

            <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] space-y-3">
              <span className="text-xs font-semibold text-[#58BDB2]">Phase 3: Explainability</span>
              <h4 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">SHAP & LIME Insights</h4>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
                Transforms opaque model predictions into interpretable local feature contributions so students understand exactly why their score increased or decreased.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onOpenResearch}
              className="text-xs font-semibold text-[#58BDB2] hover:text-[#48a99f] underline underline-offset-4 cursor-pointer"
            >
              Read Full Research Methodology & Technical Whitepaper Notes &rarr;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
