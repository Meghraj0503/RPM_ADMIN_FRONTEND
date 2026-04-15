import React from 'react';
import { MdNotifications } from 'react-icons/md';

export default function TopBar({ title, subtitle }) {
  const name = localStorage.getItem('adminName') || 'Admin';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="topbar">
      <div className="topbar-greeting">
        <h2>Welcome back, {name}</h2>
        <p>It's {dateStr}</p>
      </div>
      <div className="topbar-actions">
        <button className="topbar-icon-btn">
          <MdNotifications />
          <span className="badge">3</span>
        </button>
        <div className="avatar">{name.charAt(0).toUpperCase()}</div>
      </div>
    </header>
  );
}
