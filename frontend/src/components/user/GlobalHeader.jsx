import { useRouter } from 'next/navigation';
"use client";
import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, ChevronDown, Phone, HelpCircle, Globe, X } from 'lucide-react';
import Link from 'next/link';


import SearchAutocomplete from './SearchAutocomplete';

const GlobalHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="w-full font-sans bg-white border-b border-gray-200">
      {/* 1. Top Utility Bar */}
      <div className="bg-gray-100 hidden md:block border-b border-gray-200 text-gray-600 text-xs py-1.5">
        <div className="container mx-auto px-4 flex justify-between items-center max-w-7xl">
          <div className="flex items-center space-x-6">
            <button className="flex items-center hover:text-red-600 transition-colors">
              <Globe className="w-3.5 h-3.5 mr-1" />
              <span>EN / USD / IN</span>
            </button>
            <span className="text-gray-300">|</span>
            <Link to="/support" className="flex items-center hover:text-red-600 transition-colors">
              <HelpCircle className="w-3.5 h-3.5 mr-1" />
              <span>Support Center</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <a href="tel:+911234567890" className="flex items-center hover:text-red-600 transition-colors">
              <Phone className="w-3.5 h-3.5 mr-1" />
              <span>1-800-ELECTRONICS</span>
            </a>
            <span className="text-gray-300">|</span>
            <Link to="/track-order" className="hover:text-red-600 transition-colors">Track Order</Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          
          {/* Mobile Menu Toggle & Logo */}
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex-shrink-0 flex items-center">
              {/* Premium minimal text logo representation */}
              <span className="text-2xl font-black tracking-tight text-red-600">Archana<span className="text-gray-900 font-light">Electronics</span></span>
            </Link>
          </div>

          {/* Core Search Experience (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-3xl">
            <SearchAutocomplete />
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
            {/* Search Toggle Mobile */}
            <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md">
              <Search className="w-6 h-6" />
            </button>

            {/* Auth / Account */}
            <Link to="/login" className="hidden sm:flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-50 rounded-sm transition-colors group">
              <div className="bg-gray-100 p-2 rounded-full group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs text-gray-500 leading-tight">Sign In / Register</span>
                <span className="text-sm font-semibold leading-tight group-hover:text-red-600">My Account</span>
              </div>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-50 rounded-sm transition-colors group relative">
              <div className="bg-gray-100 p-2 rounded-full group-hover:bg-red-50 group-hover:text-red-600 transition-colors relative">
                <ShoppingCart className="w-5 h-5" />
                {/* Cart Badge */}
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  3
                </span>
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs text-gray-500 leading-tight">Cart</span>
                <span className="text-sm font-semibold leading-tight group-hover:text-red-600">$450.00</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Bottom Mega Menu Bar (Desktop) */}
      <nav className="hidden md:block bg-gray-900 text-white">
        <div className="container mx-auto px-4 max-w-7xl flex items-center">
          {/* "All Products" Dropdown Button */}
          <button className="flex items-center bg-red-600 hover:bg-red-700 px-4 py-3 text-sm font-semibold transition-colors space-x-2">
            <Menu className="w-5 h-5" />
            <span>Products</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          <ul className="flex flex-1 items-center space-x-1 pl-4 text-sm font-medium">
            <li>
              <Link to="/manufacturers" className="px-4 py-3 hover:text-red-400 transition-colors inline-block">Manufacturers</Link>
            </li>
            <li>
              <Link to="/new-products" className="px-4 py-3 hover:text-red-400 transition-colors inline-block text-red-400">New Products</Link>
            </li>
            <li>
              <Link to="/tools" className="px-4 py-3 hover:text-red-400 transition-colors inline-block">EDA & Design Tools</Link>
            </li>
            <li>
              <Link to="/resources" className="px-4 py-3 hover:text-red-400 transition-colors inline-block">Resources</Link>
            </li>
            <li>
              <Link to="/bom" className="px-4 py-3 hover:text-red-400 transition-colors inline-block">BOM Manager</Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <span className="text-xl font-black tracking-tight text-red-600">Archana</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-4">
              <div className="space-y-1 mb-6">
                <Link to="/login" className="flex items-center gap-3 p-3 rounded-md bg-gray-50 hover:bg-red-50 text-gray-800 transition-colors border border-gray-100">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold">Sign In / Register</span>
                </Link>
              </div>

              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-2">Navigation</div>
              <ul className="space-y-1 text-base text-gray-700 font-medium">
                <li><Link to="/products" className="block px-3 py-2.5 rounded-md hover:bg-gray-50">All Products</Link></li>
                <li><Link to="/manufacturers" className="block px-3 py-2.5 rounded-md hover:bg-gray-50">Manufacturers</Link></li>
                <li><Link to="/new" className="block px-3 py-2.5 rounded-md hover:bg-gray-50 text-red-600">New Products</Link></li>
                <li><Link to="/tools" className="block px-3 py-2.5 rounded-md hover:bg-gray-50">Design Tools</Link></li>
                <li><Link to="/bom" className="block px-3 py-2.5 rounded-md hover:bg-gray-50">BOM Manager</Link></li>
                <li><Link to="/support" className="block px-3 py-2.5 rounded-md hover:bg-gray-50">Support Center</Link></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default GlobalHeader;
