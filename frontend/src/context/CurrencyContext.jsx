import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return sessionStorage.getItem('currency') || 'USD';
  });
  const [rates, setRates] = useState({
    USD: 1.0,
    INR: 83.5,
    EUR: 0.92,
    GBP: 0.78
  });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Fetching live USD exchange rates from a completely free, open CORS exchange rate API
        const response = await axios.get('https://open.er-api.com/v6/latest/USD');
        if (response.data && response.data.rates) {
          setRates(response.data.rates);
          console.log('Live currency rates fetched successfully:', response.data.rates);
        }
      } catch (error) {
        console.warn('Failed to fetch live exchange rates from open.er-api.com, using fallback rates:', error.message);
      }
    };
    
    fetchRates();
  }, []);

  useEffect(() => {
    sessionStorage.setItem('currency', currency);
  }, [currency]);

  const formatPrice = (priceVal) => {
    if (priceVal === undefined || priceVal === null) return '';

    let amount = 0;
    if (typeof priceVal === 'number') {
      amount = priceVal;
    } else if (typeof priceVal === 'string') {
      // Strips currency symbols ($, ₹, €, £) and commas, parsing the base value in USD
      amount = parseFloat(priceVal.replace(/[^0-9.-]+/g, '')) || 0;
    }

    const rate = rates[currency] || 1.0;
    const converted = amount * rate;

    const symbols = {
      USD: '$',
      INR: '₹',
      EUR: '€',
      GBP: '£'
    };

    const symbol = symbols[currency] || '$';
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const convertPrice = (priceVal) => {
    let amount = 0;
    if (typeof priceVal === 'number') {
      amount = priceVal;
    } else if (typeof priceVal === 'string') {
      amount = parseFloat(priceVal.replace(/[^0-9.-]+/g, '')) || 0;
    }
    const rate = rates[currency] || 1.0;
    return amount * rate;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
