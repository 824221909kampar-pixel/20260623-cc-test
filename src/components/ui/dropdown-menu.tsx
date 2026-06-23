import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

type DropdownAlign = 'left' | 'right';

interface DropdownMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: DropdownAlign;
  className?: string;
  asChild?: boolean;
}

const alignStyles: Record<DropdownAlign, string> = {
  left: 'left-0',
  right: 'right-0',
};

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'left',
  className,
  asChild,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open, close]);

  const handleItemClick = useCallback(
    (item: DropdownMenuItem) => {
      if (item.disabled) return;
      item.onClick?.();
      close();
    },
    [close],
  );

  return (
    <div ref={ref} className={cn('relative inline-flex', className)}>
      {asChild ? (
        React.cloneElement(
          React.Children.only(trigger) as React.ReactElement<{
            onClick?: React.MouseEventHandler;
            ref?: React.Ref<HTMLElement>;
          }>,
          { onClick: toggle },
        )
      ) : (
        <button type="button" onClick={toggle} className="inline-flex">
          {trigger}
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute top-full mt-2 z-50 min-w-[180px] rounded-xl bg-bg-elevated border border-border-primary shadow-xl p-1.5',
              alignStyles[align],
            )}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                disabled={item.disabled}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-200',
                  item.danger
                    ? 'text-[var(--color-error)] hover:bg-[rgba(225,112,85,0.1)]'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover',
                  item.disabled && 'opacity-50 cursor-not-allowed',
                )}
              >
                {item.icon && <item.icon size={16} className="shrink-0" />}
                <span>{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
