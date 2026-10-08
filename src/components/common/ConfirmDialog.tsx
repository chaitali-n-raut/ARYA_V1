import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmState {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
}

interface Props {
  state: ConfirmState | null;
  onClose: () => void;
}

/**
 * In-app confirmation dialog.
 * Replaces window.confirm(), which is silently blocked inside sandboxed iframes
 * (e.g. embedded previews) and made buttons like "Start with Clean Slate" look dead.
 */
export const ConfirmDialog: React.FC<Props> = ({ state, onClose }) => {
  if (!state) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#142024] rounded-2xl max-w-md w-full shadow-xl border border-[#E4ECEA] dark:border-[#1F333A] overflow-hidden">
        <div className="p-5 flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              state.danger
                ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                : 'bg-[#EAF7F8] dark:bg-[#122D29] text-[#2EA396] dark:text-[#58BDB2]'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1.5">
            <h3 className="text-sm font-bold text-[#263238] dark:text-[#F1F5F9]">{state.title}</h3>
            <p className="text-xs text-[#687572] dark:text-[#94A3B8] leading-relaxed">{state.message}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#687572] dark:text-[#94A3B8] hover:text-[#263238] dark:hover:text-[#F1F5F9] cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs border border-[#E4ECEA] dark:border-[#1F333A] text-[#687572] dark:text-[#94A3B8] rounded-xl font-medium hover:bg-neutral-50 dark:hover:bg-[#1B2B30] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const fn = state.onConfirm;
              onClose();
              fn();
            }}
            className={`px-4 py-2 text-xs rounded-xl font-semibold text-white shadow-xs cursor-pointer ${
              state.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#58BDB2] hover:bg-[#48a99f]'
            }`}
          >
            {state.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
