import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useAnimation } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime;
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// Blood Drop Animation Component
const BloodDrop = () => (
  <motion.svg
    viewBox="0 0 100 140"
    className="blood-drop-svg"
    initial={{ scale: 0, y: -50 }}
    animate={{ scale: 1, y: 0 }}
    transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
  >
    <motion.path
      d="M50 0 C50 0 0 60 0 90 C0 120 22 140 50 140 C78 140 100 120 100 90 C100 60 50 0 50 0 Z"
      fill="url(#bloodGradient)"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
    <defs>
      <linearGradient id="bloodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff4757" />
        <stop offset="50%" stopColor="#c8102e" />
        <stop offset="100%" stopColor="#8b0a1f" />
      </linearGradient>
    </defs>
    <motion.ellipse
      cx="35"
      cy="85"
      rx="12"
      ry="18"
      fill="rgba(255,255,255,0.3)"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
    />
  </motion.svg>
);

// Heartbeat Animation
const HeartbeatLine = () => (
  <motion.svg
    viewBox="0 0 400 100"
    className="heartbeat-svg"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
  >
    <motion.path
      d="M0 50 L80 50 L100 50 L120 20 L140 80 L160 10 L180 90 L200 50 L220 50 L400 50"
      fill="none"
      stroke="rgba(200,16,46,0.3)"
      strokeWidth="2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
    />
  </motion.svg>
);

