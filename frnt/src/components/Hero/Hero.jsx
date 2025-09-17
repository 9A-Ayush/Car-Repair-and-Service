import React, { useState, useEffect } from 'react';
import './Hero.css';
import dark_arrow from '../../assets/dark-arrow.png';
import hero1 from '../../assets/carousel-bg-1.jpg';
import hero2 from '../../assets/carousel-bg-2.jpg';

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselData = [
    {
      image: hero1,
      title: 'Expert Auto Service & Repair',
      description:
        'Professional car maintenance and repair services to keep your vehicle running at its best.',
      buttonText: 'Book Service',
      action: 'book',
    },
    {
      image: hero2,
      title: 'Quality Spare Parts',
      description: 'Get genuine spare parts for all major brands at competitive prices.',
      buttonText: 'Shop Now',
      action: 'spares',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide === carouselData.length - 1 ? 0 : prevSlide + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleAction = (action) => {
    const element = document.getElementById(action);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="hero" id="home">
      {carouselData.map((slide, index) => (
        <div
          key={index}
          className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="hero-overlay"></div>
          <div className="hero-text container">
            <h1>{slide.title}</h1>
            <p>{slide.description}</p>
            <button className="btn" onClick={() => handleAction(slide.action)}>
              {slide.buttonText} <img src={dark_arrow} alt="arrow" />
            </button>
          </div>
        </div>
      ))}

      <div className="carousel-indicators">
        {carouselData.map((_, index) => (
          <div
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};
