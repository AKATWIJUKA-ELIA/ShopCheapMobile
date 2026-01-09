import { GET_USER_API_URL } from '@/types/product';
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
    refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            logout: () => set({ user: null, isAuthenticated: false }),
            refreshUser: async () => {
                const { user, setUser } = useAuthStore.getState();
                if (!user) return;

                try {
                    console.log(`[AuthSync] Refreshing user data for: ${user._id}`);
                    const res = await fetch(`${GET_USER_API_URL}?id=${user._id}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data._id) {
                            if (JSON.stringify(user) !== JSON.stringify(data)) {
                                setUser(data); // Use setUser to preserve isAuthenticated
                                console.log(`[AuthSync] User data refreshed successfully`);
                            } else {
                                console.log(`[AuthSync] User data is already up to date`);
                            }
                        }
                    } else {
                        console.error(`[AuthSync] Failed to refresh user: ${res.status}`);
                    }
                } catch (error) {
                    console.error(`[AuthSync] Error refreshing user:`, error);
                }
            },
        }),
        {
            name: 'shopcheap-auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
