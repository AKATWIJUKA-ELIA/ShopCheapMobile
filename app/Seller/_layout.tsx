import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const SellerLayout = () => {
  return (
    <Stack screenOptions={{
            headerShown:false
        }}
    >
        <Stack.Screen name='seller' options={{
                title:'Seller',
            }}
        />
        <Stack.Screen name='register' options={{
                title:'Register',
                presentation:'modal'
            }}
        />
        <Stack.Screen name='(SellerDashboard)' options={{
                headerShown:false
          }}
        />
        <Stack.Screen name='AddProduct' options={{
                headerShown:false
          }}
        />
    </Stack>
  )
}

export default SellerLayout

const styles = StyleSheet.create({})