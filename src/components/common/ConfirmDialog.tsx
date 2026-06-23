import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = '确认',
  cancelLabel = '取消',
  variant = 'default',
}: ConfirmDialogProps) {
  const confirmVariant = variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : undefined;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative bg-bg-elevated border border-border-primary rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <div className="flex items-start gap-4 mb-4">
              {variant === 'danger' && (
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={20} className="text-error" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
                <p className="text-sm text-text-secondary">{message}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={onClose}>
                {cancelLabel}
              </Button>
              <Button
                variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
                size="sm"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
