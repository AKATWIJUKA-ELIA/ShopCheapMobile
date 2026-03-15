import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            notificationsEnabled: true,
            setNotificationsEnabled: (enabled: boolean) => set({ notificationsEnabled: enabled }),
        }),
        {
            name: 'shopcheap-settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
