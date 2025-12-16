import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const ScreensLayout = () => {
  return (
    <Stack screenOptions={{
        headerShown:false
    }}>
        <Stack.Screen name='bookmark' options={{
               
            }}
        />
        <Stack.Screen name='transactions' options={{
                
            }}
        />
    </Stack>
  )
}

export default ScreensLayout

const styles = StyleSheet.create({})