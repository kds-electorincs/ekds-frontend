"use client";

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart();
  const isDisabled = product.stock === 0;

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isDisabled) {
      addToCart(product, 1);
    }
  };

  return (
    <button
      disabled={isDisabled}
      onClick={handleClick}
      aria-label="Add to cart"
      className={`
        flex items-center justify-center w-10 h-10 rounded-lg transition-all
        ${isDisabled 
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95'
        }
      `}
    >
      <ShoppingCart size={20} />
    </button>
  );
}
