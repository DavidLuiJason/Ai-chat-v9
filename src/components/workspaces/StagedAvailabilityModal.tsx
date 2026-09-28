import React from 'react';
import { AvailabilityCheck, AvailabilityStatus } from '../../types/index.ts';
import { useApp } from '../../context/AppContext.tsx';

interface StagedAvailabilityModalProps {
  check: AvailabilityCheck | null;
  onClose: () => void;
}

export const StagedAvailabilityModal: React.FC<StagedAvailabilityModalProps> = ({ check, onClose }) => {
  const { performManagerHandoff } = useApp();

  if (!check) return null;

  const handleActivateBackup = () => {
    if (check.role === 'MANAGER' && check.workspaceId) {
      performManagerHandoff(
        check.workspaceId,
        `Triggered by Staged Availability Check: ${check.targetAccountName} unresponsive during SLA inspection.`
      );
      onClose();
    }
  };

  const getStatusColor = (status?: AvailabilityStatus) => {
    switch (status) {
      case 'RESPONDING':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'WORKING':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'RATE_LIMITED':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'AUTHENTICATION_REQUIRED':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'UNRESPONSIVE':
      case 'TEMPORARILY_UNAVAILABLE':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>ROLE: {check.role}</span>
              <span>·</span>
              <span>STAGED AVAILABILITY AUDIT</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              Inspecting {check.targetAccountName}
              {!check.isComplete && (
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              )}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress & Stages */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              Deterministic inspection protocol: 8 stages prevent false-positive failovers.
            </span>
            <span className="font-mono font-medium text-slate-800">
              Stage {check.currentStageIndex + 1} / {check.stages.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {check.stages.map((stage, idx) => {
              const isPast = stage.status === 'PASSED';
              const isCurrent = stage.status === 'RUNNING';
              const isPending = stage.status === 'PENDING';

              return (
                <div
                  key={stage.stage}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isCurrent
                      ? 'border-blue-400 bg-blue-50/40 shadow-xs'
                      : isPast
                      ? 'border-slate-200 bg-white'
                      : 'border-slate-100 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {isPast && (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                          ✓
                        </div>
                      )}
                      {isCurrent && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold animate-pulse">
                          ●
                        </div>
                      )}
                      {isPending && (
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs">
                          {idx + 1}
                        </div>
                      )}
                      <span className={`text-xs font-semibold ${isCurrent ? 'text-blue-900' : 'text-slate-800'}`}>
                        {stage.label}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      {stage.timestamp ? new Date(stage.timestamp).toLocaleTimeString() : 'Waiting'}
                    </span>
                  </div>

                  <p className="mt-1.5 ml-7 text-xs text-slate-600 leading-relaxed">{stage.detail}</p>
                </div>
              );
            })}
          </div>

          {/* Final Status Card */}
          {check.isComplete && check.finalStatus && (
            <div className={`mt-4 p-4 rounded-xl border ${getStatusColor(check.finalStatus)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold opacity-80 mb-0.5">
                    Final Diagnostic Result
                  </div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    Status: {check.finalStatus}
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span>Completed at {new Date(check.completedAt || Date.now()).toLocaleTimeString()}</span>
                </div>
              </div>
              <p className="text-xs mt-2 opacity-90">
                {check.finalStatus === 'RESPONDING'
                  ? `${check.targetAccountName} is healthy and responsive. No intervention required.`
                  : `${check.targetAccountName} is experiencing issues. You may trigger a manager handoff or inspect provider settings.`}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {check.isComplete ? 'Diagnostic session finished.' : 'Performing verification sequence...'}
          </div>
          <div className="flex items-center gap-2">
            {check.role === 'MANAGER' && (
              <button
                onClick={handleActivateBackup}
                className="px-3.5 py-1.5 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer border border-amber-200"
              >
                Activate Backup Manager Now
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
