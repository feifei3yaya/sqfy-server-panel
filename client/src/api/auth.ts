
import api from './client';

export const getMe = () => {
  return api.get('/auth/me');
};
