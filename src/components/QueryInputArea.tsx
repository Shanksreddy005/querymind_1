import React, { useRef, useEffect } from 'react';
import { QueryMindLogo } from './QueryMindLogo';
import { Play, Sparkles, CornerDownLeft, Loader2, RefreshCw } from 'lucide-react';
import { Dataset } from '../types';
import { PREBUILT_DATASETS } from '../services/sampleData';

interface QueryInputAreaProps {
  query: string;
  onChangeQuery: (newQuery: string) => void;
  onRunQuery: (queryToRun?: string) => void;
  isRunning: boolean;
  dataset: Dataset | null;
  hasRunAnyQuery: boolean;
  isDarkMode: boolean;
}

export const QueryInputArea: React.FC<QueryInputAreaProps> = ({
  query,
  onChangeQuery,
  onRunQuery,
  isRunning,
  dataset,
  hasRunAnyQuery,
  isDarkMode,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!isRunning && query.trim()) {
        onRunQuery();
      }
    }
  };

  // Determine suggestions based on dataset
  let suggestions: string[] = [];
  if (dataset?.id === 'customers') {
    suggestions = PREBUILT_DATASETS.saas.promptSuggestions;
  } else if (dataset?.id === 'orders') {
    suggestions = PREBUILT_DATASETS.ecommerce.promptSuggestions;
  } else if (dataset && dataset.columns.length > 0) {
    const numCol = dataset.columns.find((c) => c.type === 'number')?.name || 'value';
    const catCol = dataset.columns.find((c) => c.type === 'string')?.name || 'category';
    suggestions = [
      `Show top 5 records ordered by ${numCol} descending`,
      `What is the average ${numCol} grouped by ${catCol}?`,
      `Count the total number of records by ${catCol}`,
    ];
  }

  const cardBg = isDarkMode ? 'bg-[#131620] border-[#222736]' : 'bg-white border-slate-200';

  return (
    <div className="w-full space-y-4">
      {/* Hero Welcome state if no query run yet */}
      {!hasRunAnyQuery && (
        <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center animate-in fade-in duration-300">
          <QueryMindLogo size={48} variant="stacked" isDarkMode={isDarkMode} />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-4">
            Ask your data anything.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
            Type any question in natural language. QueryMind reads your schema and generates verified SQL with step-by-step reasoning.
          </p>
        </div>
      )}

      {/* Main Query Input Card */}
      <div className={`rounded-2xl border shadow-lg overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-[#5B4BE8]/40 ${cardBg}`}>
        <div className="p-3 sm:p-4">
          <textarea
            ref={textareaRef}
            rows={2}
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask a question about ${dataset?.name || 'your dataset'} in plain English...`}
            disabled={isRunning || !dataset}
            className={`w-full bg-transparent outline-none resize-none text-sm sm:text-base leading-relaxed placeholder:text-slate-500 font-sans ${
              isDarkMode ? 'text-slate-100' : 'text-slate-900'
            }`}
          />
        </div>

        {/* Card Footer with shortcuts and Run Button */}
        <div className={`px-3 sm:px-4 py-2.5 border-t flex items-center justify-between gap-3 text-xs ${
          isDarkMode ? 'bg-[#0f1118]/80 border-[#1c212e]' : 'bg-slate-50/80 border-slate-100'
        }`}>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="hidden sm:inline">Press</span>
            <kbd className={`px-1.5 py-0.5 rounded text-[11px] font-mono border ${
              isDarkMode ? 'bg-[#181c28] border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-600'
            }`}>
              ⌘ + Enter
            </kbd>
            <span className="hidden sm:inline">or</span>
            <kbd className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[11px] font-mono border ${
              isDarkMode ? 'bg-[#181c28] border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-600'
            }`}>
              Ctrl + Enter
            </kbd>
            <span className="hidden sm:inline">to execute</span>
          </div>

          <div className="flex items-center gap-2">
            {query.trim() && (
              <button
                type="button"
                onClick={() => onChangeQuery('')}
                disabled={isRunning}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 transition-colors"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={() => onRunQuery()}
              disabled={isRunning || !query.trim() || !dataset}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 active:scale-95 text-white ${
                isRunning || !query.trim() || !dataset
                  ? 'opacity-40 cursor-not-allowed bg-[#5B4BE8]'
                  : 'bg-[#5B4BE8] hover:bg-[#5B4BE8]/90 shadow-md shadow-[#5B4BE8]/25'
              }`}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Query</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Query Buttons (Interactive Filter/Question Controls) */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
          <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#8B7FF5]" />
            Suggestions:
          </span>
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChangeQuery(s);
                onRunQuery(s);
              }}
              disabled={isRunning}
              className={`text-xs px-2.5 py-1 rounded-lg border text-left transition-all ${
                isDarkMode
                  ? 'border-[#262c3e] bg-[#141722]/80 text-slate-300 hover:border-[#5B4BE8] hover:text-white hover:bg-[#1a1e2d]'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
