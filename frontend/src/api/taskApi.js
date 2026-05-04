import api from './axiosInstance';

export const taskApi = {
  getAll: (projectId) => api.get(`/tasks/${projectId}`),
  create: (projectId, data) => api.post(`/tasks/${projectId}`, data),
  updateStatus: (projectId, taskId, status) =>
    api.patch(`/tasks/${projectId}/${taskId}/status`, { status }),
  update: (projectId, taskId, data) => api.put(`/tasks/${projectId}/${taskId}`, data),
  delete: (projectId, taskId) => api.delete(`/tasks/${projectId}/${taskId}`),
};
