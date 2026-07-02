import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/admin/login');
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isFeedbackPage = pathname === '/feedback' || pathname === '/';
  const isAdminPage = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';

  if (isFeedbackPage || isLoginPage) {
    return null;
  }

  // Get user initial for avatar (e.g. "A" for admin@acowale.com)
  const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'A';

  return (
    <header className="navbar" style={{ justifyContent: 'flex-end' }}>
      <nav className="navbar-links" style={{ gap: 'var(--space-4)' }}>
        {isAdminPage && isAuthenticated && (
          <>
            {/* Profile Dropdown Container */}
            <div className="profile-dropdown-container" ref={dropdownRef}>
              <button
                className="profile-trigger"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                title={user?.email || 'Admin Settings'}
              >
                <div className="profile-avatar">
                  {initial}
                </div>
              </button>

              {dropdownOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <span className="profile-dropdown-role">{user?.role || 'Administrator'}</span>
                    <span className="profile-dropdown-email">{user?.email || 'admin@acowale.com'}</span>
                  </div>
                  <button className="profile-dropdown-item" onClick={handleLogout}>
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
