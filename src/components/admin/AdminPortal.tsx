import React, { useState } from 'react';
import { User, StudentRecord } from '../../types';
import { studentService } from '../../services/studentService';
import { placementService } from '../../services/placementService';
import { useDataVersion } from '../../services/dataEvents';
import {
  ShieldCheck,
  Building,
  GraduationCap,
  Users,
  Award,
  BarChart3,
  Download,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const AdminPortal: React.FC<Props> = ({ currentUser }) => {
  useDataVersion(); // always read the live shared database
  const students: StudentRecord[] = studentService.getAllStudents();
  const drives = placementService.getAllDrives().filter((d) => d.published);
  const [activeReportTab, setActiveReportTab] = useState<'overview' | 'accreditation' | 'departments'>('overview');

  const totalStudents = students.length;
  const zeroBacklogs = students.filter((s) => s.Backlogs === 0).length;
  const avgCgpa = totalStudents > 0 ? (students.reduce((acc, s) => acc + s.CGPA, 0) / totalStudents).toFixed(2) : '0.00';
  const avgAttendance = totalStudents > 0 ? (
    students.reduce((acc, s) => acc + s.Attendance_Percentage, 0) / totalStudents
  ).toFixed(1) : '0.0';

  // Department breakdown
  const deptMap: Record<string, { count: number; avgCgpa: number; cleared: number }> = {};
  students.forEach((s) => {
    if (!deptMap[s.Branch]) {
      deptMap[s.Branch] = { count: 0, avgCgpa: 0, cleared: 0 };
    }
    deptMap[s.Branch].count += 1;
    deptMap[s.Branch].avgCgpa += s.CGPA;
    if (s.Backlogs === 0) deptMap[s.Branch].cleared += 1;
  });

  const handleDownloadAccreditationReport = () => {
    const reportData = [
      'ARYA AI INSTITUTIONAL EMPLOYABILITY & READINESS REPORT',
      `Generated on: ${new Date().toLocaleDateString()}`,
      `Evaluating Authority: ${currentUser.name} (${currentUser.designation})`,
      '------------------------------------------------------------',
      `Total B.Tech Cohort Evaluated: ${totalStudents}`,
      `Average Cumulative GPA: ${avgCgpa} / 10.0`,
      `Average Cohort Attendance: ${avgAttendance}%`,
      `Placement Cleared (0 Active Backlogs): ${zeroBacklogs} (${totalStudents > 0 ? Math.round(
        (zeroBacklogs / totalStudents) * 100
      ) : 0}%)`,
      `Active Recruiter Campus Drives: ${drives.length}`,
      '------------------------------------------------------------',
      'Branch-wise Readiness Compliance:',
      ...Object.entries(deptMap).map(
        ([branch, stats]) =>
          ` - ${branch}: Count=${stats.count}, Avg CGPA=${(stats.avgCgpa / stats.count).toFixed(
            2
          )}, Cleared=${stats.cleared}`
      )
    ].join('\n');

    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ARYA_AI_Accreditation_Report_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 transition-colors">
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">University Administration & HOD Console</h1>
            <span className="text-[11px] font-semibold bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] px-2.5 py-0.5 rounded-full border border-[#58BDB2]/30 dark:border-[#27665E]">
              Institutional Governance
            </span>
          </div>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-1">
            Logged in as <strong className="text-[#263238] dark:text-[#F1F5F9]">{currentUser.name}</strong> ({currentUser.designation}) · University-wide employability analytics & accreditation reporting.
          </p>
        </div>

        <button
          onClick={handleDownloadAccreditationReport}
          className="flex items-center gap-2 px-4 py-2 bg-[#58BDB2] hover:bg-[#48a99f] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export NAAC/NBA Compliance Dossier</span>
        </button>
      </div>

      {/* High-Level Institutional KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-1 transition-colors">
          <div className="text-xs font-medium text-[#687572] dark:text-[#94A3B8]">Cohort Size</div>
          <div className="text-3xl font-extrabold font-mono text-[#263238] dark:text-[#F1F5F9]">{totalStudents}</div>
          <div className="text-[11px] text-[#2EA396] dark:text-[#58BDB2] font-medium">B.Tech 2026 Batch</div>
        </div>

        <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-1 transition-colors">
          <div className="text-xs font-medium text-[#687572] dark:text-[#94A3B8]">Mean CGPA</div>
          <div className="text-3xl font-extrabold font-mono text-[#263238] dark:text-[#F1F5F9]">{avgCgpa}</div>
          <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">Scale of 10.00</div>
        </div>

        <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-1 transition-colors">
          <div className="text-xs font-medium text-[#687572] dark:text-[#94A3B8]">Mean Attendance</div>
          <div className="text-3xl font-extrabold font-mono text-[#263238] dark:text-[#F1F5F9]">{avgAttendance}%</div>
          <div className="text-[11px] text-[#2EA396] dark:text-[#58BDB2] font-medium">Institutional Compliance</div>
        </div>

        <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-1 transition-colors">
          <div className="text-xs font-medium text-[#687572] dark:text-[#94A3B8]">Placement Cleared</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
            {totalStudents > 0 ? Math.round((zeroBacklogs / totalStudents) * 100) : 0}%
          </div>
          <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">{zeroBacklogs} Students 0 Backlogs</div>
        </div>
      </div>

      {/* Department-Level Analytics Breakdown */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
          <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
            <Building className="w-5 h-5 text-[#58BDB2]" />
            <span>Academic Department Employability Breakdown</span>
          </h3>
          <span className="text-xs text-[#687572] dark:text-[#94A3B8]">School of Computing & IT</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(deptMap).map(([branch, stats]) => {
            const branchAvg = (stats.avgCgpa / stats.count).toFixed(2);
            const clearanceRate = Math.round((stats.cleared / stats.count) * 100);

            return (
              <div
                key={branch}
                className="p-4 rounded-xl bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] space-y-3 text-xs transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#263238] dark:text-[#F1F5F9]">{branch}</span>
                  <span className="text-[11px] text-[#687572] dark:text-[#94A3B8] font-mono">{stats.count} Enrolled</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[#687572] dark:text-[#94A3B8] text-[11px] block">Average CGPA</span>
                    <span className="font-mono font-bold text-[#263238] dark:text-[#F1F5F9] text-base">{branchAvg}</span>
                  </div>
                  <div>
                    <span className="text-[#687572] dark:text-[#94A3B8] text-[11px] block">Placement Cleared</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-base">{clearanceRate}%</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-neutral-200/70 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#58BDB2] rounded-full transition-all duration-500"
                    style={{ width: `${clearanceRate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Institutional Accreditation Summary */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-3 transition-colors">
        <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
          <Award className="w-5 h-5 text-[#58BDB2]" />
          <span>Accreditation & NAAC / NBA Criterion 5 Tracking</span>
        </h3>
        <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">
          ARYA AI automatically generates continuous evidence for Criterion 5.2.1 (Placement of graduating students) and Criterion 2.2.1 (Assessment of learning levels and special programs for advanced and slow learners). Mentoring notes and intervention logs are cryptographically stamped and exportable for institutional audits.
        </p>
      </div>
    </div>
  );
};
