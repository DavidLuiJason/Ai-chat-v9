import React from 'react';
import { useApp, NavView } from '../../context/AppContext.tsx';
import {
  LayoutDashboard,
  FolderGit2,
  Cpu,
  Users2,
  ShieldCheck,
  MessageSquare,
  FileCode2,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  onOpenAddAccount: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAddAccount }) => {
  const { activeNav, setActiveNav, workspaces, accounts } = useApp();

  const navItems: { id: NavView; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'workspaces',
      label: 'Workspaces',
      icon: <FolderGit2 className="w-4 h-4" />,
      badge: workspaces.length,
    },
    {
      id: 'ai-tools',
      label: 'AI Tools & Accounts',
      icon: <Cpu className="w-4 h-4" />,
      badge: accounts.length,
    },
    {
      id: 'workers',
      label: 'Workers',
      icon: <Users2 className="w-4 h-4" />,
    },
    {
      id: 'managers',
      label: 'Managers & Squads',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'direct-chats',
      label: 'Direct Chats',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: 'files',
      label: 'Files & Artifacts',
      icon: <FileCode2 className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
      {/* Navigation Links */}
      <div className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
          Workforce Navigation
        </div>

        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Add AI Account Widget at bottom */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-500">Autonomous Fleet</span>
          <span className="text-[11px] font-mono text-emerald-600 font-semibold">Active</span>
        </div>
        <button
          onClick={onOpenAddAccount}
          className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
        >
          <span className="font-bold text-slate-500">+</span>
          <span>Add AI Account</span>
        </button>
      </div>
    </aside>
  );
};
