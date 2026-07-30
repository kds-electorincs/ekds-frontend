import React, { createContext, useContext, useState, useEffect } from 'react';
import notification from '../utils/notification';

const CartContext = createContext();

// Sample data for testing checkout flow
const SAMPLE_CART_DATA = [
  {
    id: 'sample-1',
    name: 'Industrial Grade Multimeter Pro',
    price: 149.99,
    image: 'https://placehold.co/200x200?text=Multimeter',
    quantity: 1,
    brand: 'TechMeasure',
    category: 'Test Equipment',
    stock: 50
  },
  {
    id: 'sample-2',
    name: 'Arduino Uno R3 Compatible Board',
    price: 24.50,
    image: 'https://placehold.co/200x200?text=Arduino',
    quantity: 2,
    brand: 'MakerTech',
    category: 'Microcontrollers',
    stock: 120
  }
];

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = sessionStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      } catch (error) {
        console.error('Failed to parse cart from local storage', error);
      }
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, openDrawer = true) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      notification.success(`Updated ${product.name} quantity in cart`);
      setCartItems(prev => prev.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      notification.success(`Added ${product.name} to cart`);
      setCartItems(prev => [...prev, { ...product, quantity }]);
    }
    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    notification.info('Item removed from cart');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    notification.info('Cart cleared');
  };

  const toggleCartDrawer = () => {
    setIsCartOpen(prev => !prev);
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartItemCount,
      isCartOpen,
      toggleCartDrawer,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
