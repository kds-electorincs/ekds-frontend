import { useRouter } from 'next/navigation';
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Clock, TrendingUp, Package, Tag, Building2, X } from 'lucide-react';


// Clean API fallback without mock data simulation
const fetchSuggestions = async (query) => {
  return { categories: [], manufacturers: [], parts: [] };
};

const SearchAutocomplete = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  // Keyboard shortcut: Press '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search fetch
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions(null);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await fetchSuggestions(query);
        setSuggestions(data);
      } catch (error) {
        console.error("Failed to fetch suggestions");
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      setIsFocused(false);
      router.push(`/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
    }
  };

  const handleSuggestionClick = (path) => {
    setIsFocused(false);
    router.push(path);
  };

  return (
    <div ref={wrapperRef} className="relative flex w-full group">
      <form 
        onSubmit={handleSubmit} 
        className={`flex w-full relative z-20 shadow-sm transition-shadow rounded-sm border bg-white ${
          isFocused ? 'border-red-500 ring-1 ring-red-500 shadow-md' : 'border-gray-300 hover:shadow-md'
        }`}
      >
        {/* Category Dropdown (Desktop only) */}
        <div className="hidden sm:flex relative border-r border-gray-300 bg-gray-50 flex-shrink-0">
          <select 
            className="h-full pl-3 pr-8 py-2.5 text-sm text-gray-700 bg-transparent outline-none appearance-none cursor-pointer focus:ring-0"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Semiconductors">Semiconductors</option>
            <option value="Passives">Passives</option>
            <option value="Connectors">Connectors</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Main Search Input */}
        <div className="relative flex-1 flex items-center">
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search by Part #, Manufacturer, or Keyword... (Press '/')" 
            className="w-full px-4 py-2.5 text-sm text-gray-900 outline-none placeholder-gray-400 bg-transparent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            autoComplete="off"
          />
          {query && (
            <button 
              type="button" 
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="absolute right-3 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <button 
          type="submit" 
          className="bg-red-600 hover:bg-red-700 text-white px-6 transition-colors flex items-center justify-center flex-shrink-0 rounded-r-sm"
        >
          <Search className="w-5 h-5" />
        </button>
      </form>

      {/* Autocomplete Dropdown Panel */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-sm z-10 overflow-hidden flex flex-col md:flex-row">
          
          {/* Default State (No Query) - Recent & Popular */}
          {!query && !suggestions && (
            <div className="flex w-full">
              <div className="flex-1 p-4 border-r border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" /> Recent Searches
                </h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><button onClick={() => setQuery('STM32F103')} className="hover:text-red-600 w-full text-left py-1">STM32F103</button></li>
                  <li><button onClick={() => setQuery('10k resistor')} className="hover:text-red-600 w-full text-left py-1">10k resistor 0805</button></li>
                </ul>
              </div>
              <div className="flex-1 p-4 bg-gray-50">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" /> Popular Categories
                </h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><button onClick={() => handleSuggestionClick('/category/microcontrollers')} className="hover:text-red-600 w-full text-left py-1">Microcontrollers</button></li>
                  <li><button onClick={() => handleSuggestionClick('/category/mlcc')} className="hover:text-red-600 w-full text-left py-1">Ceramic Capacitors (MLCC)</button></li>
                </ul>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="w-full p-6 flex justify-center items-center text-gray-400">
               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mr-2"></div>
               <span className="text-sm">Searching inventory...</span>
            </div>
          )}

          {/* Suggestions State */}
          {!isLoading && suggestions && (
            <div className="flex flex-col w-full max-h-[60vh] overflow-y-auto">
              
              {/* Parts / Products (Primary) */}
              {suggestions.parts?.length > 0 && (
                <div className="p-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">Products</h4>
                  {suggestions.parts.map(part => (
                    <button 
                      key={part.sku} 
                      onClick={() => handleSuggestionClick(`/product/${part.sku}`)}
                      className="w-full text-left px-3 py-2 flex items-start gap-3 hover:bg-gray-50 rounded-sm group transition-colors"
                    >
                      <div className="bg-gray-100 p-1.5 rounded-sm group-hover:bg-red-50 text-gray-500 group-hover:text-red-600 mt-0.5">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{part.sku}</span>
                        <span className="text-xs text-gray-500 truncate">{part.name}</span>
                        {part.inStock ? (
                          <span className="text-[10px] font-bold text-green-600 mt-0.5">IN STOCK</span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 mt-0.5">OUT OF STOCK</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Flex row for secondary suggestions */}
              <div className="flex border-t border-gray-100 bg-gray-50">
                {/* Categories */}
                {suggestions.categories?.length > 0 && (
                  <div className="flex-1 p-2 border-r border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-2">Categories</h4>
                    {suggestions.categories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => handleSuggestionClick(`/category/${cat.id}`)}
                        className="w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-white rounded-sm flex items-center gap-2"
                      >
                        <Tag className="w-3.5 h-3.5 text-gray-400" />
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Manufacturers */}
                {suggestions.manufacturers?.length > 0 && (
                  <div className="flex-1 p-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-2">Manufacturers</h4>
                    {suggestions.manufacturers.map(mfr => (
                      <button 
                        key={mfr.id}
                        onClick={() => handleSuggestionClick(`/manufacturer/${mfr.id}`)}
                        className="w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-white rounded-sm flex items-center gap-2"
                      >
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        {mfr.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* See all results */}
              <div className="p-2 border-t border-gray-200 bg-white">
                <button 
                  onClick={handleSubmit}
                  className="w-full py-2 text-sm text-center text-red-600 font-semibold hover:bg-red-50 rounded-sm transition-colors"
                >
                  See all results for "{query}"
                </button>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
