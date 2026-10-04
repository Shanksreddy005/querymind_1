import React, { useState } from 'react';
import { QueryResult } from '../types';
import { DataChart } from './DataChart';
import {
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Edit3,
  Play,
  Download,
  Search,
  ArrowUpDown,
  Clock,
  Cpu,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';
import { executeClientSql } from '../services/sqlEngine';

interface ResultsViewProps {
  result: QueryResult;
  isDarkMode: boolean;
  onUpdateSql: (newSql: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  isDarkMode,
  onUpdateSql,
}) => {
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [isEditingSql, setIsEditingSql] = useState<boolean>(false);
  const [editedSql, setEditedSql] = useState<string>(result.sql);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Sync editedSql if result changes
  React.useEffect(() => {
    setEditedSql(result.sql);
    setIsEditingSql(false);
    setSearchTerm('');
    setPage(1);
  }, [result.id, result.sql]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(result.sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleExecuteEditedSql = () => {
    onUpdateSql(editedSql);
  };

  const handleExportCsv = () => {
    if (!result.rows || result.rows.length === 0) return;
    const cols = result.columns;
    const csvRows = [
      cols.join(','),
      ...result.rows.map((row) =>
        cols.map((c) => {
          const val = row[c] ?? '';
          if (typeof val === 'string' && val.includes(',')) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        }).join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `querymind_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort table data
  const filteredRows = (result.rows || []).filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(r).some((v) => String(v).toLowerCase().includes(term));
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortCol) return 0;
    const valA = a[sortCol];
    const valB = b[sortCol];
    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;
  const paginatedRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (colName: string) => {
    if (sortCol === colName) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colName);
      setSortAsc(true);
    }
  };

  const cardBg = isDarkMode ? 'bg-[#131620] border-[#222736]' : 'bg-white border-slate-200';
  const headerBg = isDarkMode ? 'bg-[#171b28] border-[#222736]' : 'bg-slate-50 border-slate-200';

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* 1. Reasoning Trace Card */}
      {result.reasoningSteps && result.reasoningSteps.length > 0 && (
        <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
          <div className={`px-4 py-2.5 border-b flex items-center justify-between ${headerBg}`}>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#8B7FF5]" />
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-300">
                Reasoning Trace
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified & Executed
            </span>
          </div>

          <div className="p-4 space-y-3">
            {result.reasoningSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">
                  ✓
                </div>
                <div>
                  <span className="font-semibold text-slate-200">{step.title}: </span>
                  <span className="text-slate-400">{step.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Executive AI Insight Card */}
      {result.insight && (
        <div className={`rounded-xl border p-4 sm:p-5 relative overflow-hidden ${
          isDarkMode
            ? 'bg-gradient-to-br from-[#12192d] via-[#101524] to-[#0c101b] border-[#232c44]'
            : 'bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 border-indigo-100'
        }`}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5B4BE8]/15 text-[#8B7FF5] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7FF5] block">
                  Actionable AI Insight
                </span>
                <p className="text-sm sm:text-base font-medium text-slate-100 mt-1 leading-relaxed">
                  {result.insight.summary}
                </p>
              </div>

              {/* Highlights List */}
              {result.insight.highlights && result.insight.highlights.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {result.insight.highlights.map((h, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg border text-xs leading-normal ${
                        isDarkMode ? 'bg-[#151a2b]/80 border-[#232b40] text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="block font-semibold text-[#8B7FF5] mb-1">Signal {i + 1}</span>
                      {h}
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended Action */}
              {result.insight.recommendedAction && (
                <div className="flex items-start gap-2 pt-1 text-xs text-amber-300/90 font-medium">
                  <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    <strong className="text-amber-300">Recommended Action:</strong> {result.insight.recommendedAction}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Interactive Data Visualization (Auto-Chart) */}
      {result.chartSuggestion && result.rows.length > 0 && (
        <DataChart
          data={result.rows}
          suggestion={result.chartSuggestion}
          isDarkMode={isDarkMode}
        />
      )}

      {/* 4. Generated SQL Panel */}
      <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
        <div className={`px-4 py-2.5 border-b flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-300">
              Generated SQL
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {result.executionTimeMs}ms · In-Memory
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingSql(!isEditingSql)}
              className={`text-xs px-2.5 py-1 rounded border flex items-center gap-1 transition-colors ${
                isEditingSql
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-inherit text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditingSql ? 'Close Editor' : 'Edit SQL'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopySql}
              className="text-xs px-2.5 py-1 rounded border border-inherit text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SQL Display or In-Place Editor */}
        <div className="p-4 bg-[#0a0c12]">
          {isEditingSql ? (
            <div className="space-y-3">
              <textarea
                rows={5}
                value={editedSql}
                onChange={(e) => setEditedSql(e.target.value)}
                className="w-full font-mono text-xs sm:text-sm bg-black/40 text-emerald-300 p-3 rounded-lg border border-slate-700 outline-none focus:border-indigo-500 resize-y"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleExecuteEditedSql}
                  className="px-3.5 py-1.5 rounded-lg bg-[#5B4BE8] hover:bg-[#5B4BE8]/90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Re-execute SQL
                </button>
              </div>
            </div>
          ) : (
            <pre className="font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto leading-relaxed whitespace-pre-wrap">
              <code>{result.sql}</code>
            </pre>
          )}
        </div>
      </div>

      {/* 5. Query Results Data Table */}
      <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
        <div className={`px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${headerBg}`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-300">
              Query Results
            </span>
            <span className="text-xs text-slate-400">
              ({result.rowCount} {result.rowCount === 1 ? 'row' : 'rows'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Table Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search rows..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className={`text-xs pl-8 pr-3 py-1.5 rounded-lg border outline-none font-mono ${
                  isDarkMode
                    ? 'bg-[#10131d] border-[#222736] text-slate-200 focus:border-[#5B4BE8]'
                    : 'bg-white border-slate-300 text-slate-800 focus:border-[#5B4BE8]'
                }`}
              />
            </div>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={result.rows.length === 0}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-inherit text-slate-300 hover:text-white hover:bg-slate-800/40 flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="Download results as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {result.rows.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 italic">
              Query completed with 0 rows returned.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={isDarkMode ? 'bg-[#161a27] text-slate-400 border-b border-[#222736]' : 'bg-slate-100 text-slate-600 border-b border-slate-200'}>
                  {result.columns.map((col) => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className="px-4 py-2.5 font-semibold font-mono uppercase tracking-wider text-[11px] cursor-pointer hover:text-indigo-400 select-none transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col}</span>
                        <ArrowUpDown className="w-3 h-3 opacity-50" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {paginatedRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={`transition-colors ${
                      isDarkMode ? 'hover:bg-[#181d2c]/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    {result.columns.map((col) => {
                      const val = row[col];
                      const isNum = typeof val === 'number';
                      return (
                        <td
                          key={col}
                          className={`px-4 py-2.5 text-slate-300 ${
                            isNum ? 'font-mono text-emerald-400' : 'font-sans'
                          }`}
                        >
                          {val === null || val === undefined ? (
                            <span className="text-slate-600 italic">null</span>
                          ) : typeof val === 'boolean' ? (
                            val ? 'true' : 'false'
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className={`px-4 py-2.5 border-t flex items-center justify-between text-xs text-slate-400 ${headerBg}`}>
            <span>
              Page {page} of {totalPages} ({sortedRows.length} filtered rows)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2.5 py-1 rounded border border-inherit disabled:opacity-30 hover:text-white"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2.5 py-1 rounded border border-inherit disabled:opacity-30 hover:text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
