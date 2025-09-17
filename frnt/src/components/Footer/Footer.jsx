import React from 'react';
import './Footer.css';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaShoppingCart,
  FaStar,
  FaSignOutAlt,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaSignInAlt,
  FaCalendarAlt,
} from 'react-icons/fa';
import logo from '../../assets/logo.png';

const Footer = ({ onRateClick, onCartClick, onAuthClick, onLogout, isLoggedIn }) => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };                                                        

  const handleQuickLinkClick = (sectionId) => {
    // If we're not on the home page, navigate to home first
    if (window.location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
    } else {
      scrollToSection(sectionId);
    }
  };                                                      

  const goToHome = () => {
    window.location.href = '/';
  };                                                      

  const goToMyAccount = () => {
    navigate('/my-account');
  };                                                          

  const goToMyAppointments = () => {
    // Check if user is logged in before navigating
    if (isLoggedIn) {
      navigate('/my-appointments');
    } else {
      // If not logged in, trigger auth modal
      onAuthClick();
    }
  };              

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Company Info */}
        <div className="footer-section">
          <img src={logo} alt="Logo" className="footer-logo" />
          <p className="company-description">
            Your trusted partner in automotive care. We provide professional car services and
            maintenance to keep your vehicle running at its best.
          </p>                  
          <div className="social-links">
            <a                      
              href="https://www.facebook.com/ShenronDragon7?mibextid=JRoKGi"
              target="_blank"                          
              rel="noopener noreferrer"                          
            >
              <FaFacebookF />                        
            </a>                            
            <a                            
              href="https://www.youtube.com/@Velocityvibes72"
              target="_blank"                        
              rel="noopener noreferrer"                        
            >
              <FaYoutube />                        
            </a>                        
            <a                        
              href="https://www.instagram.com/velocityvibes_72?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"                          
              rel="noopener noreferrer"                            
            >
              <FaInstagram />                            
            </a>                          
            <a href="https://wa.me/+919472548097" target="_blank" rel="noopener noreferrer">
              <FaWhatsapp />                            
            </a>                            
          </div>                            
        </div>                            

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>                                
            <li>                                  
              <button onClick={goToHome} className="footer-link">
                Home
              </button>                              
            </li>                              
            <li>                                
              <button onClick={() => handleQuickLinkClick('about')} className="footer-link">
                About Us
              </button>                        
            </li>                            
            <li>                            
              <button onClick={() => handleQuickLinkClick('services')} className="footer-link">
                Services
              </button>                                
            </li>                                
            <li>                                    
              <button onClick={() => handleQuickLinkClick('spares')} className="footer-link">
                Spare Parts
              </button>                                
            </li>                                  
            <li>                                  
              <button onClick={() => handleQuickLinkClick('book')} className="footer-link">
                Book Service
              </button>                                          
            </li>                                            
            <li>                                          
              <button onClick={() => handleQuickLinkClick('contact')} className="footer-link">
                Contact Us
              </button>                                              
            </li>                                            
            <li>                                          
              <button                                          
                onClick={() => {
                  const chatbot = document.querySelector('.chat-toggle-btn');
                  if (chatbot) chatbot.click();
                }}                            
                className="footer-link"
              >
                Chat with Revvy
              </button>                          
            </li>                        
          </ul>                        
        </div>                              

        {/* User Links */}
        <div className="footer-section">
          <h3>User Menu</h3>
          <ul className="footer-links">
            {isLoggedIn ? (
              <>
                <li>                  
                  <button className="footer-button" onClick={goToMyAccount}>
                    <FaUser />
                    <span>My Account</span>
                  </button>              
                </li>              
                <li>              
                  <button className="footer-button" onClick={goToMyAppointments}>
                    <FaCalendarAlt />          
                    <span>My Appointments</span>
                  </button>        
                </li>        
                <li>        
                  <button className="footer-button" onClick={onCartClick}>
                    <FaShoppingCart />
                    <span>Go to Cart</span>
                  </button>
                </li>                    
                <li>                    
                  <button className="footer-button" onClick={onRateClick}>
                    <FaStar />                    
                    <span>Rate Us</span>
                  </button>                    
                </li>                    
                <li>                    
                  <button className="footer-button" onClick={onLogout}>
                    <FaSignOutAlt />                    
                    <span>Logout</span>
                  </button>                    
                </li>                                          
              </>
            ) : (
              <>
                <li>                                          
                  <button className="footer-button" onClick={onAuthClick}>
                    <FaSignInAlt />                                  
                    <span>Login / Sign Up</span>
                  </button>                                  
                </li>                                  
                <li>                                  
                  <button className="footer-button" onClick={onCartClick}>
                    <FaShoppingCart />                                  
                    <span>View Cart</span>
                  </button>                                  
                </li>                                  
                <li>                                  
                  <button className="footer-button" onClick={onRateClick}>
                    <FaStar />                                      
                    <span>Rate Us</span>
                  </button>                                      
                </li>                                      
              </>
            )}                                      
          </ul>                                                                                                                                
        </div>                                                                                                                                

        {/* Contact Info */}
        <div className="footer-section">
          <h3>Contact Info</h3>
          <div className="contact-info">
            <p>                                                                                                                                              
              <FaPhoneAlt /> <span>+91 9472548097</span>
            </p>                                                                                                                                              
            <p>                                                                                                                                              
              <FaEnvelope /> <span>info@carcare.com</span>
            </p>                                                                                                                                                        
            <p>                                                                                                                                                        
              <FaMapMarkerAlt /> <span>CYBER THANA, Gopalganj, Bihar</span>
            </p>                                                                                                                                                        
            <p>                                                                                                                                                        
              <FaClock /> <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
            </p>                                                                                                                                                        
            </div>                                                                                                                                        
        </div>                                                                                                                                        
      </div>                                                                                                                                        

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} Car Care. All rights reserved.</p>
          <div className="footer-bottom-links"></div>
           <p>                                                                                                              
              <a                                                                                                        
                href="https://www.instagram.com/ayush_ix_xi/?hl=en"
                target="_blank"                                                                                                        
                rel="noopener noreferrer"                                                                                        
                className="footer-link"
              >
                dev.ayush
              </a>                                                                                        
            </p>                                                                                        
         
        </div>                                                                                                                    
      </div>                                                                                                      
    </footer>
  );                                                                                                      
};                                                                                                      

export default Footer;