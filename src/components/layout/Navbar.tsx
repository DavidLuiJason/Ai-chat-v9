import React from 'react';
import { useApp } from '../../context/AppContext.tsx';

interface NavbarProps {
  onOpenAddAccount: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddAccount }) => {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    serverStatus,
    accounts,
    setActiveNav,
  } = useApp();

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const connectedAccountsCount = accounts.filter((a) => a.connectionStatus === 'CONNECTED').length;

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
      {/* Brand & Workspace Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            AI
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900">AI Chat</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs text-slate-500">
          <span>Workspace:</span>
          <select
            value={activeWorkspaceId || ''}
            onChange={(e) => setActiveWorkspaceId(e.target.value)}
            className="font-medium text-slate-900 bg-transparent border-none focus:outline-hidden cursor-pointer hover:text-blue-600 transition-colors"
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Indicators & Top Actions */}
      <div className="flex items-center gap-3">
        {/* Server & Accounts Status */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{connectedAccountsCount} Connected Accounts</span>
          </div>

          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200 text-slate-500 font-mono text-[11px]">
            {serverStatus?.googleAiStudio?.hasKey ? (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Gemini API Active
              </span>
            ) : (
              <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Simulator / Demo Mode
              </span>
            )}
          </div>
        </div>

        {/* Action Button: Add Account */}
        <button
          onClick={onOpenAddAccount}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
        >
          <span className="text-slate-500 font-bold">+</span>
          <span>Add Account</span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => setActiveNav('settings')}
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
};
