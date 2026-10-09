'use client';

import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { Loader2, X } from 'lucide-react';
import { cx } from './Controls';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Sticky area under the body (primary action). */
  footer?: ReactNode;
  children: ReactNode;
  variant?: 'sheet' | 'action';
  /** Accessible name when there is no visible title. */
  label?: string;
}

const EXIT_MS = 230;

/**
 * Bottom sheet on phones (drag the grabber down to dismiss), centred dialog
 * on tablet and desktop. Built on <dialog> so focus is trapped, Escape works
 * and the page behind is inert.
 */
export function Sheet({ open, onClose, title, footer, children, variant = 'sheet', label }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    // The exit animation is driven by a data attribute set straight on the
    // element, so re-opening mid-animation simply cancels it.
    if (open) {
      d.dataset.closing = 'false';
      if (!d.open) {
        d.showModal();
        document.documentElement.style.overflow = 'hidden';
      }
    } else if (d.open) {
      d.dataset.closing = 'true';
      const t = setTimeout(() => {
        d.close();
        d.dataset.closing = 'false';
        if (panelRef.current) panelRef.current.style.transform = '';
        document.documentElement.style.overflow = '';
      }, EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(
    () => () => {
      document.documentElement.style.overflow = '';
    },
    [],
  );

  // --- drag to dismiss (phones) ---------------------------------------------
  const drag = useRef<{ y: number; t: number; dy: number } | null>(null);
  const onPointerDown = useCallback((e: ReactPointerEvent) => {
    if (variant !== 'sheet' || window.matchMedia('(min-width: 768px)').matches) return;
    drag.current = { y: e.clientY, t: performance.now(), dy: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [variant]);
  const onPointerMove = useCallback((e: ReactPointerEvent) => {
    if (!drag.current || !panelRef.current) return;
    const dy = Math.max(0, e.clientY - drag.current.y);
    drag.current.dy = dy;
    panelRef.current.style.animation = 'none';
    panelRef.current.style.transform = `translateY(${dy}px)`;
  }, []);
  const onPointerUp = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    const panel = panelRef.current;
    if (!d || !panel) return;
    const velocity = d.dy / Math.max(1, performance.now() - d.t);
    if (d.dy > 110 || (d.dy > 40 && velocity > 0.6)) {
      panel.style.transition = 'transform 220ms cubic-bezier(0.32,0.72,0,1)';
      panel.style.transform = 'translateY(100%)';
      setTimeout(() => {
        panel.style.transition = '';
        onClose();
      }, 200);
    } else {
      panel.style.transition = 'transform 260ms cubic-bezier(0.32,0.72,0,1)';
      panel.style.transform = '';
      setTimeout(() => {
        panel.style.transition = '';
      }, 270);
    }
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className="ad-sheet"
      data-variant={variant}
      aria-label={typeof title === 'string' ? title : label}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={panelRef} className="ad-sheet-panel">
        {variant === 'sheet' ? (
          <>
            <div
              className="shrink-0 touch-none select-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div className="ad-sheet-grabber" />
              <div className="grid grid-cols-[40px_minmax(0,1fr)_40px] items-center px-3 pb-2 pt-2.5 md:pt-3.5">
                <span />
                <h2 className="truncate text-center text-[17px] font-bold text-[var(--ad-label)]">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center justify-self-end rounded-full bg-[rgba(118,118,128,0.14)] text-[var(--ad-label-2)] transition active:scale-90"
                >
                  <X size={16} strokeWidth={2.6} />
                </button>
              </div>
            </div>
            <div className="ad-sheet-body flex-1 px-4 pb-5 pt-1">{children}</div>
            {footer && (
              <div className="shrink-0 border-t-[0.5px] border-[var(--ad-sep-strong)] bg-[var(--ad-bg)] px-4 pb-4 pt-3">{footer}</div>
            )}
          </>
        ) : (
          children
        )}
      </div>
    </dialog>
  );
}

/**
 * Destructive confirmation — an iOS action sheet on phones, a compact alert
 * on larger screens. Replaces window.confirm().
 */
export function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  busy,
  destructive = true,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  destructive?: boolean;
}) {
  const btn =
    'flex h-[56px] w-full items-center justify-center gap-2 text-[17px] transition active:bg-[var(--ad-pressed)] disabled:opacity-50';
  return (
    <Sheet open={open} onClose={onClose} variant="action" label={title}>
      <div className="overflow-hidden rounded-[14px] bg-[rgba(255,255,255,0.97)] shadow-[var(--ad-shadow-lg)] md:shadow-none">
        <div className="px-5 pb-4 pt-4 text-center">
          <p className="text-[14px] font-semibold text-[var(--ad-label-2)]">{title}</p>
          {message && <p className="mt-1 text-[13px] leading-snug text-[var(--ad-label-3)]">{message}</p>}
        </div>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={cx(btn, 'border-t-[0.5px] border-[var(--ad-sep-strong)] font-semibold', destructive ? 'text-[var(--ad-red)]' : 'text-[var(--ad-tint)]')}
        >
          {busy && <Loader2 size={18} className="animate-spin" />}
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={onClose}
          className={cx(btn, 'hidden border-t-[0.5px] border-[var(--ad-sep-strong)] font-medium text-[var(--ad-tint)] md:flex')}
        >
          Cancel
        </button>
      </div>
      <button
        type="button"
        onClick={onClose}
        className={cx(btn, 'rounded-[14px] bg-white font-bold text-[var(--ad-tint)] shadow-[var(--ad-shadow-lg)] md:hidden')}
      >
        Cancel
      </button>
    </Sheet>
  );
}
