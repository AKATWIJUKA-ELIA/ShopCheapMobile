import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useMemo } from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import AllProductsScreen from '@/components/SellerDashboard/AllProducts';
import ApprovedProductsScreen from '@/components/SellerDashboard/ApprovedProducts';
import PendingProductsScreen from '@/components/SellerDashboard/Pending';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createMaterialTopTabNavigator();


const Products = () => {
  const router = useRouter();
  const {colors, toggleTheme} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  
  return (
    <View style={{flex:1, backgroundColor:colors.background}}>
      <Tab.Navigator initialRouteName="All" screenOptions={{
          tabBarLabelStyle:{fontSize:14, fontWeight:'700'},
          tabBarStyle:{backgroundColor:colors.background},
          tabBarActiveTintColor:colors.primary,
          tabBarInactiveTintColor:colors.grayish,
          tabBarIndicatorStyle:{backgroundColor:colors.primary},
          tabBarBounces:true,
        }}
      >
        <Tab.Screen name="All" component={AllProductsScreen}/>
        <Tab.Screen name="Approved" component={ApprovedProductsScreen}/>
        <Tab.Screen name="Pending" component={PendingProductsScreen}/>
    </Tab.Navigator>
    {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/Seller/AddProduct')} activeOpacity={0.7} onLongPress={toggleTheme}>
        <MaterialIcons name="add" size={28} color={colors.light} />
      </TouchableOpacity>
    </View>
  )
}

export default Products

const appStyles = (colors: any) => StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 47,
    height: 47,
    borderRadius: 99,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
})