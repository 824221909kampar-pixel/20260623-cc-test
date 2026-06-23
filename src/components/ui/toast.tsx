import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
  removeToast: () => {},
});

const useToastContext = () => useContext(ToastContext);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/*  Container – fixed portal for all toasts                             */
/* ------------------------------------------------------------------ */

const toastConfig: Record<ToastType, { icon: LucideIcon; barClass: string }> = {
  success: {
    icon: CheckCircle,
    barClass: 'bg-[var(--color-success)]',
  },
  error: {
    icon: XCircle,
    barClass: 'bg-[var(--color-error)]',
  },
  warning: {
    icon: AlertTriangle,
    barClass: 'bg-[var(--color-warning)]',
  },
  info: {
    icon: Info,
    barClass: 'bg-[var(--color-info)]',
  },
};

const ToastContainer: React.FC<{
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Individual Toast                                                    */
/* ------------------------------------------------------------------ */

interface ToastComponentProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

const TOAST_DURATION = 4000;

const Toast: React.FC<ToastComponentProps> = ({ toast, onRemove }) => {
  const { icon: Icon, barClass } = toastConfig[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="pointer-events-auto relative overflow-hidden bg-bg-elevated border border-border-primary rounded-xl shadow-2xl min-w-[320px] max-w-[420px]"
    >
      {/* colored top bar */}
      <div className={cn('h-1 w-full', barClass)} />

      <div className="flex items-start gap-3 p-4">
        <Icon size={20} className={cn('shrink-0 mt-0.5', barClass.replace('bg-', 'text-'))} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">{toast.title}</p>
          {toast.description && (
            <p className="text-xs text-text-secondary mt-0.5">{toast.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onRemove(toast.id)}
          className="shrink-0 p-0.5 rounded text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors duration-200"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  useToast hook                                                      */
/* ------------------------------------------------------------------ */

export const useToast = () => {
  const { addToast, removeToast } = useToastContext();

  const toast = useCallback(
    (type: ToastType, title: string, description?: string) => {
      addToast({ type, title, description });
    },
    [addToast],
  );

  const success = useCallback(
    (title: string, description?: string) => toast('success', title, description),
    [toast],
  );
  const error = useCallback(
    (title: string, description?: string) => toast('error', title, description),
    [toast],
  );
  const warning = useCallback(
    (title: string, description?: string) => toast('warning', title, description),
    [toast],
  );
  const info = useCallback(
    (title: string, description?: string) => toast('info', title, description),
    [toast],
  );

  return { toast, success, error, warning, info, removeToast };
};
