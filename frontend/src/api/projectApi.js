import api from './axiosInstance';

export const projectApi = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  addMember: (projectId, email) => api.post(`/projects/${projectId}/members`, { email }),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),
};
