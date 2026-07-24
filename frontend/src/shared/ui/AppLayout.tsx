import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authApi';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import type { MeResponse } from '../api/types';

type AppLayoutProps = {
  children: React.ReactNode;
  title: string;
  breadcrumb?: Array<{ label: string; path?: string }>;
};

export function AppLayout({ children, title, breadcrumb = [] }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clear = useAuthStore((s) => s.clear);

  const handleLogout = useCallback(() => {
    if (refreshToken) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    clear();
  }, [refreshToken, clear]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Close sidebar on route change (window resize)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1023) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking main content on mobile
  const handleMainClick = () => {
    if (window.innerWidth <= 1023 && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.5)',
            zIndex: 99,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <Sidebar user={user as MeResponse | null} isAdmin={isAdmin()} />
      </div>

      <Topbar
        title={title}
        breadcrumb={breadcrumb}
        user={user as MeResponse | null}
        onLogout={handleLogout}
        onToggleSidebar={toggleSidebar}
      />

      <main className="main-content" onClick={handleMainClick}>
        {children}
      </main>
    </div>
  );
}
