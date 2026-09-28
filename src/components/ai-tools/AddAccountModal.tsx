import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AuthType } from '../../types/index.ts';
import { getNextAccountNumber, generateCanonicalName } from '../../services/providerService.ts';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProviderId?: string;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  defaultProviderId,
}) => {
  const { providers, accounts, addAccount } = useApp();

  const [selectedProviderId, setSelectedProviderId] = useState(
    defaultProviderId || (providers[0]?.id ?? 'google-ai-studio')
  );
  const [selectedAuthType, setSelectedAuthType] = useState<AuthType>('api_key');
  const [friendlyDesc, setFriendlyDesc] = useState('');
  const [customCapabilities, setCustomCapabilities] = useState('Code Synthesis, Architecture, Verification');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentProvider = providers.find((p) => p.id === selectedProviderId) || providers[0];

  // Auto-calculated identity number & canonical name
  const nextNum = getNextAccountNumber(currentProvider.id, accounts);
  const autoCanonicalName = generateCanonicalName(currentProvider, nextNum);

  // Filter allowed authentic auth types based on provider capabilities
  const supportedAuth = currentProvider.supportedAuth;

  const handleProviderChange = (provId: string) => {
    setSelectedProviderId(provId);
    const prov = providers.find((p) => p.id === provId);
    if (prov && !prov.supportedAuth.includes(selectedAuthType)) {
      setSelectedAuthType(prov.supportedAuth[0] || 'api_key');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const caps = customCapabilities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addAccount({
      providerId: currentProvider.id,
      authType: selectedAuthType,
      friendlyDescription: friendlyDesc.trim() || undefined,
      capabilities: caps.length > 0 ? caps : undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const getAuthLabel = (auth: AuthType) => {
    switch (auth) {
      case 'google_oauth':
        return 'Sign in with Google OAuth';
      case 'email_password':
        return 'Email / Enterprise Session';
      case 'api_key':
        return 'Provider API Key / Token';
      case 'server_environment':
        return 'Direct Server Environment Key (GEMINI_API_KEY)';
      default:
        return auth;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 mb-0.5">WORKFORCE PROVISIONING</div>
            <h3 className="text-base font-semibold text-slate-900">Connect New AI Account</h3>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* Provider Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Select AI Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {providers.map((p) => {
                const isSelected = p.id === selectedProviderId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProviderChange(p.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="font-semibold text-slate-900 block truncate">{p.name}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{p.vendor}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Automatic Canonical Identity Banner */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Canonical Identity (Auto-Assigned)
              </span>
              <span className="text-[10px] text-slate-400">Sequential, not a quality rank</span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900 flex items-center gap-2">
              <span>{autoCanonicalName}</span>
              <span className="text-xs font-normal text-slate-500">(Account #{nextNum})</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Every message sent by this account will stably preserve the &quot;{autoCanonicalName}&quot; identity.
            </p>
          </div>

          {/* Supported Authentication Options */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Supported Authentication Method
            </label>
            <div className="space-y-2">
              {supportedAuth.map((auth) => (
                <label
                  key={auth}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAuthType === auth
                      ? 'border-blue-600 bg-blue-50/40 text-blue-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="authType"
                    value={auth}
                    checked={selectedAuthType === auth}
                    onChange={() => setSelectedAuthType(auth)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium block">{getAuthLabel(auth)}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {auth === 'server_environment'
                        ? 'Uses pre-configured server secrets from runtime environment'
                        : 'Authentic provider interface adapter pathway'}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Optional Friendly Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Friendly Role / Description (Optional)
            </label>
            <input
              type="text"
              value={friendlyDesc}
              onChange={(e) => setFriendlyDesc(e.target.value)}
              placeholder="e.g. Distributed Systems & Security Reviewer"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Capabilities */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Capabilities (Comma-separated)
            </label>
            <input
              type="text"
              value={customCapabilities}
              onChange={(e) => setCustomCapabilities(e.target.value)}
              placeholder="e.g. Code Review, Benchmarking, Database Migrations"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Operating Notes / Context
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Specific behavioral guidelines or working style..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Register & Connect {autoCanonicalName}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
