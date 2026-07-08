import { create } from 'zustand';
import axios from 'axios';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8001/api'
    : 'https://boxxway.onrender.com/api'
});

export const useAuthStore = create((set) => ({
  user: null,
  loginError: null,

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.data) {
        set({ user: response.data.data, loginError: null });
        return true;
      }
      set({ loginError: 'Invalid response from server' });
      return false;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Invalid email or password. Try admin@boxway.com / admin123';
      set({ loginError: errorMessage });
      return false;
    }
  },

  clearError: () => set({ loginError: null }),
  logout: () => set({ user: null, loginError: null }),
}));
