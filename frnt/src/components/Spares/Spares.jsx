import React, { useState } from 'react';
import './Spares.css';
import enginePart from '../../assets/enginepart.jpg';
import brakePart from '../../assets/brakes.jpeg';
import filterPart from '../../assets/filteroils.jpg';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../Auth/AuthModal';
import { toast } from 'react-toastify';

const Spares = () => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const spares = [
    {
      _id: 'engine_parts_001', 
      image: enginePart,
      name: 'Engine Parts',
      description: 'High-quality engine components for optimal performance',
      price: 19999,
    },
    {
      _id: 'brake_systems_001', 
      image: brakePart,
      name: 'Brake Systems',
      description: 'Premium brake pads and rotors for maximum safety',
      price: 14999,
    },
    {
      _id: 'filters_oil_001', 
      image: filterPart,
      name: 'Filters & Oil',
      description: 'Essential filters and high-grade oil for maintenance',
      price: 4999,
    }
  ];

  const handleAddToCart = (spare) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const spareWithRequiredFields = {
      _id: spare._id,
      id: spare._id, 
      name: spare.name,
      price: parseFloat(spare.price),
      image: spare.image,
      quantity: 1
    };

    addToCart(spareWithRequiredFields);
    toast.success('Item added to cart');
  };

  return (
    <section className="spares-section" id="spares">
      <div className="container">
        <h2>Spare Parts</h2>
        <p className="section-description">
          We offer a wide range of high-quality spare parts for your vehicle
        </p>
        <div className="spares-grid">
          {spares.map((spare) => (
            <div key={spare._id} className="spare-card">
              <div className="spare-image">
                <img src={spare.image} alt={spare.name} />
              </div>
              <div className="spare-info">
                <h3>{spare.name}</h3>
                <p>{spare.description}</p>
                <div className="spare-price">
                  <span>₹{spare.price}</span>
                  <button className="buy-btn" onClick={() => handleAddToCart(spare)}>
                    {user ? 'Add to Cart' : 'Login to Add'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </section>
  );
};

export default Spares;
