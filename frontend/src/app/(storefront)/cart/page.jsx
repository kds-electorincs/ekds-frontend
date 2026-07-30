"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, ChevronRight, ShoppingCart, Info } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-gray-200 rounded-sm p-12 flex flex-col items-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your BOM / Cart is empty</h1>
          <p className="text-gray-500 mb-8 max-w-md">You haven't added any components to your order yet. Start browsing our catalog to build your list.</p>
          <Link href="/products" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-sm transition-colors">
            Start Sourcing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({cartItems.length} items)</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Cart Items */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Part Details</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center w-32">Customer Ref</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center w-32">Quantity</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right w-24">Unit Price</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right w-24">Ext Price</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 group">
                    <td className="px-4 py-4 align-top">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-white border border-gray-200 p-1 flex-shrink-0 flex items-center justify-center">
                          <img src={item.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=500'} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex flex-col">
                          <Link href={`/product/${item.id}`} className="font-bold text-blue-600 hover:underline">{item.name}</Link>
                          <span className="text-xs text-gray-500">MFR: {item.manufacturer || 'Generic'}</span>
                          <span className="text-xs text-gray-500">Pack: {item.pkg || 'Reel'}</span>
                          {/* NCNR Warning for enterprise workflow */}
                          <div className="flex items-center gap-1 mt-2 text-[10px] uppercase font-bold text-orange-600 bg-orange-50 inline-block px-1.5 py-0.5 border border-orange-200 rounded-sm">
                            <AlertTriangle className="w-3 h-3" /> NCNR
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <input type="text" placeholder="Optional" className="w-full text-xs border border-gray-300 rounded-sm p-1.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)} 
                        className="w-full text-center border border-gray-300 rounded-sm p-1.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-semibold text-gray-900"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-4 align-top text-right text-gray-700 font-medium">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-4 py-4 align-top text-right font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                    <td className="px-4 py-4 align-top text-center">
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Remove item">
                        <Trash2 className="w-5 h-5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-start gap-2 bg-blue-50 border border-blue-200 p-3 rounded-sm text-sm text-blue-800">
            <Info className="w-5 h-5 flex-shrink-0 text-blue-600" />
            <p><strong>Note on NCNR items:</strong> Products marked as NCNR (Non-Cancelable/Non-Returnable) cannot be modified or returned once the order is placed. Please verify quantities before proceeding.</p>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-gray-50 border border-gray-200 p-5 rounded-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Order Summary</h2>
            
            <div className="flex justify-between text-sm mb-3 text-gray-600">
              <span>Subtotal ({cartItems.length} items)</span>
              <span className="font-semibold text-gray-900">{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3 text-gray-600">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-gray-900">Calculated at checkout</span>
            </div>
            <div className="flex justify-between text-sm mb-4 text-gray-600">
              <span>Estimated Tax (5%)</span>
              <span className="font-semibold text-gray-900">{formatPrice(cartTotal * 0.05)}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-extrabold text-red-600">{formatPrice(cartTotal * 1.05)}</span>
              </div>
            </div>

            <button 
              onClick={() => router.push('/checkout')}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-sm transition-colors"
            >
              Secure Checkout <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
              Secure SSL Encrypted Transaction
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
