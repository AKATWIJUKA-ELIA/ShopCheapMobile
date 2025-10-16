import { Colors } from '@/constants/Colors'
import { Stack } from 'expo-router'
import React from 'react'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: Colors.background },
      headerTintColor: Colors.text,
      contentStyle: { backgroundColor: Colors.background },
      headerShown:false,
    }}>
      <Stack.Screen name="login" options={{ title: 'Sign In' }} />
      <Stack.Screen name="signup" options={{ title: 'Create Account' }} />
    </Stack>
  )
}


