import api from './api';

export const getTests = (params = {}) => api.get('/tests', { params });
export const getTest = (id) => api.get(`/tests/${id}`);
export const createTest = (data) => api.post('/tests', data);
export const updateTest = (id, data) => api.put(`/tests/${id}`, data);
export const deleteTest = (id) => api.delete(`/tests/${id}`);
