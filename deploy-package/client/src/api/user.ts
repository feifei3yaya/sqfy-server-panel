import api from './client';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'user' | 'superadmin' | 'admin';
  nickname?: string;
  realname?: string;
  gender?: string;
  birthday?: string;
  region?: string;
  phone?: string;
  wechat?: string;
  avatarUrl?: string;
  has2FA?: boolean;
  twoFASecret?: string;
  createdAt: string;
  teamMembers?: {
    teamId: string;
    role: string;
    team: {
      id: string;
      name: string;
      tag: string;
    }
  }[];
}

export const getProfile = () => api.get<User>('/users/profile');
export const updateProfile = (data: any) => api.put('/users/profile', data);
export const uploadAvatar = (formData: FormData) => api.post('/users/avatar', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
export const getLoginHistory = (page = 1, limit = 10) => api.get(`/users/login-history?page=${page}&limit=${limit}`);
export const generate2FA = () => api.post('/auth/2fa/generate');
export const verify2FA = (data: { token: string; secret: string }) => api.post('/auth/2fa/verify', data);

export default api;
