import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, containerClassName, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded-xl bg-bg-secondary border border-border-primary px-3.5 text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-200 outline-none',
            'hover:border-border-accent',
            'focus:border-accent-primary focus:ring-2 focus:ring-accent-glow',
            'disabled:opacity-50 disabled:pointer-events-none',
            error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[rgba(225,112,85,0.3)]',
            className,
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-text-tertiary">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-[var(--color-error)]">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
