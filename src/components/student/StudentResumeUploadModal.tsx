import React, { useState } from 'react';
import { StudentRecord, ExtractedResumeData } from '../../types';
import { resumeParserService } from '../../services/resumeParserService';
import { studentService } from '../../services/studentService';
import {
  Upload,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  X,
  Code2,
  Award,
  Layers,
  GraduationCap,
  RefreshCw,
  Plus
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  student: StudentRecord;
  onClose: () => void;
  onComplete: (updated: StudentRecord) => void;
}

export const StudentResumeUploadModal: React.FC<Props> = ({
  isOpen,
  student,
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState<'upload' | 'scanning' | 'review'>('upload');
  const [resumeText, setResumeText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedResumeData | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('Initializing parser...');

  // Editable review fields
  const [editCgpa, setEditCgpa] = useState<number>(student.CGPA || 0);
  const [editSkills, setEditSkills] = useState<string[]>(student.Technical_Skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [editProjects, setEditProjects] = useState<string[]>(student.Projects || []);
  const [newProjectInput, setNewProjectInput] = useState('');
  const [editCerts, setEditCerts] = useState<string[]>(student.Certifications || []);
  const [newCertInput, setNewCertInput] = useState('');
  const [editLeetcode, setEditLeetcode] = useState<number>(student.Coding_Activity?.leetcodeSolved || 0);
  const [editCodechef, setEditCodechef] = useState<number>(student.Coding_Activity?.codechefSolved || 0);
  const [editAptitude, setEditAptitude] = useState<number>(student.Aptitude_Score || 0);
  const [editCommunication, setEditCommunication] = useState<number>(student.Communication_Score || 0);
  const [editTargetRole, setEditTargetRole] = useState(student.Target_Role || '');

  if (!isOpen) return null;

  const handleProcessText = (text: string, filename: string) => {
    setResumeText(text);
    setUploadedFileName(filename);
    setStep('scanning');
    setScanProgress(15);
    setScanMessage('Ingesting document structure...');

    setTimeout(() => {
      setScanProgress(45);
      setScanMessage('Extracting academic metrics, LeetCode, CodeChef & Aptitude...');
    }, 400);

    setTimeout(() => {
      setScanProgress(75);
      setScanMessage('Detecting verified technical skills & projects...');
    }, 800);

    setTimeout(() => {
      const extracted = resumeParserService.parseResumeText(text, filename);
      setExtractedData(extracted);
      setEditCgpa(extracted.cgpa ?? student.CGPA ?? 0);
      setEditSkills(extracted.technicalSkills || []);
      setEditProjects(extracted.projects || []);
      setEditCerts(extracted.certifications || []);
      setEditLeetcode(extracted.codingProfiles?.leetcodeSolved ?? student.Coding_Activity?.leetcodeSolved ?? 0);
      setEditCodechef(extracted.codingProfiles?.codechefSolved ?? student.Coding_Activity?.codechefSolved ?? 0);
      setEditAptitude(extracted.aptitudeScore ?? student.Aptitude_Score ?? 0);
      setEditCommunication(extracted.communicationScore ?? student.Communication_Score ?? 0);
      setEditTargetRole(extracted.targetRole || student.Target_Role || 'Software Engineer');

      setScanProgress(100);
      setScanMessage('Extraction complete!');
      setStep('review');
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      handleProcessText(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    const sample = resumeParserService.getSampleResumeText();
    handleProcessText(sample, 'Standard_Resume_Template.txt');
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (!editSkills.includes(newSkillInput.trim())) {
      setEditSkills([...editSkills, newSkillInput.trim()]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setEditSkills(editSkills.filter((s) => s !== skill));
  };

  const handleAddProject = () => {
    if (!newProjectInput.trim()) return;
    setEditProjects([...editProjects, newProjectInput.trim()]);
    setNewProjectInput('');
  };

  const handleRemoveProject = (idx: number) => {
    setEditProjects(editProjects.filter((_, i) => i !== idx));
  };

  const handleAddCert = () => {
    if (!newCertInput.trim()) return;
    setEditCerts([...editCerts, newCertInput.trim()]);
    setNewCertInput('');
  };

  const handleRemoveCert = (idx: number) => {
    setEditCerts(editCerts.filter((_, i) => i !== idx));
  };

  const handleApplyToProfile = () => {
    const totalProblems = editLeetcode + editCodechef;
    const updatedRecord: StudentRecord = {
      ...student,
      Full_Name: extractedData?.fullName || student.Full_Name,
      Email: extractedData?.email || student.Email,
      Phone: extractedData?.phone || student.Phone,
      CGPA: editCgpa,
      Attendance_Percentage: student.Attendance_Percentage || 0,
      Backlogs: student.Backlogs || 0,
      Technical_Skills: editSkills,
      Projects: editProjects,
      Certifications: editCerts,
      Internships: extractedData?.internships && extractedData.internships.length > 0 ? extractedData.internships : student.Internships,
      Coding_Activity: {
        platform: 'LeetCode',
        problemsSolved: totalProblems,
        contestRating: extractedData?.codingProfiles?.contestRating || student.Coding_Activity?.contestRating || 0,
        leetcodeSolved: editLeetcode,
        leetcodeRating: extractedData?.codingProfiles?.leetcodeRating || student.Coding_Activity?.leetcodeRating || 0,
        codechefSolved: editCodechef,
        codechefRating: extractedData?.codingProfiles?.codechefRating || student.Coding_Activity?.codechefRating || 0
      },
      Aptitude_Score: editAptitude,
      Communication_Score: editCommunication,
      Target_Role: editTargetRole,
      Bio: extractedData?.bio || student.Bio,
      isProfileCompleted: true,
      ResumeUploaded: true,
      ResumeFileName: uploadedFileName || 'Candidate_Resume.pdf',
      UpdatedAt: new Date().toISOString()
    };

    studentService.updateStudent(updatedRecord);
    onComplete(updatedRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#142024] rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E4ECEA] dark:border-[#1F333A] overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-[#E4ECEA] dark:border-[#1F333A] flex items-center justify-between bg-[#F7FBFB] dark:bg-[#0E171A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] flex items-center justify-center font-bold border border-[#58BDB2]/30 dark:border-[#27665E]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">Resume AI Profile Extraction</h3>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8]">
                Extract LeetCode, CodeChef, Aptitude, Soft Skills, CGPA, and competencies directly from your resume.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9] rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1C2C32] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-[#58BDB2]/50 hover:border-[#58BDB2] rounded-3xl p-8 text-center bg-[#F7FBFB] dark:bg-[#0E171A] hover:bg-[#EAF7F8]/40 dark:hover:bg-[#122D29]/40 transition-colors">
                <input
                  type="file"
                  id="resume-file-input"
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="resume-file-input" className="cursor-pointer space-y-4 block">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#18282D] text-[#58BDB2] mx-auto flex items-center justify-center shadow-xs border border-[#58BDB2]/30 dark:border-[#27665E]">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">
                      Click to choose or drag & drop your resume file
                    </div>
                    <div className="text-xs text-[#687572] dark:text-[#94A3B8]">
                      Accepts PDF, TXT, or DOCX formats
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className="px-4 py-2 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors inline-block">
                      Select Resume Document
                    </span>
                  </div>
                </label>
              </div>

              {/* Paste Text Alternative */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#263238] dark:text-[#F1F5F9]">Or Paste Resume Plain Text Directly</div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste raw resume contents including education, LeetCode/CodeChef solved, technical skills, and projects..."
                  rows={4}
                  className="w-full text-xs p-3 rounded-xl border border-[#E4ECEA] dark:border-[#1F333A] bg-[#F7FBFB] dark:bg-[#0E171A] text-[#263238] dark:text-[#F1F5F9] focus:bg-white dark:focus:bg-[#122024] focus:outline-none focus:border-[#58BDB2]"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-xs text-[#2EA396] dark:text-[#58BDB2] hover:underline font-semibold cursor-pointer"
                  >
                    Paste standard resume template to preview format
                  </button>

                  <button
                    type="button"
                    disabled={!resumeText.trim()}
                    onClick={() => handleProcessText(resumeText, 'Pasted_Resume_Text.txt')}
                    className="px-4 py-2 bg-[#58BDB2] disabled:opacity-50 hover:bg-[#48a99f] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    Process Text
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SCANNING */}
          {step === 'scanning' && (
            <div className="py-12 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EAF7F8] dark:bg-[#122D29] text-[#58BDB2] flex items-center justify-center animate-pulse border border-[#58BDB2]/30 dark:border-[#27665E]">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">Extracting Profile Attributes</h4>
                <p className="text-xs text-[#687572] dark:text-[#94A3B8]">{scanMessage}</p>
              </div>

              <div className="w-64 mx-auto h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#58BDB2] rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & CONFIRM */}
          {step === 'review' && extractedData && (
            <div className="space-y-5 text-xs">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Successfully parsed <strong>{uploadedFileName}</strong>! Please review and modify any information below before saving to your profile.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer shrink-0 ml-2"
                >
                  Re-upload
                </button>
              </div>

              {/* Row 1: Academic & Coding Problem Counts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">Cumulative CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={editCgpa}
                    onChange={(e) => setEditCgpa(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg font-mono font-bold text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">LeetCode Solved</label>
                  <input
                    type="number"
                    min="0"
                    value={editLeetcode}
                    onChange={(e) => setEditLeetcode(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg font-mono font-bold text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">CodeChef Solved</label>
                  <input
                    type="number"
                    min="0"
                    value={editCodechef}
                    onChange={(e) => setEditCodechef(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg font-mono font-bold text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Aptitude, Soft Skills, Target Role */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">Aptitude Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editAptitude}
                    onChange={(e) => setEditAptitude(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg font-mono font-bold text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">Soft Skills / Comm (/10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editCommunication}
                    onChange={(e) => setEditCommunication(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg font-mono font-bold text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">Target Role</label>
                  <input
                    type="text"
                    value={editTargetRole}
                    onChange={(e) => setEditTargetRole(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg font-medium text-[#263238] dark:text-[#F1F5F9] focus:border-[#58BDB2] focus:outline-none"
                  />
                </div>
              </div>

              {/* Technical Skills Extracted */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-[#58BDB2]" />
                    <span>Extracted Technical Skills ({editSkills.length})</span>
                  </span>
                  <span className="text-[11px] text-[#687572] dark:text-[#94A3B8]">Click 'x' to remove</span>
                </div>

                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] max-h-36 overflow-y-auto">
                  {editSkills.map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAF7F8] dark:bg-[#122D29] border border-[#58BDB2]/30 dark:border-[#27665E] text-[#2EA396] dark:text-[#58BDB2] font-semibold text-xs"
                    >
                      <span>{sk}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(sk)}
                        className="hover:text-red-500 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Skill */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Add missing skill (e.g. Docker, PyTorch)..."
                    className="flex-1 px-3 py-1.5 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-lg text-xs focus:bg-white dark:focus:bg-[#122024] focus:outline-none focus:border-[#58BDB2]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 bg-neutral-100 dark:bg-[#1E2E33] hover:bg-neutral-200 dark:hover:bg-[#253940] text-[#263238] dark:text-[#F1F5F9] rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Projects Extracted */}
              <div className="space-y-2">
                <span className="font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Projects ({editProjects.length})</span>
                </span>
                <div className="space-y-1.5">
                  {editProjects.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg flex items-center justify-between text-xs text-[#263238] dark:text-[#F1F5F9]"
                    >
                      <span className="truncate pr-2">{p}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="text-[#687572] dark:text-[#94A3B8] hover:text-red-500 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newProjectInput}
                    onChange={(e) => setNewProjectInput(e.target.value)}
                    placeholder="Add project title & tech stack..."
                    className="flex-1 px-3 py-1.5 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-lg text-xs focus:bg-white dark:focus:bg-[#122024] focus:outline-none focus:border-[#58BDB2]"
                  />
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="px-3 py-1.5 bg-neutral-100 dark:bg-[#1E2E33] hover:bg-neutral-200 dark:hover:bg-[#253940] text-[#263238] dark:text-[#F1F5F9] rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Certifications Extracted */}
              <div className="space-y-2">
                <span className="font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#EA580C]" />
                  <span>Certifications ({editCerts.length})</span>
                </span>
                <div className="space-y-1.5">
                  {editCerts.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg flex items-center justify-between text-xs text-[#263238] dark:text-[#F1F5F9]"
                    >
                      <span className="truncate pr-2">{c}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(idx)}
                        className="text-[#687572] dark:text-[#94A3B8] hover:text-red-500 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newCertInput}
                    onChange={(e) => setNewCertInput(e.target.value)}
                    placeholder="Add certification (e.g. AWS Solutions Architect)..."
                    className="flex-1 px-3 py-1.5 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-lg text-xs focus:bg-white dark:focus:bg-[#122024] focus:outline-none focus:border-[#58BDB2]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCert}
                    className="px-3 py-1.5 bg-neutral-100 dark:bg-[#1E2E33] hover:bg-neutral-200 dark:hover:bg-[#253940] text-[#263238] dark:text-[#F1F5F9] rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#E4ECEA] dark:border-[#1F333A] bg-[#F7FBFB] dark:bg-[#0E171A] flex items-center justify-between transition-colors">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {step === 'review' && (
            <button
              type="button"
              onClick={handleApplyToProfile}
              className="px-5 py-2.5 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Apply All Attributes to Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
