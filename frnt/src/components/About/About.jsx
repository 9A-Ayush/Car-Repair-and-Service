import React, { useState } from 'react';
import './About.css';
import aboutImage from '../../assets/about.jpg';
import { FaTimes, FaTools, FaCar, FaUsers, FaAward } from 'react-icons/fa';

const About = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="about" id="about">
        <div className="container">
          <div className="about-content">
            <div className="about-image">
              <img src={aboutImage} alt="About Us" />
            </div>
            <div className="about-text">
              <h2 className="section-title">About Us</h2>
              <p>
                Welcome to our premier auto service center, where excellence meets expertise. With
                over 15 years of experience in the automotive industry, we pride ourselves on
                delivering top-quality service and customer satisfaction.
              </p>
              <div className="about-features">
                <div className="feature">
                  <h3>Expert Team</h3>
                  <p>Certified mechanics with years of experience</p>
                </div>
                <div className="feature">
                  <h3>Quality Service</h3>
                  <p>State-of-the-art equipment and genuine parts</p>
                </div>
                <div className="feature">
                  <h3>Customer First</h3>
                  <p>Dedicated to exceeding your expectations</p>
                </div>
              </div>
              <button className="about-btn" onClick={() => setShowModal(true)}>Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <FaTimes />
            </button>
            
            <h2>About Our Auto Service Center</h2>
            
            <div className="modal-sections">
              <div className="modal-section">
                <FaTools className="modal-icon" />
                <h3>Our Services</h3>
                <p>We offer comprehensive auto repair and maintenance services including engine diagnostics, brake service, oil changes, transmission repair, and more. Our state-of-the-art facility is equipped with the latest technology to handle all your vehicle needs.</p>
              </div>

              <div className="modal-section">
                <FaUsers className="modal-icon" />
                <h3>Expert Team</h3>
                <p>Our team consists of ASE-certified mechanics with decades of combined experience. We continuously train our staff to stay updated with the latest automotive technologies and repair techniques.</p>
              </div>

              <div className="modal-section">
                <FaCar className="modal-icon" />
                <h3>Vehicle Expertise</h3>
                <p>We service all makes and models, from domestic to luxury imports. Our specialized equipment and expertise ensure your vehicle receives the best possible care, regardless of its make or model.</p>
              </div>

              <div className="modal-section">
                <FaAward className="modal-icon" />
                <h3>Quality Guarantee</h3>
                <p>We stand behind our work with comprehensive warranties on parts and labor. Our commitment to quality ensures you receive the best value for your investment in vehicle maintenance and repair.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default About;
