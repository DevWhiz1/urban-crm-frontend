import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

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
  const res = await axios.get(`${BASE_URL}/user/get-all-users`);
  return res.data?.data || [];
};
