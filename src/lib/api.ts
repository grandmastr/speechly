import axios from 'axios';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: 'https://api.sws.speechify.com',
});

// Log all requests and responses for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);

    // Log FormData content for debugging
    if (config.data instanceof FormData) {
      console.log('FormData entries:');
      for (const pair of config.data.entries()) {
        const [key, value] = pair;
        if (value instanceof File) {
          console.log(`${key}: File(name=${value.name}, type=${value.type}, size=${value.size})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
    }

    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.statusText);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.statusText, error.message);
    return Promise.reject(error);
  }
);

// Request interceptor to add authorization token
api.interceptors.request.use(
  (config) => {
    // Get token from environment variable using Vite's import.meta.env
    const token = import.meta.env.VITE_SPEECHIFY_API_KEY || 'YOUR_TOKEN';

    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
