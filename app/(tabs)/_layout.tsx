import CartHeader from '@/components/Cart/CartHeader';
import HomeHeader from '@/components/Header';
import OrderDetailsBottomSheetView, { OrderDetailsBottomSheetRef } from '@/components/OrderDetailsBottomSheetView';
import OrdersBottomSheet, { OrdersBottomSheetRef } from '@/components/OrdersBottomSheet';
import { useTheme } from '@/contexts/ThemeContext';
import { useBottomSheetStore } from '@/store/useBottomSheetStore';
import { useCartStore } from '@/store/useCartStore';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { items } = useCartStore();
  const distinctCount = items.length;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const ordersSheetRef = useRef<OrdersBottomSheetRef>(null);
  const isOrdersOpen = useBottomSheetStore(state => state.isOrdersBottomSheetOpen);

  const orderDetailsSheetRef = useRef<OrderDetailsBottomSheetRef>(null);
  const isOrderDetailsOpen = useBottomSheetStore(state => state.isOrderDetailsOpen);
  const selectedOrder = useBottomSheetStore(state => state.selectedOrder);

  useEffect(() => {
    if (isOrdersOpen) {
      ordersSheetRef.current?.open();
    } else {
      ordersSheetRef.current?.close();
    }
  }, [isOrdersOpen]);

  useEffect(() => {
    if (isOrderDetailsOpen && selectedOrder) {
      orderDetailsSheetRef.current?.open(selectedOrder);
    } else {
      orderDetailsSheetRef.current?.close();
    }
  }, [isOrderDetailsOpen, selectedOrder]);

  return (
    <>
      <Tabs screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.grayish,
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
          tabBarIcon: ({ color, size }) => <Ionicons name='grid' size={size} color={color} />
        }} />

        <Tabs.Screen name='cart' options={{
          title: 'Cart',
          headerShown: true,
          header: () => <CartHeader />,
          tabBarBadge: undefined,
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name='cart' size={size} color={color} />
              {distinctCount > 0 ? (
                <View style={{ position: 'absolute', right: -8, top: -4, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 }}>
                  <Text style={{ color: '#000', fontSize: 10, fontWeight: '800' }}>{distinctCount > 99 ? '99+' : distinctCount}</Text>
                </View>
              ) : null}
            </View>
          ),
        }} />

        <Tabs.Screen name='shops' options={{
          title: 'Shops',
          tabBarIcon: ({ color, size }) => <Entypo name='shop' size={size} color={color} />
        }} />

        <Tabs.Screen name='account' options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => <Ionicons name='person' size={size} color={color} />
        }} />
      </Tabs>
      <OrdersBottomSheet ref={ordersSheetRef} />
      <OrderDetailsBottomSheetView ref={orderDetailsSheetRef} />
    </>
  );
}
