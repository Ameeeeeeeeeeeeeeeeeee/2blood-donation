import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Welcome.css';

const Welcome = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleLogout = () => {
    logout();
  };
  
  const welcomeMessages = [
    'Welcome',
    'Bienvenue',
    'Bienvenido',
    'أهلاً وسهلاً',
    'Karibu',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % welcomeMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="welcome-container">
      <nav className="welcome-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <Link to="/">Woliso Blood Donation</Link>
          </div>
          <div className="nav-links">
            {isAuthenticated ? (
              <>
                <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'}>Dashboard</Link>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register" className="signup-btn">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="hero-section">
        <div className="hero-content-wrapper">
          <div className="hero-text-section">
            <div className="welcome-title-container">
              <h1 className="welcome-title">Welcome to Woliso Blood Donation</h1>
              <div className="animated-welcome">
                <span className="welcome-slide">{welcomeMessages[currentSlide]}</span>
              </div>
            </div>
            <p className="hero-tagline">Every blood donor is a lifesaver</p>
            <p className="hero-subtitle">
              Your single donation can save up to three lives. Join us in making a difference today.
            </p>
            {!isAuthenticated && (
              <div className="hero-buttons">
                <Link to="/register" className="btn-primary">Start Donating</Link>
                <Link to="/login" className="btn-secondary">Login</Link>
              </div>
            )}
          </div>
          <div className="hero-image-section">
            <div className="blood-donation-image">
              <img 
                src="/images/blood-donation-hero.jpg" 
                alt="Blood donor smiling while donating blood"
                className="hero-photo"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="intro-section">
        <div className="intro-container">
          <h2>Why Donate Blood?</h2>
          <div className="intro-grid">
            <div className="intro-card">
              <div className="intro-icon">❤️</div>
              <h3>Save Lives</h3>
              <p>Every donation can help save up to three lives. Your contribution matters.</p>
            </div>
            <div className="intro-card">
              <div className="intro-icon">🏥</div>
              <h3>Support Hospitals</h3>
              <p>Help hospitals maintain adequate blood supplies for patients in need.</p>
            </div>
            <div className="intro-card">
              <div className="intro-icon">💪</div>
              <h3>Health Benefits</h3>
              <p>Regular blood donation can help reduce the risk of heart disease and more.</p>
            </div>
            <div className="intro-card">
              <div className="intro-icon">🤝</div>
              <h3>Community Impact</h3>
              <p>Be part of a community that cares and makes a real difference.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Section */}
      <div className="rewards-section">
        <div className="rewards-container">
          <h2>🎁 Donor Rewards Program</h2>
          <p className="rewards-subtitle">
            We appreciate every drop! The more you give, the more you earn.
          </p>
          <div className="rewards-grid">
            <div className="reward-card bronze">
              <div className="reward-badge">🥉</div>
              <h3>Bronze Donor</h3>
              <div className="reward-requirement">1-2 Donations</div>
              <ul className="reward-benefits">
                <li>Certificate of Appreciation</li>
                <li>Thank You Card</li>
                <li>Donor ID Card</li>
              </ul>
            </div>
            <div className="reward-card silver">
              <div className="reward-badge">🥈</div>
              <h3>Silver Donor</h3>
              <div className="reward-requirement">3-5 Donations</div>
              <ul className="reward-benefits">
                <li>All Bronze Benefits</li>
                <li>Priority Scheduling</li>
                <li>Free Health Checkup</li>
                <li>Exclusive T-Shirt</li>
              </ul>
            </div>
            <div className="reward-card gold">
              <div className="reward-badge">🥇</div>
              <h3>Gold Donor</h3>
              <div className="reward-requirement">6-10 Donations</div>
              <ul className="reward-benefits">
                <li>All Silver Benefits</li>
                <li>VIP Donor Lounge Access</li>
                <li>Gold Donor Pin</li>
                <li>Annual Recognition Event</li>
              </ul>
            </div>
            <div className="reward-card platinum">
              <div className="reward-badge">💎</div>
              <h3>Platinum Hero</h3>
              <div className="reward-requirement">10+ Donations</div>
              <ul className="reward-benefits">
                <li>All Gold Benefits</li>
                <li>Lifetime Donor Trophy</li>
                <li>Featured on Wall of Fame</li>
                <li>Free Medical Consultation</li>
                <li>Special Gift Hamper</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="how-it-works">
        <div className="how-container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your account and complete your profile with health information.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Schedule</h3>
              <p>Choose a convenient date and location for your donation.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Donate</h3>
              <p>Visit our station or we can come to you - your choice!</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Track Impact</h3>
              <p>See how many lives you've saved through your donations.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="stats-section">
        <div className="stats-container">
          <h2>Our Impact in Woliso</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Registered Donors</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1,200+</div>
              <div className="stat-label">Lives Saved</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4</div>
              <div className="stat-label">Partner Hospitals</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">3,000+</div>
              <div className="stat-label">Units Collected</div>
            </div>
          </div>
        </div>
      </div>

      <footer className="welcome-footer">
        <div className="footer-content">
          <div className="footer-info">
            <h3>Woliso Blood Donation Center</h3>
            <p>Saving lives, one donation at a time.</p>
            <p>📍 Woliso, Ethiopia</p>
            <p>📞 +251 XXX XXX XXX</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <Link to="/register">Become a Donor</Link>
            <Link to="/login">Login</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Woliso Blood Donation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
