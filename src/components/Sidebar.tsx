import React from 'react';
import { Dataset, HistoryItem } from '../types';
import { Database, Table, Columns, Clock, ShieldCheck, ChevronRight, Hash, Type, Calendar, ToggleLeft, Trash2, X } from 'lucide-react';
import { PREBUILT_DATASETS } from '../services/sampleData';

interface SidebarProps {
  dataset: Dataset | null;
  onSelectDataset: (dataset: Dataset) => void;
  onSelectHistoryQuery: (query: string) => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  isDarkMode: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onInsertColumn: (colName: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  dataset,
  onSelectDataset,
  onSelectHistoryQuery,
  history,
  onClearHistory,
  isDarkMode,
  isOpenMobile,
  onCloseMobile,
  onInsertColumn,
}) => {
  const getColIcon = (type: string) => {
    switch (type) {
      case 'number':
        return <Hash className="w-3 h-3 text-emerald-400" />;
      case 'date':
        return <Calendar className="w-3 h-3 text-amber-400" />;
      case 'boolean':
        return <ToggleLeft className="w-3 h-3 text-purple-400" />;
      default:
        return <Type className="w-3 h-3 text-sky-400" />;
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden select-none">
      {/* Mobile Close Button Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-inherit">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Database & Schema</span>
        <button
          onClick={onCloseMobile}
          className="p-1 rounded text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Active Dataset Overview */}
        {dataset && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Active Database Table</span>
              <span className="font-mono text-emerald-400">{dataset.rowCount} rows</span>
            </div>

            <div className={`p-3 rounded-xl border transition-colors ${
              isDarkMode ? 'bg-[#181c28] border-[#262c3e]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 font-medium text-xs truncate">
                <Table className="w-4 h-4 text-[#8B7FF5] flex-shrink-0" />
                <span className="font-mono text-xs font-semibold text-[#8B7FF5]">{dataset.tableName}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{dataset.name}</p>
            </div>
          </div>
        )}

        {/* Dynamic Schema Explorer */}
        {dataset && dataset.columns.length > 0 && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Schema Columns ({dataset.columns.length})</span>
              <span className="text-[10px] text-slate-400">Click to insert</span>
            </div>

            <div className="space-y-1">
              {dataset.columns.map((col) => (
                <div
                  key={col.name}
                  onClick={() => onInsertColumn(col.name)}
                  title={`Type: ${col.type}\nSamples: ${col.sampleValues.slice(0, 3).join(', ')}`}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                    isDarkMode
                      ? 'hover:bg-[#1c2232] text-slate-300'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getColIcon(col.type)}
                    <span className="truncate group-hover:text-indigo-400 transition-colors">{col.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans">{col.type.slice(0, 3)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sample Datasets Switcher */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Preloaded Demo Datasets
          </div>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => onSelectDataset(PREBUILT_DATASETS.saas.dataset)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                dataset?.id === 'customers'
                  ? 'border-[#5B4BE8] bg-[#5B4BE8]/10 text-indigo-400'
                  : isDarkMode
                  ? 'border-[#262c3e] bg-[#161a26] text-slate-300 hover:border-slate-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="truncate">
                <span className="block font-semibold">SaaS Customer MRR</span>
                <span className="text-[10px] text-slate-400 font-normal">25 rows · Subscriptions & Churn</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onSelectDataset(PREBUILT_DATASETS.ecommerce.dataset)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                dataset?.id === 'orders'
                  ? 'border-[#5B4BE8] bg-[#5B4BE8]/10 text-indigo-400'
                  : isDarkMode
                  ? 'border-[#262c3e] bg-[#161a26] text-slate-300 hover:border-slate-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="truncate">
                <span className="block font-semibold">E-Commerce Orders</span>
                <span className="text-[10px] text-slate-400 font-normal">15 rows · Sales & Profitability</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Recent Query History */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Recent Queries
            </span>
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
                title="Clear query history"
              >
                Clear
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic px-1">No recent queries yet.</p>
          ) : (
            <div className="space-y-1">
              {history.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectHistoryQuery(item.question)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors truncate block ${
                    isDarkMode
                      ? 'hover:bg-[#1c2232] text-slate-300'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  title={item.question}
                >
                  <span className="truncate block font-medium">{item.question}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.rowCount} rows · {item.timestamp}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Local Privacy Footer */}
      <div className={`p-4 border-t border-inherit text-xs ${isDarkMode ? 'bg-[#0f1118]' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-2 text-emerald-400 font-medium mb-1">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>Local Engine Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-normal">
          In-memory execution ensures zero telemetry or dataset uploading.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Static Sidebar (260px) */}
      <aside className={`hidden lg:flex w-64 flex-col border-r flex-shrink-0 transition-colors ${
        isDarkMode ? 'bg-[#12151e] border-[#1e2332]' : 'bg-white border-slate-200'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
            onClick={onCloseMobile}
          />
          <aside className={`relative w-72 max-w-[80vw] h-full shadow-2xl flex flex-col z-10 transition-colors ${
            isDarkMode ? 'bg-[#12151e] border-r border-[#1e2332]' : 'bg-white border-r border-slate-200'
          }`}>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
