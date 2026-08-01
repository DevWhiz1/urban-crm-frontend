import apiClient from './apiClient';

export interface IUserResponse {
  _id: string;
  userName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllUsers = async (): Promise<IUserResponse[]> => {
  const res = await apiClient.get('/api/user/get-all-users');
  return res.data?.data || [];
};
