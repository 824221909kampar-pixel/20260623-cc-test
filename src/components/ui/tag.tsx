import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

type TagSize = 'sm' | 'md';

interface TagProps {
  label: string;
  color?: string;
  onRemove?: () => void;
  size?: TagSize;
  className?: string;
}

const sizeStyles: Record<TagSize, string> = {
  sm: 'h-6 px-2 text-[11px] gap-1',
  md: 'h-8 px-3 text-xs gap-1.5',
};

export const Tag: React.FC<TagProps> = ({
  label,
  color = 'bg-bg-tertiary text-text-secondary border-border-primary',
  onRemove,
  size = 'md',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium whitespace-nowrap transition-colors duration-200',
        sizeStyles[size],
        color,
        className,
      )}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            'inline-flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-bg-hover',
            size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
          )}
          aria-label={`Remove ${label}`}
        >
          <X size={size === 'sm' ? 10 : 12} />
        </button>
      )}
    </span>
  );
};
