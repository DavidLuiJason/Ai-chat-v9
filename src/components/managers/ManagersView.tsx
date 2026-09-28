import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Shield, ShieldAlert, ArrowRight, Play, Users, RefreshCw } from 'lucide-react';

export const ManagersView: React.FC = () => {
  const {
    workspaces,
    accounts,
    tasks,
    setActiveWorkspaceId,
    setActiveNav,
    startAvailabilityCheck,
    performManagerHandoff,
  } = useApp();

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>WORKFORCE LEADERSHIP</span>
          <span>·</span>
          <span>MANAGERS & FAILOVER SQUADS</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Workforce Managers & Operational Squads
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          The Manager is the primary decision-maker and planner. Every active Manager maintains a
          designated Backup Manager ready for seamless handoff with zero state amnesia.
        </p>
      </div>

      {/* Squad Cards List */}
      <div className="space-y-6">
        {workspaces.map((ws) => {
          const mgr = accounts.find((a) => a.id === ws.managerAccountId);
          const bkp = accounts.find((a) => a.id === ws.backupManagerAccountId);
          const caller = accounts.find((a) => a.id === ws.callerAccountId);
          const filter = accounts.find((a) => a.id === ws.filterAccountId);
          const assignedWorkers = accounts.filter((a) => ws.workerAccountIds.includes(a.id));
          const wsTasks = tasks.filter((t) => t.workspaceId === ws.id);

          return (
            <div
              key={ws.id}
              className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-5"
            >
              {/* Workspace Leadership Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                    <span>WORKSPACE LEADERSHIP SQUAD</span>
                    <span>·</span>
                    <span className="font-mono">{ws.id}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{ws.name}</h2>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{ws.objective}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveWorkspaceId(ws.id);
                      setActiveNav('workspaces');
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <span>Open Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Leadership Roles Diagram & Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* 1. Primary Manager */}
                <div className="p-4 rounded-xl border-2 border-slate-900 bg-slate-900 text-white shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-300">
                      Primary Manager
                    </span>
                    <Shield className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-base font-bold font-mono">{mgr?.canonicalName || 'None'}</div>
                  <p className="text-[11px] text-slate-300">
                    Primary decision maker & planner. Evaluates reports and steers workforce.
                  </p>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => startAvailabilityCheck(ws.managerAccountId, ws.id)}
                      className="text-[11px] text-amber-300 hover:text-amber-200 underline cursor-pointer"
                    >
                      Audit Availability
                    </button>
                  </div>
                </div>

                {/* 2. Backup Manager */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500">
                      Designated Backup
                    </span>
                    <ShieldAlert className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900">
                    {bkp?.canonicalName || 'None'}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Maintains live shadow state. Ready for immediate handoff with briefing context.
                  </p>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <button
                      onClick={() =>
                        performManagerHandoff(ws.id, 'Manual simulation of primary manager interruption')
                      }
                      className="text-[11px] text-blue-700 hover:text-blue-900 font-medium underline cursor-pointer"
                    >
                      Test Manager Handoff
                    </button>
                  </div>
                </div>

                {/* 3. Caller */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500">
                      Caller (Dispatcher)
                    </span>
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900">
                    {caller?.canonicalName || 'None'}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Coordinates communications, routes tasks, and monitors worker response timing.
                  </p>
                </div>

                {/* 4. Filter */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500">
                      Filter (Not Summarizer)
                    </span>
                    <Users className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900">
                    {filter?.canonicalName || 'None'}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Builds structured workforce reports preserving worker identity and details.
                  </p>
                </div>
              </div>

              {/* Workers Assigned */}
              <div className="pt-2 text-xs text-slate-600 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-800">Assigned Workers:</span>
                {assignedWorkers.map((w) => (
                  <span
                    key={w.id}
                    className="px-2 py-0.5 bg-slate-100 rounded-md font-mono text-[11px] border border-slate-200"
                  >
                    {w.canonicalName}
                  </span>
                ))}
                <span className="text-slate-400 ml-auto font-mono text-[11px]">
                  {wsTasks.length} total tasks tracked
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
