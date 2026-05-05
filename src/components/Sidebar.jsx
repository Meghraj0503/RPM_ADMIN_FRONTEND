import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdPeople,
  MdWarning,
  MdAssignment,
  MdArticle,
  MdDownload,
  MdClose,
  MdChevronLeft,
  MdChevronRight,
  MdFitnessCenter
} from 'react-icons/md';

const navItems = [
  { to: '/dashboard',      icon: <MdDashboard />,  label: 'Dashboard' },
  { to: '/users',          icon: <MdPeople />,     label: 'Users' },
  { to: '/at-risk',        icon: <MdWarning />,    label: 'At Risk Users' },
  { to: '/questionnaires', icon: <MdAssignment />, label: 'Questionnaires' },
  { to: '/articles', icon: <MdArticle />, label: 'Articles' },
  { to: '/training', icon: <MdFitnessCenter />, label: 'Manage Training' },
  { to: '/export', icon: <MdDownload />, label: 'Export Data' },
];

/**
 * Sidebar — responsive navigation.
 *
 * Desktop  : always visible; `collapsed` toggles icon-only rail.
 * Tablet   : off-screen by default; parent class `app-layout--mobile-open`
 *            slides it in.  Close button (X) dismisses it.
 * Mobile   : same as tablet.
 *
 * CSS for each behaviour lives in:
 *   src/styles/main.css  — base modifiers
 *   src/styles/device.css — breakpoint-specific overrides
 *
 * Props:
 *   collapsed          — boolean, icon-only mode (desktop)
 *   onToggleCollapse   — called when the collapse chevron is clicked
 *   onClose            — called when the mobile overlay X is clicked
 *                        (also called on each nav click to close the drawer)
 */
export default function Sidebar({ collapsed, onToggleCollapse, onClose }) {
  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>

      {/* ── Logo row ── */}
      <div className="sidebar-logo">
        <span>RPM</span>

        {/* Desktop: collapse / expand chevron */}
        <button
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
        </button>

        {/* Mobile / tablet: close (X) button — hidden on desktop via device.css */}
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <MdClose />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
            title={collapsed ? item.label : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            {/* .sidebar-nav-label hidden via CSS when collapsed */}
            <span className="sidebar-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}
