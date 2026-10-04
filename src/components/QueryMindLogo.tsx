import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'horizontal' | 'stacked' | 'icon-only';
  theme?: 'dark' | 'light';
  isDarkMode?: boolean;
}

export const QueryMindLogo: React.FC<LogoProps> = ({
  className = '',
  size = 32,
  variant = 'horizontal',
  isDarkMode = true,
}) => {
  const gridColor = isDarkMode ? '#F4F4F2' : '#141418';
  const violetColor = isDarkMode ? '#8B7FF5' : '#5B4BE8';
  const textColor = isDarkMode ? '#F4F4F2' : '#141418';

  const mark = (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className="flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
      aria-hidden="true"
    >
      <defs>
        <g id="qm-grid-cells">
          {/* Top-Left Cell: outer corner R12, inner corner R3 */}
          <path
            d="M12,0 H26 A3,3 0 0 1 29,3 V26 A3,3 0 0 1 26,29 H3 A3,3 0 0 1 0,26 V12 A12,12 0 0 1 12,0 Z"
            fill={gridColor}
          />
          {/* Top-Right Cell: outer corner R12, inner corner R3 */}
          <path
            d="M38,0 H52 A12,12 0 0 1 64,12 V26 A3,3 0 0 1 61,29 H38 A3,3 0 0 1 35,26 V3 A3,3 0 0 1 38,0 Z"
            fill={gridColor}
          />
          {/* Bottom-Left Cell: outer corner R12, inner corner R3 */}
          <path
            d="M3,35 H26 A3,3 0 0 1 29,38 V61 A3,3 0 0 1 26,64 H12 A12,12 0 0 1 0,52 V38 A3,3 0 0 1 3,35 Z"
            fill={gridColor}
          />
        </g>
        {/* Bottom-Right Sharp Cell (R0): the speech bubble tail / answer indicator */}
        <path
          id="qm-cell-sharp"
          d="M38,35 H61 A3,3 0 0 1 64,38 V64 H38 A3,3 0 0 1 35,61 V38 A3,3 0 0 1 38,35 Z"
          fill={violetColor}
        />
      </defs>
      <use href="#qm-grid-cells" />
      <use href="#qm-cell-sharp" />
    </svg>
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{mark}</div>;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        {mark}
        <div
          className="text-2xl tracking-tight leading-none"
          style={{ color: textColor }}
        >
          <span className="font-semibold">Query</span>
          <span className="font-normal opacity-90">Mind</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {mark}
      <div
        className="text-[19px] tracking-tight leading-none"
        style={{ color: textColor }}
      >
        <span className="font-bold">Query</span>
        <span className="font-normal opacity-90">Mind</span>
      </div>
    </div>
  );
};
