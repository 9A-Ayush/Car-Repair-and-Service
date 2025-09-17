import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Services.css';
import serviceImg1 from '../../assets/service-1.jpg';
import serviceImg2 from '../../assets/service-2.jpg';
import serviceImg3 from '../../assets/service-3.jpg';
import { FaTimes, FaTools, FaCar, FaCog, FaWrench, FaCheckCircle } from 'react-icons/fa';

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();

  const services = [
    {
      image: serviceImg1,
      title: 'Regular Maintenance',
      description: 'Comprehensive maintenance service to keep your vehicle in perfect condition.',
      details: {
        overview: 'Our regular maintenance service is designed to keep your vehicle running smoothly and prevent potential issues before they become major problems.',
        includes: [
          'Oil and filter change',
          'Brake system inspection',
          'Tire rotation and balancing',
          'Battery check',
          'Fluid level inspection and top-up',
          'Multi-point vehicle inspection'
        ],
        benefits: 'Regular maintenance helps extend your vehicle\'s life, improves fuel efficiency, and maintains its resale value.',
        pricing: 'Starting from ₹2,500'
      }
    },
    {
      image: serviceImg2,
      title: 'Repair Services',
      description: 'Expert repair services for all types of mechanical and electrical issues.',
      details: {
        overview: 'Our expert technicians are equipped to handle all types of repairs, from minor fixes to major overhauls.',
        includes: [
          'Engine diagnostics and repair',
          'Transmission service',
          'Brake system repair',
          'Electrical system repair',
          'Suspension and steering repair',
          'AC service and repair'
        ],
        benefits: 'Professional repairs using genuine parts ensure your vehicle\'s optimal performance and safety.',
        pricing: 'Varies based on repair type'
      }
    },
    {
      image: serviceImg3,
      title: 'Parts Replacement',
      description: 'Quality replacement parts and professional installation services.',
      details: {
        overview: 'We use only genuine or high-quality compatible parts for all replacements to ensure reliability and performance.',
        includes: [
          'Genuine OEM parts',
          'Performance upgrades',
          'Battery replacement',
          'Filter replacement',
          'Brake pad and rotor replacement',
          'Timing belt replacement'
        ],
        benefits: 'Quality parts and expert installation guarantee long-lasting performance and safety.',
        pricing: 'Depends on part and vehicle model'
      }
    },
  ];

  

  return (
    <>
      <section className="services" id="services">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <div className="service-card" key={index}>
                <img src={service.image} alt={service.title} />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <button 
                  className="service-btn"
                  onClick={() => setSelectedService(service)}
                >
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="service-modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="service-modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedService(null)}
            >
              <FaTimes />
            </button>

            <div className="modal-header">
              <img src={selectedService.image} alt={selectedService.title} />
              <h2>{selectedService.title}</h2>
            </div>

            <div className="modal-body">
              {selectedService.details && (
                <>
                  <div className="modal-section">
                    <FaCar className="modal-icon" />
                    <h3>Overview</h3>
                    <p>{selectedService.details.overview}</p>
                  </div>

                  <div className="modal-section">
                    <FaTools className="modal-icon" />
                    <h3>Service Includes</h3>
                    <ul className="service-includes">
                      {selectedService.details.includes.map((item, index) => (
                        <li key={index}>
                          <FaCheckCircle className="check-icon" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="modal-section">
                    <FaCog className="modal-icon" />
                    <h3>Benefits</h3>
                    <p>{selectedService.details.benefits}</p>
                  </div>

                  <div className="modal-section">
                    <FaWrench className="modal-icon" />
                    <h3>Pricing</h3>
                    <p>{selectedService.details.pricing}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Services;
