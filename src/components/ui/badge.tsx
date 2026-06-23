import React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-bg-tertiary text-text-secondary border border-border-primary',
  success: 'bg-[rgba(0,184,148,0.15)] text-[var(--color-success)] border border-[rgba(0,184,148,0.3)]',
  warning: 'bg-[rgba(253,203,110,0.15)] text-[var(--color-warning)] border border-[rgba(253,203,110,0.3)]',
  error: 'bg-[rgba(225,112,85,0.15)] text-[var(--color-error)] border border-[rgba(225,112,85,0.3)]',
  info: 'bg-[rgba(116,185,255,0.15)] text-[var(--color-info)] border border-[rgba(116,185,255,0.3)]',
  outline: 'bg-transparent text-text-secondary border border-border-accent',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] leading-normal',
  md: 'px-2.5 py-1 text-xs leading-normal',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full whitespace-nowrap transition-colors duration-200',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';
