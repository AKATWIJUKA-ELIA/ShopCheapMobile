// This layout already exists; ensure product modal route works via file-based routing
import { Colors } from '@/constants/Colors'
import { Stack } from 'expo-router'
import React from 'react'

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{
      presentation: 'modal',
      headerStyle: { backgroundColor: Colors.background },
      headerTintColor: Colors.light,
      contentStyle: { backgroundColor: Colors.background },
      headerShown:false,
    }}>
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="addresses" options={{ title: 'Addresses' }} />
      <Stack.Screen name="payments" options={{ title: 'Payment Methods' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="dark-mode" options={{ title: 'Appearance' }} />
      <Stack.Screen name="help" options={{ title: 'Help Center' }} />
    </Stack>
  )
}


