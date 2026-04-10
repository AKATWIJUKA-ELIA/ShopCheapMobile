import React, { useMemo, useState } from 'react';
import { Colors } from '@/constants/Colors';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

export default function Notifications() {
  const {colors} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Order Shipped', message: 'Your order #1234 has been shipped.', read: false },
    { id: 2, title: 'New Promo', message: 'Get 20% off on electronics this week.', read: true },
    { id: 3, title: 'Order Delivered', message: 'Your order #1220 has been delivered.', read: false },
  ]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.notificationCard, item.read && styles.readCard]} onPress={() => markAsRead(item.id)}>
      <Text style={[styles.title, item.read && { color: '#9ca3af' }]}>{item.title}</Text>
      <Text style={[styles.message, item.read && { color: '#9ca3af' }]}>{item.message}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={{flexDirection:'row'}}>
        {Platform.OS === 'android'? (
          <TouchableOpacity onPress={() => router.back()} style={{
            backgroundColor:colors.background, 
            padding:20
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary}/>
        </TouchableOpacity>
        ): undefined}

        <Text style={{color:Colors.primary, fontSize:24, fontWeight:'bold', padding:20}}>
          {`${notifications.filter(n => !n.read).length} Unread`}
        </Text>
      </View>
      
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notificationCard: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  readCard: {
    backgroundColor: colors.gray,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color:colors.dark
  },
  message: {
    fontSize: 14,
    color: colors.dark,
  },
});