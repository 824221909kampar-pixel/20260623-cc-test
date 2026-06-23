import React, { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue>({
  open: false,
  onOpenChange: () => {},
});

const useDialogContext = () => React.useContext(DialogContext);

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const DialogRoot: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  const value = React.useMemo(() => ({ open, onOpenChange }), [open, onOpenChange]);

  return (
    <DialogContext.Provider value={value}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger: React.FC<{ children: React.ReactNode; asChild?: boolean }> = ({
  children,
  asChild,
}) => {
  const { onOpenChange } = useDialogContext();

  const handleClick = useCallback(() => {
    onOpenChange(true);
  }, [onOpenChange]);

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<{
      onClick?: React.MouseEventHandler;
    }>;
    return React.cloneElement(child, { onClick: handleClick });
  }

  return (
    <button type="button" onClick={handleClick} className="inline-flex">
      {children}
    </button>
  );
};

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  const { open, onOpenChange } = useDialogContext();

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) handleClose();
    },
    [handleClose],
  );

  React.useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, handleClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={cn(
              'relative z-10 bg-bg-elevated border border-border-primary rounded-2xl shadow-2xl w-full max-w-lg p-6',
              className,
            )}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors duration-200"
            >
              <X size={18} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface DialogHeaderProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ title, description, children, className }) => {
  return (
    <div className={cn('mb-5', className)}>
      {children ? (
        children
      ) : (
        <>
          {title && (
            <h2 className="text-lg font-semibold text-text-primary leading-tight">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-text-secondary mt-1">{description}</p>
          )}
        </>
      )}
    </div>
  );
};

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

const DialogFooter: React.FC<DialogFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('flex items-center justify-end gap-3 mt-6', className)}>
      {children}
    </div>
  );
};

interface DialogCloseProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const DialogClose: React.FC<DialogCloseProps> = ({ children, asChild }) => {
  const { onOpenChange } = useDialogContext();

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<{
      onClick?: React.MouseEventHandler;
    }>;
    return React.cloneElement(child, { onClick: handleClose });
  }

  return (
    <button type="button" onClick={handleClose} className="inline-flex">
      {children}
    </button>
  );
};

export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Footer: DialogFooter,
  Close: DialogClose,
});
