import axios from 'axios';
import notification from '../utils/notification'; // Reusing your existing notification utility

// Create an Axios instance
const axiosInstance = axios.create({
  // Use Vite environment variable or fallback to localhost:8080/api (IntelliJ/Spring Boot default)
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token
axiosInstance.interceptors.request.use(
  (config) => {
    // Retrieve token from local storage (or your chosen state management)
    const token = localStorage.getItem('token');
    
    // If token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Responses and Errors Globally
axiosInstance.interceptors.response.use(
  (response) => {
    // Return just the data object to simplify component logic
    return response.data;
  },
  (error) => {
    // Handle generic errors here
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - token might be expired
        console.error('Unauthorized access. Logging out...');
        localStorage.removeItem('token');
        // Redirect to login if needed: window.location.href = '/login';
      } else if (status === 403) {
        notification.error('You do not have permission to perform this action.');
      } else if (status === 404) {
        console.error('Requested resource not found');
      } else {
        // Display backend error message if available, otherwise a generic one
        notification.error(data?.message || 'Something went wrong!');
      }
    } else if (error.request) {
      // Network error (no response received from backend)
      notification.error('Network Error: Unable to connect to the server.');
    } else {
      // Request configuration error
      notification.error(`Error: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