const HomePage = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const controls = useAnimation();

  const handleLogout = () => {
    logout();
  };

  // Scroll to section handler
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="homepage">
      {/* Navigation */}
      <motion.nav 
        className="home-nav"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="nav-content">
          <Link to="/" className="nav-brand">
            <motion.div
              className="brand-icon"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🩸
            </motion.div>
            <span>Woliso Blood Donation</span>
          </Link>
          <div className="nav-links">
            <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }} className="nav-link">Home</a>
            <a href="#about-waliso" onClick={(e) => { e.preventDefault(); scrollToSection('about-waliso'); }} className="nav-link">About Us</a>
            <a href="#contact-waliso" onClick={(e) => { e.preventDefault(); scrollToSection('contact-waliso'); }} className="nav-link">Contact Us</a>
          </div>
          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="nav-link">
                  Dashboard
                </Link>
                <motion.button
                  onClick={handleLogout}
                  className="btn-nav-logout"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register" className="btn-nav-signup">Sign Up</Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="hero" className="hero">
        <div className="hero-bg-elements">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
        </div>
        
        <div className="hero-content">
          <motion.div 
            className="hero-text"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span className="hero-badge" variants={fadeInUp}>
              ❤️ Save Lives Today
            </motion.span>
            <motion.h1 className="hero-title" variants={fadeInUp}>
              <span className="title-red">Woliso Blood</span> Donation
            </motion.h1>
            <motion.p className="hero-subtitle" variants={fadeInUp}>
              Your blood can save lives today. Join our network of heroes and make a difference in someone's life.
            </motion.p>
            <motion.p className="hero-tagline" variants={fadeInUp}>
              Saving lives by connecting blood donors instantly
            </motion.p>
            
            {!isAuthenticated && (
              <motion.div className="hero-buttons" variants={fadeInUp}>
                <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register" className="btn-hero-primary">
                    <span>🩸</span> Become a Donor
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className="btn-hero-secondary">
                    <span>🏥</span> Hospital Login
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="blood-drop-container">
              <BloodDrop />
              <motion.div
                className="pulse-ring"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="pulse-ring pulse-ring-2"
                animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </div>
          </motion.div>
        </div>

        <HeartbeatLine />
      </section>

      {/* Why Blood Donation Matters */}
      <section className="why-matters">
        <motion.div 
          className="section-container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div className="section-header" variants={fadeInUp}>
            <span className="section-badge">Why It Matters</span>
            <h2>Every Drop Counts</h2>
            <p>Your donation creates a ripple effect of hope and healing</p>
          </motion.div>

          <div className="features-grid">
            <motion.div 
              className="feature-card"
              variants={scaleIn}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(200,16,46,0.2)" }}
            >
              <div className="feature-icon emergency">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🚨
                </motion.span>
              </div>
              <h3>Emergency Response</h3>
              <p>Instant alerts to nearby donors during critical emergencies. Every second counts when lives are at stake.</p>
            </motion.div>

            <motion.div 
              className="feature-card"
              variants={scaleIn}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(200,16,46,0.2)" }}
            >
              <div className="feature-icon matching">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  📍
                </motion.span>
              </div>
              <h3>Local Donor Matching</h3>
              <p>Smart matching system connects patients with compatible donors in their area for faster response.</p>
            </motion.div>

            <motion.div 
              className="feature-card"
              variants={scaleIn}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(200,16,46,0.2)" }}
            >
              <div className="feature-icon notifications">
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🔔
                </motion.span>
              </div>
              <h3>Fast Notifications</h3>
              <p>Real-time notifications keep you informed about donation requests and your impact on lives saved.</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <motion.div 
          className="section-container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div className="section-header" variants={fadeInUp}>
            <span className="section-badge">Simple Process</span>
            <h2>How It Works</h2>
            <p>Four simple steps to become a life-saving hero</p>
          </motion.div>

          <div className="timeline">
            <motion.div className="timeline-item" variants={slideInLeft}>
              <div className="timeline-number">1</div>
              <div className="timeline-content">
                <div className="timeline-icon">📝</div>
                <h3>Register as Donor</h3>
                <p>Sign up with your details and blood type. It takes less than 2 minutes.</p>
              </div>
            </motion.div>

            <motion.div className="timeline-item" variants={slideInRight}>
              <div className="timeline-number">2</div>
              <div className="timeline-content">
                <div className="timeline-icon">✅</div>
                <h3>Mark Availability</h3>
                <p>Set your availability and preferred donation locations.</p>
              </div>
            </motion.div>

            <motion.div className="timeline-item" variants={slideInLeft}>
              <div className="timeline-number">3</div>
              <div className="timeline-content">
                <div className="timeline-icon">📱</div>
                <h3>Get Emergency Alert</h3>
                <p>Receive notifications when someone nearby needs your blood type.</p>
              </div>
            </motion.div>

            <motion.div className="timeline-item" variants={slideInRight}>
              <div className="timeline-number">4</div>
              <div className="timeline-content">
                <div className="timeline-icon">💖</div>
                <h3>Save a Life</h3>
                <p>Donate blood and become someone's hero. Track your impact over time.</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Impact Section */}
      <section className="impact-section">
        <motion.div 
          className="section-container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div className="section-header light" variants={fadeInUp}>
            <span className="section-badge">Our Impact</span>
            <h2>Together We Save Lives</h2>
            <p>See the difference our community is making</p>
          </motion.div>

          <div className="impact-stats">
            <motion.div className="impact-stat" variants={scaleIn}>
              <div className="stat-icon">❤️</div>
              <div className="stat-number">
                <AnimatedCounter end={12500} duration={2.5} suffix="+" />
              </div>
              <div className="stat-label">Lives Saved</div>
            </motion.div>

            <motion.div className="impact-stat" variants={scaleIn}>
              <div className="stat-icon">🩸</div>
              <div className="stat-number">
                <AnimatedCounter end={8750} duration={2.5} suffix="+" />
              </div>
              <div className="stat-label">Active Donors</div>
            </motion.div>

            <motion.div className="impact-stat" variants={scaleIn}>
              <div className="stat-icon">🏥</div>
              <div className="stat-number">
                <AnimatedCounter end={150} duration={2} suffix="+" />
              </div>
              <div className="stat-label">Hospitals Connected</div>
            </motion.div>

            <motion.div className="impact-stat" variants={scaleIn}>
              <div className="stat-icon">🌍</div>
              <div className="stat-number">
                <AnimatedCounter end={25} duration={1.5} suffix="+" />
              </div>
              <div className="stat-label">Cities Covered</div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <motion.div 
          className="cta-container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <motion.div 
            className="cta-content"
            variants={fadeInUp}
          >
            <motion.div
              className="cta-icon"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💧
            </motion.div>
            <h2>One Drop of Blood Can Save a Life</h2>
            <p>Join thousands of donors who are making a difference every day. Your contribution matters more than you know.</p>
            
            {!isAuthenticated && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/register" className="btn-cta">
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Join as Donor →
                  </motion.span>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* About Woliso Blood Bank Section */}
      <section id="about-waliso" className="about-section">
        <motion.div 
          className="section-container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div className="section-header" variants={fadeInUp}>
            <span className="section-badge">About Us</span>
            <h2>About Woliso Blood Bank</h2>
            <p>Dedicated to saving lives through blood donation</p>
          </motion.div>
          <motion.div className="about-content" variants={fadeInUp}>
            <p>Woliso Blood Bank is a vital regional healthcare facility located in Woliso town, within the South-West Shewa Zone of the Oromia Region, Ethiopia.</p>
            <p>Established in 2013 by the Oromia Regional Health Bureau in partnership with the Federal Ministry of Health, it serves as one of the key hubs for blood collection and distribution in the region.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Contact Woliso Blood Bank Section */}
      <section id="contact-waliso" className="contact-section">
        <motion.div 
          className="section-container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div className="section-header" variants={fadeInUp}>
            <span className="section-badge">Get in Touch</span>
            <h2>Contact Woliso Blood Bank</h2>
            <p>We're here to help you make a difference</p>
          </motion.div>
          <motion.div className="contact-content" variants={fadeInUp}>
            <p>For inquiries, donations, or emergency blood requests, please contact us:</p>
            <div className="contact-details">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <div>
                  <strong>Email:</strong>
                  <a href="mailto:info@wolisobloodbank.org">info@wolisobloodbank.org</a>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div>
                  <strong>Phone:</strong>
                  <a href="tel:+251911234567">+251 911 234 567</a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="home-footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="logo-icon">🩸</span>
                <span className="logo-text">Woliso Blood Donation</span>
              </div>
              <p>Connecting blood donors with those in need. Together, we save lives.</p>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4>Quick Links</h4>
                <Link to="/register">Become a Donor</Link>
                <Link to="/login">Login</Link>
                <Link to="/hospitals">Find Hospitals</Link>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#faq">FAQ</a>
                <a href="#contact-waliso">Contact Us</a>
                <a href="#privacy">Privacy Policy</a>
              </div>
            </div>
          </div>

          <div className="footer-emergency">
            <div className="emergency-badge">
              <span>🚨</span>
              Emergency Blood Needed?
            </div>
            <p>Contact your nearest hospital or call the emergency helpline</p>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 Woliso Blood Donation. All rights reserved. Made with ❤️ for humanity.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default HomePage;


