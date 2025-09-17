import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems(prev => {
      // Try to find existing item by _id first, then fallback to id
      const existingItem = prev.find(i => 
        (i._id && i._id === item._id) || (i.id && i.id === item.id)
      );

      if (existingItem) {
        return prev.map(i => 
          (i._id === item._id || i.id === item.id)
            ? {...i, quantity: i.quantity + 1}
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => 
      !(item._id === itemId || item.id === itemId)
    ));
  };

  const updateQuantity = (itemId, change) => {
    setCartItems(prev => prev.map(item => {
      if (item._id === itemId || item.id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;