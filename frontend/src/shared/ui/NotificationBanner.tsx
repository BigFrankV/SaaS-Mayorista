import { useEffect, useState } from 'react';

type NotificationBannerProps = {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  autoCloseMs?: number;
};

export function NotificationBanner({ type, message, onClose, autoCloseMs }: NotificationBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  useEffect(() => {
    if (autoCloseMs && autoCloseMs > 0) {
      const id = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for slideDown animation
      }, autoCloseMs);
      return () => clearTimeout(id);
    }
  }, [autoCloseMs, onClose]);

  return (
    <div className={`notification-banner ${type}${visible ? ' show' : ''}`}>
      <span>{message}</span>
      <button className="notification-close" onClick={onClose} aria-label="Cerrar notificación">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
