import React from 'react';

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = false,
  size = 'md',
  className = '',
  color = 'bg-[#61afef]',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-[#5c6370] mb-1.5 font-mono">
          <span>Progress</span>
          <span className="font-semibold text-[#abb2bf]">{clampedProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-[#21252b] rounded-full overflow-hidden ${heightClasses[size]} border border-[#2c313a]/50`}>
        <div
          className={`h-full ${color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
