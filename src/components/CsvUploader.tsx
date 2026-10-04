import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileText, Database, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Dataset } from '../types';
import { inferDatasetSchema, PREBUILT_DATASETS } from '../services/sampleData';

interface CsvUploaderProps {
  onDatasetLoaded: (dataset: Dataset) => void;
  isDarkMode: boolean;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({ onDatasetLoaded, isDarkMode }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    setError(null);
    setIsLoading(true);

    const isCsvOrTsv = file.name.endsWith('.csv') || file.name.endsWith('.tsv') || file.name.endsWith('.txt');
    const isJson = file.name.endsWith('.json');

    if (!isCsvOrTsv && !isJson) {
      setError('Please upload a valid .csv, .tsv, or .json file.');
      setIsLoading(false);
      return;
    }

    const reader = new FileReader();

    if (isJson) {
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          const records = Array.isArray(parsed) ? parsed : [parsed];
          const rawName = file.name.replace(/\.[^/.]+$/, '');
          const tableName = rawName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
          const dataset = inferDatasetSchema(records, tableName, rawName);
          dataset.fileSizeFormatted = `${(file.size / 1024).toFixed(1)} KB`;
          onDatasetLoaded(dataset);
        } catch (err: any) {
          setError(`JSON Parse error: ${err?.message || 'Invalid JSON format'}`);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
    } else {
      // CSV / TSV Parsing
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          setIsLoading(false);
          if (results.errors && results.errors.length > 0 && results.data.length === 0) {
            setError(`CSV Parsing Error: ${results.errors[0].message}`);
            return;
          }

          const rawName = file.name.replace(/\.[^/.]+$/, '');
          const tableName = rawName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
          const dataset = inferDatasetSchema(results.data as Record<string, any>[], tableName, rawName);
          dataset.fileSizeFormatted = `${(file.size / 1024).toFixed(1)} KB`;
          onDatasetLoaded(dataset);
        },
        error: (err) => {
          setIsLoading(false);
          setError(`File reading failed: ${err.message}`);
        },
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const loadSample = (key: 'saas' | 'ecommerce') => {
    const sample = PREBUILT_DATASETS[key];
    if (sample) {
      onDatasetLoaded(sample.dataset);
    }
  };

  const borderClass = isDragging
    ? 'border-[#5B4BE8] bg-[#5B4BE8]/10'
    : isDarkMode
    ? 'border-[#222838] bg-[#12151f]/60 hover:border-[#38425d] hover:bg-[#151926]'
    : 'border-slate-300 bg-slate-50/80 hover:border-indigo-400 hover:bg-slate-100/80';

  return (
    <div className="w-full space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer text-center group ${borderClass}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.json,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#5B4BE8]/10 text-[#5B4BE8] dark:text-[#8B7FF5] flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold tracking-tight">
              Drop your CSV, TSV, or JSON dataset here, or <span className="text-[#5B4BE8] dark:text-[#8B7FF5] underline">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              100% private · Browser-native DuckDB/Alasql · No data ever leaves your device
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Instant Demo Datasets Picker */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-inherit bg-[#141722]/40 dark:bg-[#12151e]">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Database className="w-4 h-4 text-[#8B7FF5]" />
          <span>Don't have a dataset ready? Explore instant demo datasets:</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => loadSample('saas')}
            className={`flex-1 sm:flex-initial text-xs font-medium px-3 py-1.5 rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
              isDarkMode
                ? 'border-[#262c3e] bg-[#181c28] text-slate-200 hover:border-[#5B4BE8] hover:text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-500 hover:text-indigo-600'
            }`}
          >
            <span>SaaS Retention & MRR</span>
            <span className="text-[10px] font-mono text-slate-400">(25 rows)</span>
          </button>

          <button
            type="button"
            onClick={() => loadSample('ecommerce')}
            className={`flex-1 sm:flex-initial text-xs font-medium px-3 py-1.5 rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
              isDarkMode
                ? 'border-[#262c3e] bg-[#181c28] text-slate-200 hover:border-[#5B4BE8] hover:text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-500 hover:text-indigo-600'
            }`}
          >
            <span>E-Commerce Profitability</span>
            <span className="text-[10px] font-mono text-slate-400">(15 rows)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
