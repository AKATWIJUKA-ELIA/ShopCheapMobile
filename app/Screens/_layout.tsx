import { Stack } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'

const ScreensLayout = () => {
    return (
        <Stack screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen name='bookmark' options={{

            }}
            />
            <Stack.Screen name='transactions' options={{

            }}
            />
            <Stack.Screen name='[id]' options={{}} />
            <Stack.Screen name='order-details/[id]' options={{}} />
        </Stack>
    )
}

export default ScreensLayout

const styles = StyleSheet.create({})