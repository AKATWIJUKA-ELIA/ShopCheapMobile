import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'user' | 'seller' | 'admin';
    isVerified: boolean;
    profilePicture?: string;
    phoneNumber?: string;
    _creationTime: number;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'shopcheap-auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
