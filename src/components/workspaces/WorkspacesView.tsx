import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { WorkspaceDetailView } from './WorkspaceDetailView.tsx';
import { Plus, FolderGit2 } from 'lucide-react';

export const WorkspacesView: React.FC = () => {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    accounts,
    createWorkspace,
  } = useApp();

  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [mgrId, setMgrId] = useState(accounts[0]?.id || '');
  const [bkpId, setBkpId] = useState(accounts[1]?.id || '');
  const [callerId, setCallerId] = useState(accounts[2]?.id || '');
  const [filterId, setFilterId] = useState(accounts[3]?.id || '');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !objective.trim()) return;

    const workerIds = accounts
      .filter((a) => a.id !== mgrId && a.id !== bkpId)
      .map((a) => a.id)
      .slice(0, 4);

    const newWs = createWorkspace({
      name: name.trim(),
      objective: objective.trim(),
      managerAccountId: mgrId || accounts[0]?.id,
      backupManagerAccountId: bkpId || accounts[1]?.id,
      callerAccountId: callerId || accounts[2]?.id || mgrId,
      filterAccountId: filterId || accounts[3]?.id,
      workerAccountIds: workerIds.length > 0 ? workerIds : [accounts[0]?.id],
    });

    setName('');
    setObjective('');
    setIsCreatingModal(false);
    setActiveWorkspaceId(newWs.id);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* If a workspace is active, render its full detail interface */}
      {activeWorkspaceId ? (
        <WorkspaceDetailView />
      ) : (
        <div className="flex-1 p-8 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Workspaces</h2>
              <p className="text-xs text-slate-500">Select an existing workspace or initialize a new multi-AI project.</p>
            </div>
            <button
              onClick={() => setIsCreatingModal(true)}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Workspace</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                onClick={() => setActiveWorkspaceId(ws.id)}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900 text-sm">{ws.name}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{ws.objective}</p>
                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>Status: {ws.currentStatus}</span>
                  <span className="text-blue-600 font-medium">Open →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Workspace Creation Modal */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Create New Multi-AI Workspace</h3>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Distributed Database Cutover"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Objective</label>
                <textarea
                  required
                  rows={3}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Describe the high-level objective that the Manager AI will plan and break into tasks..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-slate-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Manager</label>
                  <select
                    value={mgrId}
                    onChange={(e) => setMgrId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.canonicalName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Backup Manager</label>
                  <select
                    value={bkpId}
                    onChange={(e) => setBkpId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.canonicalName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Caller (Dispatcher)</label>
                  <select
                    value={callerId}
                    onChange={(e) => setCallerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.canonicalName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Filter (Report Compiler)</label>
                  <select
                    value={filterId}
                    onChange={(e) => setFilterId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.canonicalName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  Initialize Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
