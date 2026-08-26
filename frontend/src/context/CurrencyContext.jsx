import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    return sessionStorage.getItem('currency') || 'INR';
  });

  // Supported currencies list from the backend (GET /store/products/currencies)
  // If this returns a single currency, the currency selector should be hidden.
  const [supportedCurrencies, setSupportedCurrencies] = useState([]);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

  // ─── Fetch supported currencies from backend (spec §10) ──────────────────
  useEffect(() => {
    const fetchSupportedCurrencies = async () => {
      try {
        // GET /api/store/products/currencies — returns string[] e.g. ["INR", "USD"]
        const result = await axiosClient.get('/store/products/currencies');
        const list = Array.isArray(result) ? result : (result?.data ?? []);
        if (list.length > 0) {
          setSupportedCurrencies(list);
          // Spec §10: hide currency selector entirely if only 1 currency is supported
          setShowCurrencySelector(list.length > 1);
          // If current currency is no longer in the supported list, reset to first
          if (!list.includes(currency)) {
            const first = list[0];
            setCurrencyState(first);
            sessionStorage.setItem('currency', first);
          }
        }
      } catch (err) {
        // Backend may be unreachable during development — fail silently
        console.warn('[CurrencyContext] Failed to fetch supported currencies:', err?.message);
        // Default: show selector with common currencies as fallback
        setSupportedCurrencies(['INR', 'USD', 'EUR', 'GBP']);
        setShowCurrencySelector(true);
      }
    };

    fetchSupportedCurrencies();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Persist currency selection ───────────────────────────────────────────
  const setCurrency = (newCurrency) => {
    setCurrencyState(newCurrency);
    sessionStorage.setItem('currency', newCurrency);
  };

  useEffect(() => {
    sessionStorage.setItem('currency', currency);
  }, [currency]);

  // No formatPrice/convertPrice here (guide §7: never do FX arithmetic on
  // the frontend — the backend is the single conversion point, and every
  // priced response already carries its numbers in the requested display
  // currency). For rendering, use utils/priceUtils.js's formatPrice/
  // formatTotal against a response's own scaled/priceScale/currency fields.

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      supportedCurrencies,
      showCurrencySelector,
    }}>
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
