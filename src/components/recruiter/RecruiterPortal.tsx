import React, { useMemo, useState } from 'react';
import { User } from '../../types';
import { studentService } from '../../services/studentService';
import { placementService } from '../../services/placementService';
import { CandidateMatch, matchCandidatesToDrive } from '../../services/recruiterMatchingService';
import {
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Star,
  Users
} from 'lucide-react';

interface Props {
  currentUser: User;
}

const percent = (value: number | null) => value === null ? '—' : `${Math.round(value)}%`;

export const RecruiterPortal: React.FC<Props> = ({ currentUser }) => {
  const [students] = useState(() => studentService.getAllStudents());
  const [drives] = useState(() => placementService.getPublishedDrives());
  const [selectedDriveId, setSelectedDriveId] = useState(() => placementService.getPublishedDrives()[0]?.id ?? '');
  const [sortBy, setSortBy] = useState<'match' | 'readiness'>('match');
  const [detailsStudentId, setDetailsStudentId] = useState<string | null>(null);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);

  const selectedDrive = drives.find((drive) => drive.id === selectedDriveId) ?? null;
  const results = useMemo(
    () => selectedDrive ? matchCandidatesToDrive(students, selectedDrive) : null,
    [students, selectedDrive]
  );
  const eligibleCandidates = useMemo(() => {
    if (!results) return [];
    return [...results.eligibleCandidates].sort((a, b) => {
      const primary = sortBy === 'readiness'
        ? (b.readinessScore ?? -1) - (a.readinessScore ?? -1)
        : (b.matchScore ?? -1) - (a.matchScore ?? -1);
      if (primary !== 0) return primary;
      return (b.matchScore ?? -1) - (a.matchScore ?? -1);
    });
  }, [results, sortBy]);

  const toggleShortlist = (studentId: string) => {
    setShortlistedIds((previous) => previous.includes(studentId)
      ? previous.filter((id) => id !== studentId)
      : [...previous, studentId]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 transition-colors">
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">Recruiter Candidate Matching</h1>
            <span className="text-[11px] font-semibold bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] px-2.5 py-0.5 rounded-full border border-[#58BDB2]/30 dark:border-[#27665E]">
              {currentUser.organization || 'Recruiter Portal'}
            </span>
          </div>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-1">
            Logged in as <strong className="text-[#263238] dark:text-[#F1F5F9]">{currentUser.name}</strong>. Eligible students are ranked using available profile evidence.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#F7FBFB] dark:bg-[#0E171A] px-4 py-2 rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          <div className="text-xs">
            <span className="text-[#687572] dark:text-[#94A3B8]">Shortlisted:</span>{' '}
            <strong className="text-[#263238] dark:text-[#F1F5F9] font-mono">{shortlistedIds.length}</strong>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
        <h2 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
          <Filter className="w-4 h-4 text-[#58BDB2]" /> Opportunity and ranking
        </h2>
        {drives.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label htmlFor="recruiter-drive" className="text-[#687572] dark:text-[#94A3B8] font-medium block mb-1">Placement opportunity</label>
              <select
                id="recruiter-drive"
                value={selectedDriveId}
                onChange={(event) => { setSelectedDriveId(event.target.value); setDetailsStudentId(null); }}
                className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg text-[#263238] dark:text-[#F1F5F9] focus:outline-none focus:border-[#58BDB2]"
              >
                {drives.map((drive) => (
                  <option key={drive.id} value={drive.id}>{drive.companyName} — {drive.role}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="candidate-sort" className="text-[#687572] dark:text-[#94A3B8] font-medium block mb-1">Sort eligible candidates by</label>
              <select
                id="candidate-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as 'match' | 'readiness')}
                className="w-full px-3 py-2 bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] rounded-lg text-[#263238] dark:text-[#F1F5F9] focus:outline-none focus:border-[#58BDB2]"
              >
                <option value="match">Match Score</option>
                <option value="readiness">Readiness</option>
              </select>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#687572] dark:text-[#94A3B8]">No published placement opportunities are available yet.</p>
        )}
        {selectedDrive && (
          <div className="rounded-xl bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] p-4 text-xs space-y-1">
            <div className="font-semibold text-[#263238] dark:text-[#F1F5F9]">{selectedDrive.companyName} · {selectedDrive.role}</div>
            <div className="text-[#687572] dark:text-[#94A3B8]">
              Minimum CGPA {selectedDrive.eligibility.minCGPA} · Maximum backlogs {selectedDrive.eligibility.maxBacklogs} · Graduation year {selectedDrive.eligibility.graduationYear}
            </div>
            <div className="text-[#687572] dark:text-[#94A3B8]">
              Branches: {selectedDrive.eligibility.allowedBranches.length ? selectedDrive.eligibility.allowedBranches.join(', ') : 'None listed'} · Required skills: {selectedDrive.requiredSkills.length ? selectedDrive.requiredSkills.join(', ') : 'None listed'}
            </div>
          </div>
        )}
        <div className="rounded-xl border border-[#58BDB2]/30 bg-[#EAF7F8]/60 dark:bg-[#122D29]/50 px-4 py-3 text-[11px] text-[#263238] dark:text-[#F1F5F9]">
          Candidate Match Score is a deterministic decision-support score based on the available profile data. It is not a trained ML prediction.
          <div className="mt-1 text-[#687572] dark:text-[#94A3B8]">Base weights: Readiness 50%, Skill Match 30%, Project Relevance 10%, Certification Relevance 10%. Dimensions without recorded evidence are omitted and the remaining weights are normalized.</div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-white dark:bg-[#142024] p-8 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] text-center text-sm text-[#687572] dark:text-[#94A3B8]">
          <Users className="w-6 h-6 mx-auto mb-2 text-[#58BDB2]" />
          No student records available for matching.
        </div>
      ) : selectedDrive && results ? (
        <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3">
            <h2 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#58BDB2]" /> Eligible Candidates ({eligibleCandidates.length})
            </h2>
            <span className="text-xs text-[#687572] dark:text-[#94A3B8]">{results.uniqueStudentCount} unique student records checked</span>
          </div>

          {eligibleCandidates.length === 0 ? (
            <p className="py-5 text-center text-xs text-[#687572] dark:text-[#94A3B8]">No eligible candidates match this opportunity&apos;s criteria.</p>
          ) : (
            <div className="space-y-4">
              {eligibleCandidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate.student.Student_ID}
                  candidate={candidate}
                  rank={index + 1}
                  driveId={selectedDrive.id}
                  requiredSkills={selectedDrive.requiredSkills}
                  isShortlisted={shortlistedIds.includes(candidate.student.Student_ID)}
                  detailsOpen={detailsStudentId === candidate.student.Student_ID}
                  onToggleShortlist={() => toggleShortlist(candidate.student.Student_ID)}
                  onToggleDetails={() => setDetailsStudentId((current) => current === candidate.student.Student_ID ? null : candidate.student.Student_ID)}
                />
              ))}
            </div>
          )}

          {results.excludedCandidates.length > 0 && (
            <details className="rounded-xl border border-[#E4ECEA] dark:border-[#1F333A] p-4">
              <summary className="cursor-pointer text-xs font-semibold text-[#687572] dark:text-[#94A3B8]">
                Excluded by eligibility criteria ({results.excludedCandidates.length})
              </summary>
              <div className="mt-3 space-y-2">
                {results.excludedCandidates.map((candidate) => (
                  <div key={candidate.student.Student_ID} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="text-[#263238] dark:text-[#F1F5F9]">{candidate.student.Full_Name} ({candidate.student.Student_ID})</span>
                    <span className="text-amber-700 dark:text-amber-300">{candidate.eligibilityReasons.join('; ')}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      ) : null}
    </div>
  );
};

function CandidateCard({
  candidate,
  rank,
  driveId,
  requiredSkills,
  isShortlisted,
  detailsOpen,
  onToggleShortlist,
  onToggleDetails
}: {
  candidate: CandidateMatch;
  rank: number;
  driveId: string;
  requiredSkills: string[];
  isShortlisted: boolean;
  detailsOpen: boolean;
  onToggleShortlist: () => void;
  onToggleDetails: () => void;
}) {
  const student = candidate.student;
  const application = placementService.getApplicationsForDrive(driveId)
    .find((item) => item.studentId.trim().toUpperCase() === student.Student_ID.trim().toUpperCase());

  return (
    <article className="p-5 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] hover:border-[#58BDB2]/60 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3 mb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#58BDB2]">#{rank}</span>
            <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">{student.Full_Name}</h3>
            <span className="text-xs font-mono text-[#687572] dark:text-[#94A3B8]">({student.Student_ID})</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
              <CheckCircle2 className="w-3 h-3" /> Eligibility: Eligible
            </span>
          </div>
          <div className="text-xs text-[#687572] dark:text-[#94A3B8]">
            {student.Branch} · CGPA {student.CGPA.toFixed(2)} · {student.Backlogs} backlogs · Graduation {student.Graduation_Year}
          </div>
          {application && <div className="text-[11px] text-[#687572] dark:text-[#94A3B8]">Application status: {application.status}</div>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Score label="Match Score" value={percent(candidate.matchScore)} />
          <Score label="Readiness" value={candidate.readinessScore === null ? 'Unavailable' : `${candidate.readinessScore}/100`} />
          <button type="button" onClick={onToggleShortlist} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${isShortlisted ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-[#16272C] border border-[#58BDB2] text-[#2EA396] dark:text-[#58BDB2] hover:bg-[#EAF7F8] dark:hover:bg-[#1E3B37]'}`}>
            {isShortlisted ? 'Shortlisted' : 'Shortlist'}
          </button>
          <button type="button" onClick={onToggleDetails} className="p-2 rounded-lg border border-[#E4ECEA] dark:border-[#1F333A] text-[#687572] dark:text-[#94A3B8]" aria-label={detailsOpen ? 'Close candidate details' : 'Open candidate details'}>
            {detailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-[#687572] dark:text-[#94A3B8] font-semibold text-[11px] block mb-1">Skill Match</span>
          <strong className="text-[#263238] dark:text-[#F1F5F9]">{candidate.skillInformationAvailable ? percent(candidate.skillMatchPercent) : 'Information unavailable'}</strong>
        </div>
        <div>
          <span className="text-[#687572] dark:text-[#94A3B8] font-semibold text-[11px] block mb-1">Matched Skills</span>
          <div className="flex flex-wrap gap-1">
            {candidate.skillInformationAvailable
              ? candidate.matchingSkills.length
                ? candidate.matchingSkills.map((skill) => <span key={skill} className="px-2 py-0.5 bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2] rounded border border-[#58BDB2]/20">{skill}</span>)
                : <span className="text-[#687572] dark:text-[#94A3B8]">No required skills matched</span>
              : <span className="text-[#687572] dark:text-[#94A3B8]">Skill information unavailable</span>}
          </div>
        </div>
        <div>
          <span className="text-[#687572] dark:text-[#94A3B8] font-semibold text-[11px] block mb-1">Unrecorded Required Skills</span>
          <span className="text-[#263238] dark:text-[#F1F5F9]">
            {!requiredSkills.length ? 'No required skills listed'
              : !candidate.skillInformationAvailable ? 'Skill information unavailable'
                : candidate.unrecordedRequiredSkills.length ? candidate.unrecordedRequiredSkills.join(', ') : 'None'}
          </span>
        </div>
        <div className="flex gap-3">
          <Score label="Project Relevance" value={percent(candidate.projectRelevancePercent)} />
          <Score label="Certification Relevance" value={percent(candidate.certificationRelevancePercent)} />
        </div>
      </div>

      {detailsOpen && (
        <div className="mt-4 pt-4 border-t border-[#E4ECEA] dark:border-[#1F333A] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <h4 className="font-semibold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-1"><Search className="w-3.5 h-3.5 text-[#58BDB2]" /> Student details</h4>
            <div className="text-[#687572] dark:text-[#94A3B8]">Email: {student.Email || 'Not recorded'}</div>
            <div className="text-[#687572] dark:text-[#94A3B8]">Attendance: {student.Attendance_Percentage ? `${student.Attendance_Percentage}%` : 'Not recorded'}</div>
            <div className="text-[#687572] dark:text-[#94A3B8]">Skills: {candidate.skillInformationAvailable ? student.Technical_Skills.join(', ') : 'Not recorded'}</div>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-[#263238] dark:text-[#F1F5F9] flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-[#58BDB2]" /> Recorded profile evidence</h4>
            <div className="text-[#687572] dark:text-[#94A3B8]">Projects: {student.Projects?.filter(Boolean).join('; ') || 'No project information recorded'}</div>
            <div className="text-[#687572] dark:text-[#94A3B8]">Certifications: {student.Certifications?.filter(Boolean).join('; ') || 'No certification information recorded'}</div>
          </div>
        </div>
      )}
    </article>
  );
}

function Score({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right min-w-[72px]">
      <div className="text-sm font-bold font-mono text-[#2EA396] dark:text-[#58BDB2]">{value}</div>
      <div className="text-[10px] text-[#687572] dark:text-[#94A3B8]">{label}</div>
    </div>
  );
}
