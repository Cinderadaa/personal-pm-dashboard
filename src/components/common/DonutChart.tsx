import React from 'react';

interface DonutChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  percentage,
  size = 140,
  strokeWidth = 12,
  label = 'Complete',
  sublabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#21252b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#61afef"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold font-mono tracking-tight text-[#abb2bf]">
            {percentage}%
          </span>
          <span className="text-[10px] font-mono font-medium text-[#5c6370] uppercase tracking-wider">
            {label}
          </span>
        </div>
      </div>
      {sublabel && (
        <span className="mt-2 text-xs text-[#5c6370] font-mono">
          {sublabel}
        </span>
      )}
    </div>
  );
};
