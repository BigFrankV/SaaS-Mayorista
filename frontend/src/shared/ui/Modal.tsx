import { useEffect, useRef, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Si `false`, no se cierra al hacer click fuera del modal. Default: `true`. */
  closeOnOverlay?: boolean;
};

/* Elementos que pueden recibir foco — para el focus trap */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  /* ── Auto-focus al abrir + restaurar foco al cerrar ── */
  useEffect(() => {
    if (!open) return;

    prevFocus.current = document.activeElement as HTMLElement;

    const raf = requestAnimationFrame(() => {
      if (!contentRef.current) return;
      const first = contentRef.current.querySelector(FOCUSABLE) as HTMLElement | null;
      first?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      // Al cerrar, devolvemos el foco al elemento que lo tenía antes
      prevFocus.current?.focus();
    };
  }, [open]);

  /* ── Escape + bloqueo scroll ── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  /* ── Focus trap: Tab/Shift+Tab ciclan dentro del modal ── */
  const trapFocus = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !contentRef.current) return;

    const focusables = contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  /* ── Cerrar al hacer mouseDown en el overlay (no en un hijo) ── */
  const handleOverlayMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!closeOnOverlay) return;
      // e.target es el elemento donde se presionó; e.currentTarget es el overlay
      // Solo cerramos si el click fue directamente en el overlay, no en un hijo
      if (e.target === e.currentTarget) onClose();
    },
    [onClose, closeOnOverlay],
  );

  if (!open) return null;

  const sizeClass = size === 'sm' ? 'modal-sm' : size === 'lg' ? 'modal-lg' : '';

  const modal = (
    <div className="modal-overlay open" onMouseDown={handleOverlayMouseDown}>
      <div
        ref={contentRef}
        className={`modal ${sizeClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={trapFocus}
      >
        <div className="modal-header">
          <span id={titleId} className="modal-title">
            {title}
          </span>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}