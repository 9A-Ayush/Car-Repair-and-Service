import React, { useState, useEffect, useRef } from 'react';
import './Stats.css';
import { FaCar, FaUsers, FaStar, FaMapMarkerAlt } from 'react-icons/fa';

const Stats = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({
    cars: 0,
    customers: 0,
    rating: 0,
    locations: 0
  });
  const statsRef = useRef(null);

  const stats = [
    {
      icon: <FaCar className="stats-icon" />,
      number: 3000,
      label: "Cars Serviced",
      suffix: "+",
      key: "cars"
    },
    {
      icon: <FaUsers className="stats-icon" />,
      number: 2500,
      label: "Happy Customers",
      suffix: "+",
      key: "customers"
    },
    {
      icon: <FaStar className="stats-icon" />,
      number: 4.8,
      label: "Average Rating",
      suffix: "★",
      key: "rating",
      decimals: 1
    },
    {
      icon: <FaMapMarkerAlt className="stats-icon" />,
      number: 10,
      label: "Touch Points in India",
      suffix: "+",
      key: "locations"
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    stats.forEach((stat) => {
      const duration = 2000; // Animation duration in milliseconds
      const steps = 60; // Number of steps in the animation
      const stepDuration = duration / steps;
      let currentStep = 0;

      const increment = () => {
        currentStep++;
        const progress = currentStep / steps;
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        setCounts(prevCounts => ({
          ...prevCounts,
          [stat.key]: stat.decimals
            ? Number((stat.number * easeOutQuart).toFixed(stat.decimals))
            : Math.round(stat.number * easeOutQuart)
        }));

        if (currentStep < steps) {
          setTimeout(increment, stepDuration);
        }
      };

      increment();
    });
  }, [isVisible]);

  const formatNumber = (value) => {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return value.toString();
  };

  return (
    <section className="stats-section" ref={statsRef}>
      <div className="stats-container">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-item ${isVisible ? 'animate' : ''}`}>
            {stat.icon}
            <div className="stat-content">
              <h3 className="stat-number">
                {stat.decimals
                  ? counts[stat.key].toFixed(stat.decimals)
                  : formatNumber(counts[stat.key])}
                <span className="stat-suffix">{stat.suffix}</span>
              </h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
