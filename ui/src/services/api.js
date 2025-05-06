import axios from 'axios';

// Create a configured axios instance with defaults
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx causes this function to trigger
    return response.data;
  },
  (error) => {
    // Any status codes outside the range of 2xx cause this function to trigger
    const errorResponse = {
      status: error.response?.status || 500,
      message: error.response?.data?.detail || 'An unexpected error occurred',
      data: error.response?.data || {},
    };

    // Handle specific error statuses
    switch (errorResponse.status) {
      case 401:
        errorResponse.message = 'Authentication required. Please log in.';
        // Handle authentication errors (redirect to login, etc.)
        break;
      case 403:
        errorResponse.message = 'You do not have permission to perform this action.';
        break;
      case 404:
        errorResponse.message = 'The requested resource was not found.';
        break;
      case 429:
        errorResponse.message = 'Too many requests. Please try again later.';
        break;
      case 500:
        errorResponse.message = 'Server error. Please try again later.';
        break;
      default:
        if (!navigator.onLine) {
          errorResponse.message = 'Network error. Please check your internet connection.';
        }
        break;
    }

    return Promise.reject(errorResponse);
  }
);

// API service methods
const apiService = {
  // Websites
  getWebsites: () => api.get('/websites'),
  getWebsite: (id) => api.get(`/websites/${id}`),
  createWebsite: (data) => api.post('/websites', data),
  updateWebsite: (id, data) => api.put(`/websites/${id}`, data),
  deleteWebsite: (id) => api.delete(`/websites/${id}`),
  
  // Content
  getContents: (params) => api.get('/contents', { params }),
  getContent: (id) => api.get(`/contents/${id}`),
  
  // Analysis
  analyzeContent: (id) => api.post(`/contents/${id}/analyze`),
  getAnalysisResults: (id) => api.get(`/contents/${id}/analysis`),
  
  // Dashboard data
  getDashboardStats: () => api.get('/dashboard/stats'),
  getRecentContent: () => api.get('/dashboard/recent-content'),
  
  // System
  getSystemStatus: () => api.get('/system/status'),
  triggerScrape: (websiteId) => api.post(`/websites/${websiteId}/scrape`),
};

export default apiService;