'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextValue {
  toasts: (ToastProps & { id: string })[];
  toast: (props: ToastProps) => string;
  dismiss: (id: string) => void;
  error: (title: string, description?: string) => string;
  success: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([]);

  const generateId = () => Math.random().toString(36).slice(2);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback((props: ToastProps) => {
    const id = generateId();
    const toast = { ...props, id };
    setToasts((prev) => [...prev, toast]);
    if (props.duration !== 0) {
      setTimeout(() => dismiss(id), props.duration ?? 5000);
    }
    return id;
  }, [dismiss]);

  const createToast = (variant: ToastProps['variant']) => (title: string, description?: string) =>
    addToast({ title, description, variant });

  return (
    <ToastContext.Provider
      value={{
        toasts,
        toast: addToast,
        dismiss,
        error: createToast('destructive'),
        success: createToast('success'),
        warning: createToast('warning'),
        info: createToast('info'),
      }}
    >
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" role="region" aria-live="polite" aria-label="Notifications">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

const variantStyles = {
  default: 'border-border bg-card text-card-foreground',
  destructive: 'border-destructive/50 bg-destructive/10 text-destructive',
  success: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700',
  warning: 'border-amber-500/50 bg-amber-500/10 text-amber-700',
  info: 'border-primary/50 bg-primary/10 text-primary',
};

interface ToastComponentProps extends ToastProps {
  onDismiss: (id: string) => void;
  id: string;
}

function ToastComponent({ title, description, variant = 'default', onDismiss, id }: ToastComponentProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 shadow-lg min-w-[300px] max-w-md animate-slide-up',
        variantStyles[variant]
      )}
      role="alert"
    >
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function Toast({ title, description, variant = 'default', onDismiss, id, ...props }: ToastProps & { id: string; onDismiss: (id: string) => void }) {
  return <ToastComponent {...props} title={title} description={description} variant={variant} onDismiss={onDismiss} id={id} />;
}