import axios from 'axios';
import { toast } from 'react-toastify';

// Create base instance
const baseURL = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_BASE_URL)
  || (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_API_BASE_URL || process.env?.VITE_API_BASE_URL))
  || 'http://localhost:8080/api';

if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
  console.log('[API Base URL]:', baseURL);
}

const axiosClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Memory-store accessor functions
let getAccessTokenFn = () => null;
let setAccessTokenFn = () => null;

export const injectTokenAccessors = (getAccessToken, setAccessToken) => {
  getAccessTokenFn = getAccessToken;
  setAccessTokenFn = setAccessToken;
};

// Request Interceptor: Inject Access Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessTokenFn() || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s and token refreshes
axiosClient.interceptors.response.use(
  (response) => {
    // Return the response data directly
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      toast.error('Network Error: Cannot connect to backend server.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Check if error is EMAIL_NOT_VERIFIED (V033) - do NOT treat as session expiration
    const isEmailNotVerified = data?.title === 'EMAIL_NOT_VERIFIED';
    const hasToken = Boolean(getAccessTokenFn() || sessionStorage.getItem('token') || sessionStorage.getItem('refreshToken'));

    // Handle 401 Unauthorized or 403 on protected endpoints when tokens are revoked/expired
    const isProtectedCall = originalRequest.url && (
      originalRequest.url.includes('/users/me') || 
      (hasToken && !originalRequest.url.includes('/public') && !originalRequest.url.includes('/store') && !originalRequest.url.includes('/search'))
    );

    if ((status === 401 || (status === 403 && isProtectedCall && !isEmailNotVerified)) && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Retrieve explicit refreshToken
        const storedRefreshToken = sessionStorage.getItem('refreshToken');
        if (!storedRefreshToken) throw new Error('No refresh token available');

        // Call backend token refresh endpoint with body payload
        const refreshResponse = await axiosClient.post('/auth/refresh', { refreshToken: storedRefreshToken });
        const { accessToken, refreshToken } = refreshResponse;

        setAccessTokenFn(accessToken);
        if (refreshToken) {
          sessionStorage.setItem('refreshToken', refreshToken);
        }
        sessionStorage.setItem('token', accessToken);

        processQueue(null, accessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        setAccessTokenFn(null);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        // Dispatch custom event to trigger clean logout redirect in context
        window.dispatchEvent(new Event('auth-expired'));
        return Promise.reject(refreshError);
      }
    }

    // Support RFC 7807 ProblemDetail formatting and custom backend messages
    let errorMsg = data?.detail || data?.title || data?.message || 'Request failed';
    if (data?.errors && typeof data.errors === 'object') {
      const fieldErrors = Object.entries(data.errors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(' | ');
      if (fieldErrors) {
        errorMsg = `${errorMsg} (${fieldErrors})`;
      }
    }

    if (status === 403) {
      // If this is EMAIL_NOT_VERIFIED, skip the generic "Access Denied" toast so the checkout/verify screen handles it cleanly
      if (!isEmailNotVerified) {
        const hasBody = data && (typeof data === 'object' ? Object.keys(data).length > 0 : String(data).trim().length > 0);
        if (hasBody) {
          toast.error('Access Denied: You do not have permission.');
        }
      }
    } else if (status === 422 || status === 400 || status === 409 || status === 429) {
      toast.warning(errorMsg);
    } else if (status === 503) {
      // Currency guide §8: no FX rate available for the requested currency
      // yet (backend between polls, or the provider is down). Transient,
      // not fatal — callers on price-fetching screens should retry or fall
      // back to INR; this toast just names what happened instead of the
      // generic 500 message.
      toast.warning('Live pricing is temporarily unavailable for this currency. Retrying in INR…', { toastId: 'fx-currency-warning-toast' });
    } else if (status === 502) {
      toast.error(errorMsg || 'Payment Gateway Error: Upstream service unavailable or not configured.');
    } else if (status >= 500) {
      toast.error(errorMsg || 'Server Error: Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
