import CartHeader from '@/components/Cart/CartHeader';
import HomeHeader from '@/components/Header';
import { useTheme } from '@/contexts/ThemeContext';
import { useCartStore } from '@/store/useCartStore';
import { CHATS_API_URL } from '@/types/product';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';

export default function TabLayout() {
  const { items } = useCartStore();
  const distinctCount = items.length;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const { notifications } = useNotificationStore();
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const fetchUnreadCount = async () => {
    if (!isAuthenticated || !user?._id) {
      setUnreadCount(0);
      return;
    }
    try {
      const response = await fetch(`${CHATS_API_URL}?userId=${user._id}`);
      if (response.ok) {
        const data = await response.json();
        const totalUnread = data.reduce((sum: number, conv: any) => sum + (conv.unreadCount || 0), 0);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('[Layout] Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, [isAuthenticated, user?._id]);

  return (
    <>
      <Tabs screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.dark,
        tabBarStyle: { backgroundColor: colors.background, height: 60, paddingBottom: 20 },
        headerShown: false,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarShowLabel: true,
      }}>
        <Tabs.Screen name='home' options={{
          title: 'Home',
          headerShown: true,
          header: () => <HomeHeader />,
          tabBarIcon: ({ color, size }) => <Entypo name='home' size={size} color={color} />,
        }} />

        <Tabs.Screen name='categories' options={{
          title: 'Categories',
          headerShown: true,
          header: () => <HomeHeader />,
          tabBarIcon: ({ color, size }) => <Ionicons name='grid-outline' size={size} color={color} />
        }} />

        <Tabs.Screen name='chats' options={{
          title: 'Messages',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name='chatbubble-ellipses' size={size} color={color} />
              {unreadCount > 0 ? (
                <View style={{ position: 'absolute', right: -12, top: -4, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, minWidth: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#000', fontSize: 10, fontWeight: '800' }}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              ) : null}
            </View>
          ),
        }} />

        <Tabs.Screen name='shops' options={{
          title: 'Shops',
          tabBarIcon: ({ color, size }) => <Ionicons name='storefront-outline' size={size} color={color} />
        }} />

        <Tabs.Screen name='account' options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name='person' size={size} color={color} />
              {unreadNotifications > 0 ? (
                <View style={{ position: 'absolute', right: -12, top: -4, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, minWidth: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#000', fontSize: 10, fontWeight: '800' }}>{unreadNotifications > 99 ? '99+' : unreadNotifications}</Text>
                </View>
              ) : null}
            </View>
          ),
        }} />
      </Tabs>
    </>
  );
}
