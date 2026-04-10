import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { Tabs, useRouter } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { Entypo, FontAwesome6, Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons'

const SellerDashboardLayout = () => {
    const router = useRouter();
  return (
    <Tabs screenOptions={{
        // headerShown:false,
        tabBarStyle: { backgroundColor: Colors.background, height: 60, paddingBottom: 20 },
        tabBarActiveTintColor:Colors.primary,
        tabBarInactiveTintColor:Colors.light,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        header:() => (
            <View style={{height:50, alignItems:'center', justifyContent:'center', backgroundColor:Colors.gray, flexDirection:'row'}}>
                <TouchableOpacity onPress={()=> router.push('/(tabs)/home')}>
                   <Image source={require('@/assets/images/Logo1.webp')} style={{width:120, height:24, marginRight:10, marginLeft:-40, borderRadius:4}}/>
                </TouchableOpacity>
                
                <Text style={{color:Colors.primary, fontSize:18, fontWeight:'700'}}>Seller Dashboard</Text>
            </View>
        ),
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
            tabBarLabel:'My Shop',
            tabBarIcon:({ color, size }) => <Entypo name='shop' size={size} color={color}/>
        }}
      />
    </Tabs>
  )
}

export default SellerDashboardLayout

const styles = StyleSheet.create({})