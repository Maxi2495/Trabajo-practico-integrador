import { axiosInstance } from '../../../shared/api/axiosInstance';
import type { User, RegisterData } from '../types';

export async function loginApi(credentials: URLSearchParams): Promise<{ message: string }> {
  const response = await axiosInstance.post<{ message: string }>('/auth/token', credentials, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
}

export async function registerApi(data: RegisterData): Promise<User> {
  const response = await axiosInstance.post<User>('/auth/register', data);
  return response.data;
}

export async function getMeApi(): Promise<User> {
  const response = await axiosInstance.get<User>('/auth/me');
  return response.data;
}

export async function logoutApi(): Promise<{ message: string }> {
  const response = await axiosInstance.post<{ message: string }>('/auth/logout');
  return response.data;
}