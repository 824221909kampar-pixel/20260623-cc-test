import React from 'react';
import { cn } from '../../lib/utils';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 text-text-tertiary opacity-60">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary mt-1.5 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 inline-flex items-center justify-center h-10 px-5 rounded-xl bg-accent-primary text-white text-sm font-medium transition-all duration-200 hover:brightness-110 active:brightness-95 shadow-[0_0_20px_var(--color-accent-glow)]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
