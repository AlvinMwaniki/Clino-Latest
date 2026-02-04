import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      // Ensure all three ziko set at once
      setAuth: ({ user, token, role }) => set({ user, token, role }),
      logout: () => set({ user: null, token: null, role: null }),
    }),
    {
      name: 'healvista-auth', // key name in localStorage
    }
  )
);

export default useAuthStore;