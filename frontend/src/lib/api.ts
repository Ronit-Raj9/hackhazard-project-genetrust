import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Function to get token from localStorage (as fallback to cookies)
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Function to save token to localStorage (when received in response)
const saveAuthToken = (token: string) => {
  if (typeof window !== 'undefined' && token) {
    localStorage.setItem('auth_token', token);
    console.log('Auth token saved to localStorage as fallback');
  }
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
  timeout: 30000, // Increase timeout to 30 seconds
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    // Only add token header if token exists (fallback mechanism)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to save token when available
api.interceptors.response.use(
  (response) => {
    // Check for token in response data
    const token = response.data?.data?.accessToken;
    if (token) {
      saveAuthToken(token);
      // Set token in axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Token saved and set in default headers');
    }
    return response;
  },
  (error) => {
    // Improved error handling
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
    } else if (!error.response) {
      console.error('Network error - server may be unavailable:', error);
    }
    return Promise.reject(error);
  }
);

// Auth API with error handling
export const authAPI = {
  // Token helper function
  setToken: (token: string) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Token set in API headers manually');
      return true;
    }
    return false;
  },

  // Login-related methods with improved error handling
  getCurrentUser: () => {
    try {
      return api.get('/auth/me');
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return Promise.reject(error);
    }
  },
  
  // Other auth methods...
  login: (email: string, password: string) => {
    return api.post('/auth/login', { email, password })
      .then(response => {
        // Explicitly handle token from login response
        const token = response?.data?.data?.accessToken;
        if (token) {
          console.log('Received accessToken from login, saving and setting in headers');
          saveAuthToken(token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        return response;
      });
  },
  register: (email: string, password: string, name: string) => 
    api.post('/auth/register', { email, password, name }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => 
    api.post('/auth/reset-password', { token, password }),
  changePassword: (currentPassword: string, newPassword: string) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
  
  // Wallet auth
  loginWithWallet: (walletAddress: string) => api.post('/auth/login/wallet', { walletAddress }),
  
  // Google auth
  loginWithGoogle: () => {
    // Instead of an API call, we'll redirect the user directly to the Google OAuth endpoint
    const googleAuthUrl = `${API_URL}/auth/google`;
    console.log('Redirecting to Google OAuth page:', googleAuthUrl);
    // Redirect the browser to the Google auth endpoint
    window.location.href = googleAuthUrl;
    // Return a promise that never resolves since we're redirecting the page
    return new Promise(() => {});
  },
  
  // Common
  logout: () => {
    localStorage.removeItem('auth_token');
    return api.post('/auth/logout');
  },
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updatePreferences: (data: { theme?: string; aiVoice?: string }) => 
    api.put('/profile/preferences', data),
  addActivity: (data: { type: 'prediction' | 'monitoring'; data: any }) => 
    api.post('/profile/activity', data),
};

// Prediction API (for storing/retrieving results)
export const predictionAPI = {
  createPrediction: (sequence: string) => api.post('/prediction', { sequence }),
  getUserPredictions: () => api.get('/prediction'),
  getPrediction: (id: string) => api.get(`/prediction/${id}`),
  addExplanation: (id: string, question: string) => 
    api.post(`/prediction/${id}/explanation`, { question }),
};

// CRISPR Prediction API (calls the Python ML service via backend)
export const crisprAPI = {
  predictSequence: (sequence: string) => api.post('/crispr/predict', { sequence }),
};

// IoT Monitoring API
export const iotAPI = {
  getLatestData: () => api.get('/iot/data'),
  getInsights: () => api.get('/iot/insights'),
};

// Groq API
export const groqAPI = {
  chat: (messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>) => 
    api.post('/groq/chat', { messages }),
  
  onboardingChat: (message: string, history: Array<{ role: 'user' | 'assistant'; content: string }> = []) => 
    api.post('/groq/onboarding-chat', { message, history }),
    
  getBlockchainGuidance: (dataType: 'prediction' | 'monitoring') => 
    api.get(`/groq/blockchain-guidance?dataType=${dataType}`),
    
  // Health check for Groq API
  checkHealth: async () => {
    try {
      console.log('Checking Groq API health...');
      const response = await api.get('/groq/health');
      console.log('Groq health status:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking Groq health:', error);
      return {
        status: 'error',
        groq: {
          connected: false,
          message: 'Failed to connect to Groq health endpoint'
        }
      };
    }
  },
    
  // Lab monitoring APIs
  analyzeVision: (scenario: string) => 
    api.post('/groq/analyze-vision', { scenario }),
    
  transcribeAudio: (audioCommand: string) => 
    api.post('/groq/transcribe', { audioCommand }),
    
  interpretCommand: (text: string) => 
    api.post('/groq/interpret-command', { text }),
    
  getSensorInsights: (sensorData: { 
    temperature: number; 
    humidity: number; 
    pressure?: number; 
    co2?: number; 
    oxygen?: number;
    ph?: number;
  }) => api.post('/groq/sensor-insights', sensorData),
};

// Modify the interceptor for handling auth errors to prevent redirects on network errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Skip redirect for network errors
    if (!error.response) {
      console.error('Network error detected, not redirecting');
      return Promise.reject(error);
    }
    
    // Only redirect on actual 401 responses (not network errors)
    if (error.response?.status === 401) {
      // Check if we're already on the login page or home page to prevent redirects
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const isLoginPage = pathname === '/login';
      const isHomePage = pathname === '/';
      const isChainSightPage = pathname.includes('/chainSight');
      
      // Don't redirect for chainSight pages - they handle auth differently
      if (!isLoginPage && !isHomePage && !isChainSightPage) {
        console.error('Authentication error. Redirecting to login.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 