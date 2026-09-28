import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AIAccount, Provider, InteractionMode } from '../../types/index.ts';
import { Plus, Cpu, MessageSquare, Check, ShieldCheck, ExternalLink, Zap } from 'lucide-react';

interface AiToolsViewProps {
  onOpenAddAccount: () => void;
}

export const AiToolsView: React.FC<AiToolsViewProps> = ({ onOpenAddAccount }) => {
  const {
    providers,
    accounts,
    workspaces,
    tasks,
    attachments,
    addProvider,
    updateAccount,
    setDirectChatSelectedAccountId,
    setActiveNav,
  } = useApp();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    accounts[0]?.id || null
  );
  const [isAddingProviderModal, setIsAddingProviderModal] = useState(false);

  // New Provider Form State
  const [provName, setProvName] = useState('');
  const [provVendor, setProvVendor] = useState('');
  const [provDesc, setProvDesc] = useState('');
  const [provModes, setProvModes] = useState<InteractionMode[]>(['api', 'web_session']);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const selectedProvider = providers.find((p) => p.id === selectedAccount?.providerId);

  const handleCreateCustomProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provName.trim() || !provVendor.trim()) return;

    addProvider({
      name: provName.trim(),
      vendor: provVendor.trim(),
      description: provDesc.trim() || 'Custom extensible AI provider adapter.',
      supportedModes: provModes,
      supportedAuth: ['api_key', 'google_oauth'],
      iconKey: 'custom',
    });

    setProvName('');
    setProvVendor('');
    setProvDesc('');
    setIsAddingProviderModal(false);
  };

  const handleStartDirectChat = (accId: string) => {
    setDirectChatSelectedAccountId(accId);
    setActiveNav('direct-chats');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/40">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>AI TOOLS & INFRASTRUCTURE</span>
            <span>·</span>
            <span>EXTENSIBLE ADAPTER ARCHITECTURE</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900">Providers & Connected AI Accounts</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingProviderModal(true)}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>Add AI Provider</span>
          </button>
          <button
            onClick={onOpenAddAccount}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Connect Account</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Catalog / Right Account Dossier */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Provider & Account Tree */}
        <div className="w-full md:w-80 border-r border-slate-200 bg-white overflow-y-auto p-4 space-y-6 shrink-0">
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Providers & Accounts
              </span>
              <span className="text-[11px] font-mono text-slate-400">{accounts.length} active</span>
            </div>

            <div className="space-y-4">
              {providers.map((prov) => {
                const provAccounts = accounts.filter((a) => a.providerId === prov.id);
                return (
                  <div key={prov.id} className="space-y-1">
                    <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-50 rounded-md">
                      <span>{prov.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {provAccounts.length > 0 ? `${provAccounts.length} acc` : 'Not connected'}
                      </span>
                    </div>

                    <div className="pl-2 space-y-1">
                      {provAccounts.length > 0 ? (
                        provAccounts.map((acc) => {
                          const isSelected = selectedAccountId === acc.id;
                          return (
                            <button
                              key={acc.id}
                              onClick={() => setSelectedAccountId(acc.id)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all cursor-pointer text-left ${
                                isSelected
                                  ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200 shadow-2xs'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    acc.availability === 'WORKING'
                                      ? 'bg-blue-500 animate-pulse'
                                      : 'bg-emerald-500'
                                  }`}
                                />
                                <span className="font-mono">{acc.canonicalName}</span>
                              </div>
                              <span className="text-[10px] font-normal text-slate-400">
                                {acc.availability}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-3 py-1.5 text-[11px] text-slate-400 italic">
                          No connected accounts
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Selected Account Dossier */}
        {selectedAccount ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
              {/* Account Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span>PROVIDER: {selectedProvider?.name}</span>
                    <span>·</span>
                    <span>CANONICAL IDENTITY #{selectedAccount.identityNumber}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 font-mono">
                    {selectedAccount.canonicalName}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">{selectedAccount.friendlyDescription}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartDirectChat(selectedAccount.id)}
                    className="px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Direct Chat</span>
                  </button>
                </div>
              </div>

              {/* Status and Diagnostics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Connection State
                  </span>
                  <span className="font-semibold text-emerald-700 font-mono mt-0.5 block">
                    {selectedAccount.connectionStatus}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Availability
                  </span>
                  <span className="font-semibold text-slate-900 font-mono mt-0.5 block">
                    {selectedAccount.availability}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Completed Tasks
                  </span>
                  <span className="font-semibold text-slate-900 font-mono mt-0.5 block">
                    {selectedAccount.totalTasksCompleted}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Files Produced
                  </span>
                  <span className="font-semibold text-slate-900 font-mono mt-0.5 block">
                    {selectedAccount.filesProducedCount}
                  </span>
                </div>
              </div>

              {/* Capabilities */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-900 block">Reported Capabilities</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {selectedAccount.capabilities.map((cap, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md border border-slate-200"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Workspace Assignments */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-900 block">
                  Current Workspace Roles
                </span>
                <div className="space-y-2">
                  {workspaces
                    .filter(
                      (ws) =>
                        ws.managerAccountId === selectedAccount.id ||
                        ws.backupManagerAccountId === selectedAccount.id ||
                        ws.callerAccountId === selectedAccount.id ||
                        ws.filterAccountId === selectedAccount.id ||
                        ws.workerAccountIds.includes(selectedAccount.id)
                    )
                    .map((ws) => (
                      <div
                        key={ws.id}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-slate-900">{ws.name}</span>
                          <span className="text-slate-500 ml-2">
                            ({ws.managerAccountId === selectedAccount.id
                              ? 'Primary Manager'
                              : ws.backupManagerAccountId === selectedAccount.id
                              ? 'Backup Manager'
                              : ws.callerAccountId === selectedAccount.id
                              ? 'Caller'
                              : ws.filterAccountId === selectedAccount.id
                              ? 'Filter'
                              : 'Worker'})
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">{ws.currentStatus}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Adapter & Auth Controls */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-500">
                  Authentication Type:{' '}
                  <strong className="text-slate-800 font-mono">{selectedAccount.authType}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateAccount(selectedAccount.id, {
                        connectionStatus:
                          selectedAccount.connectionStatus === 'CONNECTED'
                            ? 'UNAVAILABLE'
                            : 'CONNECTED',
                      })
                    }
                    className="px-3 py-1.5 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Toggle Connection Simulation
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-8 text-center text-slate-400">Select an account to view details</div>
        )}
      </div>

      {/* Custom AI Provider Modal */}
      {isAddingProviderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Add Extensible AI Provider</h3>
              <button
                onClick={() => setIsAddingProviderModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomProvider} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Provider Name</label>
                <input
                  type="text"
                  required
                  value={provName}
                  onChange={(e) => setProvName(e.target.value)}
                  placeholder="e.g. DeepSeek or Mistral"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vendor / Organization</label>
                <input
                  type="text"
                  required
                  value={provVendor}
                  onChange={(e) => setProvVendor(e.target.value)}
                  placeholder="e.g. Open Source Foundation"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adapter Description</label>
                <textarea
                  rows={2}
                  value={provDesc}
                  onChange={(e) => setProvDesc(e.target.value)}
                  placeholder="Interaction methods, latency profile, and supported models..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-slate-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingProviderModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  Register Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
