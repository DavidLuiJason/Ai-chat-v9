import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  FolderGit2,
  Users2,
  CheckCircle2,
  FileCode2,
  ArrowRight,
  ShieldAlert,
  Play,
  Zap,
} from 'lucide-react';

interface HomeViewProps {
  onOpenAddAccount: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenAddAccount }) => {
  const {
    workspaces,
    accounts,
    tasks,
    attachments,
    setActiveNav,
    setActiveWorkspaceId,
    startAvailabilityCheck,
  } = useApp();

  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const activeTasksCount = tasks.filter((t) => t.status === 'WORKING' || t.status === 'ASSIGNED').length;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Hero Welcome */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-2xs relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
            <span>AUTONOMOUS MULTI-AI WORKFORCE</span>
            <span>·</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Operational
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Chat Fleet Control
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Coordinate multiple AI accounts as structured Managers, Callers, Workers, and Filters.
            Ensure continuous execution with staged availability testing and zero-loss manager handoffs.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setActiveWorkspaceId(workspaces[0]?.id);
                setActiveNav('workspaces');
              }}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs flex items-center gap-2"
            >
              <span>Launch Active Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenAddAccount}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Connect AI Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards (Zero-pill text styling) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Connected Accounts</span>
            <Users2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{accounts.length}</div>
          <div className="text-[11px] text-slate-400">Sequential identities auto-assigned</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Active Workspaces</span>
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{workspaces.length}</div>
          <div className="text-[11px] text-slate-400">Multi-AI collaboration rooms</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Completed Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{completedTasksCount}</div>
          <div className="text-[11px] text-slate-400">{activeTasksCount} currently in progress</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Artifacts & Files</span>
            <FileCode2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{attachments.length}</div>
          <div className="text-[11px] text-slate-400">Code, CSVs, benchmarks</div>
        </div>
      </div>

      {/* Active Workspaces Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Workspaces</h2>
            <p className="text-xs text-slate-500">Live multi-AI squads and managerial supervision</p>
          </div>
          <button
            onClick={() => setActiveNav('workspaces')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
          >
            View All Workspaces →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workspaces.map((ws) => {
            const mgr = accounts.find((a) => a.id === ws.managerAccountId);
            const bkp = accounts.find((a) => a.id === ws.backupManagerAccountId);
            const wsTaskItems = tasks.filter((t) => t.workspaceId === ws.id);

            return (
              <div
                key={ws.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">{ws.name}</span>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {ws.currentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {ws.objective}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Manager
                      </span>
                      <span className="font-semibold text-slate-900 font-mono">
                        {mgr?.canonicalName || 'None'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Backup Manager
                      </span>
                      <span className="text-slate-700 font-mono">
                        {bkp?.canonicalName || 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-400">{wsTaskItems.length} tasks registered</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startAvailabilityCheck(ws.managerAccountId, ws.id)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    >
                      Audit
                    </button>
                    <button
                      onClick={() => {
                        setActiveWorkspaceId(ws.id);
                        setActiveNav('workspaces');
                      }}
                      className="px-3 py-1 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Open Workspace
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
