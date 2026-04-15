import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  MdDashboard, MdPeople, MdWarning, MdAssignment, MdArticle, MdDownload
} from 'react-icons/md';

const navItems = [
  { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
  { to: '/users', icon: <MdPeople />, label: 'Users' },
  { to: '/at-risk', icon: <MdWarning />, label: 'At Risk Users' },
  { to: '/questionnaires', icon: <MdAssignment />, label: 'Questionnaires' },
  { to: '/articles', icon: <MdArticle />, label: 'Articles' },
  { to: '/export', icon: <MdDownload />, label: 'Export Data' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>AAYU</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
