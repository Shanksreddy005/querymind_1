import React, { useState } from 'react';
import { ApiKeyConfig, AiProvider } from '../types';
import { Key, ShieldCheck, Lock, ExternalLink, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, X } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiKeyConfig;
  onSave: (config: ApiKeyConfig) => void;
  isDarkMode: boolean;
}

const PROVIDERS: {
  id: AiProvider;
  name: string;
  badge: string;
  models: { id: string; name: string; tag: string }[];
  keyPrefix: string;
  docsUrl: string;
  placeholder: string;
}[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Recommended · Free Tier Available',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tag: 'Fast & High Intelligence' },
      { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', tag: 'Next-Gen Flash' },
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', tag: 'Deep Analytical Reasoning' },
    ],
    keyPrefix: 'AIzaSy...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    placeholder: 'AIzaSy...',
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    badge: 'Ultra-Fast · Free Developer Tier',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', tag: 'High Accuracy SQL' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', tag: 'Sub-second Latency' },
    ],
    keyPrefix: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
    placeholder: 'gsk_...',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    badge: 'BYOK Standard',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', tag: 'Fast & Cost-Efficient' },
      { id: 'gpt-4o', name: 'GPT-4o', tag: 'Flagship Intelligence' },
    ],
    keyPrefix: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-...',
  },
];

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  isDarkMode,
}) => {
  const [provider, setProvider] = useState<AiProvider>(config.provider || 'gemini');
  const [key, setKey] = useState<string>(config.key || '');
  const [model, setModel] = useState<string>(config.model || 'gemini-2.5-flash');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  if (!isOpen) return null;

  const currentProviderConfig = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

  const handleProviderChange = (newProvider: AiProvider) => {
    setProvider(newProvider);
    const pConf = PROVIDERS.find((p) => p.id === newProvider);
    if (pConf && pConf.models.length > 0) {
      setModel(pConf.models[0].id);
    }
    setTestStatus('idle');
    setTestMessage('');
  };

  const handleTestConnection = async () => {
    if (!key.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter an API key first.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Validating API key directly with provider...');

    try {
      if (provider === 'gemini') {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${key.trim()}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}: Invalid Gemini API key`);
        setTestStatus('success');
        setTestMessage('Gemini API key verified successfully! Ready for NL queries.');
      } else if (provider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${key.trim()}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: Invalid Groq API key`);
        setTestStatus('success');
        setTestMessage('Groq API key verified successfully!');
      } else if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${key.trim()}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: Invalid OpenAI key`);
        setTestStatus('success');
        setTestMessage('OpenAI API key verified successfully!');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err?.message || 'Connection test failed. Check key format and permissions.');
    }
  };

  const handleSave = () => {
    onSave({
      provider,
      key: key.trim(),
      model,
    });
    onClose();
  };

  const handleClear = () => {
    setKey('');
    onSave({
      provider,
      key: '',
      model,
    });
    setTestStatus('idle');
    setTestMessage('');
  };

  const modalBg = isDarkMode ? 'bg-[#13161f] text-slate-100 border-[#222838]' : 'bg-white text-slate-800 border-slate-200';
  const cardBg = isDarkMode ? 'bg-[#0f1118] border-[#1d2230]' : 'bg-slate-50 border-slate-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className={`relative w-full max-w-xl rounded-2xl border shadow-2xl p-6 ${modalBg} overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#5B4BE8]/10 text-[#5B4BE8] dark:text-[#8B7FF5] flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Bring Your Own Key (BYOK)</h3>
              <p className="text-xs text-slate-400">Direct client-side inference · Zero server storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zero-Backend Privacy Guarantee Callout */}
        <div className="my-4 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-emerald-300">100% Client-Side Privacy Guarantee</span>
            <p className="text-emerald-400/90 leading-relaxed">
              Your dataset is parsed and executed exclusively inside your browser (in-memory). No data rows are uploaded to any server. Your API key remains strictly in browser memory and calls the provider directly.
            </p>
          </div>
        </div>

        {/* Provider Tabs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select AI Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS.map((p) => {
                const isSelected = provider === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleProviderChange(p.id)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#5B4BE8] bg-[#5B4BE8]/10 text-white shadow-sm ring-1 ring-[#5B4BE8]'
                        : isDarkMode
                        ? 'border-[#222838] bg-[#181c28] text-slate-300 hover:border-slate-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold">{p.name}</span>
                    <span className="text-[10px] text-slate-400 truncate w-full mt-0.5">{p.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={`w-full text-xs font-mono rounded-lg px-3 py-2.5 border outline-none transition-colors ${
                isDarkMode
                  ? 'bg-[#181c28] border-[#262c3e] text-slate-200 focus:border-[#5B4BE8]'
                  : 'bg-white border-slate-300 text-slate-800 focus:border-[#5B4BE8]'
              }`}
            >
              {currentProviderConfig.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.tag}
                </option>
              ))}
            </select>
          </div>

          {/* Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {currentProviderConfig.name} API Key
              </label>
              <a
                href={currentProviderConfig.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#8B7FF5] hover:underline inline-flex items-center gap-1"
              >
                Get a free key <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={currentProviderConfig.placeholder}
                className={`w-full text-xs font-mono rounded-lg pl-3 pr-20 py-2.5 border outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-[#181c28] border-[#262c3e] text-slate-200 focus:border-[#5B4BE8]'
                    : 'bg-white border-slate-300 text-slate-800 focus:border-[#5B4BE8]'
                }`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing' || !key.trim()}
                  className="text-[11px] font-medium px-2 py-1 rounded bg-[#5B4BE8]/20 text-[#8B7FF5] hover:bg-[#5B4BE8]/30 disabled:opacity-50 transition-colors"
                >
                  {testStatus === 'testing' ? 'Testing...' : 'Test'}
                </button>
              </div>
            </div>

            {/* Test status banner */}
            {testStatus === 'success' && (
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{testMessage}</span>
              </div>
            )}
            {testStatus === 'error' && (
              <div className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{testMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2">
            {key && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
              >
                Clear Key
              </button>
            )}
            {!key && (
              <span className="text-xs text-slate-500">
                Key optional: Prebuilt datasets use fast smart local queries
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                isDarkMode ? 'border-[#262c3e] hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-[#5B4BE8] hover:bg-[#5B4BE8]/90 text-white transition-all shadow-sm active:scale-95"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
