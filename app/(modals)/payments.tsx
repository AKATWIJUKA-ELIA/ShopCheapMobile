import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Platform } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import PaymentScreen from '@/components/Account/PaymentScreen';
import { useTheme } from '@/contexts/ThemeContext';

export default function PaymentMethods() {
  const {colors} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {/* <View style={{flexDirection:'row'}}>
        {Platform.OS === 'android'? (
          <TouchableOpacity onPress={() => router.back()} style={{
              backgroundColor:Colors.background, 
              padding:20
            }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary}/>
          </TouchableOpacity>
        ):undefined}

        <Text style={{color:Colors.primary, fontSize:24, fontWeight:'bold', padding:20}}>
          Choose Payment Method
        </Text>
      </View> */}
      <PaymentScreen/>
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    color:Colors.text
  },
  methodCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  selectedCard: {
    backgroundColor: Colors.primary,
  },
  methodText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
});
