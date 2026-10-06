import React, { useState, useMemo, useEffect } from 'react';
import { User, PlacementDrive, StudentRecord, JobApplication, ApplicationStatus } from '../../types';
import { placementService } from '../../services/placementService';
import { studentService } from '../../services/studentService';
import { dataService } from '../../services/dataService';
import { authService } from '../../services/authService';
import { useDataVersion } from '../../services/dataEvents';
import { ConfirmDialog, ConfirmState } from '../common/ConfirmDialog';
import {
  Building2,
  Briefcase,
  Plus,
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  MapPin,
  X,
  FileSpreadsheet,
  Trash2,
  Edit3,
  Eye,
  Send,
  Search,
  Filter,
  AlertTriangle,
  Download,
  Megaphone,
  Check,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  RefreshCw,
  Clock,
  Award
} from 'lucide-react';

interface Props {
  currentUser: User;
}

type TnpTab = 'drives' | 'applications' | 'eligibility' | 'announcements';

const ALL_BRANCHES = [
  'Computer Science & Engineering',
  'Data Science & AI',
  'Information Technology',
  'Cybersecurity & Networks',
  'Electronics & Communication Engineering'
];

export const TnpPortal: React.FC<Props> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<TnpTab>('drives');
  const [drives, setDrives] = useState<PlacementDrive[]>(placementService.getAllDrives());
  const [applications, setApplications] = useState<JobApplication[]>(placementService.getAllApplications());
  const [students, setStudents] = useState<StudentRecord[]>(studentService.getAllStudents());
  const dataVersion = useDataVersion();
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [formPublish, setFormPublish] = useState(true);
  const [formEligibilityNotes, setFormEligibilityNotes] = useState('');

  // Drive Filters & Search
  const [driveSearch, setDriveSearch] = useState('');
  const [driveStatusFilter, setDriveStatusFilter] = useState<'all' | 'Active' | 'Upcoming' | 'Closed'>('all');

  // Application Filters
  const [appDriveFilter, setAppDriveFilter] = useState<string>('all');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all');
  const [appSearch, setAppSearch] = useState('');

  // Institutional Eligibility Policy Configurator
  const [policyMinCgpa, setPolicyMinCgpa] = useState<number>(7.0);
  const [policyMaxBacklogs, setPolicyMaxBacklogs] = useState<number>(0);
  const [policyBranchFilter, setPolicyBranchFilter] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Drive Modal state (Create / Edit)
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [editingDriveId, setEditingDriveId] = useState<string | null>(null);

  // Drive Form Fields
  const [formCompany, setFormCompany] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formPackage, setFormPackage] = useState('');
  const [formJobType, setFormJobType] = useState<PlacementDrive['jobType']>('Full-time');
  const [formMinCgpa, setFormMinCgpa] = useState(7.0);
  const [formMaxBacklogs, setFormMaxBacklogs] = useState(0);
  const [formGraduationYear, setFormGraduationYear] = useState(2026);
  const [formAllowedBranches, setFormAllowedBranches] = useState<string[]>([...ALL_BRANCHES]);
  const [formLocation, setFormLocation] = useState('');
  const [formDriveDate, setFormDriveDate] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formOpenings, setFormOpenings] = useState(25);
  const [formSkills, setFormSkills] = useState('');
  const [formRounds, setFormRounds] = useState('');
  const [formBond, setFormBond] = useState('No Service Bond');
  const [formStatus, setFormStatus] = useState<'Active' | 'Upcoming' | 'Closed'>('Active');
  const [formDescription, setFormDescription] = useState('');

  // Modal: View Eligible Cohort for a Drive
  const [inspectDrive, setInspectDrive] = useState<PlacementDrive | null>(null);

  // Modal: Update Applicant Status
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [newAppStatus, setNewAppStatus] = useState<ApplicationStatus>('Under Review');
  const [newAppNotes, setNewAppNotes] = useState('');

  // Broadcast Announcement Form
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementType, setAnnouncementType] = useState<'drive' | 'alert' | 'agentic'>('drive');
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  // Success toast / action confirmation
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshData = () => {
    setDrives(placementService.getAllDrives());
    setApplications(placementService.getAllApplications());
    setStudents(studentService.getAllStudents());
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion]);

  // ---------------- INSTITUTIONAL METRICS (Authorized Dynamic Calculations) ----------------
  const filteredCohort = useMemo(() => {
    return students.filter((s) => {
      if (policyBranchFilter !== 'all' && s.Branch !== policyBranchFilter) return false;
      return true;
    });
  }, [students, policyBranchFilter]);

  const totalCohortCount = filteredCohort.length;
  const eligibleCohortCount = filteredCohort.filter(
    (s) => s.Backlogs <= policyMaxBacklogs && s.CGPA >= policyMinCgpa
  ).length;
  const highTierReadyCount = filteredCohort.filter(
    (s) => s.Backlogs === 0 && s.CGPA >= 8.5
  ).length;
  const remedialCount = filteredCohort.filter((s) => s.Backlogs > 0).length;

  const stats = useMemo(() => placementService.getStats(students, applications), [students, applications, drives]);
  const facultyUsers = authService.getRegisteredUsers().filter((u) => u.role === 'faculty');
  const hasAnyData = students.length > 0 || drives.length > 0 || applications.length > 0;

  // ---------------- DRIVE MANAGEMENT ----------------
  const handleOpenCreateModal = () => {
    setEditingDriveId(null);
    setFormCompany('');
    setFormRole('');
    setFormPackage('');
    setFormJobType('Full-time');
    setFormMinCgpa(0);
    setFormMaxBacklogs(0);
    setFormGraduationYear(new Date().getFullYear());
    setFormAllowedBranches([...ALL_BRANCHES]);
    setFormLocation('');
    setFormDriveDate('');
    setFormDeadline('');
    setFormOpenings(1);
    setFormSkills('');
    setFormRounds('');
    setFormBond('');
    setFormStatus('Active');
    setFormDescription('');
    setFormEligibilityNotes('');
    setFormPublish(true);
    setShowDriveModal(true);
  };

  const handleOpenEditModal = (drive: PlacementDrive) => {
    setEditingDriveId(drive.id);
    setFormCompany(drive.companyName);
    setFormRole(drive.role);
    setFormPackage(drive.packageLPA);
    setFormJobType(drive.jobType);
    setFormMinCgpa(drive.eligibility.minCGPA);
    setFormMaxBacklogs(drive.eligibility.maxBacklogs);
    setFormGraduationYear(drive.eligibility.graduationYear || 2026);
    setFormAllowedBranches(drive.eligibility.allowedBranches || [...ALL_BRANCHES]);
    setFormLocation(drive.location);
    setFormDriveDate(drive.driveDate);
    setFormDeadline(drive.applicationDeadline);
    setFormOpenings(drive.totalOpenings);
    setFormSkills(drive.requiredSkills.join(', '));
    setFormRounds(drive.selectionProcess ? drive.selectionProcess.join('\n') : '');
    setFormBond(drive.bondDetails || '');
    setFormStatus(drive.status || 'Active');
    setFormDescription(drive.description);
    setFormEligibilityNotes(drive.eligibilityNotes || '');
    setFormPublish(drive.published);
    setShowDriveModal(true);
  };

  const handleSaveDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany || !formRole || !formPackage) {
      showToast('Please enter company name, designation, and package.');
      return;
    }

    const skillsArray = formSkills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const roundsArray = formRounds
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const drivePayload: Omit<PlacementDrive, 'id'> = {
      companyName: formCompany.trim(),
      logoText: formCompany.slice(0, 3).toUpperCase(),
      role: formRole.trim(),
      packageLPA: formPackage.trim(),
      jobType: formJobType,
      location: formLocation.trim(),
      driveDate: formDriveDate,
      applicationDeadline: formDeadline,
      eligibility: {
        minCGPA: formMinCgpa,
        maxBacklogs: formMaxBacklogs,
        allowedBranches: formAllowedBranches.length > 0 ? formAllowedBranches : [...ALL_BRANCHES],
        graduationYear: formGraduationYear
      },
      requiredSkills: skillsArray,
      selectionProcess: roundsArray,
      description: formDescription.trim(),
      eligibilityNotes: formEligibilityNotes.trim(),
      published: formPublish,
      totalOpenings: formOpenings,
      status: formStatus,
      bondDetails: formBond,
      createdBy: `${currentUser.name} (${currentUser.designation || 'T&P Officer'})`
    };

    if (editingDriveId) {
      const ok = placementService.updateDrive(editingDriveId, drivePayload, currentUser);
      showToast(ok ? `Drive for "${formCompany}" updated successfully!` : 'Permission denied: could not update drive.');
    } else {
      const created = placementService.createDrive(drivePayload, currentUser);
      if (!created) {
        showToast('Permission denied: could not create drive.');
      } else {
        showToast(
          formPublish
            ? `Drive for "${formCompany}" published. Eligible students can now see it.`
            : `Drive for "${formCompany}" saved as a draft. Students cannot see it until you publish.`
        );
      }
    }

    refreshData();
    setShowDriveModal(false);
  };

  const handleDeleteDrive = (driveId: string, company: string) => {
    const appCount = applications.filter((a) => a.driveId === driveId).length;
    setConfirmState({
      title: `Delete drive for ${company}?`,
      message: `This removes the drive from every student workspace${
        appCount > 0 ? ` and deletes its ${appCount} submitted application(s)` : ''
      }. This action cannot be undone.`,
      confirmLabel: 'Delete Drive',
      danger: true,
      onConfirm: () => {
        const ok = placementService.deleteDrive(driveId, currentUser);
        refreshData();
        showToast(ok ? `Placement drive for ${company} deleted.` : 'Permission denied.');
      }
    });
  };

  const handleTogglePublish = (d: PlacementDrive) => {
    const next = !d.published;
    const ok = placementService.setPublished(d.id, next, currentUser);
    refreshData();
    showToast(
      !ok
        ? 'Permission denied.'
        : next
        ? `"${d.companyName}" published. Eligible students can now see and apply.`
        : `"${d.companyName}" unpublished. It is hidden from students.`
    );
  };

  const handleCleanSlate = () => {
    setConfirmState({
      title: 'Start with a clean slate?',
      message:
        'Are you sure you want to start with a clean slate? This will remove existing demo/student/drive/application records (students, uploaded CSV imports, placement drives, applications and notifications). User accounts, roles and permissions are NOT affected. This action cannot be undone.',
      confirmLabel: 'Yes, Remove Data',
      danger: true,
      onConfirm: () => {
        const res = dataService.cleanSlate(currentUser);
        refreshData();
        showToast(res.message);
      }
    });
  };

  const handleReassignMentor = (studentId: string, facultyId: string) => {
    if (facultyId === '') {
      studentService.assignMentor(studentId, '', '');
    } else {
      const f = facultyUsers.find((u) => u.id === facultyId);
      if (!f) return;
      studentService.assignMentor(studentId, f.name, f.email);
    }
    refreshData();
    showToast('Mentor assignment updated. Faculty visibility changed accordingly.');
  };

  // ---------------- APPLICATION STAGE UPDATES ----------------
  const handleUpdateAppStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    const ok = placementService.updateApplicationStatus(selectedApp.id, newAppStatus, newAppNotes, currentUser);
    refreshData();
    if (!ok) {
      showToast('Permission denied.');
      setSelectedApp(null);
      return;
    }
    showToast(`Application updated to "${newAppStatus}". Notification dispatched to student.`);
    setSelectedApp(null);
    setNewAppNotes('');
  };

  // ---------------- BROADCAST ANNOUNCEMENTS ----------------
  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;

    placementService.broadcastAnnouncement(announcementTitle.trim(), announcementMessage.trim(), announcementType);
    setAnnouncementSuccess(true);
    setAnnouncementTitle('');
    setAnnouncementMessage('');
    setTimeout(() => setAnnouncementSuccess(false), 3500);
    showToast('Official announcement published to all student workspaces.');
  };

  // ---------------- EXPORT ELIGIBLE STUDENTS CSV ----------------
  const handleExportEligibleCsv = (drive: PlacementDrive) => {
    const csvData = placementService.exportEligibleStudentsCsv(students, drive);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Eligible_Candidates_${drive.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported candidate roster for ${drive.companyName}`);
  };

  // Filtered drives
  const displayedDrives = drives.filter((d) => {
    if (driveStatusFilter !== 'all' && (d.status || 'Active') !== driveStatusFilter) return false;
    if (driveSearch.trim()) {
      const q = driveSearch.toLowerCase();
      const matchComp = d.companyName.toLowerCase().includes(q);
      const matchRole = d.role.toLowerCase().includes(q);
      const matchSkills = d.requiredSkills.some((s) => s.toLowerCase().includes(q));
      if (!matchComp && !matchRole && !matchSkills) return false;
    }
    return true;
  });

  // Filtered applications
  const displayedApps = applications.filter((a) => {
    if (appDriveFilter !== 'all' && a.driveId !== appDriveFilter) return false;
    if (appStatusFilter !== 'all' && a.status !== appStatusFilter) return false;
    if (appSearch.trim()) {
      const q = appSearch.toLowerCase();
      const matchStu = a.studentId.toLowerCase().includes(q);
      const matchComp = a.companyName.toLowerCase().includes(q);
      const matchRole = a.role.toLowerCase().includes(q);
      if (!matchStu && !matchComp && !matchRole) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#263238] dark:bg-[#142024] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#58BDB2]/40 flex items-center gap-2.5 text-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#58BDB2]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF7F8] dark:bg-[#122D29] border border-[#58BDB2]/30 dark:border-[#27665E] flex items-center justify-center text-[#2EA396] dark:text-[#58BDB2]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">
                Training & Placement (T&P) Officer Console
              </h1>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8]">
                Authorized Coordinator: <strong className="text-[#263238] dark:text-[#F1F5F9]">{currentUser.name}</strong> ({currentUser.designation || 'Head of Placements & Corporate Relations'})
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCleanSlate}
            title="Remove all student, drive, application and import records. Accounts and roles are kept."
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Start with Clean Slate</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Placement Drive</span>
          </button>
        </div>
      </div>

      {/* Dynamic metrics - every number comes from stored records */}
      {!hasAnyData ? (
        <div className="bg-white dark:bg-[#142024] p-8 rounded-2xl border border-dashed border-[#58BDB2]/50 text-center space-y-1.5 transition-colors">
          <Users className="w-8 h-8 text-[#58BDB2] opacity-60 mx-auto" />
          <div className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">
            No student data available yet. Upload or add student records to view statistics.
          </div>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8]">
            Students appear here once a Faculty/Mentor uploads a CSV or students register. Create a placement drive to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-1 transition-colors">
              <div className="flex items-center justify-between text-[#687572] dark:text-[#94A3B8]">
                <span className="text-xs font-medium">Total Registered Students</span>
                <Users className="w-4 h-4 text-[#58BDB2]" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-[#263238] dark:text-[#F1F5F9]">{students.length}</div>
              <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
                {students.length === 0 ? 'No student records available.' : 'From uploaded CSVs and registrations'}
              </div>
            </div>

            <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-1 transition-colors">
              <div className="flex items-center justify-between text-[#687572] dark:text-[#94A3B8]">
                <span className="text-xs font-medium">Eligible (Policy Met)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">{eligibleCohortCount}</div>
              <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
                {totalCohortCount > 0
                  ? `${Math.round((eligibleCohortCount / totalCohortCount) * 100)}% meet CGPA ≥ ${policyMinCgpa.toFixed(1)} & ≤ ${policyMaxBacklogs} backlogs (policy tab)`
                  : 'No student records available.'}
              </div>
            </div>

            <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-1 transition-colors">
              <div className="flex items-center justify-between text-[#687572] dark:text-[#94A3B8]">
                <span className="text-xs font-medium">Active Placement Drives</span>
                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-[#263238] dark:text-[#F1F5F9]">{stats.activeDrives}</div>
              <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
                {stats.totalDrives === 0
                  ? 'No active placement drives available.'
                  : `${stats.publishedDrives} published · ${stats.totalDrives - stats.publishedDrives} draft`}
              </div>
            </div>

            <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-1 transition-colors">
              <div className="flex items-center justify-between text-[#687572] dark:text-[#94A3B8]">
                <span className="text-xs font-medium">Total Applications</span>
                <Send className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-[#263238] dark:text-[#F1F5F9]">{stats.totalApplications}</div>
              <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
                {stats.totalApplications === 0 ? 'No applications received yet.' : `${stats.byStatus.Applied} awaiting review`}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex items-center justify-between transition-colors">
              <div>
                <div className="text-xs font-medium text-[#687572] dark:text-[#94A3B8]">Shortlisted (incl. Interview & Selected)</div>
                <div className="text-2xl font-extrabold font-mono text-[#263238] dark:text-[#F1F5F9]">{stats.shortlisted}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-[#687572] dark:text-[#94A3B8] text-right">Selected</div>
                <div className="text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 text-right">{stats.selected}</div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs transition-colors">
              <div className="text-xs font-medium text-[#687572] dark:text-[#94A3B8] mb-2">Company-wise Applications</div>
              {stats.byCompany.length === 0 ? (
                <div className="text-xs text-[#687572] dark:text-[#94A3B8]">No data available.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {stats.byCompany.map((c) => (
                    <span
                      key={c.company}
                      className="px-2.5 py-1 rounded-lg bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[11px] text-[#263238] dark:text-[#F1F5F9]"
                    >
                      <strong>{c.company}</strong>: {c.applications} applied{c.selected > 0 ? ` · ${c.selected} selected` : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs for T&P Tasks */}
      <div className="border-b border-[#E4ECEA] dark:border-[#1F333A] flex items-center gap-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('drives')}
          className={`px-4 py-3 border-b-2 font-bold cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'drives'
              ? 'border-[#58BDB2] text-[#2EA396] dark:text-[#58BDB2]'
              : 'border-transparent text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Campus Placement Drives ({drives.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-3 border-b-2 font-bold cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'applications'
              ? 'border-[#58BDB2] text-[#2EA396] dark:text-[#58BDB2]'
              : 'border-transparent text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Applications & Shortlists ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('eligibility')}
          className={`px-4 py-3 border-b-2 font-bold cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'eligibility'
              ? 'border-[#58BDB2] text-[#2EA396] dark:text-[#58BDB2]'
              : 'border-transparent text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Batch Placement Eligibility & Policy</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-3 border-b-2 font-bold cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'announcements'
              ? 'border-[#58BDB2] text-[#2EA396] dark:text-[#58BDB2]'
              : 'border-transparent text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9]'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Broadcast Notices & Alerts</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CAMPUS RECRUITMENT DRIVES MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'drives' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-[#142024] p-4 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-colors">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#687572] dark:text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search drives by company, role, or skill..."
                value={driveSearch}
                onChange={(e) => setDriveSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1.5 text-[#687572] dark:text-[#94A3B8]">
                <span>Status:</span>
                <select
                  value={driveStatusFilter}
                  onChange={(e) => setDriveStatusFilter(e.target.value as any)}
                  className="bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#58BDB2]"
                >
                  <option value="all">All Drives ({drives.length})</option>
                  <option value="Active">Active Only</option>
                  <option value="Upcoming">Upcoming Only</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <button
                onClick={handleOpenCreateModal}
                className="px-3.5 py-1.5 bg-[#58BDB2] text-white rounded-xl font-semibold hover:bg-[#48a99f] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Drive</span>
              </button>
            </div>
          </div>

          {/* Drives Cards / Table View */}
          {displayedDrives.length === 0 ? (
            <div className="bg-white dark:bg-[#142024] p-12 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] text-center space-y-3 transition-colors">
              <Briefcase className="w-12 h-12 text-[#58BDB2] opacity-40 mx-auto" />
              <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">{drives.length === 0 ? 'No Placement Drives Yet' : 'No Drives Match This Filter'}</h3>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8] max-w-md mx-auto">
                No active placement drives available. Schedule a drive with company cutoffs, packages and branch eligibility, then publish it to make it visible to eligible students.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-2 px-4 py-2 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Schedule First Drive
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedDrives.map((d) => {
                const driveApps = applications.filter((a) => a.driveId === d.id);
                const eligibleCount = students.filter(
                  (s) => placementService.checkEligibility(s, d).eligible
                ).length;

                return (
                  <div
                    key={d.id}
                    className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] hover:border-[#58BDB2]/60 dark:hover:border-[#58BDB2]/60 transition-all shadow-xs space-y-4"
                  >
                    {/* Top Row: Company, Role, Package, Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#EAF7F8] dark:bg-[#122D29] border border-[#58BDB2]/30 dark:border-[#27665E] text-[#2EA396] dark:text-[#58BDB2] font-extrabold flex items-center justify-center text-sm shrink-0">
                          {d.logoText || d.companyName.slice(0, 3).toUpperCase()}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">{d.companyName}</h3>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                d.status === 'Closed'
                                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                                  : d.status === 'Upcoming'
                                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                              }`}
                            >
                              {d.status || 'Active'}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                d.published
                                  ? 'bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] border-[#58BDB2]/30'
                                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                              }`}
                            >
                              {d.published ? 'Published' : 'Draft · hidden from students'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#58BDB2]">{d.role}</p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#687572] dark:text-[#94A3B8] pt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#58BDB2]" />
                              <span>{d.location}</span>
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#58BDB2]" />
                              <span>Drive Date: {d.driveDate}</span>
                            </span>
                            <span>·</span>
                            <span className="font-semibold text-amber-700 dark:text-amber-400">
                              Deadline: {d.applicationDeadline}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:shrink-0 space-y-1">
                        <div className="text-lg font-mono font-extrabold text-[#263238] dark:text-[#F1F5F9]">
                          {d.packageLPA}
                        </div>
                        <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
                          {d.jobType} · {d.totalOpenings} Openings
                        </div>
                      </div>
                    </div>

                    {/* Middle: Eligibility & Allowed Branches */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-[#F7FBFB] dark:bg-[#0E171A] p-3.5 rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
                      <div>
                        <span className="text-[#687572] dark:text-[#94A3B8] font-semibold text-[11px] block mb-1">
                          Academic Cutoff Criteria:
                        </span>
                        <div className="space-y-0.5 text-[#263238] dark:text-[#F1F5F9]">
                          <div>Min CGPA: <strong className="text-[#2EA396] dark:text-[#58BDB2]">{d.eligibility.minCGPA}</strong></div>
                          <div>Max Backlogs: <strong>{d.eligibility.maxBacklogs}</strong></div>
                          <div>Graduation Batch: <strong>{d.eligibility.graduationYear || 2026}</strong></div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-[#687572] dark:text-[#94A3B8] font-semibold text-[11px] block mb-1">
                          Permitted Branches ({d.eligibility.allowedBranches?.length || ALL_BRANCHES.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(d.eligibility.allowedBranches || ALL_BRANCHES).map((branch) => (
                            <span
                              key={branch}
                              className="px-2 py-0.5 rounded-md bg-white dark:bg-[#16272C] border border-[#E4ECEA] dark:border-[#1F333A] text-[10px] font-medium text-[#263238] dark:text-[#F1F5F9]"
                            >
                              {branch.split('&')[0]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Required Skills & Description */}
                    <div className="text-xs space-y-1.5">
                      <p className="text-[#687572] dark:text-[#94A3B8] line-clamp-2 leading-relaxed">
                        {d.description}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {d.requiredSkills.map((sk) => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 rounded bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] text-[10px] font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4ECEA] dark:border-[#1F333A] text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-[#687572] dark:text-[#94A3B8]">
                          Drive Eligibility: <strong className="text-[#2EA396] dark:text-[#58BDB2] font-mono">{eligibleCount}</strong> / {students.length} students qualify
                        </span>
                        <span>·</span>
                        <span className="text-[#687572] dark:text-[#94A3B8]">
                          Applications: <strong className="text-[#263238] dark:text-[#F1F5F9] font-mono">{driveApps.length}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInspectDrive(d)}
                          className="px-3 py-1.5 bg-[#EAF7F8] dark:bg-[#142A2D] text-[#2EA396] dark:text-[#58BDB2] hover:bg-[#DDF5F0] dark:hover:bg-[#1C3B3F] rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Eligible Cohort ({eligibleCount})</span>
                        </button>

                        <button
                          onClick={() => handleExportEligibleCsv(d)}
                          className="px-3 py-1.5 border border-[#E4ECEA] dark:border-[#1F333A] text-[#687572] dark:text-[#94A3B8] hover:bg-neutral-100 dark:hover:bg-[#1B2B30] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export CSV</span>
                        </button>

                        <button
                          onClick={() => handleTogglePublish(d)}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                            d.published
                              ? 'border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                              : 'bg-[#58BDB2] hover:bg-[#48a99f] text-white'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{d.published ? 'Unpublish' : 'Publish'}</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(d)}
                          className="p-1.5 text-[#687572] dark:text-[#94A3B8] hover:text-[#58BDB2] rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1B2B30] transition-colors cursor-pointer"
                          title="Edit Placement Drive"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteDrive(d.id, d.companyName)}
                          className="p-1.5 text-[#687572] dark:text-[#94A3B8] hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Delete Placement Drive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STUDENT CANDIDATE APPLICATIONS & SHORTLISTING */}
      {/* ========================================================================= */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-[#142024] p-4 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs transition-colors">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#687572] dark:text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search by Student ID, Company..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                />
              </div>

              <div className="flex items-center gap-1.5 text-[#687572] dark:text-[#94A3B8]">
                <span>Drive:</span>
                <select
                  value={appDriveFilter}
                  onChange={(e) => setAppDriveFilter(e.target.value)}
                  className="bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#58BDB2]"
                >
                  <option value="all">All Drives ({drives.length})</option>
                  {drives.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.companyName} ({d.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-[#687572] dark:text-[#94A3B8]">
                <span>Stage:</span>
                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  className="bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#58BDB2]"
                >
                  <option value="all">All Stages ({applications.length})</option>
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="text-[#687572] dark:text-[#94A3B8]">
              Showing <strong>{displayedApps.length}</strong> submitted application(s)
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white dark:bg-[#142024] rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7FBFB] dark:bg-[#0E171A] border-b border-[#E4ECEA] dark:border-[#1F333A] text-[#687572] dark:text-[#94A3B8] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Candidate Student</th>
                    <th className="py-3 px-4">Company & Target Role</th>
                    <th className="py-3 px-4">Applied On</th>
                    <th className="py-3 px-4">Mentor & Resume</th>
                    <th className="py-3 px-4">Academic Specs</th>
                    <th className="py-3 px-4">Current Hiring Stage</th>
                    <th className="py-3 px-4">Coordinator Remarks</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4ECEA] dark:divide-[#1F333A]">
                  {displayedApps.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#687572] dark:text-[#94A3B8]">
                        <Users className="w-8 h-8 text-[#58BDB2] opacity-40 mx-auto mb-2" />
                        <div className="font-bold text-[#263238] dark:text-[#F1F5F9]">No Student Applications Found</div>
                        <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-1 max-w-sm mx-auto">
                          When students submit applications to scheduled campus drives from their workspace, they will appear here for review and stage advancement.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    displayedApps.map((app) => {
                      const studentRecord = students.find(
                        (s) => s.Student_ID.toUpperCase() === app.studentId.toUpperCase()
                      );

                      return (
                        <tr key={app.id} className="hover:bg-[#F7FBFB] dark:hover:bg-[#18262B] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#263238] dark:text-[#F1F5F9]">
                              {studentRecord?.Full_Name || app.studentId}
                            </div>
                            <div className="font-mono text-[11px] text-[#2EA396] dark:text-[#58BDB2]">
                              {app.studentId}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#263238] dark:text-[#F1F5F9]">{app.companyName}</div>
                            <div className="text-[11px] text-[#58BDB2]">{app.role}</div>
                            <div className="font-mono text-[10px] text-[#687572] dark:text-[#94A3B8]">{app.packageLPA}</div>
                          </td>
                          <td className="py-3 px-4 text-[#687572] dark:text-[#94A3B8] whitespace-nowrap">
                            {app.appliedAt ? new Date(app.appliedAt).toLocaleString() : app.appliedDate}
                          </td>
                          <td className="py-3 px-4 text-[11px]">
                            <div className="text-[#263238] dark:text-[#F1F5F9]">{studentRecord?.Mentor || 'Unassigned'}</div>
                            <div className="text-[#687572] dark:text-[#94A3B8]">{app.resumeFileName || 'No resume on file'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div>CGPA: <strong className="text-[#2EA396] dark:text-[#58BDB2]">{studentRecord ? studentRecord.CGPA.toFixed(2) : 'N/A'}</strong></div>
                            <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
                              Backlogs: {studentRecord?.Backlogs ?? 0} · {studentRecord?.Branch || 'Branch not set'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                app.status === 'Selected'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60'
                                  : app.status === 'Rejected'
                                  ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60'
                                  : app.status === 'Interview' || app.status === 'Under Review'
                                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60'
                                  : 'bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] border border-[#58BDB2]/30 dark:border-[#27665E]'
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-[11px] text-[#687572] dark:text-[#94A3B8]">
                            {app.stageNotes || 'No notes provided'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setNewAppStatus(app.status);
                                setNewAppNotes(app.stageNotes || '');
                              }}
                              className="px-3 py-1.5 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-lg font-semibold transition-colors cursor-pointer text-xs"
                            >
                              Update Stage
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

      {/* ========================================================================= */}
      {/* TAB 3: BATCH PLACEMENT ELIGIBILITY & POLICY CONFIGURATOR */}
      {/* ========================================================================= */}
      {activeTab === 'eligibility' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#58BDB2]" />
                  <span>Institutional Placement Policy & Eligibility Thresholds</span>
                </h3>
                <p className="text-xs text-[#687572] dark:text-[#94A3B8]">
                  Define and calibrate the university-wide baseline parameters to calculate eligible student quotas dynamically.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#2EA396] dark:text-[#58BDB2] bg-[#EAF7F8] dark:bg-[#122D29] px-3 py-1 rounded-full border border-[#58BDB2]/30 dark:border-[#27665E]">
                  Eligible: {eligibleCohortCount} / {totalCohortCount} ({totalCohortCount > 0 ? Math.round((eligibleCohortCount / totalCohortCount) * 100) : 0}%)
                </span>
              </div>
            </div>

            {/* Threshold Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A] space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-[#263238] dark:text-[#F1F5F9]">
                    Minimum Qualifying CGPA Cutoff
                  </label>
                  <span className="font-mono font-bold text-[#58BDB2] text-sm">{policyMinCgpa.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="9.0"
                  step="0.1"
                  value={policyMinCgpa}
                  onChange={(e) => setPolicyMinCgpa(parseFloat(e.target.value))}
                  className="w-full accent-[#58BDB2] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#687572] dark:text-[#94A3B8]">
                  <span>5.0 (All Pass)</span>
                  <span>7.0 (Tier-2 Standard)</span>
                  <span>8.5 (Super-Dream)</span>
                </div>
              </div>

              <div className="p-4 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A] space-y-2">
                <label className="font-semibold text-[#263238] dark:text-[#F1F5F9] block">
                  Permitted Active Backlogs
                </label>
                <select
                  value={policyMaxBacklogs}
                  onChange={(e) => setPolicyMaxBacklogs(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-white dark:bg-[#142024] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-lg focus:outline-none focus:border-[#58BDB2]"
                >
                  <option value={0}>0 Backlogs (Strict Zero Active Policy)</option>
                  <option value={1}>Max 1 Backlog (Conditional Clearance)</option>
                  <option value={2}>Max 2 Backlogs (Special Approval Required)</option>
                </select>
                <p className="text-[10px] text-[#687572] dark:text-[#94A3B8]">
                  Most Tier-1 IT & Product recruiters mandate zero active backlog.
                </p>
              </div>

              <div className="p-4 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A] space-y-2">
                <label className="font-semibold text-[#263238] dark:text-[#F1F5F9] block">
                  Department / Branch Scope
                </label>
                <select
                  value={policyBranchFilter}
                  onChange={(e) => setPolicyBranchFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#142024] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-lg focus:outline-none focus:border-[#58BDB2]"
                >
                  <option value="all">All B.Tech Engineering Branches</option>
                  {ALL_BRANCHES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <p className="text-[10px] text-[#687572] dark:text-[#94A3B8]">
                  Filter candidate statistics for specific department drives.
                </p>
              </div>
            </div>

            {/* Student Candidate Roster */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-[#263238] dark:text-[#F1F5F9]">
                  Student Roster Evaluation ({filteredCohort.length} Students)
                </h4>
                <div className="relative w-64 text-xs">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#687572] dark:text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search candidate name or ID..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-lg focus:outline-none focus:border-[#58BDB2]"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7FBFB] dark:bg-[#0E171A] sticky top-0 border-b border-[#E4ECEA] dark:border-[#1F333A] text-[#687572] dark:text-[#94A3B8] font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Student ID & Name</th>
                      <th className="py-2.5 px-4">Branch</th>
                      <th className="py-2.5 px-4">CGPA</th>
                      <th className="py-2.5 px-4">Backlogs</th>
                      <th className="py-2.5 px-4">Skills Verified</th>
                      <th className="py-2.5 px-4">Mentor</th>
                      <th className="py-2.5 px-4 text-right">Policy Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4ECEA] dark:divide-[#1F333A]">
                    {filteredCohort
                      .filter((s) => {
                        if (!studentSearch.trim()) return true;
                        const q = studentSearch.toLowerCase();
                        return (
                          s.Full_Name.toLowerCase().includes(q) ||
                          s.Student_ID.toLowerCase().includes(q)
                        );
                      })
                      .map((stu) => {
                        const qualifies = stu.CGPA >= policyMinCgpa && stu.Backlogs <= policyMaxBacklogs;

                        return (
                          <tr key={stu.Student_ID} className="hover:bg-[#F7FBFB] dark:hover:bg-[#18262B] transition-colors">
                            <td className="py-2.5 px-4">
                              <div className="font-bold text-[#263238] dark:text-[#F1F5F9]">{stu.Full_Name}</div>
                              <div className="font-mono text-[10px] text-[#687572] dark:text-[#94A3B8]">{stu.Student_ID}</div>
                            </td>
                            <td className="py-2.5 px-4 text-[11px] text-[#687572] dark:text-[#94A3B8]">
                              {stu.Branch || 'Not set'}
                            </td>
                            <td className="py-2.5 px-4 font-mono font-bold text-[#263238] dark:text-[#F1F5F9]">
                              {stu.CGPA.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-4">
                              <span
                                className={`font-mono font-bold ${
                                  stu.Backlogs > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'
                                }`}
                              >
                                {stu.Backlogs}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-[11px] text-[#687572] dark:text-[#94A3B8]">
                              {stu.Technical_Skills.slice(0, 3).join(', ')}
                              {stu.Technical_Skills.length > 3 ? ` +${stu.Technical_Skills.length - 3}` : ''}
                            </td>
                            <td className="py-2.5 px-4">
                              <select
                                value={facultyUsers.find((f) => studentService.isAssignedTo(stu, f))?.id || ''}
                                onChange={(e) => handleReassignMentor(stu.Student_ID, e.target.value)}
                                className="max-w-[9rem] px-2 py-1 text-[11px] bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-lg focus:outline-none"
                                title="Reassign mentor - changes which faculty sees this student's applications"
                              >
                                <option value="">{stu.Mentor ? `${stu.Mentor} (not a registered faculty)` : 'Unassigned'}</option>
                                {facultyUsers.map((f) => (
                                  <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              {qualifies ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                                  <Check className="w-3 h-3" />
                                  <span>Eligible</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900/60">
                                  <X className="w-3 h-3" />
                                  <span>Disqualified</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BROADCAST PLACEMENT NOTICES & ALERTS */}
      {/* ========================================================================= */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
            <div className="border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
              <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#58BDB2]" />
                <span>Publish Official Campus Placement Notice</span>
              </h3>
              <p className="text-xs text-[#687572] dark:text-[#94A3B8]">
                Broadcast schedules, test instructions, or resume guidelines directly to student workspaces and notification centers.
              </p>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                    Announcement Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="e.g. Online Assessment Link Released for Deloitte Campus Drive..."
                    className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                  />
                </div>

                <div>
                  <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                    Notification Category
                  </label>
                  <select
                    value={announcementType}
                    onChange={(e) => setAnnouncementType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                  >
                    <option value="drive">Placement Drive Alert</option>
                    <option value="alert">Urgent Action Required</option>
                    <option value="agentic">Career Intelligence Tip</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                  Notice Details & Instructions
                </label>
                <textarea
                  rows={4}
                  required
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="Provide precise details such as online test timings, mandatory college ID verification, link to pre-placement webinar, or required documents..."
                  className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
                  Notifications are delivered instantly to all enrolled students and verified candidates.
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-xl font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Notice to All Students</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SCHEDULE / EDIT PLACEMENT DRIVE (ALL DETAILS) */}
      {/* ========================================================================= */}
      {showDriveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#142024] rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E4ECEA] dark:border-[#1F333A] overflow-hidden my-8 transition-colors">
            <div className="p-5 border-b border-[#E4ECEA] dark:border-[#1F333A] flex items-center justify-between bg-[#F7FBFB] dark:bg-[#0E171A]">
              <div>
                <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">
                  {editingDriveId ? 'Edit Authorized Campus Placement Drive' : 'Schedule New Campus Placement Drive'}
                </h3>
                <p className="text-xs text-[#687572] dark:text-[#94A3B8]">
                  Enter complete recruiter parameters. All information is synced to student placement workspaces.
                </p>
              </div>
              <button
                onClick={() => setShowDriveModal(false)}
                className="p-1.5 text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9] rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1E2E33] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDrive} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Row 1: Company Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Cisco Systems, Oracle, Morgan Stanley..."
                    className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                  />
                </div>

                <div>
                  <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                    Job Role / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Software Development Engineer - I (Full-Stack)..."
                    className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                  />
                </div>
              </div>

              {/* Row 2: Package, Job Type, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                    Package / CTC (LPA) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPackage}
                    onChange={(e) => setFormPackage(e.target.value)}
                    placeholder="e.g. ₹14.0 - ₹18.5 LPA"
                    className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl font-mono font-bold focus:outline-none focus:border-[#58BDB2]"
                  />
                </div>

                <div>
                  <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                    Employment Type
                  </label>
                  <select
                    value={formJobType}
                    onChange={(e) => setFormJobType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                  >
                    <option value="Full-time">Full-time Regular</option>
                    <option value="Internship + PPO">Internship + PPO Conversion</option>
                    <option value="Specialist">Specialist / R&D Track</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                    Drive Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                  >
                    <option value="Active">Active (Open for Applications)</option>
                    <option value="Upcoming">Upcoming (Announced)</option>
                    <option value="Closed">Closed / Completed</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Eligibility Cutoffs */}
              <div className="p-3.5 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A] space-y-3">
                <span className="font-bold text-[#263238] dark:text-[#F1F5F9] block">
                  Candidate Eligibility Cutoffs
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                      Min CGPA Cutoff
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      required
                      value={formMinCgpa}
                      onChange={(e) => setFormMinCgpa(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#142024] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl font-mono font-bold focus:outline-none focus:border-[#58BDB2]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                      Max Backlogs Allowed
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      required
                      value={formMaxBacklogs}
                      onChange={(e) => setFormMaxBacklogs(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#142024] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl font-mono font-bold focus:outline-none focus:border-[#58BDB2]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      min="2025"
                      max="2030"
                      value={formGraduationYear}
                      onChange={(e) => setFormGraduationYear(parseInt(e.target.value, 10) || 2026)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#142024] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl font-mono focus:outline-none focus:border-[#58BDB2]"
                    />
                  </div>
                </div>

                {/* Branch Multi-select */}
                <div>
                  <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1.5">
                    Permitted Branches (Checked branches will be allowed to apply):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ALL_BRANCHES.map((branch) => {
                      const isChecked = formAllowedBranches.includes(branch);
                      return (
                        <label
                          key={branch}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#142024] border border-[#E4ECEA] dark:border-[#1F333A] cursor-pointer text-[11px]"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setFormAllowedBranches(formAllowedBranches.filter((b) => b !== branch));
                              } else {
                                setFormAllowedBranches([...formAllowedBranches, branch]);
                              }
                            }}
                            className="accent-[#58BDB2]"
                          />
                          <span className="text-[#263238] dark:text-[#F1F5F9]">{branch}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Row 4: Location, Dates & Openings */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                    Job Location
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Bangalore / Hybrid"
                    className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                  />
                </div>

                <div>
                  <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                    Drive Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDriveDate}
                    onChange={(e) => setFormDriveDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                  />
                </div>

                <div>
                  <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                  />
                </div>

                <div>
                  <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                    Openings
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formOpenings}
                    onChange={(e) => setFormOpenings(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl font-mono focus:outline-none focus:border-[#58BDB2]"
                  />
                </div>
              </div>

              {/* Row 5: Required Skills */}
              <div>
                <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                  Required Competencies & Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  placeholder="Java, React, Data Structures, System Design, SQL, Communication..."
                  className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                />
              </div>

              {/* Row 6: Selection Rounds & Process */}
              <div>
                <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                  Selection Process & Evaluation Rounds (One round per line)
                </label>
                <textarea
                  rows={3}
                  value={formRounds}
                  onChange={(e) => setFormRounds(e.target.value)}
                  placeholder="Round 1: Online Aptitude & Coding Assessment&#10;Round 2: Technical Interview 1 (DSA & Architecture)&#10;Round 3: HR & Cultural Fitment"
                  className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                />
              </div>

              {/* Eligibility notes */}
              <div>
                <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                  Additional Eligibility Criteria (shown to students)
                </label>
                <textarea
                  rows={2}
                  value={formEligibilityNotes}
                  onChange={(e) => setFormEligibilityNotes(e.target.value)}
                  placeholder="e.g. No gap years, 10th/12th above 70%..."
                  className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                />
              </div>

              {/* Publish toggle */}
              <label className="flex items-center gap-2 p-3 rounded-xl bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formPublish}
                  onChange={(e) => setFormPublish(e.target.checked)}
                  className="accent-[#58BDB2]"
                />
                <span className="text-[#263238] dark:text-[#F1F5F9]">
                  <strong>Publish to students</strong> - eligible students see this drive immediately. Untick to keep it as a hidden draft.
                </span>
              </label>

              {/* Row 7: Description & Special Instructions */}
              <div>
                <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                  Job Description & Recruiter Guidelines
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Outline key project expectations, tech stack, bond agreements, and preparation advice for candidates..."
                  className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                />
              </div>

              <div className="pt-3 border-t border-[#E4ECEA] dark:border-[#1F333A] flex items-center justify-between">
                <span className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
                  Authorized by {currentUser.name}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDriveModal(false)}
                    className="px-4 py-2 border border-[#E4ECEA] dark:border-[#1F333A] text-[#687572] dark:text-[#94A3B8] hover:bg-neutral-100 dark:hover:bg-[#1E2E33] rounded-xl font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    {editingDriveId ? 'Save Changes' : formPublish ? 'Create & Publish' : 'Save as Draft'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INSPECT ELIGIBLE COHORT FOR SPECIFIC DRIVE */}
      {/* ========================================================================= */}
      {inspectDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#142024] rounded-2xl max-w-3xl w-full shadow-2xl border border-[#E4ECEA] dark:border-[#1F333A] overflow-hidden my-8 transition-colors">
            <div className="p-5 border-b border-[#E4ECEA] dark:border-[#1F333A] flex items-center justify-between bg-[#F7FBFB] dark:bg-[#0E171A]">
              <div>
                <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
                  <span>Eligible Candidates Roster · {inspectDrive.companyName}</span>
                  <span className="text-xs font-mono font-bold text-[#58BDB2] bg-[#EAF7F8] dark:bg-[#122D29] px-2 py-0.5 rounded">
                    {inspectDrive.packageLPA}
                  </span>
                </h3>
                <p className="text-xs text-[#687572] dark:text-[#94A3B8]">
                  Cutoffs: Min CGPA {inspectDrive.eligibility.minCGPA} · Max Backlogs {inspectDrive.eligibility.maxBacklogs} · Allowed Branches: {inspectDrive.eligibility.allowedBranches?.length || ALL_BRANCHES.length}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportEligibleCsv(inspectDrive)}
                  className="px-3 py-1.5 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => setInspectDrive(null)}
                  className="p-1.5 text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9] rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1E2E33] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 text-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7FBFB] dark:bg-[#0E171A] sticky top-0 border-b border-[#E4ECEA] dark:border-[#1F333A] text-[#687572] dark:text-[#94A3B8] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Student Name & ID</th>
                    <th className="py-2.5 px-3">Branch</th>
                    <th className="py-2.5 px-3">CGPA</th>
                    <th className="py-2.5 px-3">Backlogs</th>
                    <th className="py-2.5 px-3">Skills Match</th>
                    <th className="py-2.5 px-3 text-right">Application Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4ECEA] dark:divide-[#1F333A]">
                  {students.map((stu) => {
                    const { eligible, reasons } = placementService.checkEligibility(stu, inspectDrive);
                    const app = applications.find(
                      (a) => a.driveId === inspectDrive.id && a.studentId.toUpperCase() === stu.Student_ID.toUpperCase()
                    );

                    return (
                      <tr
                        key={stu.Student_ID}
                        className={eligible ? 'hover:bg-[#F7FBFB] dark:hover:bg-[#18262B]' : 'opacity-50 hover:bg-neutral-50 dark:hover:bg-[#10181A]'}
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-[#263238] dark:text-[#F1F5F9]">{stu.Full_Name}</div>
                          <div className="font-mono text-[10px] text-[#687572] dark:text-[#94A3B8]">{stu.Student_ID}</div>
                        </td>
                        <td className="py-2.5 px-3 text-[#687572] dark:text-[#94A3B8]">
                          {stu.Branch.split('&')[0]}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#263238] dark:text-[#F1F5F9]">
                          {stu.CGPA.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {stu.Backlogs}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-[#687572] dark:text-[#94A3B8]">
                          {stu.Technical_Skills.slice(0, 2).join(', ')}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {app ? (
                            <span className="font-bold text-[#58BDB2] text-[10px] bg-[#EAF7F8] dark:bg-[#122D29] px-2 py-0.5 rounded-full">
                              Applied ({app.status})
                            </span>
                          ) : eligible ? (
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[10px]">
                              Eligible (Not Applied)
                            </span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400 text-[10px]" title={reasons.join(', ')}>
                              Ineligible
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPDATE APPLICANT STAGE */}
      {/* ========================================================================= */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#142024] rounded-2xl max-w-md w-full shadow-2xl border border-[#E4ECEA] dark:border-[#1F333A] overflow-hidden transition-colors">
            <div className="p-5 border-b border-[#E4ECEA] dark:border-[#1F333A] flex items-center justify-between bg-[#F7FBFB] dark:bg-[#0E171A]">
              <div>
                <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">
                  Update Application Stage
                </h3>
                <p className="text-xs text-[#687572] dark:text-[#94A3B8]">
                  {selectedApp.studentId} · {selectedApp.companyName} ({selectedApp.role})
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAppStatus} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                  Select New Hiring Stage
                </label>
                <select
                  value={newAppStatus}
                  onChange={(e) => setNewAppStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                >
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-[#687572] dark:text-[#94A3B8] font-semibold mb-1">
                  Official Coordinator Remarks / Instructions
                </label>
                <textarea
                  rows={3}
                  value={newAppNotes}
                  onChange={(e) => setNewAppNotes(e.target.value)}
                  placeholder="e.g. Cleared OA with 88%. Technical interview scheduled for Thursday 2:00 PM in Lab 4..."
                  className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[#263238] dark:text-[#F1F5F9] rounded-xl focus:outline-none focus:border-[#58BDB2]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 border border-[#E4ECEA] dark:border-[#1F333A] text-[#687572] dark:text-[#94A3B8] rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Save & Notify Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
    </div>
  );
};
