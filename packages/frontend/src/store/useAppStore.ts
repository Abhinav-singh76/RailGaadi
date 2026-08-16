import { create } from 'zustand';
import { Train } from '@railgaadi/types';

interface AppState {
  recentSearches: Train[];
  favourites: Train[];
  addRecentSearch: (train: Train) => void;
  toggleFavourite: (train: Train) => void;
  isFavourite: (trainId: string) => boolean;
}

const RECENT_KEY = 'railgaadi_recent_searches';
const FAVS_KEY = 'railgaadi_favourites';

function loadInitial<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  recentSearches: loadInitial<Train>(RECENT_KEY),
  favourites: loadInitial<Train>(FAVS_KEY),

  addRecentSearch: (train) => {
    set((state) => {
      const filtered = state.recentSearches.filter((t) => t.id !== train.id);
      const updated = [train, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { recentSearches: updated };
    });
  },

  toggleFavourite: (train) => {
    set((state) => {
      const exists = state.favourites.some((t) => t.id === train.id);
      let updated: Train[];
      if (exists) {
        updated = state.favourites.filter((t) => t.id !== train.id);
      } else {
        updated = [train, ...state.favourites];
      }
      try {
        localStorage.setItem(FAVS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { favourites: updated };
    });
  },

  isFavourite: (trainId) => {
    return get().favourites.some((t) => t.id === trainId);
  },
}));
