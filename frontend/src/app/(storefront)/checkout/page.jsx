"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, CheckCircle2, ShieldCheck, MapPin, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import notification from '../../utils/notification';

export default function CheckoutPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartItems, router]);

  if (cartItems.length === 0) return null;

  const totalWithTax = cartTotal * 1.05;

  const handleRazorpayPayment = () => {
    setIsProcessing(true);
    
    // Simulate Razorpay Gateway Integration
    setTimeout(() => {
      // Create a mock Razorpay options object
      const options = {
        key: 'rzp_test_mock_key',
        amount: Math.round(totalWithTax * 100), // amount in paisa
        currency: 'INR',
        name: 'KDS Archana Electronics',
        description: 'B2B Components Purchase',
        handler: function (response) {
          // Success callback
          notification.success(`Payment successful! Payment ID: ${response.razorpay_payment_id || 'MOCK_ID_84729'}`);
          clearCart();
          router.push('/checkout/success');
        },
        prefill: {
          name: user?.name || 'Guest User',
          email: user?.email || 'guest@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#DC2626' // Tailwind red-600
        }
      };

      // In a real implementation, we would call:
      // const rzp = new window.Razorpay(options);
      // rzp.open();
      
      // Since window.Razorpay isn't loaded in this mock, we manually trigger the success handler
      options.handler({ razorpay_payment_id: 'pay_' + Math.random().toString(36).substring(7) });
      
    }, 1500); // Simulate network latency to payment gateway
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Checkout Steps Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <div className="flex items-center gap-2 text-sm">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-gray-700">SSL Secure Payment</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Checkout Forms */}
        <div className="flex-1">
          
          {/* Step 1: Shipping */}
          <div className={`border border-gray-200 rounded-sm bg-white mb-4 overflow-hidden transition-all ${activeStep === 1 ? 'ring-2 ring-red-500 ring-opacity-50' : 'opacity-70'}`}>
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer" onClick={() => setActiveStep(1)}>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${activeStep >= 1 ? 'bg-red-600' : 'bg-gray-400'}`}>1</div>
                <h2 className="text-lg font-bold text-gray-900">Shipping Information</h2>
              </div>
              {activeStep > 1 && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            </div>
            
            {activeStep === 1 && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Company / First Name</label>
                    <input type="text" className="w-full border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500" placeholder="KDS Electronics" defaultValue={user?.name || ''} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Last Name</label>
                    <input type="text" className="w-full border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500" placeholder="Doe" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Street Address</label>
                    <input type="text" className="w-full border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500" placeholder="123 Industrial Park Rd." />
                  </div>
                </div>
                <button onClick={() => setActiveStep(2)} className="bg-gray-900 hover:bg-black text-white font-bold py-2 px-6 rounded-sm transition-colors">
                  Continue to Payment
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Payment (Razorpay) */}
          <div className={`border border-gray-200 rounded-sm bg-white overflow-hidden transition-all ${activeStep === 2 ? 'ring-2 ring-red-500 ring-opacity-50' : 'opacity-70'}`}>
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${activeStep === 2 ? 'bg-red-600' : 'bg-gray-400'}`}>2</div>
              <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
            </div>
            
            {activeStep === 2 && (
              <div className="p-6">
                <div className="border border-blue-200 bg-blue-50 p-4 rounded-sm flex gap-4 mb-6 cursor-pointer border-l-4 border-l-blue-600">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-blue-900">Razorpay Secure Gateway</h3>
                    <p className="text-xs text-blue-800 mt-1">Pay via Credit Card, Debit Card, Netbanking, UPI, or Wallets.</p>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mb-6">By clicking "Pay Now", you will be securely redirected to Razorpay to complete your purchase. Once completed, you will return here to view your order receipt.</p>
                
                <button 
                  onClick={handleRazorpayPayment} 
                  disabled={isProcessing}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-sm transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing with Razorpay...
                    </>
                  ) : (
                    <>Pay {formatPrice(totalWithTax)} Now</>
                  )}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-sm p-5 sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">In Your Cart</h2>
            
            <div className="max-h-64 overflow-y-auto custom-scrollbar pr-2 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm mb-3">
                  <div className="flex flex-col max-w-[200px]">
                    <span className="font-semibold text-gray-800 truncate">{item.name}</span>
                    <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-sm mb-2 text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2 text-gray-600">
                <span>Tax (5%)</span>
                <span className="font-semibold">{formatPrice(cartTotal * 0.05)}</span>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-xl font-extrabold text-red-600">{formatPrice(totalWithTax)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
