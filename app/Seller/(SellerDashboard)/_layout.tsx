import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { Entypo, FontAwesome6, Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons'

const SellerDashboardLayout = () => {
  return (
    <Tabs screenOptions={{
        // headerShown:false,
        tabBarStyle:{ backgroundColor: Colors.gray, height:60, paddingTop:4 },
        tabBarActiveTintColor:Colors.primary,
        tabBarInactiveTintColor:Colors.light,
        header:() => (
            <View style={{height:50, alignItems:'center', justifyContent:'center', backgroundColor:Colors.gray, flexDirection:'row'}}>
                <Image source={require('@/assets/images/Logo1.webp')} style={{width:120, height:24, marginRight:10, marginLeft:-40, borderRadius:4}}/>
                <Text style={{color:Colors.primary, fontSize:18, fontWeight:'700'}}>Seller Dashboard</Text>
            </View>
        ),
        tabBarLabelStyle:{fontSize:12, fontWeight:'700'},
    }}>
      <Tabs.Screen name='index'
        options={{
          tabBarLabel:'Dashboard',
          tabBarIcon:({ color, size }) => <MaterialIcons name='space-dashboard' size={size} color={color}/>
        }}
      /> 

      <Tabs.Screen name="products" options={{
            tabBarLabel:'Products',
            tabBarIcon:({ color, size }) => <FontAwesome6 name='list' size={size} color={color}/>
        }}
      />

      <Tabs.Screen name="orders" options={{
            tabBarLabel:'Orders',
            tabBarIcon:({ color, size }) => <MaterialIcons name='shopping-bag' size={size} color={color}/>
        }}
      /> 

      <Tabs.Screen name="shop" options={{
            tabBarLabel:'Shop',
            tabBarIcon:({ color, size }) => <Entypo name='shop' size={size} color={color}/>
        }}
      />
    </Tabs>
  )
}

export default SellerDashboardLayout

const styles = StyleSheet.create({})