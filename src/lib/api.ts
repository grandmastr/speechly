import axios, { AxiosInstance } from 'axios';

// Store the current API key
let currentApiKey: string | null = null;

// Create an axios instance with default configuration
const createApiInstance = (apiKey?: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: 'https://api.sws.speechify.com',
  });

  // Log all requests and responses for debugging
  instance.interceptors.request.use(
    (config) => config,
    (error) => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      console.error('API Response Error:', error.response?.status,
        error.response?.statusText, error.message);
      return Promise.reject(error);
    },
  );

  // Request interceptor to add authorization token
  instance.interceptors.request.use(
    (config) => {
      // Use the provided API key, or fall back to the current API key, or fall back to the environment variable
      const token = apiKey || currentApiKey ||
        import.meta.env.VITE_SPEECHIFY_API_KEY || '';

      // Add token to headers if it exists
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  return instance;
};

// Create the default API instance
const api = createApiInstance();

// Function to set the API key for all future requests
export const setApiKey = (apiKey: string): void => {
  currentApiKey = apiKey;
};

// Function to create a new API instance with a specific API key
export const createApi = (apiKey: string): AxiosInstance => {
  return createApiInstance(apiKey);
};

export default api;
