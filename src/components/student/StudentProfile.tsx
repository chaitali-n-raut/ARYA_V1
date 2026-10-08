import React, { useState } from 'react';
import { StudentRecord } from '../../types';
import { studentService } from '../../services/studentService';
import { StudentResumeUploadModal } from './StudentResumeUploadModal';
import {
  User,
  GraduationCap,
  Code2,
  Award,
  Briefcase,
  Layers,
  Save,
  Plus,
  X,
  CheckCircle,
  MessageSquare,
  Upload,
  Sparkles,
  Target,
  BrainCircuit,
  FileText
} from 'lucide-react';

interface Props {
  student: StudentRecord;
  registeredName: string;
  onUpdateSuccess: () => void;
}

export const StudentProfile: React.FC<Props> = ({ student, registeredName, onUpdateSuccess }) => {
  const [formData, setFormData] = useState<StudentRecord>({
    ...student,
    Full_Name: registeredName.trim() || student.Full_Name
  });
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newInternship, setNewInternship] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  // Sync with prop when student updates
  React.useEffect(() => {
    setFormData({
      ...student,
      Full_Name: registeredName.trim() || student.Full_Name
    });
  }, [student, registeredName]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const lcSolved = formData.Coding_Activity?.leetcodeSolved ?? 0;
    const ccSolved = formData.Coding_Activity?.codechefSolved ?? 0;
    const totalProblems = lcSolved + ccSolved;

    const updatedRecord: StudentRecord = {
      ...formData,
      Coding_Activity: {
        ...formData.Coding_Activity,
        problemsSolved: totalProblems,
        leetcodeSolved: lcSolved,
        codechefSolved: ccSolved
      },
      isProfileCompleted: true,
      UpdatedAt: new Date().toISOString()
    };
    studentService.updateStudent(updatedRecord);
    setSaveStatus('Profile updated successfully!');
    onUpdateSuccess();
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (formData.Technical_Skills.includes(newSkill.trim())) return;
    setFormData({
      ...formData,
      Technical_Skills: [...formData.Technical_Skills, newSkill.trim()]
    });
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      Technical_Skills: formData.Technical_Skills.filter((s) => s !== skill)
    });
  };

  const handleAddCert = () => {
    if (!newCert.trim()) return;
    setFormData({
      ...formData,
      Certifications: [...formData.Certifications, newCert.trim()]
    });
    setNewCert('');
  };

  const handleRemoveCert = (cert: string) => {
    setFormData({
      ...formData,
      Certifications: formData.Certifications.filter((c) => c !== cert)
    });
  };

  const handleAddProject = () => {
    if (!newProject.trim()) return;
    setFormData({
      ...formData,
      Projects: [...formData.Projects, newProject.trim()]
    });
    setNewProject('');
  };

  const handleRemoveProject = (project: string) => {
    setFormData({
      ...formData,
      Projects: formData.Projects.filter((p) => p !== project)
    });
  };

  const handleAddInternship = () => {
    if (!newInternship.trim()) return;
    setFormData({
      ...formData,
      Internships: [...(formData.Internships || []), newInternship.trim()]
    });
    setNewInternship('');
  };

  const handleRemoveInternship = (internship: string) => {
    setFormData({
      ...formData,
      Internships: (formData.Internships || []).filter((i) => i !== internship)
    });
  };

  const lcCount = formData.Coding_Activity?.leetcodeSolved ?? 0;
  const ccCount = formData.Coding_Activity?.codechefSolved ?? 0;
  const totalSolved = lcCount + ccCount;

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
            <span>Update Student Profile</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#EAF7F8] dark:bg-[#153430] text-[#2EA396] dark:text-[#58BDB2] font-semibold border border-[#58BDB2]/20 dark:border-[#27665E]">
              {formData.Student_ID}
            </span>
          </h2>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8]">
            Enter your LeetCode & CodeChef problems solved, Aptitude, Soft skills, and academics, or upload your resume to autofill everything.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="text-xs text-[#2EA396] dark:text-[#58BDB2] font-semibold flex items-center gap-1 bg-[#EAF7F8] dark:bg-[#153430] px-3 py-1.5 rounded-lg border border-[#58BDB2]/30 dark:border-[#27665E]">
              <CheckCircle className="w-3.5 h-3.5" />
              {saveStatus}
            </span>
          )}

          <button
            type="button"
            onClick={() => setResumeModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#EAF7F8] dark:bg-[#142A2D] hover:bg-[#DDF5F0] dark:hover:bg-[#1A383C] text-[#2EA396] dark:text-[#58BDB2] border border-[#58BDB2]/30 dark:border-[#27665E] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Autofill from Resume</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      {/* Resume Ingestion Callout Banner */}
      <div className="bg-gradient-to-r from-[#EAF7F8] via-white to-[#DDF5F0]/60 dark:from-[#11312D] dark:via-[#142226] dark:to-[#0F1E22] p-5 rounded-2xl border border-[#58BDB2]/30 dark:border-[#27665E] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#16272C] border border-[#58BDB2]/30 dark:border-[#27665E] flex items-center justify-center text-[#58BDB2] shrink-0 shadow-2xs">
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-[#263238] dark:text-[#F1F5F9]">Instant Autofill with Resume AI</h3>
            <p className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
              Have an updated resume? Upload it to automatically extract LeetCode, CodeChef, Aptitude, Soft skills, and skills in seconds.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setResumeModalOpen(true)}
          className="px-4 py-2 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Resume Now</span>
        </button>
      </div>

      {/* SECTION 1: Academic & Institutional Information */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-2">
          <GraduationCap className="w-4 h-4 text-[#58BDB2]" />
          <span>Academic & Institutional Credentials</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">Student ID (Immutable)</label>
            <input
              type="text"
              readOnly
              value={formData.Student_ID}
              className="w-full bg-[#F7FBFB] dark:bg-[#0D1518] px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#1F333A] font-mono font-semibold text-[#263238] dark:text-[#F1F5F9] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">Full Legal Name</label>
            <input
              type="text"
              readOnly
              value={registeredName.trim() || formData.Full_Name}
              className="w-full bg-[#F7FBFB] dark:bg-[#0D1518] px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] text-[#263238] dark:text-[#F1F5F9] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">Registered Email</label>
            <input
              type="email"
              value={formData.Email}
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
              className="w-full bg-white dark:bg-[#0D1518] px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.Phone}
              onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
              placeholder="+91 99887 76655"
              className="w-full bg-white dark:bg-[#0D1518] px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">Cumulative GPA (CGPA) (0 - 10.0)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={formData.CGPA}
              onChange={(e) => setFormData({ ...formData, CGPA: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white dark:bg-[#0D1518] px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] font-mono font-bold text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">Active Backlogs</label>
            <input
              type="number"
              min="0"
              value={formData.Backlogs}
              onChange={(e) => setFormData({ ...formData, Backlogs: parseInt(e.target.value, 10) || 0 })}
              className={`w-full bg-white dark:bg-[#0D1518] px-3 py-2 rounded-lg border font-mono font-bold focus:outline-none ${
                formData.Backlogs > 0 ? 'border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50/30 dark:bg-red-950/20' : 'border-[#E4ECEA] dark:border-[#22353B] text-[#263238] dark:text-[#F1F5F9]'
              }`}
            />
          </div>

          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">Attendance Rate (%) (0 - 100)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.Attendance_Percentage}
              onChange={(e) => setFormData({ ...formData, Attendance_Percentage: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white dark:bg-[#0D1518] px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] font-mono text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">Graduation Year</label>
            <input
              type="number"
              value={formData.Graduation_Year}
              onChange={(e) => setFormData({ ...formData, Graduation_Year: parseInt(e.target.value, 10) || 2026 })}
              className="w-full bg-white dark:bg-[#0D1518] px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] text-[#263238] dark:text-[#F1F5F9]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Algorithmic Coding Activity (LeetCode & CodeChef) */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-[#E4ECEA] dark:border-[#1F333A] pb-2">
          <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#58BDB2]" />
            <span>Algorithmic Coding Activity (LeetCode & CodeChef)</span>
          </h3>
          <span className="text-xs font-mono font-bold text-[#2EA396] dark:text-[#58BDB2] bg-[#EAF7F8] dark:bg-[#153430] px-2.5 py-0.5 rounded-full border border-[#58BDB2]/30 dark:border-[#27665E]">
            Total Solved: {totalSolved}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">LeetCode Problems Solved</label>
            <input
              type="number"
              min="0"
              value={formData.Coding_Activity?.leetcodeSolved ?? 0}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 0;
                setFormData({
                  ...formData,
                  Coding_Activity: {
                    ...formData.Coding_Activity,
                    leetcodeSolved: val,
                    problemsSolved: val + (formData.Coding_Activity?.codechefSolved ?? 0)
                  }
                });
              }}
              className="w-full bg-white dark:bg-[#0D1518] px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] font-mono font-bold text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">LeetCode Contest Rating</label>
            <input
              type="number"
              min="0"
              value={formData.Coding_Activity?.leetcodeRating ?? 0}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 0;
                setFormData({
                  ...formData,
                  Coding_Activity: {
                    ...formData.Coding_Activity,
                    leetcodeRating: val
                  }
                });
              }}
              placeholder="0 (e.g. 1650)"
              className="w-full bg-white dark:bg-[#0D1518] px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] font-mono text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">CodeChef Problems Solved</label>
            <input
              type="number"
              min="0"
              value={formData.Coding_Activity?.codechefSolved ?? 0}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 0;
                setFormData({
                  ...formData,
                  Coding_Activity: {
                    ...formData.Coding_Activity,
                    codechefSolved: val,
                    problemsSolved: val + (formData.Coding_Activity?.leetcodeSolved ?? 0)
                  }
                });
              }}
              className="w-full bg-white dark:bg-[#0D1518] px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] font-mono font-bold text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">CodeChef Contest Rating</label>
            <input
              type="number"
              min="0"
              value={formData.Coding_Activity?.codechefRating ?? 0}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 0;
                setFormData({
                  ...formData,
                  Coding_Activity: {
                    ...formData.Coding_Activity,
                    codechefRating: val
                  }
                });
              }}
              placeholder="0 (e.g. 1580)"
              className="w-full bg-white dark:bg-[#0D1518] px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] font-mono text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Aptitude & Soft Skills / Communication */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-2">
          <BrainCircuit className="w-4 h-4 text-[#8B5CF6]" />
          <span>Quantitative Aptitude & Behavioral Soft Skills</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">
              Aptitude Test Score (%) (0 - 100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.Aptitude_Score}
              onChange={(e) => setFormData({ ...formData, Aptitude_Score: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-white dark:bg-[#0D1518] px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] font-mono font-bold text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
            />
            <span className="text-[10px] text-[#687572] dark:text-[#94A3B8] mt-0.5 block">
              Default is 0 until test evaluated or updated
            </span>
          </div>

          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">
              Soft Skills / Communication Score (/10.0)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={formData.Communication_Score}
              onChange={(e) => setFormData({ ...formData, Communication_Score: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white dark:bg-[#0D1518] px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] font-mono font-bold text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
            />
            <span className="text-[10px] text-[#687572] dark:text-[#94A3B8] mt-0.5 block">
              Default is 0 until mentor interview evaluated
            </span>
          </div>

          <div>
            <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">Target Placement Role</label>
            <input
              type="text"
              value={formData.Target_Role || ''}
              onChange={(e) => setFormData({ ...formData, Target_Role: e.target.value })}
              placeholder="e.g. Software Engineer, Full Stack, Data Scientist"
              className="w-full bg-white dark:bg-[#0D1518] px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Technical Skills Inventory */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-[#E4ECEA] dark:border-[#1F333A] pb-2">
          <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#58BDB2]" />
            <span>Technical Skills Inventory</span>
          </h3>
          <span className="text-xs text-[#687572] dark:text-[#94A3B8]">{formData.Technical_Skills.length} Verified Competencies</span>
        </div>

        {/* Existing skill tags */}
        <div className="flex flex-wrap gap-2">
          {formData.Technical_Skills.length === 0 ? (
            <span className="text-xs text-[#687572] dark:text-[#94A3B8] italic">
              No technical skills entered yet. Add skills below or upload your resume.
            </span>
          ) : (
            formData.Technical_Skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF7F8] dark:bg-[#153430] border border-[#58BDB2]/30 dark:border-[#27665E] text-xs font-semibold text-[#2EA396] dark:text-[#58BDB2]"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Add Skill Input */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
              }
            }}
            placeholder="Add new skill (e.g. Docker, GraphQL, PyTorch, Kubernetes, React, Python)..."
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] bg-[#F7FBFB] dark:bg-[#0D1518] text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-3.5 py-2 bg-white dark:bg-[#1A2E33] border border-[#58BDB2] text-[#2EA396] dark:text-[#58BDB2] hover:bg-[#EAF7F8] dark:hover:bg-[#1F3D43] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {/* SECTION 5: Projects & Certifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Projects */}
        <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
          <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-2">
            <Layers className="w-4 h-4 text-[#8B5CF6]" />
            <span>Demonstrated Projects ({formData.Projects?.length || 0})</span>
          </h3>

          <div className="space-y-2">
            {(formData.Projects || []).length === 0 ? (
              <div className="text-xs text-[#687572] dark:text-[#94A3B8] italic">No projects registered yet.</div>
            ) : (
              formData.Projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#F7FBFB] dark:bg-[#0D1518] border border-[#E4ECEA] dark:border-[#1F333A] flex items-center justify-between text-xs text-[#263238] dark:text-[#F1F5F9]"
                >
                  <span className="truncate pr-2">{proj}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(proj)}
                    className="text-[#687572] dark:text-[#94A3B8] hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              placeholder="Add project title & tech stack..."
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] bg-[#F7FBFB] dark:bg-[#0D1518] text-[#263238] dark:text-[#F1F5F9] focus:outline-none focus:border-[#58BDB2]"
            />
            <button
              type="button"
              onClick={handleAddProject}
              className="px-3 py-2 bg-neutral-100 dark:bg-[#1A2E33] hover:bg-neutral-200 dark:hover:bg-[#233F46] text-[#263238] dark:text-[#F1F5F9] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
          <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-2">
            <Award className="w-4 h-4 text-[#EA580C]" />
            <span>Industry Certifications ({formData.Certifications?.length || 0})</span>
          </h3>

          <div className="space-y-2">
            {(formData.Certifications || []).length === 0 ? (
              <div className="text-xs text-[#687572] dark:text-[#94A3B8] italic">No certifications registered yet.</div>
            ) : (
              formData.Certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#F7FBFB] dark:bg-[#0D1518] border border-[#E4ECEA] dark:border-[#1F333A] flex items-center justify-between text-xs text-[#263238] dark:text-[#F1F5F9]"
                >
                  <span className="truncate pr-2">{cert}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCert(cert)}
                    className="text-[#687572] dark:text-[#94A3B8] hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newCert}
              onChange={(e) => setNewCert(e.target.value)}
              placeholder="Add credential (e.g. AWS Solutions Architect)..."
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] bg-[#F7FBFB] dark:bg-[#0D1518] text-[#263238] dark:text-[#F1F5F9] focus:outline-none focus:border-[#58BDB2]"
            />
            <button
              type="button"
              onClick={handleAddCert}
              className="px-3 py-2 bg-neutral-100 dark:bg-[#1A2E33] hover:bg-neutral-200 dark:hover:bg-[#233F46] text-[#263238] dark:text-[#F1F5F9] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 6: Internships & Work Experience */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-2">
          <Briefcase className="w-4 h-4 text-[#58BDB2]" />
          <span>Internships & Professional Experience ({formData.Internships?.length || 0})</span>
        </h3>

        <div className="space-y-2">
          {(formData.Internships || []).length === 0 ? (
            <div className="text-xs text-[#687572] dark:text-[#94A3B8] italic">No internships added yet.</div>
          ) : (
            formData.Internships.map((intern, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#F7FBFB] dark:bg-[#0D1518] border border-[#E4ECEA] dark:border-[#1F333A] flex items-center justify-between text-xs text-[#263238] dark:text-[#F1F5F9]"
              >
                <span>{intern}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveInternship(intern)}
                  className="text-[#687572] dark:text-[#94A3B8] hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={newInternship}
            onChange={(e) => setNewInternship(e.target.value)}
            placeholder="Add internship (e.g. Software Intern @ Acme Corp - 3 months)..."
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#E4ECEA] dark:border-[#22353B] bg-[#F7FBFB] dark:bg-[#0D1518] text-[#263238] dark:text-[#F1F5F9] focus:outline-none focus:border-[#58BDB2]"
          />
          <button
            type="button"
            onClick={handleAddInternship}
            className="px-3.5 py-2 bg-white dark:bg-[#1A2E33] border border-[#58BDB2] text-[#2EA396] dark:text-[#58BDB2] hover:bg-[#EAF7F8] dark:hover:bg-[#1F3D43] rounded-lg text-xs font-semibold cursor-pointer"
          >
            Add Internship
          </button>
        </div>
      </div>

      {/* Bottom Save Action */}
      <div className="p-4 bg-white dark:bg-[#142024] rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex items-center justify-between transition-colors">
        <div className="text-xs text-[#687572] dark:text-[#94A3B8]">
          All modifications update your live institutional placement readiness profile.
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-6 py-2.5 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile Changes</span>
        </button>
      </div>

      <StudentResumeUploadModal
        isOpen={resumeModalOpen}
        student={student}
        onClose={() => setResumeModalOpen(false)}
        onComplete={(updated) => {
          setFormData(updated);
          onUpdateSuccess();
        }}
      />
    </form>
  );
};
