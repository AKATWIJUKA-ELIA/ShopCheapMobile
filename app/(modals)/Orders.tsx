import { View, FlatList, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import React, { useMemo } from 'react';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

const orders = [
  {
    id: '1',
    date: '2025-09-01',
    status: 'Delivered',
    total: 120000,
  },
  {
    id: '2',
    date: '2025-09-05',
    status: 'Processing',
    total: 85000,
  },
  {
    id: '3',
    date: '2025-09-08',
    status: 'Cancelled',
    total: 45000,
  },
  {
    id: '4',
    date: '2025-09-08',
    status: 'Cancelled',
    total: 45000,
  },
  {
    id: '5',
    date: '2025-09-08',
    status: 'Cancelled',
    total: 45000,
  },
  {
    id: '6',
    date: '2025-09-08',
    status: 'Cancelled',
    total: 45000,
  },
  {
    id: '7',
    date: '2025-09-08',
    status: 'Completed',
    total: 45000,
  },
];

const OrdersScreen = () => {
  const router = useRouter();
  const {colors, theme} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const renderOrder = ({ item }: any) => (
    <TouchableOpacity style={styles.orderCard} activeOpacity={0.5}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <Text style={styles.orderStatus}>{item.status}</Text>
      </View>
      <Text style={styles.orderDate}>Date: {item.date}</Text>
      <Text style={styles.orderTotal}>Total: UGX {item.total.toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        {Platform.OS === 'android'? (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        ):undefined}
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default OrdersScreen;

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  orderCard: {
    backgroundColor: colors.grayish,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  orderDate: {
    fontSize: 14,
    color: Colors.grayish,
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
});
