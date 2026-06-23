import React, { useCallback, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  autoResize?: boolean;
  containerClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, autoResize = false, className, containerClassName, id, onChange, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const combinedRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [ref],
    );

    const autoResizeEffect = useCallback(() => {
      const textarea = internalRef.current;
      if (textarea && autoResize) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [autoResize]);

    useEffect(() => {
      autoResizeEffect();
    }, [props.value, autoResizeEffect]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        autoResizeEffect();
        onChange?.(e);
      },
      [autoResizeEffect, onChange],
    );

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={combinedRef}
          id={textareaId}
          onChange={handleChange}
          rows={props.rows ?? 3}
          className={cn(
            'w-full rounded-xl bg-bg-secondary border border-border-primary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-200 outline-none resize-none',
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

Textarea.displayName = 'Textarea';
