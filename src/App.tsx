/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Dataset, QueryResult, ApiKeyConfig, HistoryItem, ReasoningStep } from './types';
import { PREBUILT_DATASETS } from './services/sampleData';
import { registerDatasetInSql, executeClientSql } from './services/sqlEngine';
import { processNaturalLanguageQuery } from './services/aiService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { QueryInputArea } from './components/QueryInputArea';
import { ResultsView } from './components/ResultsView';
import { CsvUploader } from './components/CsvUploader';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ShieldCheck, Upload, Database, AlertCircle, FileSpreadsheet, X } from 'lucide-react';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Dataset state (default to preloaded SaaS dataset for instant playground)
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(PREBUILT_DATASETS.saas.dataset);
  const [isUploaderOpen, setIsUploaderOpen] = useState<boolean>(false);

  // BYOK Configuration state
  const [apiKeyConfig, setApiKeyConfig] = useState<ApiKeyConfig>({
    provider: 'gemini',
    key: '',
    model: 'gemini-2.5-flash',
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);

  // Query & Execution state
  const [query, setQuery] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<QueryResult | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Mobile sidebar state
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState<boolean>(false);

  // Register initial dataset into SQL engine on mount
  useEffect(() => {
    if (activeDataset) {
      registerDatasetInSql(activeDataset);
    }
  }, [activeDataset]);

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0d0f15';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }
  }, [isDarkMode]);

  // Handle switching datasets
  const handleSelectDataset = (dataset: Dataset) => {
    setActiveDataset(dataset);
    registerDatasetInSql(dataset);
    setQuery('');
    setCurrentResult(null);
    setExecutionError(null);
    setIsUploaderOpen(false);
    setIsOpenMobileSidebar(false);
  };

  // Run natural language query
  const handleRunQuery = async (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : query).trim();
    if (!q || !activeDataset || isRunning) return;

    setIsRunning(true);
    setExecutionError(null);

    const tempSteps: ReasoningStep[] = [
      { title: 'Parsing Intent', detail: `Understanding natural language query: "${q}"`, status: 'running' },
      { title: 'Schema Inspection', detail: `Inspecting columns for table "${activeDataset.tableName}"`, status: 'waiting' },
      { title: 'SQL Generation', detail: 'Constructing SQLite/Alasql compatible query', status: 'waiting' },
      { title: 'Client Execution', detail: 'Running in-memory SQL on local browser engine', status: 'waiting' },
    ];

    try {
      // Step 1 & 2: Process NL Query through AI / smart engine
      const aiResponse = await processNaturalLanguageQuery(q, activeDataset, apiKeyConfig);

      // Step 3: Execute the generated SQL locally in browser via alasql
      const execResult = executeClientSql(aiResponse.sql, activeDataset);

      if (!execResult.success) {
        throw new Error(execResult.error || 'Failed to execute query in local engine.');
      }

      const newResult: QueryResult = {
        id: `query_${Date.now()}`,
        question: q,
        sql: execResult.sanitizedSql,
        columns: execResult.columns,
        rows: execResult.rows,
        rowCount: execResult.rowCount,
        executionTimeMs: execResult.executionTimeMs,
        reasoningSteps: aiResponse.reasoningSteps,
        insight: aiResponse.insight,
        chartSuggestion: aiResponse.chartSuggestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCurrentResult(newResult);

      // Add to query history
      setHistory((prev) => [
        {
          id: newResult.id,
          question: q,
          sql: newResult.sql,
          datasetName: activeDataset.name,
          rowCount: newResult.rowCount,
          timestamp: newResult.timestamp,
        },
        ...prev.slice(0, 19),
      ]);
    } catch (err: any) {
      console.error('Query execution error:', err);
      setExecutionError(err?.message || 'An unexpected error occurred while executing the query.');
    } finally {
      setIsRunning(false);
    }
  };

  // Re-run modified SQL query
  const handleUpdateSql = (newSql: string) => {
    if (!activeDataset) return;
    try {
      const execResult = executeClientSql(newSql, activeDataset);
      if (!execResult.success) {
        alert(execResult.error || 'Syntax error in updated SQL');
        return;
      }
      if (currentResult) {
        setCurrentResult({
          ...currentResult,
          sql: execResult.sanitizedSql,
          columns: execResult.columns,
          rows: execResult.rows,
          rowCount: execResult.rowCount,
          executionTimeMs: execResult.executionTimeMs,
        });
      }
    } catch (err: any) {
      alert(`SQL Error: ${err?.message || 'Invalid SQL'}`);
    }
  };

  // Insert column name into textarea
  const handleInsertColumn = (colName: string) => {
    setQuery((prev) => (prev ? `${prev} ${colName}` : colName));
  };

  const mainBg = isDarkMode ? 'bg-[#0d0f15] text-[#e8eaf0]' : 'bg-[#f8fafc] text-slate-900';

  return (
    <div className={`min-h-screen flex flex-col ${mainBg} transition-colors`}>
      {/* Top Navigation Bar */}
      <Header
        activeDataset={activeDataset}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onOpenUploader={() => setIsUploaderOpen(true)}
        onToggleMobileSidebar={() => setIsOpenMobileSidebar(!isOpenMobileSidebar)}
        apiKeyConfig={apiKeyConfig}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Schema Explorer & History */}
        <Sidebar
          dataset={activeDataset}
          onSelectDataset={handleSelectDataset}
          onSelectHistoryQuery={(historyQuery) => {
            setQuery(historyQuery);
            handleRunQuery(historyQuery);
            setIsOpenMobileSidebar(false);
          }}
          history={history}
          onClearHistory={() => setHistory([])}
          isDarkMode={isDarkMode}
          isOpenMobile={isOpenMobileSidebar}
          onCloseMobile={() => setIsOpenMobileSidebar(false)}
          onInsertColumn={handleInsertColumn}
        />

        {/* Content Workspace */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-5xl mx-auto w-full space-y-6">
          {/* Uploader Dropdown Modal / View if triggered */}
          {isUploaderOpen && (
            <div className={`p-6 rounded-2xl border mb-6 relative animate-in fade-in ${
              isDarkMode ? 'bg-[#131620] border-[#222736]' : 'bg-white border-slate-200 shadow-md'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#8B7FF5]" />
                  <h3 className="text-sm font-semibold">Upload Dataset</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploaderOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <CsvUploader onDatasetLoaded={handleSelectDataset} isDarkMode={isDarkMode} />
            </div>
          )}

          {/* Natural Language Query Area */}
          <QueryInputArea
            query={query}
            onChangeQuery={setQuery}
            onRunQuery={handleRunQuery}
            isRunning={isRunning}
            dataset={activeDataset}
            hasRunAnyQuery={currentResult !== null}
            isDarkMode={isDarkMode}
          />

          {/* Execution Error Banner */}
          {executionError && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Query Error</span>
                <p className="mt-0.5 leading-relaxed">{executionError}</p>
              </div>
            </div>
          )}

          {/* Results View: Reasoning Trace, AI Insights, Charts, SQL & Table */}
          {currentResult && (
            <ResultsView
              result={currentResult}
              isDarkMode={isDarkMode}
              onUpdateSql={handleUpdateSql}
            />
          )}
        </main>
      </div>

      {/* BYOK Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        config={apiKeyConfig}
        onSave={(newConfig) => setApiKeyConfig(newConfig)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
