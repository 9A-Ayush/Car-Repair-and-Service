import React, { useState, useEffect } from 'react';
import './Navbar.css';
import logo from '../../assets/logo.png';
import {
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaHome,
  FaInfoCircle,
  FaPhone,
  FaTools,
  FaCalendarCheck,
  FaStar,
  FaSignOutAlt,
  FaUserCircle,
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ onRateClick, onCartClick, onAuthClick, isLoggedIn, onLogout, user }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  // Listen for custom event to open auth modal
  useEffect(() => {
    const handleOpenAuthModal = () => {
      onAuthClick();
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal);
    return () => window.removeEventListener('openAuthModal', handleOpenAuthModal);
  }, [onAuthClick]);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    
    // Check if we're not on the home page
    if (window.location.pathname !== '/') {
      // Navigate to home page first, then scroll after page loads
      navigate('/');
      // Use setTimeout to wait for page to load before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // We're already on home page, just scroll
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    setIsMobileMenuOpen(false);
  };

  const handleAuthButtonClick = () => {
    if (isLoggedIn) {
      navigate('/my-account');
    } else {
      onAuthClick();
    }
    setIsMobileMenuOpen(false);
  };

  const handleRateClick = () => {
    onRateClick();
    setIsMobileMenuOpen(false);
  };

  const handleCartClick = () => {
    onCartClick();
    setIsMobileMenuOpen(false);
  };

  const handleHomeClick = () => {
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-brand">
            <Link to="/" onClick={handleHomeClick}>
              <img src={logo} alt="Logo" className="navbar-logo" />
            </Link>
          </div>

          <div className={`navbar-right ${isMobileMenuOpen ? 'active' : ''}`}>
            <ul className="navbar-links">
              <li className="nav-item">
                <Link to="/" onClick={handleHomeClick}>
                  <FaHome className="nav-icon" />
                  <span>Home</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/" onClick={(e) => handleNavClick(e, 'about')}>
                  <FaInfoCircle className="nav-icon" />
                  <span>About</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/" onClick={(e) => handleNavClick(e, 'services')}>
                  <FaTools className="nav-icon" />
                  <span>Services</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/" onClick={(e) => handleNavClick(e, 'spares')}>
                  <FaTools className="nav-icon" />
                  <span>Spares</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/" onClick={(e) => handleNavClick(e, 'contact')}>
                  <FaPhone className="nav-icon" />
                  <span>Contact</span>
                </Link>
              </li>
            </ul>

            <div className="navbar-actions">
              <button className="action-btn rate-btn" onClick={handleRateClick}>
                <FaStar className="action-icon" />
                <span className="action-label">Rate Us</span>
              </button>

              <button className="action-btn book-btn" onClick={(e) => handleNavClick(e, 'book')}>
                <FaCalendarCheck className="action-icon" />
                <span className="action-label">Book Now</span>
              </button>

              <div className="nav-buttons">
                {isLoggedIn ? (
                  <>
                    <button
                      className="auth-btn"
                      onClick={() => navigate('/my-account')}
                      title={user?.username || 'My Account'}
                    >
                      <FaUser className="action-icon" />
                      {user?.username && <span className="user-name-display">{user.username}</span>}
                    </button>
                    <button className="auth-btn" onClick={onLogout} title="Logout">
                      <FaSignOutAlt className="action-icon" />
                    </button>
                  </>
                ) : (
                  <button
                    className="auth-btn"
                    onClick={handleAuthButtonClick}
                    title="Login/Register"
                  >
                    <FaUser className="action-icon" />
                  </button>
                )}
                <button className="cart-btn" onClick={handleCartClick}>
                  <FaShoppingCart className="action-icon" />
                  {cartItems.length > 0 && (
                    <span className="cart-count">
                      {cartItems.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
