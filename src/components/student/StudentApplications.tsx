import React, { useEffect, useState } from 'react';
import { StudentRecord } from '../../types';
import { placementService } from '../../services/placementService';
import { useDataVersion } from '../../services/dataEvents';
import { Send, CheckCircle2, Clock, Calendar, ArrowRight, Building } from 'lucide-react';

interface Props {
  student: StudentRecord;
  onNavigateTab: (tab: string) => void;
}

export const StudentApplications: React.FC<Props> = ({ student, onNavigateTab }) => {
  const dataVersion = useDataVersion();
  const [applications, setApplications] = useState(placementService.getApplicationsByStudent(student.Student_ID));
  useEffect(() => {
    setApplications(placementService.getApplicationsByStudent(student.Student_ID));
  }, [dataVersion, student.Student_ID]);

  const getStageColor = (status: string) => {
    switch (status) {
      case 'Selected':
        return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60';
      case 'Interview':
      case 'Under Review':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
      case 'Rejected':
        return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/60';
      case 'Shortlisted':
        return 'bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] border-[#58BDB2]/30 dark:border-[#27665E]';
      default:
        return 'bg-neutral-100 dark:bg-[#1B2B30] text-[#263238] dark:text-[#F1F5F9] border-[#E4ECEA] dark:border-[#1F333A]';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl transition-colors">
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">My Placement Applications</h2>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-0.5">
            Real-time status tracking for campus recruitment drives and shortlists.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('placements')}
          className="px-4 py-2 bg-[#58BDB2] text-white font-semibold text-xs rounded-xl hover:bg-[#48a99f] transition-colors cursor-pointer shadow-xs"
        >
          Explore More Drives
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white dark:bg-[#142024] p-12 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] text-center space-y-3 transition-colors">
          <Send className="w-10 h-10 text-[#687572] dark:text-[#94A3B8] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">No Applications Submitted Yet</h3>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] max-w-md mx-auto">
            Review active placement drives matching your CGPA and branch to submit your first corporate placement application.
          </p>
          <button
            onClick={() => onNavigateTab('placements')}
            className="mt-2 px-4 py-2 bg-[#58BDB2] text-white rounded-xl text-xs font-semibold hover:bg-[#48a99f] transition-colors cursor-pointer shadow-xs"
          >
            Browse Active Drives
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#58BDB2]" />
                    <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">{app.companyName}</h3>
                    <span className="text-xs text-[#687572] dark:text-[#94A3B8]">·</span>
                    <span className="text-xs font-semibold text-[#58BDB2]">{app.role}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#687572] dark:text-[#94A3B8]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#58BDB2]" />
                      <span>Applied on {app.appliedAt ? new Date(app.appliedAt).toLocaleString() : app.appliedDate}</span>
                    </span>
                    <span>·</span>
                    <span className="font-mono font-bold text-[#263238] dark:text-[#F1F5F9]">{app.packageLPA}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStageColor(
                      app.status
                    )}`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{app.status}</span>
                  </span>
                </div>
              </div>

              {/* Stage Notes from T&P or Recruiter */}
              <div className="p-3.5 rounded-xl bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-xs space-y-1">
                <span className="font-semibold text-[#263238] dark:text-[#F1F5F9] block text-[11px]">Recruitment Coordinator Update:</span>
                <p className="text-[#687572] dark:text-[#94A3B8] leading-relaxed">{app.stageNotes}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
