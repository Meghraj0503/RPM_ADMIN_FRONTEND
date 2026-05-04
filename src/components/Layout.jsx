import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Layout — responsive application shell.
 *
 * State:
 *   sidebarOpen      — mobile/tablet overlay drawer (slide in/out)
 *   sidebarCollapsed — desktop icon-only rail (collapse/expand)
 *
 * These are intentionally separate: overlay behaviour applies on
 * mobile/tablet; collapsed rail applies only on desktop.
 * device.css handles all visual differences per breakpoint.
 *
 * CSS consumed:
 *   index.css         — base .app-layout, .sidebar, .main-content, .topbar
 *   styles/main.css   — .sidebar--collapsed, .sidebar-overlay, .rl-header__*
 *   styles/device.css — responsive overrides for each breakpoint
 */
export default function Layout() {
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  /* Close mobile drawer on every route change */
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  /* Close mobile drawer on Escape key */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div
      className={[
        'app-layout',
        sidebarOpen && 'app-layout--mobile-open',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/*
        Overlay backdrop — always in the DOM.
        CSS (device.css) shows it via .app-layout--mobile-open .sidebar-overlay.
        display:none removes pointer events automatically.
      */}
      <div
        className="sidebar-overlay"
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={[
          'main-content',
          sidebarCollapsed && 'main-content--collapsed',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Header onHamburgerClick={() => setSidebarOpen((v) => !v)} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
