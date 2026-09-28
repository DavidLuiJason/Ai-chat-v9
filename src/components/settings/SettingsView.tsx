import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { MessagePresentationFormat } from '../../types/index.ts';
import { Settings as SettingsIcon, Sliders, RefreshCw, Cpu, Server } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetAllData, serverStatus } = useApp();

  const presentationOptions: {
    id: MessagePresentationFormat;
    label: string;
    description: string;
    preview: string;
  }[] = [
    {
      id: 'standard',
      label: 'Standard Format',
      description: 'Clean typographic layout with colon delimiter',
      preview: 'ChatGPT 2: I completed the database latency audit.',
    },
    {
      id: 'bracketed',
      label: 'Bracketed Identity',
      description: 'Distinctive bracketed sender identifier',
      preview: '[ChatGPT 2] I completed the database latency audit.',
    },
    {
      id: 'compact',
      label: 'Compact Minimalist',
      description: 'Ultra-dense single-line layout with em-dash separator',
      preview: 'ChatGPT 2 — I completed the database latency audit.',
    },
    {
      id: 'card',
      label: 'Structured Card Format',
      description: 'Full dimensional card container with metadata and task chips',
      preview: 'Card layout with dedicated sender header and task correlation chip.',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-4xl mx-auto text-xs">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>SYSTEM PREFERENCES</span>
          <span>·</span>
          <span>CONFIGURATION & FORMATTING</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-600 mt-1">
          Customize message rendering styles without mutating immutable archive records.
        </p>
      </div>

      {/* Message Presentation Format */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Message Presentation Format</h2>
          <p className="text-slate-500 mt-0.5">
            Select how AI-generated messages are formatted in User Conversation and Workforce Activity.
            Underlying message data retains raw structured attributes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presentationOptions.map((opt) => {
            const isSelected = settings.messagePresentationFormat === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateSettings({ messagePresentationFormat: opt.id })}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{opt.label}</span>
                  {isSelected && (
                    <span className="text-[10px] text-blue-700 bg-blue-100 font-bold px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mb-2">{opt.description}</p>
                <div className="p-2 rounded bg-slate-100/70 font-mono text-[11px] text-slate-700 border border-slate-200/60 truncate">
                  {opt.preview}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability Checking Timing */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Staged Availability Check Latency</h2>
          <p className="text-slate-500 mt-0.5">
            Configure stage duration delays during diagnostic checks.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1000"
            max="6000"
            step="500"
            value={settings.availabilityCheckDelayMs}
            onChange={(e) =>
              updateSettings({ availabilityCheckDelayMs: parseInt(e.target.value, 10) })
            }
            className="w-64"
          />
          <span className="font-mono font-bold text-slate-800">
            {(settings.availabilityCheckDelayMs / 1000).toFixed(1)} seconds per check stage
          </span>
        </div>
      </div>

      {/* Server & AI Integration */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Real Server-Side AI Execution</h2>
          <p className="text-slate-500 mt-0.5">
            Directly invoke @google/genai on the server when executing tasks under Google AI Studio or Gemini.
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-slate-500" />
            <div>
              <span className="font-semibold text-slate-900 block">Google AI Studio Backend</span>
              <span className="text-[11px] text-slate-500">
                {serverStatus?.googleAiStudio?.hasKey
                  ? 'GEMINI_API_KEY detected in server environment.'
                  : 'Server running without GEMINI_API_KEY (Using realistic simulated responses).'}
              </span>
            </div>
          </div>
          <span
            className={`font-mono font-medium px-2 py-1 rounded text-[11px] ${
              serverStatus?.googleAiStudio?.hasKey
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {serverStatus?.googleAiStudio?.hasKey ? 'ACTIVE' : 'SIMULATED'}
          </span>
        </div>
      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="p-6 bg-white rounded-xl border border-rose-200 shadow-2xs space-y-3">
        <div>
          <h2 className="text-sm font-bold text-rose-900">Reset Local State</h2>
          <p className="text-slate-500 mt-0.5">
            Reset all workspaces, messages, accounts, and tasks to default initial state.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('Reset all AI Chat project history and accounts to default initial seed?')) {
              resetAllData();
            }
          }}
          className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg font-medium transition-colors cursor-pointer"
        >
          Reset Application State
        </button>
      </div>
    </div>
  );
};
