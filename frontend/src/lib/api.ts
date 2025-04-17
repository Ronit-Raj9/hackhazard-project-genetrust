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
  timeout: 10000, // Add a 10 second timeout to prevent hanging requests
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    // Only add token header if token exists (fallback mechanism)
    if (token) {
      console.log('Using token from localStorage as fallback to cookies');
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
    }
    return response;
  },
  (error) => {
    // Improved error handling
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
    } else if (!error.response) {
      console.error('Network error:', error);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Email/password auth
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
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
  loginWithGoogle: () => api.get('/auth/google'),
  handleGoogleCallback: (code: string) => {
    console.log('Sending Google callback code to backend');
    return api.post('/auth/google/callback', { code })
      .then(response => {
        // Explicitly save token from successful Google auth response
        const token = response?.data?.data?.accessToken;
        if (token) {
          console.log('Received accessToken from Google auth, saving as fallback');
          saveAuthToken(token);
        }
        return response;
      });
  },
  
  // Common
  logout: () => {
    localStorage.removeItem('auth_token');
    return api.post('/auth/logout');
  },
  getCurrentUser: () => api.get('/auth/me'),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateOnboarding: (data: { role: string; experienceLevel: string; interests: string[] }) => 
    api.put('/profile/onboarding', data),
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
};

// Interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401 error, redirect to login page but only if not already on login page
    if (error.response?.status === 401) {
      // Check if we're already on the login page or home page to prevent redirects
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const isLoginPage = pathname === '/login';
      const isHomePage = pathname === '/';
      
      if (!isLoginPage && !isHomePage) {
        console.error('Authentication error. Redirecting to login.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 