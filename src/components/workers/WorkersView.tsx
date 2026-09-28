import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { MessageSquare, CheckSquare, FileText, Activity } from 'lucide-react';
import { WorkerAvailability } from '../../types/index.ts';

export const WorkersView: React.FC = () => {
  const { accounts, tasks, workspaces, updateAccount, setDirectChatSelectedAccountId, setActiveNav } = useApp();
  const [filterAvailability, setFilterAvailability] = useState<string>('ALL');

  const filteredAccounts = accounts.filter((a) => {
    if (filterAvailability === 'ALL') return true;
    return a.availability === filterAvailability;
  });

  const getStatusColor = (status: WorkerAvailability) => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'WORKING':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'WAITING':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'UNAVAILABLE':
        return 'text-slate-500 bg-slate-100 border-slate-200';
      case 'ERROR':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const handleDirectChat = (accId: string) => {
    setDirectChatSelectedAccountId(accId);
    setActiveNav('direct-chats');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>AUTONOMOUS FLEET</span>
            <span>·</span>
            <span>WORKER REGISTRY</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Active AI Workers</h1>
          <p className="text-xs text-slate-600 mt-1">
            Individual AI accounts performing assignments, benchmark executions, and artifact compilation.
          </p>
        </div>

        {/* Filter Tabs (Interactive button controls) */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 self-start text-xs shadow-2xs">
          {['ALL', 'AVAILABLE', 'WORKING', 'WAITING'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterAvailability(st)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterAvailability === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((worker) => {
          const currentTask = tasks.find((t) => t.id === worker.currentTaskId);
          const assignedWorkspaces = workspaces.filter(
            (ws) => ws.workerAccountIds.includes(worker.id) || ws.managerAccountId === worker.id
          );

          return (
            <div
              key={worker.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {worker.canonicalName}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${getStatusColor(
                      worker.availability
                    )}`}
                  >
                    {worker.availability}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-1 mb-3">
                  {worker.friendlyDescription || 'Operational Worker Node'}
                </p>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {worker.capabilities.slice(0, 3).map((cap, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                    >
                      {cap}
                    </span>
                  ))}
                </div>

                {/* Current Assignment */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1 mb-3">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                    Current Assignment
                  </span>
                  {currentTask ? (
                    <div className="font-mono text-slate-900 font-medium truncate">
                      [{currentTask.id}] {currentTask.title}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No task currently assigned (Standby)</span>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <div>
                    <span>Completed Tasks:</span>{' '}
                    <strong className="text-slate-800 font-mono">{worker.totalTasksCompleted}</strong>
                  </div>
                  <div>
                    <span>Files Created:</span>{' '}
                    <strong className="text-slate-800 font-mono">{worker.filesProducedCount}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[10px]">
                  Assigned to {assignedWorkspaces.length} projects
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDirectChat(worker.id)}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
