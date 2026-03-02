import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SearchState {
    query: string;
    recentSearches: string[];
    setQuery: (query: string) => void;
    addSearch: (search: string) => void;
    clearSearches: () => void;
}

export const useSearchStore = create<SearchState>()(
    persist(
        (set) => ({
            query: '',
            recentSearches: [],
            setQuery: (query) => set({ query }),
            addSearch: (search) => set((state) => {
                if (!search.trim()) return state;
                const filtered = state.recentSearches.filter((s) => s !== search);
                const newSearches = [search, ...filtered].slice(0, 10);
                return { recentSearches: newSearches };
            }),
            clearSearches: () => set({ recentSearches: [] }),
        }),
        {
            name: 'search-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ recentSearches: state.recentSearches }),
        }
    )
);
