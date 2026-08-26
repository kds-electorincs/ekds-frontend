"use client";
import React from 'react';
import Link from 'next/link';
import { Cpu, Zap, Radio, Battery, LayoutGrid } from 'lucide-react'; // Placeholder icons

// A helper to map category strings to icons (in a real app, icons might be URLs from the DB)
const getCategoryIcon = (iconName) => {
  switch(iconName?.toLowerCase()) {
    case 'cpu': return <Cpu className="w-8 h-8 text-gray-600 group-hover:text-red-600 transition-colors" />;
    case 'zap': return <Zap className="w-8 h-8 text-gray-600 group-hover:text-red-600 transition-colors" />;
    case 'radio': return <Radio className="w-8 h-8 text-gray-600 group-hover:text-red-600 transition-colors" />;
    case 'battery': return <Battery className="w-8 h-8 text-gray-600 group-hover:text-red-600 transition-colors" />;
    default: return <LayoutGrid className="w-8 h-8 text-gray-600 group-hover:text-red-600 transition-colors" />;
  }
};

const CategoryGrid = ({ title, categories }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="py-6">
      {title && <h2 className="text-xl font-bold text-gray-900 mb-6">{title}</h2>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            to={`/category/${category.id}`}
            className="flex items-start p-4 bg-white border border-gray-200 rounded-sm hover:border-red-500 hover:shadow-md transition-all group"
          >
            <div className="flex-shrink-0 mr-4 bg-gray-50 p-2 rounded-sm group-hover:bg-red-50 transition-colors">
              {getCategoryIcon(category.icon)}
            </div>
            
            <div className="flex flex-col flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-red-600 transition-colors">
                {category.name}
              </h3>
              {/* Product Count - crucial for B2B engineering platforms */}
              <span className="text-xs text-gray-500 mt-1">
                {category.productCount ? category.productCount.toLocaleString() : '0'} Items
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
