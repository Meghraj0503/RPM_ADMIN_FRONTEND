import React, { useState, useRef, useEffect } from "react";
import { MdNotifications, MdLogout, MdMenu } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useHeaderContext } from "../contexts/HeaderContext";

/**
 * Header — responsive top bar.
 *
 * Extends the existing .topbar styles from index.css.
 * New .rl-header__* classes are styled in src/styles/main.css
 * and revealed/hidden by src/styles/device.css media queries.
 *
 * Props:
 *   onHamburgerClick — called when the mobile/tablet hamburger is pressed
 */
export default function Header({ onHamburgerClick }) {
  const { customLeftComponent } = useHeaderContext();
  const name = localStorage.getItem("adminName") || "Admin";
  const role = localStorage.getItem("adminRole") || "";
  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  /* Close dropdown when clicking outside */
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminRole");
    navigate("/login");
  };

  return (
    <header className="topbar rl-header">
      {/* ── Hamburger (mobile/tablet only, hidden via device.css on desktop) ── */}
      <button
        className="rl-header__hamburger"
        onClick={onHamburgerClick}
        aria-label="Toggle sidebar"
      >
        <MdMenu />
      </button>

      {/* ── Brand shown in header when sidebar is off-screen ── */}
      <div className="rl-header__brand">
        <span>RPM</span>
      </div>

      {/* ── Left section: custom component (e.g. UserDetailHeader) or default greeting ── */}
      {customLeftComponent ?? (
        <div className="topbar-greeting">
          <h2>Welcome back, {name}</h2>
          <p>It's {dateStr}</p>
        </div>
      )}

      {/* ── Right-side actions ── */}
      <div className="topbar-actions">
        <button className="topbar-icon-btn" aria-label="Notifications">
          <svg
            width="17"
            height="19"
            viewBox="0 0 17 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.5 14.5V15.5C5.5 16.2956 5.81607 17.0587 6.37868 17.6213C6.94129 18.1839 7.70435 18.5 8.5 18.5C9.29565 18.5 10.0587 18.1839 10.6213 17.6213C11.1839 17.0587 11.5 16.2956 11.5 15.5V14.5M6.5 2.5C6.5 1.96957 6.71071 1.46086 7.08579 1.08579C7.46086 0.710714 7.96957 0.5 8.5 0.5C9.03043 0.5 9.53914 0.710714 9.91421 1.08579C10.2893 1.46086 10.5 1.96957 10.5 2.5C11.6484 3.04303 12.6274 3.88833 13.3321 4.9453C14.0367 6.00227 14.4404 7.23107 14.5 8.5V11.5C14.5753 12.1217 14.7954 12.7171 15.1428 13.2381C15.4902 13.7592 15.9551 14.1914 16.5 14.5H0.5C1.04494 14.1914 1.50981 13.7592 1.85719 13.2381C2.20457 12.7171 2.42474 12.1217 2.5 11.5V8.5C2.55956 7.23107 2.9633 6.00227 3.66795 4.9453C4.3726 3.88833 5.35159 3.04303 6.5 2.5Z"
              stroke="black"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <span className="badge">3</span>
        </button>

        {/* Avatar + dropdown */}
        <div className="avatar-wrapper" ref={dropdownRef}>
          <div
            className="avatar"
            onClick={() => setDropdownOpen((prev) => !prev)}
            style={{ cursor: "pointer", userSelect: "none" }}
            title={name}
            role="button"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            {name.charAt(0).toUpperCase()}
          </div>

          {dropdownOpen && (
            <div className="avatar-dropdown">
              <div className="avatar-dropdown-header">
                <div className="avatar-dropdown-avatar">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="avatar-dropdown-name">{name}</div>
                  {role && <div className="avatar-dropdown-role">{role}</div>}
                </div>
              </div>
              <div className="avatar-dropdown-divider" />
              <button
                className="avatar-dropdown-item avatar-dropdown-logout"
                onClick={handleLogout}
              >
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
