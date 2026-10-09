'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

type ToastTone = 'success' | 'error';
interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => {});

/** Brief confirmation pill ("Saved") at the top of the screen. */
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, tone: ToastTone = 'success') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), message, tone });
    timer.current = setTimeout(() => setToast(null), tone === 'error' ? 3600 : 2200);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" role="status" className="sr-only">
        {toast?.message}
      </div>
      {toast && (
        <div key={toast.id} className="ad-toast" aria-hidden="true">
          {toast.tone === 'success' ? (
            <CheckCircle2 size={17} className="text-[#7be0cf]" />
          ) : (
            <AlertCircle size={17} className="text-[#ff9a9d]" />
          )}
          <span className="truncate">{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}
