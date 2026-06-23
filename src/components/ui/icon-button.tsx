import React from 'react';
import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  tooltip?: string;
}

const variantStyles: Record<IconButtonVariant, string> = {
  primary:
    'bg-accent-primary text-white hover:brightness-110 active:brightness-95 shadow-[0_0_15px_var(--color-accent-glow)]',
  secondary:
    'bg-bg-elevated border border-border-primary text-text-secondary hover:text-text-primary hover:bg-bg-hover hover:border-border-accent active:bg-bg-tertiary',
  ghost:
    'bg-transparent text-text-tertiary hover:text-text-primary hover:bg-bg-hover active:bg-bg-tertiary',
  danger:
    'bg-[var(--color-error)] text-white hover:brightness-110 active:brightness-95 shadow-[0_0_15px_rgba(225,112,85,0.3)]',
  success:
    'bg-[var(--color-success)] text-black hover:brightness-110 active:brightness-95 shadow-[0_0_15px_rgba(0,184,148,0.3)]',
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-12 w-12 rounded-xl',
};

const iconSizes: Record<IconButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 20,
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, variant = 'ghost', size = 'md', tooltip, disabled, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        title={tooltip}
        aria-label={tooltip}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        <Icon size={iconSizes[size]} className="shrink-0" />
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';
