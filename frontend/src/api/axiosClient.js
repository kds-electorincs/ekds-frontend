import axios from 'axios';
import { toast } from 'react-toastify';

// Create base instance
const axiosClient = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL || 'https://d33txvk614c5de.cloudfront.net',
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Removed withCredentials: true as we're explicitly passing tokens now
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

    // Handle 401 Unauthorized or 403 on protected endpoints (Known Backend Quirk for /users/me/**)
    const isProtectedCall = originalRequest.url && originalRequest.url.includes('/users/me');
    if ((status === 401 || (status === 403 && isProtectedCall)) && !originalRequest._retry) {
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
        // Dispatch custom event to trigger logout redirect in context
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
      // KDS spec §9 known backend defect (currency guide §8):
      // 403 with an EMPTY body = malformed request (e.g. a missing/invalid
      // ?currency= on a public /api/store/* or /api/search/* endpoint), NOT
      // a permissions failure. Do NOT show "Access Denied" or log the user
      // out — it would be misleading. Only show the Access Denied toast when
      // the response body has actual content (a real problem+json auth
      // failure on an authenticated endpoint always has one).
      // Note: this branch runs regardless of the 401/403-refresh branch
      // above, which itself only ever retries on a 403 whose URL matches
      // isProtectedCall (currently just /users/me) — /store/* and /search/*
      // never match that, so they never reach the refresh flow at all, empty
      // body or not.
      const hasBody = data && (typeof data === 'object' ? Object.keys(data).length > 0 : String(data).trim().length > 0);
      if (hasBody) {
        toast.error('Access Denied: You do not have permission.');
      }
      // Empty-body 403 → suppress toast; caller handles the rejection.
    } else if (status === 422 || status === 400 || status === 409) {
      toast.warning(errorMsg);
    } else if (status === 503) {
      // Currency guide §8: no FX rate available for the requested currency
      // yet (backend between polls, or the provider is down). Transient,
      // not fatal — callers on price-fetching screens should retry or fall
      // back to INR; this toast just names what happened instead of the
      // generic 500 message.
      toast.warning('Live pricing is temporarily unavailable for this currency. Retrying in INR…');
    } else if (status >= 500) {
      toast.error('Server Error: Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
