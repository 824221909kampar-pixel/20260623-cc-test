import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  label,
  showPercentage = false,
  color = 'bg-accent-primary',
  className,
}) => {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-text-secondary font-medium">{label}</span>}
          {showPercentage && (
            <span className="text-text-tertiary tabular-nums">{Math.round(clampedValue)}%</span>
          )}
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-bg-tertiary overflow-hidden">
        <div
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            color,
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
