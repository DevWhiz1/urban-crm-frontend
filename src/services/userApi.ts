import apiClient from './apiClient';

export interface IUserResponse {
  _id: string;
  userName: string;
  email: string;
  role: string;
  status: string;
  plainPassword?: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllUsers = async (): Promise<IUserResponse[]> => {
  const res = await apiClient.get('/api/user/get-all-users?limit=all');
  return res.data?.data || [];
};

export const updateUser = async (id: string, data: Partial<IUserResponse & { password?: string }>): Promise<IUserResponse> => {
  const res = await apiClient.put(`/api/user/update-user/${id}`, data);
  return res.data?.user || res.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/user/delete-user/${id}`);
};
