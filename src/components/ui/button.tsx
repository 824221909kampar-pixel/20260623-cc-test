import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2, type LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: LucideIcon;
  children?: React.ReactNode;
}

interface AsChildProps {
  asChild: true;
  children: React.ReactElement;
}

type ButtonProps = (ButtonBaseProps & { asChild?: false }) | (AsChildProps & Omit<ButtonBaseProps, 'children'>);

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-primary text-white hover:bg-accent-secondary active:brightness-95 shadow-sm hover:shadow-md transition-shadow',
  secondary:
    'bg-bg-elevated border border-border-primary text-text-primary hover:bg-bg-hover hover:border-border-accent active:bg-bg-tertiary shadow-sm',
  ghost:
    'bg-transparent text-text-secondary hover:text-accent-primary hover:bg-accent-primary/5 active:bg-accent-primary/10',
  danger:
    'bg-[var(--color-error)] text-white hover:brightness-110 active:brightness-95',
  success:
    'bg-[var(--color-success)] text-white hover:brightness-110 active:brightness-95',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
};

const iconSizes: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

const spinnerSizes: Record<ButtonSize, number> = {
  sm: 12,
  md: 16,
  lg: 20,
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    if (props.asChild) {
      const { asChild, children, variant = 'primary', size = 'md', loading, icon, disabled, ...rest } = props;
      const child = React.Children.only(children);
      const childElement = child as React.ReactElement<{
        className?: string;
        ref?: React.Ref<HTMLElement>;
      }>;

      return React.cloneElement(childElement, {
        className: cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none',
          variantStyles[variant],
          sizeStyles[size],
          childElement.props.className,
        ),
        ref,
        ...rest,
      });
    }

    const {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      icon: Icon,
      children,
      className,
      ...rest
    } = props;

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...rest}
      >
        {loading ? (
          <Loader2
            size={spinnerSizes[size]}
            className="animate-spin shrink-0"
          />
        ) : Icon ? (
          <Icon size={iconSizes[size]} className="shrink-0" />
        ) : null}
        {children && <span>{children}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
