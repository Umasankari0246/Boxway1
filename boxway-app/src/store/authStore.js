import { create } from 'zustand';

// Mock credentials – consistent with what the login page shows
const MOCK_CREDENTIALS = [
  {
    id: 1,
    name: 'Alex Carter',
    email: 'admin@boxway.com',
    password: 'admin123',
    role: 'Admin',
    title: 'Studio Principal',
    department: 'Management',
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    email: 'architect@boxway.com',
    password: 'arch123',
    role: 'Architect',
    title: 'Senior Architect',
    department: 'Design',
  },
];

export const useAuthStore = create((set) => ({
  user: null,
  loginError: null,

  login: (email, password) => {
    const match = MOCK_CREDENTIALS.find(
      (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (match) {
      const { password: _pw, ...user } = match; // strip password from stored state
      set({ user, loginError: null });
      return true;
    }
    set({ loginError: 'Invalid email or password. Try admin@boxway.com / admin123' });
    return false;
  },

  clearError: () => set({ loginError: null }),
  logout: () => set({ user: null, loginError: null }),
}));
