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
      console.log('Received auth token in response - saving to localStorage');
      saveAuthToken(token);
      // Set token in axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// Auth API with error handling
export const authAPI = {
  // Token helper function
  setToken: (token: string) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    }
    return false;
  },

  // Login-related methods
  getCurrentUser: () => {
    // Always try to set token from localStorage before getCurrentUser call
    const token = getAuthToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return api.get('/auth/me');
  },
  
  // Email/password authentication
  login: (email: string, password: string) => {
    return api.post('/auth/login', { email, password })
      .then(response => {
        // Explicitly handle token from login response
        const token = response?.data?.data?.accessToken;
        if (token) {
          console.log('Login successful - saving auth token');
          saveAuthToken(token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        return response;
      });
  },
  
  // Guest authentication
  loginAsGuest: () => {
    return api.post('/auth/login/guest')
      .then(response => {
        // Handle token from guest login response
        const token = response?.data?.data?.accessToken;
        if (token) {
          saveAuthToken(token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        return response;
      });
  },
  
  register: (email: string, password: string, name: string) => 
    api.post('/auth/register', { email, password, name }),
  verifyEmail: (token: string) => {
    console.log('Frontend API: Sending verification request with token', { tokenLength: token.length });
    return api.post('/auth/verify-email', { token });
  },
  resendVerification: (email: string) => {
    console.log('Frontend API: Requesting verification email resend for', { email });
    return api.post('/auth/resend-verification', { email });
  },
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => 
    api.post('/auth/reset-password', { token, password }),
  changePassword: (currentPassword: string, newPassword: string) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
  
  // Wallet auth
  loginWithWallet: (walletAddress: string) => 
    api.post('/auth/login/wallet', { walletAddress }),
  
  // Google auth
  loginWithGoogle: (idToken: string, email: string, name?: string) =>
    api.post('/auth/login/google', { idToken, email, name }),
  
  // Common
  logout: () => {
    // Safely clean up localStorage
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.warn('Failed to clear localStorage on logout:', error);
    }
    
    // Safely clean up auth headers
    try {
      if (api.defaults?.headers?.common?.Authorization) {
        delete api.defaults.headers.common.Authorization;
      } else if (api.defaults?.headers?.common && api.defaults.headers.common['Authorization']) {
        delete api.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.warn('Failed to clear auth headers on logout:', error);
    }
    
    // Call the backend logout API
    return api.post('/auth/logout').catch(err => {
      console.warn('Backend logout API call failed:', err);
      // Return a resolved promise so that frontend logout flow can continue
      return Promise.resolve({ status: 'ok', data: { message: 'Logged out locally' } });
    });
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
      const response = await api.get('/groq/health');
      return response.data;
    } catch (error) {
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
      return Promise.reject(error);
    }
    
    // Only handle 401 responses (not network errors)
    if (error.response?.status === 401) {
      // Don't immediately redirect - let the component decide based on requireAuth
      console.warn('Authentication required for this request');
      
      // Check if this is a second request with the same error
      // This helps prevent infinite loops
      const isRetry = error.config.__isRetryRequest;
      
      if (!isRetry) {
        // Check if token exists in localStorage
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          console.warn('Auth token exists but request was unauthorized. Token may be invalid.');
          
          // Clear the invalid token
          localStorage.removeItem('auth_token');
          
          // Notify about auth state change for components to update
          if (typeof window !== 'undefined' && window.authEvents) {
            window.authEvents.emit('auth_state_changed', { isAuthenticated: false, reason: '401_response' });
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 