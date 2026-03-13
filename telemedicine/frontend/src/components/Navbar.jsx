import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const NAV_LINKS = {
  patient: [
    { to: '/patient/dashboard', label: 'Dashboard' },
    { to: '/patient/join-queue', label: 'Join Queue' },
    { to: '/patient/schedule', label: 'Book Appointment' },
  ],
  doctor: [
    { to: '/doctor/dashboard', label: 'Dashboard' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/analytics', label: 'Analytics' },
    { to: '/admin/simulation', label: 'Simulation' },
  ],
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const stored = localStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : null;
  const links = user ? NAV_LINKS[user.role] || [] : [];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          TeleMed Queue
        </Link>
        <button
          className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
        <div className="navbar-links">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="navbar-link"
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          {user ? (
            <>
              <span className="navbar-user">
                {user.name}
              </span>
              <button className="navbar-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="navbar-link" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
