import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/dashboard">Blood Donation</Link>
        </div>
        <div className="navbar-links">
          {user?.role === 'donor' && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/donate">Donate</Link>
              <Link to="/hospitals">Hospitals</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin">Admin Dashboard</Link>
          )}
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

