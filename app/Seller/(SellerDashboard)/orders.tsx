import { StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import AllOrders from '@/components/SellerOrders/AllOrders';
import OrderHistory from '@/components/SellerOrders/OrderHistory';
import ActiveOrders from '@/components/SellerOrders/ActiveOrders';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

const Tab = createMaterialTopTabNavigator();


const Orders = () => {
    const router = useRouter();
    const {colors, toggleTheme} = useTheme();
    const styles = useMemo(() => appStyles(colors), [colors]);
    
  return (
    <Tab.Navigator initialRouteName="All Orders" screenOptions={{
          tabBarLabelStyle:{fontSize:14, fontWeight:'700'},
          tabBarStyle:{backgroundColor:colors.background},
          tabBarActiveTintColor:colors.primary,
          tabBarInactiveTintColor:colors.grayish,
          tabBarIndicatorStyle:{backgroundColor:colors.primary},
          tabBarBounces:true}}
    >
      <Tab.Screen name="All Orders" component={AllOrders}/>
      <Tab.Screen name="Active" component={ActiveOrders}/>
      <Tab.Screen name="History" component={OrderHistory}/>
    </Tab.Navigator>
  )
}

export default Orders

const appStyles = (colors: any) => StyleSheet.create({})