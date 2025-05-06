import axios from 'axios';

const BASE_URL = '/api';

// Create an axios instance with defaults
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
const apiService = {
  // Statistics
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },

  // Websites
  getWebsites: async (params = {}) => {
    const response = await api.get('/websites', { params });
    return response.data;
  },

  getWebsite: async (id) => {
    const response = await api.get(`/websites/${id}`);
    return response.data;
  },

  createWebsite: async (data) => {
    const response = await api.post('/websites', data);
    return response.data;
  },
  
  updateWebsite: async (id, data) => {
    const response = await api.put(`/websites/${id}`, data);
    return response.data;
  },
  
  deleteWebsite: async (id) => {
    const response = await api.delete(`/websites/${id}`);
    return response.data;
  },
  
  scrapeWebsite: async (id) => {
    const response = await api.post(`/run/scraper/${id}`);
    return response.data;
  },

  // Content
  getContentList: async (params = {}) => {
    const response = await api.get('/content', { params });
    return response.data;
  },

  getWebsiteContent: async (websiteId, params = {}) => {
    const response = await api.get(`/websites/${websiteId}/content`, { params });
    return response.data;
  },

  getContentDetail: async (id) => {
    const response = await api.get(`/content/${id}`);
    return response.data;
  },

  // Operations
  runScraper: async () => {
    const response = await api.post('/run/scraper');
    return response.data;
  },

  runAnalyzer: async (limit = 100) => {
    const response = await api.post('/run/analyzer', { limit });
    return response.data;
  }
};

export default apiService;