import api from './api';

export const getMarks = (params = {}) => api.get('/marks', { params });
export const getMark = (id) => api.get(`/marks/${id}`);
export const createMark = (data) => api.post('/marks', data);
export const updateMark = (id, data) => api.put(`/marks/${id}`, data);
export const deleteMark = (id) => api.delete(`/marks/${id}`);
export const getStudentPerformance = (studentId) =>
  api.get(`/marks/student/${studentId}/performance`);
