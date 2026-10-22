"use client";

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconClose } from '@/components/common/Icons';
import TermsContent from './TermsContent';

export default function TermsModal({ open, onClose, onAgree }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-backdrop-in sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-popup-in flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] shadow-[var(--shadow-high)]"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--color-border-separator)] px-5 py-4 sm:px-7">
          <div>
            <h2 id={titleId} className="text-lg font-bold tracking-tight">
              Điều khoản &amp; Quy định
            </h2>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">Cập nhật lần cuối: 22/10/2026</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => onCloseRef.current()}
            aria-label="Đóng điều khoản"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-xs)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-fill-tertiary)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
          >
            <IconClose />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
          <TermsContent />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--color-border-separator)] px-5 py-3.5 sm:px-7">
          <button
            type="button"
            onClick={() => onCloseRef.current()}
            className="h-10 rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] px-5 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-fill-tertiary)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-tertiary)]"
          >
            Đóng
          </button>
          {onAgree && (
            <button
              type="button"
              onClick={() => {
                onAgree();
                onCloseRef.current();
              }}
              className="h-10 rounded-[var(--radius-sm)] bg-[var(--color-brand-primary)] px-5 text-sm font-semibold text-[var(--color-brand-on-primary)] transition-colors hover:bg-[var(--color-brand-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-tertiary)]"
            >
              Đồng ý
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
