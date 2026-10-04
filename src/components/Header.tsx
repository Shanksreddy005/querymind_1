import React from 'react';
import { QueryMindLogo } from './QueryMindLogo';
import { Dataset, ApiKeyConfig } from '../types';
import { ShieldCheck, Key, Sun, Moon, Menu, Upload, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeDataset: Dataset | null;
  onOpenKeyModal: () => void;
  onOpenUploader: () => void;
  onToggleMobileSidebar: () => void;
  apiKeyConfig: ApiKeyConfig;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeDataset,
  onOpenKeyModal,
  onOpenUploader,
  onToggleMobileSidebar,
  apiKeyConfig,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const hasKey = apiKeyConfig.key && apiKeyConfig.key.trim().length > 0;

  return (
    <header className={`h-16 px-4 sm:px-6 border-b flex items-center justify-between flex-shrink-0 transition-colors ${
      isDarkMode ? 'bg-[#12151e] border-[#1e2332]' : 'bg-white border-slate-200'
    }`}>
      {/* Left: Mobile hamburger + Brand Logo + Active Dataset */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          aria-label="Toggle Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <a href="#" className="flex items-center gap-2 group">
          <QueryMindLogo size={28} isDarkMode={isDarkMode} variant="horizontal" />
        </a>

        {activeDataset && (
          <>
            <span className="hidden sm:inline-block w-px h-5 bg-slate-700/40" />
            <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isDarkMode ? 'bg-[#181c28] border-[#262c3e] text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] truncate max-w-[160px]">{activeDataset.name}</span>
              <span className="text-[10px] text-slate-400">({activeDataset.rowCount} rows)</span>
            </div>
          </>
        )}
      </div>

      {/* Right: Privacy Indicator, BYOK Key pill, Upload Dataset, Dark/Light Mode */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Zero-Backend Privacy Tag */}
        <div
          title="QueryMind runs 100% in your browser using in-memory SQL. No dataset rows ever leave your device."
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border font-medium ${
            isDarkMode
              ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Zero Backend · 100% Client-Side</span>
        </div>

        {/* Change / Upload Dataset Button */}
        <button
          type="button"
          onClick={onOpenUploader}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isDarkMode
              ? 'border-[#262c3e] bg-[#181c28] text-slate-200 hover:border-slate-500 hover:text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-sm'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload File</span>
        </button>

        {/* BYOK Settings Trigger */}
        <button
          type="button"
          onClick={onOpenKeyModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            hasKey
              ? isDarkMode
                ? 'border-[#5B4BE8]/50 bg-[#5B4BE8]/10 text-indigo-300 hover:bg-[#5B4BE8]/20'
                : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              : isDarkMode
              ? 'border-[#262c3e] bg-[#181c28] text-slate-400 hover:text-slate-200'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-[#5B4BE8] dark:text-[#8B7FF5]" />
          <span className="font-mono text-[11px]">
            {hasKey ? `${apiKeyConfig.provider.toUpperCase()} Key Active` : 'BYOK Keys'}
          </span>
        </button>

        {/* Dark/Light Mode Switcher */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors ${
            isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100'
          }`}
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
