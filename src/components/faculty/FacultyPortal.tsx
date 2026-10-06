import React, { useState } from 'react';
import { User, StudentRecord, ImportPreviewRow, ImportSummary } from '../../types';
import { studentService } from '../../services/studentService';
import { csvParserService } from '../../services/csvParserService';
import { readinessService } from '../../services/readinessService';
import {
  Users,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Eye,
  Plus,
  RefreshCw,
  X,
  FileDown
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const FacultyPortal: React.FC<Props> = ({ currentUser }) => {
  const [students, setStudents] = useState<StudentRecord[]>(studentService.getAllStudents());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [backlogFilter, setBacklogFilter] = useState<'all' | 'zero' | 'active'>('all');
  
  // Default to 'import' so faculty can first upload spreadsheet
  const [activeTab, setActiveTab] = useState<'import' | 'roster'>('import');

  // Selected student for detail view / mentoring modal
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [newMentorNote, setNewMentorNote] = useState('');
  const [noteSuccess, setNoteSuccess] = useState(false);

  // Import state
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [importCompleted, setImportCompleted] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Filtering logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.Full_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.Student_ID.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.Email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = selectedBranch === 'all' || s.Branch === selectedBranch;
    const matchesSection = selectedSection === 'all' || s.Section === selectedSection;
    const matchesBacklog =
      backlogFilter === 'all'
        ? true
        : backlogFilter === 'zero'
        ? s.Backlogs === 0
        : s.Backlogs > 0;

    return matchesSearch && matchesBranch && matchesSection && matchesBacklog;
  });

  // Download template
  const handleDownloadCsvTemplate = () => {
    const csv = csvParserService.generateCsvTemplate();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'ARYA_AI_Student_Cohort_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload and parse CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportCompleted(false);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      setCsvContent(text);

      const existingStudents = studentService.getAllStudents();
      const { summary, previewRows } = csvParserService.parseAndValidateCsv(text, existingStudents);

      setImportSummary(summary);
      setPreviewRows(previewRows);
    };

    reader.onerror = () => {
      setImportError('Failed to read local file. Please try again.');
    };

    reader.readAsText(file);
  };

  // Execute import
  const handleExecuteImport = () => {
    if (!previewRows || previewRows.length === 0) return;

    try {
      const validRecords = previewRows
        .filter((r) => r.status !== 'error' && r.rawRecord && r.rawRecord.Student_ID)
        .map((r) => r.rawRecord as StudentRecord);

      const result = studentService.importStudents(validRecords);

      // Refresh local state
      setStudents(studentService.getAllStudents());
      setImportCompleted(true);

      if (importSummary) {
        setImportSummary({
          ...importSummary,
          importedCount: result.added + result.updated
        });
      }
    } catch (err: any) {
      setImportError(err.message || 'An error occurred during student import.');
    }
  };

  // Download error log
  const handleDownloadErrorReport = () => {
    if (!importSummary) return;
    const errorRows = previewRows.filter((r) => r.status === 'error');
    const report = csvParserService.generateErrorReportCsv(errorRows);
    const blob = new Blob([report], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Import_Validation_Errors_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add mentoring advisory note
  const handleAddNote = () => {
    if (!selectedStudent || !newMentorNote.trim()) return;

    studentService.addMentoringNote(selectedStudent.Student_ID, newMentorNote.trim());
    const updated = studentService.getStudentById(selectedStudent.Student_ID);
    if (updated) {
      setSelectedStudent(updated);
      setStudents(studentService.getAllStudents());
    }

    setNewMentorNote('');
    setNoteSuccess(true);
    setTimeout(() => setNoteSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 transition-colors">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">Faculty & Mentor Workspace</h1>
            <span className="text-[11px] font-semibold bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] px-2.5 py-0.5 rounded-full border border-[#58BDB2]/30 dark:border-[#27665E]">
              Department of CSE
            </span>
          </div>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-1">
            Logged in as <strong className="text-[#263238] dark:text-[#F1F5F9]">{currentUser.name}</strong> · Monitoring assigned mentees and batch readiness.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'import'
                ? 'bg-[#58BDB2] text-white shadow-xs font-bold'
                : 'text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>1. Upload Student Spreadsheet (CSV / Excel)</span>
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-[#58BDB2] text-white shadow-xs font-bold'
                : 'text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2. Student Roster ({students.length})</span>
          </button>
        </div>
      </div>

      {/* ---------------- TAB 1: ROSTER VIEW ---------------- */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-[#142024] p-4 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs transition-colors">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-[#687572] dark:text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, ID (e.g. STU-2026-001), or email..."
                className="w-full bg-transparent focus:outline-none text-[#263238] dark:text-[#F1F5F9] placeholder:text-[#687572] dark:placeholder:text-[#94A3B8]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="px-2.5 py-1.5 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg text-xs text-[#263238] dark:text-[#F1F5F9] focus:outline-none"
              >
                <option value="all">All Branches</option>
                <option value="Computer Science & Engineering">CSE</option>
                <option value="Data Science & AI">Data Science & AI</option>
                <option value="Information Technology">IT</option>
                <option value="Cybersecurity & Networks">Cybersecurity</option>
              </select>

              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="px-2.5 py-1.5 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg text-xs text-[#263238] dark:text-[#F1F5F9] focus:outline-none"
              >
                <option value="all">All Sections</option>
                <option value="CSE-A">CSE-A</option>
                <option value="CSE-B">CSE-B</option>
                <option value="DS-B">DS-B</option>
                <option value="IT-A">IT-A</option>
              </select>

              <select
                value={backlogFilter}
                onChange={(e) => setBacklogFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg text-xs text-[#263238] dark:text-[#F1F5F9] focus:outline-none"
              >
                <option value="all">All Backlog Statuses</option>
                <option value="zero">0 Backlogs (Placement Clear)</option>
                <option value="active">Active Backlogs (Intervention)</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white dark:bg-[#142024] rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7FBFB] dark:bg-[#0E171A] border-b border-[#E4ECEA] dark:border-[#1F333A] text-[#687572] dark:text-[#94A3B8] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Student ID & Name</th>
                    <th className="py-3 px-4">Branch & Section</th>
                    <th className="py-3 px-4 text-center">CGPA</th>
                    <th className="py-3 px-4 text-center">Attendance</th>
                    <th className="py-3 px-4 text-center">Backlogs</th>
                    <th className="py-3 px-4 text-center">Readiness Tier</th>
                    <th className="py-3 px-4 text-center">DSA Solved</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4ECEA] dark:divide-[#1F333A]">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#687572] dark:text-[#94A3B8]">
                        No student records match the active search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((stu) => {
                      const readiness = readinessService.evaluateStudentReadiness(stu);
                      return (
                        <tr key={stu.Student_ID} className="hover:bg-[#F7FBFB] dark:hover:bg-[#18262B] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#263238] dark:text-[#F1F5F9]">{stu.Full_Name}</div>
                            <div className="text-[11px] font-mono text-[#687572] dark:text-[#94A3B8]">{stu.Student_ID}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-[#263238] dark:text-[#F1F5F9]">{stu.Branch}</div>
                            <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">Section: {stu.Section}</div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-[#263238] dark:text-[#F1F5F9]">
                            {stu.CGPA.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-[#263238] dark:text-[#F1F5F9]">
                            {stu.Attendance_Percentage}%
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            <span
                              className={`px-2 py-0.5 rounded font-bold ${
                                stu.Backlogs > 0
                                  ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60'
                                  : 'text-emerald-700 dark:text-emerald-400'
                              }`}
                            >
                              {stu.Backlogs}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                readiness.tier === 'High Placement Readiness'
                                  ? 'bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] border border-[#58BDB2]/30 dark:border-[#27665E]'
                                  : readiness.tier === 'Critical Intervention'
                                  ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60'
                                  : 'bg-amber-50 dark:bg-[#251A0E] text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-[#4B3518]'
                              }`}
                            >
                              {readiness.tier} ({readiness.overallScore}%)
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-[#263238] dark:text-[#F1F5F9]">
                            {stu.Coding_Activity.problemsSolved}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedStudent(stu)}
                              className="px-3 py-1.5 bg-[#EAF7F8] dark:bg-[#122D29] hover:bg-[#DDF5F0] dark:hover:bg-[#1A3D37] text-[#2EA396] dark:text-[#58BDB2] font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              Profile & Notes
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 2: SPREADSHEET INGESTION (CSV/XLSX) ---------------- */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Guide & Template download */}
          <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#58BDB2]" />
                  <span>Institutional Student Record Ingestion</span>
                </h3>
                <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-0.5">
                  Import institutional CSV or XLSX spreadsheets directly into the central ARYA AI repository.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCsvTemplate}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#16272C] text-[#2EA396] dark:text-[#58BDB2] border border-[#58BDB2]/60 hover:bg-[#EAF7F8] dark:hover:bg-[#1E3B37] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV Template</span>
                </button>
              </div>
            </div>

            {/* Ingestion Rules & Required Columns */}
            <div className="p-4 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A] text-xs space-y-2">
              <div className="font-bold text-[#263238] dark:text-[#F1F5F9]">Mandatory Columns & Validation Criteria:</div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[#687572] dark:text-[#94A3B8] text-[11px]">
                <li>• <strong>Student_ID</strong>: Required primary unique key (e.g. STU-2026-001).</li>
                <li>• <strong>Full_Name, Email</strong>: Valid institutional name and RFC 5322 email.</li>
                <li>• <strong>CGPA, Attendance</strong>: CGPA (0.0 to 10.0), Attendance (0 to 100%).</li>
                <li>• <strong>Backlogs</strong>: Non-negative integer (0, 1, 2...).</li>
                <li>• <strong>Technical_Skills, Certifications, Projects</strong>: Semicolon-separated values.</li>
              </ul>
            </div>

            {/* Upload Box */}
            <div className="border-2 border-dashed border-[#58BDB2]/40 rounded-2xl p-8 text-center bg-[#F7FBFB] dark:bg-[#0E171A] hover:bg-[#EAF7F8]/20 dark:hover:bg-[#122D29]/20 transition-colors">
              <Upload className="w-10 h-10 text-[#58BDB2] mx-auto mb-2 opacity-80" />
              <div className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">Select or drop your spreadsheet</div>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-1 mb-4">
                Accepts comma-separated (.csv) files formatted according to the ARYA AI template.
              </p>
              <label className="inline-block px-5 py-2.5 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                <span>Browse Local File</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {fileName && (
                <div className="mt-3 text-xs font-mono font-semibold text-[#2EA396] dark:text-[#58BDB2]">
                  Uploaded: {fileName}
                </div>
              )}
            </div>

            {importError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>{importError}</span>
              </div>
            )}
          </div>

          {/* Validation Preview & Summary */}
          {importSummary && (
            <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">Pre-Import Validation Summary</h3>
                  <p className="text-xs text-[#687572] dark:text-[#94A3B8]">
                    Verify statuses before writing records to the persistent university database.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {importSummary.errorCount > 0 && (
                    <button
                      onClick={handleDownloadErrorReport}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 rounded-lg border border-red-200 dark:border-red-800/60 transition-colors cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download Error Log ({importSummary.errorCount})</span>
                    </button>
                  )}

                  <button
                    onClick={handleExecuteImport}
                    disabled={importCompleted || importSummary.validCount + importSummary.existingCount === 0}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      importCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 cursor-default'
                        : 'bg-[#58BDB2] text-white hover:bg-[#48a99f] shadow-xs cursor-pointer'
                    }`}
                  >
                    {importCompleted
                      ? `Import Complete (${importSummary.importedCount} Records Saved)`
                      : `Import ${importSummary.validCount + importSummary.existingCount} Valid Records`}
                  </button>
                </div>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="p-3 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
                  <div className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9] font-mono">{importSummary.totalRows}</div>
                  <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">Total Rows</div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                  <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 font-mono">{importSummary.validCount}</div>
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-400">New Valid</div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/60">
                  <div className="text-xl font-bold text-blue-700 dark:text-blue-300 font-mono">{importSummary.existingCount}</div>
                  <div className="text-[11px] text-blue-800 dark:text-blue-400">Updates Existing</div>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-[#251A0E] rounded-xl border border-amber-200 dark:border-[#4B3518]">
                  <div className="text-xl font-bold text-amber-700 dark:text-amber-300 font-mono">{importSummary.warningCount}</div>
                  <div className="text-[11px] text-amber-800 dark:text-amber-400">Warnings</div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800/60">
                  <div className="text-xl font-bold text-red-700 dark:text-red-400 font-mono">{importSummary.errorCount}</div>
                  <div className="text-[11px] text-red-800 dark:text-red-400">Errors (Excluded)</div>
                </div>
              </div>

              {/* Preview Rows Table */}
              <div className="overflow-x-auto max-h-80 border border-[#E4ECEA] dark:border-[#1F333A] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7FBFB] dark:bg-[#0E171A] border-b border-[#E4ECEA] dark:border-[#1F333A] text-[#687572] dark:text-[#94A3B8] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Row</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Student ID</th>
                      <th className="py-2.5 px-3">Full Name</th>
                      <th className="py-2.5 px-3">CGPA</th>
                      <th className="py-2.5 px-3">Attendance</th>
                      <th className="py-2.5 px-3">Backlogs</th>
                      <th className="py-2.5 px-3">Validation Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4ECEA] dark:divide-[#1F333A]">
                    {previewRows.map((r) => (
                      <tr
                        key={r.rowNumber}
                        className={
                          r.status === 'error'
                            ? 'bg-red-50/40 dark:bg-red-950/30 text-red-900 dark:text-red-300'
                            : r.status === 'existing'
                            ? 'bg-blue-50/20 dark:bg-blue-950/20'
                            : ''
                        }
                      >
                        <td className="py-2 px-3 font-mono text-[#687572] dark:text-[#94A3B8]">{r.rowNumber}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              r.status === 'valid'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : r.status === 'existing'
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                                : r.status === 'warning'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-semibold text-[#263238] dark:text-[#F1F5F9]">{r.studentId || 'BLANK'}</td>
                        <td className="py-2 px-3 text-[#263238] dark:text-[#F1F5F9]">{r.fullName}</td>
                        <td className="py-2 px-3 font-mono text-[#263238] dark:text-[#F1F5F9]">{r.cgpa.toFixed(2)}</td>
                        <td className="py-2 px-3 font-mono text-[#263238] dark:text-[#F1F5F9]">{r.attendance}%</td>
                        <td className="py-2 px-3 font-mono text-[#263238] dark:text-[#F1F5F9]">{r.backlogs}</td>
                        <td className="py-2 px-3 text-[11px] text-[#687572] dark:text-[#94A3B8]">
                          {r.messages.join(' · ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODAL: STUDENT PROFILE & MENTORING NOTES ---------------- */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#142024] rounded-2xl max-w-2xl w-full shadow-xl border border-[#E4ECEA] dark:border-[#1F333A] overflow-hidden max-h-[90vh] flex flex-col transition-colors">
            <div className="p-5 border-b border-[#E4ECEA] dark:border-[#1F333A] flex items-center justify-between bg-[#F7FBFB] dark:bg-[#0E171A]">
              <div>
                <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">{selectedStudent.Full_Name}</h3>
                <p className="text-xs text-[#687572] dark:text-[#94A3B8]">
                  {selectedStudent.Student_ID} · {selectedStudent.Branch} · Section {selectedStudent.Section}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9] rounded-lg hover:bg-neutral-200/50 dark:hover:bg-[#1E2E33] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Academic Metrics Row */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
                  <div className="text-base font-bold font-mono text-[#263238] dark:text-[#F1F5F9]">{selectedStudent.CGPA.toFixed(2)}</div>
                  <div className="text-[10px] text-[#687572] dark:text-[#94A3B8]">CGPA</div>
                </div>
                <div className="p-3 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
                  <div className="text-base font-bold font-mono text-[#263238] dark:text-[#F1F5F9]">{selectedStudent.Attendance_Percentage}%</div>
                  <div className="text-[10px] text-[#687572] dark:text-[#94A3B8]">Attendance</div>
                </div>
                <div className="p-3 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
                  <div className={`text-base font-bold font-mono ${selectedStudent.Backlogs > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {selectedStudent.Backlogs}
                  </div>
                  <div className="text-[10px] text-[#687572] dark:text-[#94A3B8]">Backlogs</div>
                </div>
                <div className="p-3 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
                  <div className="text-base font-bold font-mono text-[#263238] dark:text-[#F1F5F9]">{selectedStudent.Coding_Activity.problemsSolved}</div>
                  <div className="text-[10px] text-[#687572] dark:text-[#94A3B8]">DSA Solved</div>
                </div>
              </div>

              {/* Verified Technical Skills */}
              <div>
                <span className="font-bold text-[#263238] dark:text-[#F1F5F9] block mb-1.5">Technical Competencies:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.Technical_Skills.map((s) => (
                    <span key={s} className="px-2.5 py-0.5 bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] border border-[#58BDB2]/30 dark:border-[#27665E] font-medium rounded-lg text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mentorship Notes History */}
              <div className="space-y-2 border-t border-[#E4ECEA] dark:border-[#1F333A] pt-4">
                <span className="font-bold text-[#263238] dark:text-[#F1F5F9] block">Mentoring Log & Advisory History:</span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedStudent.Mentorship_Notes && selectedStudent.Mentorship_Notes.length > 0 ? (
                    selectedStudent.Mentorship_Notes.map((note, idx) => (
                      <div key={idx} className="p-2.5 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-lg border border-[#E4ECEA] dark:border-[#1F333A] text-[11px] text-[#263238] dark:text-[#F1F5F9]">
                        {note}
                      </div>
                    ))
                  ) : (
                    <div className="text-[#687572] dark:text-[#94A3B8] italic text-[11px]">No previous mentoring notes recorded for this student.</div>
                  )}
                </div>
              </div>

              {/* Add New Note */}
              <div className="space-y-2 border-t border-[#E4ECEA] dark:border-[#1F333A] pt-4">
                <span className="font-bold text-[#263238] dark:text-[#F1F5F9] block">Add New Mentoring Advisory:</span>
                {noteSuccess && (
                  <div className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Advisory note saved to student's record!</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMentorNote}
                    onChange={(e) => setNewMentorNote(e.target.value)}
                    placeholder="Enter observation, intervention advice, or mock interview feedback..."
                    className="flex-1 px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-lg text-xs focus:bg-white dark:focus:bg-[#122024] focus:border-[#58BDB2] focus:outline-none"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
