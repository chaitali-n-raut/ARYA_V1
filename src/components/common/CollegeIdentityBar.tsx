import React from 'react';
import { Building2, ShieldCheck, Copy } from 'lucide-react';
import { User } from '../../types';
import { authService } from '../../services/authService';

interface Props { currentUser: User; }

export const CollegeIdentityBar: React.FC<Props> = ({ currentUser }) => {
  const tenant = authService.getCurrentTenant();
  const collegeName = tenant?.name || currentUser.organization || 'Your Institution';
  const collegeCode = tenant?.collegeCode || '';
  const roleLabel = currentUser.role === 'tnp'
    ? 'Training & Placement'
    : `${currentUser.role.charAt(0).toUpperCase()}${currentUser.role.slice(1)} Workspace`;

  const copyCode = () => {
    if (collegeCode) navigator.clipboard?.writeText(collegeCode);
  };

  return (
    <div className="border-b border-[#DDE8E5] dark:border-[#1F333A] bg-white dark:bg-[#111D21] px-5 md:px-8 py-2.5">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#EAF7F8] dark:bg-[#153430] text-[#2EA396] dark:text-[#58BDB2] flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#263238] dark:text-[#F1F5F9] truncate">{collegeName}</div>
            <div className="text-[10px] text-[#687572] dark:text-[#94A3B8] truncate">ARYA AI TalentLink · {roleLabel}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-semibold text-[#2EA396] dark:text-[#58BDB2] whitespace-nowrap">
          {currentUser.role === 'tnp' && collegeCode && (
            <button
              type="button"
              onClick={copyCode}
              title="Copy College Code"
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md border border-[#58BDB2]/30 hover:bg-[#EAF7F8] dark:hover:bg-[#153430] cursor-pointer"
            >
              <span className="font-mono tracking-wider">{collegeCode}</span>
              <Copy className="w-3 h-3" />
            </button>
          )}
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Institution Workspace</span>
        </div>
      </div>
    </div>
  );
};
