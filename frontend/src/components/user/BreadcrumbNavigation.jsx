"use client";
import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const BreadcrumbNavigation = ({ paths }) => {
  if (!paths || paths.length === 0) return null;

  return (
    <nav className="flex items-center text-sm text-gray-500 py-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <Link 
        to="/" 
        className="flex items-center hover:text-red-600 transition-colors"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
            {isLast || !path.link ? (
              <span className="font-semibold text-gray-900" aria-current="page">
                {path.label}
              </span>
            ) : (
              <Link 
                to={path.link} 
                className="hover:text-red-600 transition-colors truncate max-w-[200px]"
              >
                {path.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default BreadcrumbNavigation;
