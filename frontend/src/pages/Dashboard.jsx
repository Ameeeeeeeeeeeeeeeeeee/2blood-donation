import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { donorAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { isDonor } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // NEW: Leaderboard state (additive feature)
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  useEffect(() => {
    if (!isDonor) {
      navigate('/');
      return;
    }

    fetchDashboardData();
    fetchLeaderboard(); // NEW: Fetch leaderboard data
  }, [isDonor, navigate]);

  useEffect(() => {
    // Check if profile is complete, redirect if not
    if (dashboardData?.donor) {
      const donor = dashboardData.donor;
      if (!donor.age || !donor.location || !donor.blood_type) {
        navigate('/complete-profile');
        return;
      }
    }
  }, [dashboardData, navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await donorAPI.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch leaderboard data (additive feature)
  const fetchLeaderboard = async () => {
    try {
      const response = await donorAPI.getLeaderboard(5); // Top 5 donors
      setLeaderboard(response.data.leaderboard || []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      // Don't set error - leaderboard is optional feature
    } finally {
      setLeaderboardLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="dashboard-container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="dashboard-container">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  const { donor, pending_schedules } = dashboardData || {};

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {donor?.user?.first_name || 'Donor'}!</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🩸</div>
            <div className="stat-content">
              <h3>{donor?.total_donations || 0}</h3>
              <p>Total Donations</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-content">
              <h3>{donor?.lives_saved || 0}</h3>
              <p>Lives Saved</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{pending_schedules || 0}</h3>
              <p>Pending Schedules</p>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Your Profile</h2>
          <div className="profile-card">
            <div className="profile-image-container">
              {donor?.profile_image_url ? (
                <img
                  src={donor.profile_image_url}
                  alt="Profile"
                  className="profile-image"
                />
              ) : (
                <div className="profile-placeholder">
                  {donor?.user?.first_name?.[0] || 'D'}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h3>
                {donor?.user?.first_name} {donor?.user?.last_name}
              </h3>
              <p className="profile-email">{donor?.user?.email}</p>
              <div className="profile-details">
                <div className="detail-item">
                  <span className="detail-label">Age:</span>
                  <span className="detail-value">{donor?.age || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{donor?.phone || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">
                    {donor?.location || 'N/A'}
                  </span>
                </div>
                {donor?.blood_type && (
                  <div className="detail-item">
                    <span className="detail-label">Blood Type:</span>
                    <span className="detail-value blood-type-badge">{donor.blood_type}</span>
                  </div>
                )}
                {donor?.health_info && (
                  <div className="detail-item">
                    <span className="detail-label">Health Info:</span>
                    <span className="detail-value">{donor.health_info}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button
              className="action-btn"
              onClick={() => navigate('/donate')}
            >
              Schedule Donation
            </button>
            <button
              className="action-btn"
              onClick={() => navigate('/hospitals')}
            >
              View Hospitals
            </button>
            <button
              className="action-btn"
              onClick={() => navigate('/profile')}
            >
              Update Profile
            </button>
          </div>
        </div>

        {/* NEW: Top Leader Donors Section (additive feature) */}
        <div className="leaderboard-section">
          <h2>Top Leader Donors</h2>
          <div className="leaderboard-card">
            {leaderboardLoading ? (
              <div className="leaderboard-loading">Loading leaderboard...</div>
            ) : leaderboard.length === 0 ? (
              <div className="leaderboard-empty">
                <p>🏆 No donations yet. Be the first leader!</p>
              </div>
            ) : (
              <div className="leaderboard-list">
                {leaderboard.map((donor) => (
                  <div key={donor.id} className="leaderboard-item">
                    <div className="leaderboard-rank">
                      {donor.rank === 1 && <span className="rank-medal">🥇</span>}
                      {donor.rank === 2 && <span className="rank-medal">🥈</span>}
                      {donor.rank === 3 && <span className="rank-medal">🥉</span>}
                      {donor.rank > 3 && <span className="rank-number">#{donor.rank}</span>}
                    </div>
                    <div className="leaderboard-info">
                      <span className="leaderboard-name">{donor.name}</span>
                      <span className="leaderboard-blood-type">{donor.blood_type}</span>
                    </div>
                    <div className="leaderboard-stats">
                      <span className="donation-count">{donor.total_donations}</span>
                      <span className="donation-label">donations</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
