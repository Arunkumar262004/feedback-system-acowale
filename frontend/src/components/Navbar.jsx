import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="brand">Acowale Feedback</Link>
      <nav className="nav-links">
        <Link to="/">Submit Feedback</Link>
        {isAuthenticated ? (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <button
              className="link-btn"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/admin/login">Admin Login</Link>
        )}
      </nav>
    </header>
  );
}
