"use client";

import React from 'react';
import Link from 'next/link';
import { CheckCircle, FileText, Package, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
  // In a real app, you would fetch order details from the URL params or context
  const mockOrderId = `ORD-${Math.floor(Math.random() * 1000000)}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white border border-gray-200 rounded-sm p-8 text-center shadow-sm">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-8">Thank you for your purchase. Your payment via Razorpay has been processed.</p>
        
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm inline-block min-w-[300px] mb-8">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Order Reference Number</p>
          <p className="text-2xl font-black text-gray-900 font-mono tracking-widest">{mockOrderId}</p>
        </div>

        <p className="text-sm text-gray-600 mb-10 max-w-lg mx-auto">
          We have sent an order confirmation email to your registered email address with the invoice and shipping timeline details.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/user/dashboard" className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-sm transition-colors">
            <Package className="w-4 h-4" /> View Order History
          </Link>
          <Link href="/products" className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-sm transition-colors">
            Continue Sourcing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
