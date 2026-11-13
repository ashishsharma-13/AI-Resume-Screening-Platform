import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export const getDashboardStats = async () => {
  const res = await api.get('/dashboard/stats');
  return res.data;
};

export const getCandidates = async (params = {}) => {
  const res = await api.get('/candidates', { params });
  return res.data;
};

export const getCandidateById = async (id) => {
  const res = await api.get(`/candidates/${id}`);
  return res.data;
};

export const updateCandidateStatus = async (id, status) => {
  const res = await api.patch(`/candidates/${id}/status`, { status });
  return res.data;
};

export const getRankings = async (role = 'lca') => {
  const res = await api.get('/rankings', { params: { role } });
  return res.data;
};

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
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
