import React, { useState } from 'react';
import { StudentRecord, PlacementDrive } from '../../types';
import { placementService } from '../../services/placementService';
import {
  Briefcase,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Building,
  GraduationCap,
  Layers,
  FileText,
  ShieldCheck,
  Check
} from 'lucide-react';

interface Props {
  student: StudentRecord;
  onNavigateTab: (tab: string) => void;
}

export const StudentPlacements: React.FC<Props> = ({ student, onNavigateTab }) => {
  const [drives, setDrives] = useState<PlacementDrive[]>(placementService.getAllDrives());
  const [existingApplications, setExistingApplications] = useState(
    placementService.getApplicationsByStudent(student.Student_ID)
  );
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleApply = (drive: PlacementDrive) => {
    const res = placementService.applyToDrive(student, drive);
    if (res.success) {
      setStatusMessage({ text: res.message, type: 'success' });
      setExistingApplications(placementService.getApplicationsByStudent(student.Student_ID));
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl transition-colors">
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">Active Campus Placement Drives</h2>
            <span className="text-[11px] font-semibold bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] px-2.5 py-0.5 rounded-full border border-[#58BDB2]/30 dark:border-[#27665E]">
              {drives.length} Drives Available
            </span>
          </div>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-0.5">
            Verified corporate hiring drives scheduled and authorized by the Central Training & Placement (T&P) Cell.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('applications')}
          className="px-4 py-2 bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] font-semibold text-xs rounded-xl border border-[#58BDB2]/30 dark:border-[#27665E] hover:bg-[#DDF5F0] dark:hover:bg-[#1A3D37] transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>My Applications ({existingApplications.length})</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
              : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/60'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Drives List */}
      {drives.length === 0 ? (
        <div className="bg-white dark:bg-[#142024] p-12 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] text-center space-y-3 transition-colors">
          <Briefcase className="w-12 h-12 text-[#58BDB2] opacity-40 mx-auto" />
          <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">No Active Campus Drives Scheduled</h3>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] max-w-md mx-auto">
            The Central Placement Cell is currently coordinating with corporate recruiters to finalize upcoming schedules. As soon as a placement coordinator publishes a drive, it will appear here with full details.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {drives.map((drive) => {
            const { eligible, reasons } = placementService.checkEligibility(student, drive);
            const appliedRecord = existingApplications.find((a) => a.driveId === drive.id);
            const hasApplied = !!appliedRecord;
            const isBranchPermitted = drive.eligibility.allowedBranches?.includes(student.Branch) ?? true;

            return (
              <div
                key={drive.id}
                className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] hover:border-[#58BDB2]/60 dark:hover:border-[#58BDB2]/60 transition-all shadow-xs space-y-4"
              >
                {/* Header: Company, Logo, Role, Package */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#EAF7F8] dark:bg-[#122D29] border border-[#58BDB2]/30 dark:border-[#27665E] text-[#2EA396] dark:text-[#58BDB2] font-extrabold flex items-center justify-center text-sm shrink-0">
                      {drive.logoText || drive.companyName.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">{drive.companyName}</h3>
                        {drive.status && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              drive.status === 'Closed'
                                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                            }`}
                          >
                            {drive.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#58BDB2]">{drive.role}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#687572] dark:text-[#94A3B8] mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#58BDB2]" />
                          <span>{drive.location}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#58BDB2]" />
                          <span>Drive Date: {drive.driveDate}</span>
                        </span>
                        {drive.bondDetails && (
                          <>
                            <span>·</span>
                            <span>{drive.bondDetails}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:shrink-0 space-y-0.5">
                    <div className="text-lg font-mono font-extrabold text-[#263238] dark:text-[#F1F5F9]">{drive.packageLPA}</div>
                    <div className="text-[10px] text-[#687572] dark:text-[#94A3B8]">{drive.jobType} · {drive.totalOpenings} Openings</div>
                  </div>
                </div>

                <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">{drive.description}</p>

                {/* Eligibility, Branches, and Skills Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#F7FBFB] dark:bg-[#0E171A] p-3.5 rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
                  <div className="space-y-2">
                    <span className="text-[#687572] dark:text-[#94A3B8] font-semibold text-[11px] block">
                      Institutional Eligibility Cutoffs:
                    </span>
                    <div className="space-y-1 text-[11px] text-[#263238] dark:text-[#F1F5F9]">
                      <div className="flex items-center justify-between">
                        <span>Minimum CGPA Required:</span>
                        <strong className="text-[#2EA396] dark:text-[#58BDB2]">
                          {drive.eligibility.minCGPA} (Your CGPA: {student.CGPA.toFixed(2)})
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Max Backlogs Permitted:</span>
                        <strong>
                          {drive.eligibility.maxBacklogs} (Your Backlogs: {student.Backlogs})
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Target Graduation Batch:</span>
                        <span>{drive.eligibility.graduationYear || 2026}</span>
                      </div>
                    </div>

                    {/* Eligible Branches */}
                    <div className="pt-1.5 border-t border-neutral-200 dark:border-[#1E3036]">
                      <span className="text-[11px] text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">
                        Permitted Branches:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(drive.eligibility.allowedBranches || []).map((branch) => {
                          const isStudentBranch = branch === student.Branch;
                          return (
                            <span
                              key={branch}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                isStudentBranch
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold'
                                  : 'bg-white dark:bg-[#16272C] text-[#687572] dark:text-[#94A3B8] border-[#E4ECEA] dark:border-[#1F333A]'
                              }`}
                            >
                              {branch.split('&')[0]} {isStudentBranch ? '✓ (Your Branch)' : ''}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[#687572] dark:text-[#94A3B8] font-semibold text-[11px] block">
                      Required Competencies:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {drive.requiredSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 bg-white dark:bg-[#16272C] border border-[#E4ECEA] dark:border-[#1F333A] rounded text-[10px] font-medium text-[#263238] dark:text-[#F1F5F9]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>

                    {/* Selection Process */}
                    {drive.selectionProcess && drive.selectionProcess.length > 0 && (
                      <div className="pt-1.5 border-t border-neutral-200 dark:border-[#1E3036]">
                        <span className="text-[11px] text-[#687572] dark:text-[#94A3B8] font-semibold block mb-1">
                          Selection Rounds:
                        </span>
                        <ul className="space-y-0.5 text-[10px] text-[#687572] dark:text-[#94A3B8]">
                          {drive.selectionProcess.map((round, rIdx) => (
                            <li key={rIdx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#58BDB2]" />
                              <span>{round}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* If Applied, Show Current Stage & Coordinator Notes */}
                {appliedRecord && (
                  <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Application Status: {appliedRecord.status}</span>
                      </span>
                      <span className="text-[10px] text-blue-800 dark:text-blue-300">
                        Applied on {appliedRecord.appliedDate}
                      </span>
                    </div>
                    {appliedRecord.stageNotes && (
                      <p className="text-[11px] text-blue-800 dark:text-blue-300">
                        <strong>T&P Officer Update:</strong> {appliedRecord.stageNotes}
                      </p>
                    )}
                  </div>
                )}

                {/* Status and Action button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div>
                    {hasApplied ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Application Submitted</span>
                      </span>
                    ) : eligible ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Eligible to Apply</span>
                      </span>
                    ) : (
                      <div className="text-[11px] text-red-600 dark:text-red-400 space-y-0.5">
                        <div className="font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Not Currently Eligible:</span>
                        </div>
                        <div className="italic">{reasons.join(' · ')}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#687572] dark:text-[#94A3B8]">
                      Registration Deadline: <strong className="text-[#263238] dark:text-[#F1F5F9]">{drive.applicationDeadline}</strong>
                    </span>

                    {hasApplied ? (
                      <button
                        onClick={() => onNavigateTab('applications')}
                        className="px-4 py-2 bg-neutral-100 dark:bg-[#1E2E33] hover:bg-neutral-200 dark:hover:bg-[#253940] text-[#263238] dark:text-[#F1F5F9] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Track Status
                      </button>
                    ) : (
                      <button
                        disabled={!eligible}
                        onClick={() => handleApply(drive)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          eligible
                            ? 'bg-[#58BDB2] text-white hover:bg-[#48a99f] shadow-xs cursor-pointer'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                        }`}
                      >
                        <span>Submit Application</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
