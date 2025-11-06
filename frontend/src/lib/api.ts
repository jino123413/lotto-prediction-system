import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT 토큰 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Data Collector APIs
export const dataAPI = {
  getLatest: async (limit = 5) => {
    const response = await api.get(`/data/latest?limit=${limit}`);
    return response.data;
  },
  getHistory: async (page = 1, perPage = 20) => {
    const response = await api.get(`/data/history?page=${page}&per_page=${perPage}`);
    return response.data;
  },
  getCount: async () => {
    const response = await api.get('/data/stats/count');
    return response.data;
  },
};

// Statistics APIs
export const statsAPI = {
  getFrequency: async () => {
    const response = await api.get('/stats/frequency');
    return response.data;
  },
  getPatterns: async () => {
    const response = await api.get('/stats/patterns');
    return response.data;
  },
  getStatistics: async () => {
    const response = await api.get('/stats/statistics');
    return response.data;
  },
  getHeatmap: async () => {
    const response = await api.get('/stats/heatmap');
    return response.data;
  },
};

// ML Prediction APIs
export const mlAPI = {
  predict: async (method = 'ensemble') => {
    const response = await api.post('/predict/predict', { method });
    return response.data;
  },
  predictMultiple: async () => {
    const response = await api.post('/predict/predict-multiple', {});
    return response.data;
  },
  getModelInfo: async () => {
    const response = await api.get('/predict/model-info');
    return response.data;
  },
};

// User Service APIs
export const authAPI = {
  register: async (data: { username: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data: { username: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  health: async () => {
    const response = await api.get('/auth/health');
    return response.data;
  },
};

export const predictionAPI = {
  save: async (data: { method: string; numbers: number[]; confidence: number }) => {
    const response = await api.post('/predictions', {
      predictedNumbers: data.numbers.join(','),
      method: data.method,
      confidence: data.confidence,
    });
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/predictions');
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/predictions/${id}`);
    return response.data;
  },
  getCount: async () => {
    const response = await api.get('/predictions/count');
    return response.data;
  },
};

export default api;
