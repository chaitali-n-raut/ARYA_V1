import React, { useState } from 'react';
import { StudentRecord, NotificationItem } from '../../types';
import { placementService } from '../../services/placementService';
import { Bell, Briefcase, UserCheck, Sparkles, Check, Clock } from 'lucide-react';

interface Props {
  student: StudentRecord;
  onRefreshBadge: () => void;
}

export const StudentNotifications: React.FC<Props> = ({ student, onRefreshBadge }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    placementService.getNotificationsForStudent(student.Student_ID)
  );
  const [filter, setFilter] = useState<'all' | 'drive' | 'mentor' | 'agentic'>('all');

  const handleMarkAsRead = (id: string) => {
    placementService.markNotificationAsRead(id);
    setNotifications(placementService.getNotificationsForStudent(student.Student_ID));
    onRefreshBadge();
  };

  const filteredNotifs =
    filter === 'all' ? notifications : notifications.filter((n) => n.type === filter);

  return (
    <div className="space-y-6 max-w-5xl transition-colors">
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-[#263238] dark:text-[#F1F5F9]">Alerts & Proactive Notifications</h2>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] mt-0.5">
            Placement drive deadlines, faculty mentor updates, and agentic career recommendations.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F7FBFB] dark:bg-[#0E171A] rounded-xl border border-[#E4ECEA] dark:border-[#1F333A]">
          {(['all', 'drive', 'mentor', 'agentic'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize cursor-pointer ${
                filter === t
                  ? 'bg-white dark:bg-[#1C2C32] text-[#263238] dark:text-[#F1F5F9] shadow-xs font-bold'
                  : 'text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9]'
              }`}
            >
              {t === 'all' ? 'All Alerts' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="bg-white dark:bg-[#142024] p-12 rounded-2xl border border-[#E4ECEA] dark:border-[#1F333A] text-center space-y-3 transition-colors">
          <Bell className="w-10 h-10 text-[#687572] dark:text-[#94A3B8] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#263238] dark:text-[#F1F5F9]">No Notifications Yet</h3>
          <p className="text-xs text-[#687572] dark:text-[#94A3B8] max-w-md mx-auto">
            Proactive alerts for campus placement deadlines, faculty mentor advisory notes, and career roadmap insights will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                item.read
                  ? 'bg-white dark:bg-[#142024] border-[#E4ECEA] dark:border-[#1F333A]'
                  : 'bg-[#EAF7F8]/30 dark:bg-[#122D29]/40 border-[#58BDB2]/40 dark:border-[#27665E] shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.type === 'drive'
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                        : item.type === 'mentor'
                        ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
                        : 'bg-teal-50 dark:bg-teal-950/40 text-[#2EA396] dark:text-[#58BDB2]'
                    }`}
                  >
                    {item.type === 'drive' && <Briefcase className="w-4 h-4" />}
                    {item.type === 'mentor' && <UserCheck className="w-4 h-4" />}
                    {item.type === 'agentic' && <Sparkles className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">{item.title}</h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#58BDB2]" />
                      )}
                    </div>
                    <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">{item.message}</p>
                    <div className="text-[11px] text-[#687572] dark:text-[#94A3B8] flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3 text-[#58BDB2]" />
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>

                {!item.read && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#2EA396] dark:text-[#58BDB2] hover:bg-[#EAF7F8] dark:hover:bg-[#122D29] rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
