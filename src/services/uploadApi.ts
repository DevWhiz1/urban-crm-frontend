import apiClient from './apiClient';

export const uploadApi = {
  uploadFile: async (file: File): Promise<{ url: string; public_id: string; format: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
