import axios from 'axios';

// Resolve backend base URL from Vercel / Vite environment variables
// Default to the deployed Render backend
const DEFAULT_BACKEND_URL = 'https://ai-resume-screening-api-60uf.onrender.com';
const envApiUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_BACKEND_URL;

export const getApiBaseUrl = () => {
  const url = (envApiUrl && envApiUrl.trim()) ? envApiUrl.trim() : DEFAULT_BACKEND_URL;
  return url.replace(/\/+$/, '');
};

// Guarantee the /api prefix for all backend requests
const base = getApiBaseUrl();
const apiBaseUrl = base.endsWith('/api') ? base : `${base}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 60000, // 60s timeout to allow Render free tier instances to spin up
  headers: {
    'Accept': 'application/json',
  },
});

// Response interceptor for clear timeout / network error debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
      console.warn('API request timed out. Deployed backend (e.g. Render) may be waking up from sleep.');
    }
    return Promise.reject(error);
  }
);

export const getDashboardStats = async () => {
  const res = await api.get('/dashboard/stats');
  return res.data;
};

export const getCandidates = async (params = {}) => {
  const cleanedParams = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      cleanedParams[key] = params[key];
    }
  });
  const res = await api.get('/candidates', { params: cleanedParams });
  return res.data;
};

export const getCandidateById = async (id) => {
  const res = await api.get(`/candidates/${encodeURIComponent(id)}`);
  return res.data;
};

export const updateCandidateStatus = async (id, status) => {
  const res = await api.patch(`/candidates/${encodeURIComponent(id)}/status`, { status });
  return res.data;
};

export const getRankings = async (role = 'lca') => {
  const cleanRole = (role || '').toLowerCase().includes('ui') ? 'uiux' : 'lca';
  const res = await api.get('/rankings', { params: { role: cleanRole } });
  return res.data;
};

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  // Do not set Content-Type manually so the browser/Axios automatically sets the multipart boundary
  const res = await api.post('/upload', formData);
  return res.data;
};

export const getJobDescriptions = async () => {
  const res = await api.get('/job-descriptions');
  return res.data;
};

export const scrapeJobLink = async (url) => {
  const res = await api.post('/job-descriptions/scrape', { url });
  return res.data;
};

export const createJobDescription = async (data) => {
  const res = await api.post('/job-descriptions', data);
  return res.data;
};

export const updateJobDescription = async (id, data) => {
  const res = await api.put(`/job-descriptions/${id}`, data);
  return res.data;
};

export const deleteJobDescription = async (id) => {
  const res = await api.delete(`/job-descriptions/${id}`);
  return res.data;
};

export const getAnalytics = async () => {
  const res = await api.get('/analytics');
  return res.data;
};

export const getProcessingHistory = async () => {
  const res = await api.get('/processing-history');
  return res.data;
};

export const getResumeDownloadUrl = (filename) => {
  return `${apiBaseUrl}/resumes/${encodeURIComponent(filename)}`;
};

export function getProfileLetters(name) {
  if (!name) return 'CAN';
  // Prefer alphabetical characters if present
  const alphaOnly = name.replace(/[^a-zA-Z]/g, '').trim();
  if (alphaOnly.length >= 3) {
    return alphaOnly.slice(0, 3).toUpperCase();
  }
  if (alphaOnly.length > 0) {
    return alphaOnly.toUpperCase();
  }
  const clean = name.replace(/[^a-zA-Z0-9]/g, '').trim();
  if (clean.length >= 3) {
    return clean.slice(0, 3).toUpperCase();
  }
  return (clean || 'CAN').toUpperCase();
}

export default api;
