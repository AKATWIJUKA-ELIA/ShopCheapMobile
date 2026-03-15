import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: number;
  read: boolean;
  type?: 'order' | 'promo' | 'system';
}

interface NotificationState {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id' | 'time' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: Math.random().toString(36).substring(7),
            time: Date.now(),
            read: false,
          },
          ...state.notifications,
        ].slice(0, 50), // Keep last 50 notifications
      })),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
      })),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      })),
      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'shopcheap-notifications-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
