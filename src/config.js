import { create } from "zustand";

const BASE_URL = 'https://api.frankfurter.dev/v2';

export const useCurrencyStore = create((set) => ({
  latestRate: null,
  isLoading: false,
  error: null,
  fetchLatestRate: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = `${BASE_URL}/currencies`;
      const res = await fetch(response);
      const data = await res.json();   
      set({ latestRate: Object.keys(data), isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));