import React, { useState } from 'react';
import { Filter, ChevronDown, Check, X, ArrowUpDown, Info, ShoppingCart, SlidersHorizontal } from 'lucide-react';

import { productPublicService, productService } from '../../services/apiServices';

const ParametricSearch = () => {
  const [activeFilters, setActiveFilters] = useState([{ id: 'status', value: 'Active' }]);
  const [showFilters, setShowFilters] = useState(true);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsRes = await productPublicService.listProducts();
        setProducts(productsRes?.data || productsRes?.products || productsRes || []);
        
        // Fetch actual filters
        try {
          const [catRes, brandRes] = await Promise.all([
            productService.getCategories(),
            productService.getBrands()
          ]);
          
          setFilters([
            { id: 'category', name: 'Category', options: (catRes?.data || catRes || []).map(c => c.name || c) },
            { id: 'brand', name: 'Manufacturer', options: (brandRes?.data || brandRes || []).map(b => b.name || b) },
            { id: 'status', name: 'Part Status', options: ['Active', 'Obsolete', 'NRND'] },
            { id: 'rohs', name: 'RoHS Status', options: ['Compliant', 'Non-Compliant'] }
          ]);
        } catch (filterErr) {
          console.error("Failed to load filters:", filterErr);
          setFilters([]);
        }
      } catch (err) {
        console.error("Failed to load parametric data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const removeFilter = (filterValue) => {
    setActiveFilters(activeFilters.filter(f => f.value !== filterValue));
  };

  return (
    <div className="flex flex-col w-full bg-white min-h-[600px] border border-gray-200 shadow-sm rounded-sm">
      
      {/* 1. Header & Active Filter Chips */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Parametric Search</h1>
            <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
              {loading ? '...' : products.length} Results
            </span>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 text-sm font-semibold text-gray-700 border border-gray-300 px-3 py-1.5 rounded-sm hover:bg-gray-100"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Active Filters:</span>
            {activeFilters.map((filter, idx) => (
              <div key={idx} className="flex items-center bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-2 py-1 rounded-sm">
                <span>{filter.value}</span>
                <button onClick={() => removeFilter(filter.value)} className="ml-1.5 hover:text-red-900">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button 
              onClick={() => setActiveFilters([])}
              className="text-xs text-blue-600 hover:underline font-medium ml-2"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* 2. Parametric Filter Sidebar */}
        {showFilters && (
          <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto hidden md:block">
            {filters.map((filterGroup) => (
              <div key={filterGroup.id} className="border-b border-gray-100 last:border-0">
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left group">
                  <span className="text-sm font-bold text-gray-800">{filterGroup.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </button>
                <div className="px-3 pb-3 max-h-48 overflow-y-auto custom-scrollbar">
                  {filterGroup.options.map((opt, idx) => (
                    <label key={idx} className="flex items-start gap-2 py-1 cursor-pointer group">
                      <div className="relative flex items-start mt-0.5">
                        <input type="checkbox" className="peer w-4 h-4 border-gray-300 rounded-sm text-red-600 focus:ring-red-500 cursor-pointer" />
                      </div>
                      <span className="text-xs text-gray-600 group-hover:text-gray-900 select-none leading-tight">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. Horizontal Scrolling Data Table */}
        <div className="flex-1 overflow-x-auto bg-white custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-3 border-b border-r border-gray-200 w-10 text-center">
                  <input type="checkbox" className="w-4 h-4 rounded-sm text-red-600 focus:ring-red-500" />
                </th>
                <th className="p-3 border-b border-r border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-200 group">
                  <div className="flex items-center justify-between">Part Number <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" /></div>
                </th>
                <th className="p-3 border-b border-r border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Manufacturer
                </th>
                <th className="p-3 border-b border-r border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider min-w-[200px]">
                  Description
                </th>
                <th className="p-3 border-b border-r border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 group text-right">
                  <div className="flex items-center justify-end gap-1">Stock <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" /></div>
                </th>
                <th className="p-3 border-b border-r border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 group text-right">
                  <div className="flex items-center justify-end gap-1">Price (1+) <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" /></div>
                </th>
                <th className="p-3 border-b border-r border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Package
                </th>
                <th className="p-3 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="8" className="text-center p-4">Loading...</td></tr>
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-red-50/30 transition-colors group">
                  <td className="p-3 border-r border-gray-200 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded-sm text-red-600 focus:ring-red-500 cursor-pointer" />
                  </td>
                  <td className="p-3 border-r border-gray-200">
                    <a href={`/product/${product.id}`} className="text-sm font-bold text-blue-600 hover:underline">{product.mfrPart}</a>
                  </td>
                  <td className="p-3 border-r border-gray-200 text-sm text-gray-600 truncate max-w-[150px]">
                    {product.mfr}
                  </td>
                  <td className="p-3 border-r border-gray-200 text-xs text-gray-600">
                    {product.desc}
                  </td>
                  <td className="p-3 border-r border-gray-200 text-right">
                    {product.stock > 0 ? (
                      <span className="text-sm font-bold text-green-700">{product.stock.toLocaleString()}</span>
                    ) : (
                      <span className="text-xs font-semibold text-red-500">0</span>
                    )}
                  </td>
                  <td className="p-3 border-r border-gray-200 text-right text-sm font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="p-3 border-r border-gray-200 text-xs text-gray-600">
                    {product.pkg}
                  </td>
                  <td className="p-3">
                    <button 
                      disabled={product.stock === 0}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors ${
                        product.stock > 0 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> 
                      {product.stock > 0 ? 'Add' : 'Out'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParametricSearch;
