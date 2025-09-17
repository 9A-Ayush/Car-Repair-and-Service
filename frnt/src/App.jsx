import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import { Hero } from './components/Hero/Hero';
import Services from './components/Services/Services';
import About from './components/About/About';
import Spares from './components/Spares/Spares';
import BookingForm from './components/BookingForm/BookingForm';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import Contact from './components/Contact/Contact';
import { useAuth } from './context/AuthContext';
import Rating from './components/Rating/Rating';
import Cart from './components/Cart/Cart';
import AuthModal from './components/Auth/AuthModal';
import ResetPassword from './components/Auth/ResetPassword';
import MyAccount from './components/MyAccount/MyAccount';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Chatbot from './components/Chatbot/Chatbot';
import Stats from './components/Stats/Stats';
import { Toaster } from 'react-hot-toast';

// Import the new component
import MyAppointments from './pages/MyAppointments/MyAppointments';

const HomePage = () => (
  <>
    <Hero />
    <Stats />
    <About />
    <Services />
    <Spares />
    <BookingForm />
    <Contact />
  </>
);

const AppContent = () => {
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we need to open the auth modal
  useEffect(() => {
    // Check if there's a redirect path in sessionStorage and user is not authenticated
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath && !isAuthenticated) {
      setIsAuthOpen(true);
    }
  }, [isAuthenticated]);

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      // Check if there's a redirect path in sessionStorage
      const redirectPath = sessionStorage.getItem('redirectPath');
      if (redirectPath) {
        // Clear the redirect path and navigate to it
        sessionStorage.removeItem('redirectPath');
        navigate(redirectPath);
      }
    }
  }, [isAuthenticated, navigate]);

  const handleRateClick = () => {
    if (isAuthenticated) {
      setIsRatingOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleCartClick = () => {
    if (isAuthenticated) {
      setIsCartOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleAuthClick = () => {
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  // Handle successful authentication
  const handleAuthSuccess = () => {
    setIsAuthOpen(false);
  };

  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: '#ff4b4b',
            },
          },
        }}
      />
      <Navbar 
        onRateClick={handleRateClick}
        onCartClick={handleCartClick}
        onAuthClick={handleAuthClick}
        isLoggedIn={isAuthenticated}
        onLogout={handleLogout}
        user={user}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
        <Route path="/my-appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
      <Footer 
        onRateClick={handleRateClick}
        onCartClick={handleCartClick}
        onAuthClick={handleAuthClick}
        onLogout={handleLogout}
        isLoggedIn={isAuthenticated}
      />
      <ScrollToTop />
      <Rating 
        isOpen={isRatingOpen} 
        onClose={() => setIsRatingOpen(false)} 
        isAuthenticated={isAuthenticated}
        onAuthRequired={() => setIsAuthOpen(true)}
      />
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        isAuthenticated={isAuthenticated}
        onAuthRequired={() => setIsAuthOpen(true)}
      />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
      <Chatbot />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;