import React, { useState, useRef, useEffect } from 'react';
import { MdNotifications, MdLogout, MdPerson } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export default function TopBar() {
  const name = localStorage.getItem('adminName') || 'Admin';
  const role = localStorage.getItem('adminRole') || '';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminRole');
    navigate('/login');
  };

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

        {/* Avatar with dropdown */}
        <div className="avatar-wrapper" ref={dropdownRef}>
          <div
            className="avatar"
            onClick={() => setDropdownOpen(prev => !prev)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            title={name}
          >
            {name.charAt(0).toUpperCase()}
          </div>

          {dropdownOpen && (
            <div className="avatar-dropdown">
              <div className="avatar-dropdown-header">
                <div className="avatar-dropdown-avatar">{name.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="avatar-dropdown-name">{name}</div>
                  {role && <div className="avatar-dropdown-role">{role}</div>}
                </div>
              </div>
              <div className="avatar-dropdown-divider" />
              <button className="avatar-dropdown-item avatar-dropdown-logout" onClick={handleLogout}>
                <MdLogout size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
