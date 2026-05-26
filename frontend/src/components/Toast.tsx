import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

type ToastKind = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContext {
  push: (message: string, kind?: ToastKind) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  warning: (msg: string) => void;
}

const ToastCtx = createContext<ToastContext | null>(null);

export function useToast(): ToastContext {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((arr) => [...arr, { id, message, kind }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const api: ToastContext = {
    push,
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
    warning: (m) => push(m, 'warning'),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`} onClick={() => remove(t.id)}>
            <span className="toast-icon">{iconFor(t.kind)}</span>
            <span className="toast-message">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function iconFor(kind: ToastKind): string {
  switch (kind) {
    case 'success': return '✓';
    case 'error':   return '✕';
    case 'warning': return '⚠';
    case 'info':    return 'ℹ';
  }
}
