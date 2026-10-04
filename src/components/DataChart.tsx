import React, { useState } from 'react';
import { ChartSuggestion } from '../types';

interface DataChartProps {
  data: Record<string, any>[];
  suggestion: ChartSuggestion;
  isDarkMode: boolean;
}

const PALETTE = [
  '#5B4BE8', // Brand Violet
  '#4F8EF7', // Blue
  '#34C97B', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#10B981', // Green
];

function formatVal(val: any): string {
  if (val === undefined || val === null) return '-';
  if (typeof val === 'number') {
    if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    if (Number.isInteger(val)) return val.toLocaleString();
    return val.toFixed(1);
  }
  return String(val);
}

export const DataChart: React.FC<DataChartProps> = ({ data, suggestion, isDarkMode }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  // Extract keys
  const xKey = suggestion.xAxisKey || Object.keys(data[0])[0];
  const yKey = suggestion.yAxisKey || Object.keys(data[0]).find((k) => typeof data[0][k] === 'number') || Object.keys(data[0])[1];

  // Take top 10 for clean presentation
  const chartData = data.slice(0, 10).map((d) => ({
    label: String(d[xKey] ?? 'Unknown'),
    value: Number(d[yKey]) || 0,
  }));

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);
  const totalValue = chartData.reduce((acc, curr) => acc + Math.max(0, curr.value), 0);

  // Colors
  const textColor = isDarkMode ? '#9ca3af' : '#4b5563';
  const labelColor = isDarkMode ? '#e5e7eb' : '#1f2937';
  const gridColor = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <div className={`p-4 rounded-xl border transition-colors ${isDarkMode ? 'bg-[#13161f] border-[#222735]' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className={`text-sm font-semibold ${labelColor}`}>{suggestion.title || `${yKey} by ${xKey}`}</h4>
          <p className={`text-xs ${textColor}`}>Showing top {chartData.length} records</p>
        </div>
        <span className={`text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${isDarkMode ? 'bg-[#1a1f2c] text-indigo-400' : 'bg-indigo-50 text-indigo-700'}`}>
          {suggestion.type.toUpperCase()}
        </span>
      </div>

      {suggestion.type === 'donut' ? (
        // Donut Chart View
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-2">
          <div className="relative w-44 h-44 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {(() => {
                let accumulatedPercent = 0;
                return chartData.map((d, i) => {
                  const percent = totalValue > 0 ? Math.max(0, d.value) / totalValue : 0;
                  const strokeDasharray = `${percent * 283} 283`;
                  const strokeDashoffset = `-${accumulatedPercent * 283}`;
                  accumulatedPercent += percent;
                  const color = PALETTE[i % PALETTE.length];
                  const isHovered = hoveredIdx === i;

                  return (
                    <circle
                      key={i}
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      stroke={color}
                      strokeWidth={isHovered ? '13' : '10'}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  );
                });
              })()}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
              <span className={`text-xs ${textColor}`}>
                {hoveredIdx !== null ? chartData[hoveredIdx].label : 'Total'}
              </span>
              <span className={`text-sm font-bold font-mono ${labelColor}`}>
                {hoveredIdx !== null ? formatVal(chartData[hoveredIdx].value) : formatVal(totalValue)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {chartData.map((d, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center gap-2 p-1 rounded cursor-pointer transition-colors ${
                  hoveredIdx === i ? (isDarkMode ? 'bg-[#1f2536]' : 'bg-slate-100') : ''
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                <span className={`truncate max-w-[100px] ${textColor}`}>{d.label}</span>
                <span className={`font-mono ml-auto font-medium ${labelColor}`}>{formatVal(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Bar Chart View
        <div className="space-y-2 pt-2">
          {chartData.map((d, i) => {
            const widthPct = Math.max(3, Math.min(100, (d.value / maxValue) * 100));
            const isHovered = hoveredIdx === i;
            const barColor = PALETTE[i % PALETTE.length];

            return (
              <div
                key={i}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className={`truncate max-w-[200px] font-medium transition-colors ${isHovered ? 'text-indigo-400 font-semibold' : labelColor}`}>
                    {d.label}
                  </span>
                  <span className={`font-mono text-xs ${isHovered ? 'text-indigo-400 font-semibold' : textColor}`}>
                    {formatVal(d.value)}
                  </span>
                </div>
                <div className={`h-2.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-[#1c2230]' : 'bg-slate-100'}`}>
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: isHovered ? '#8B7FF5' : barColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
