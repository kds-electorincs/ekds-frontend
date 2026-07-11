import axios from 'axios';
import { toast } from 'react-toastify';

// Create base instance
const axiosClient = axios.create({
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
    const token = getAccessTokenFn();
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

    // Handle 401 Unauthorized (Token Expiry)
    if (status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
        // Refresh token itself is expired, or login credentials invalid
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
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (!storedRefreshToken) throw new Error('No refresh token available');

        // Call backend token refresh endpoint with body payload
        const refreshResponse = await axiosClient.post('/auth/refresh', { refreshToken: storedRefreshToken });
        const { accessToken, refreshToken } = refreshResponse;
        
        setAccessTokenFn(accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('token', accessToken);

        processQueue(null, accessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        setAccessTokenFn(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // Dispatch custom event to trigger logout redirect in context
        window.dispatchEvent(new Event('auth-expired'));
        return Promise.reject(refreshError);
      }
    }

    // Pass custom backend validation messages
    const errorMsg = data?.message || 'Request failed';
    if (status === 403) {
      toast.error('Access Denied: You do not have permission.');
    } else if (status === 422 || status === 400) {
      toast.warning(errorMsg);
    } else if (status >= 500) {
      toast.error('Server Error: Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
