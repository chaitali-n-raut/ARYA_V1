import React, { useEffect, useState } from 'react';
import { StudentRecord, RoadmapMilestone } from '../../types';
import { readinessService } from '../../services/readinessService';
import { Milestone, CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';

interface Props {
  student: StudentRecord;
}

export const StudentRoadmap: React.FC<Props> = ({ student }) => {
  const initialRoadmap = readinessService.getPersonalizedRoadmap(student);
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>(initialRoadmap);

  useEffect(() => {
    setMilestones(readinessService.getPersonalizedRoadmap(student));
  }, [student]);

  const toggleActionItem = (milestoneId: string, actionId: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        const updatedActions = m.actionItems.map((act) =>
          act.id === actionId ? { ...act, completed: !act.completed } : act
        );
        const allCompleted = updatedActions.every((a) => a.completed);
        const someCompleted = updatedActions.some((a) => a.completed);

        return {
          ...m,
          actionItems: updatedActions,
          status: allCompleted ? 'completed' : someCompleted ? 'in_progress' : 'upcoming'
        };
      })
    );
  };

  const totalTasks = milestones.reduce((sum, m) => sum + m.actionItems.length, 0);
  const completedTasks = milestones.reduce(
    (sum, m) => sum + m.actionItems.filter((a) => a.completed).length,
    0
  );
  const overallRoadmapProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl transition-colors">
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">Personalized Learning Roadmap</h2>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-0.5">
            Actions are generated from the current profile and role-skill gaps. Suggested actions begin unchecked and are not evidence of completed work.
          </p>
        </div>

        {/* Overall progress indicator */}
        <div className="flex items-center gap-3 bg-[#EAF7F8] dark:bg-[#122D29] px-4 py-2 rounded-xl border border-[#58BDB2]/30 dark:border-[#27665E]">
          <div>
            <div className="text-[11px] font-semibold text-[#263238] dark:text-[#F1F5F9]">Overall Milestone Progress</div>
            <div className="text-xs text-[#2EA396] dark:text-[#58BDB2] font-bold">
              {completedTasks} of {totalTasks} Tasks Done ({overallRoadmapProgress}%)
            </div>
          </div>
          <div className="w-16 h-2 bg-white dark:bg-[#1A3D38] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#58BDB2] rounded-full transition-all duration-500"
              style={{ width: `${overallRoadmapProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline Milestones */}
      <div className="space-y-4">
        {milestones.map((m, idx) => {
          const isDone = m.status === 'completed';
          const isInProgress = m.status === 'in_progress';

          return (
            <div
              key={m.id}
              className={`p-6 rounded-2xl border transition-all ${
                isDone
                  ? 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                  : isInProgress
                  ? 'bg-white dark:bg-[#142024] border-[#58BDB2] dark:border-[#58BDB2] shadow-xs'
                  : 'bg-white dark:bg-[#142024] border-[#E4ECEA] dark:border-[#1F333A]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4ECEA] dark:border-[#1F333A] pb-3 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#58BDB2]">0{idx + 1}.</span>
                    <span className="text-xs font-bold text-[#687572] dark:text-[#94A3B8] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#58BDB2]" />
                      <span>{m.weekRange}</span>
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        isDone
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                          : isInProgress
                          ? 'bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2]'
                          : 'bg-neutral-100 dark:bg-[#1B2B30] text-[#687572] dark:text-[#94A3B8]'
                      }`}
                    >
                      {isDone ? 'Completed' : isInProgress ? 'In Progress' : 'Upcoming'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">{m.title}</h3>
                  <p className="text-xs text-[#687572] dark:text-[#94A3B8]">{m.description}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 sm:justify-end">
                  {m.skillsCovered.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md bg-[#F7FBFB] dark:bg-[#0E171A] border border-[#E4ECEA] dark:border-[#1F333A] text-[10px] font-medium text-[#263238] dark:text-[#F1F5F9]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Item Checkboxes */}
              <div className="space-y-2">
                {m.actionItems.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => toggleActionItem(m.id, action.id)}
                    className="w-full text-left p-3 rounded-xl bg-[#F7FBFB] dark:bg-[#0E171A] hover:bg-neutral-100/70 dark:hover:bg-[#17272C] border border-[#E4ECEA] dark:border-[#1F333A] flex items-start gap-3 transition-colors cursor-pointer group"
                  >
                    <span className="mt-0.5 shrink-0">
                      {action.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2EA396] dark:text-[#58BDB2]" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#687572] dark:text-[#94A3B8] group-hover:text-[#58BDB2]" />
                      )}
                    </span>
                    <span
                      className={`text-xs ${
                        action.completed ? 'line-through text-[#687572] dark:text-[#94A3B8]' : 'text-[#263238] dark:text-[#F1F5F9] font-medium'
                      }`}
                    >
                      {action.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
