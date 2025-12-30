import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import OrderDetailsBottomSheet, {OrderDetailsBottomSheetRef, OrderDetails} from "../OrderDetailsBottomSheetView";

const PRIMARY = '#f97316';
const SURFACE = '#ffffff';
const BORDER = '#e5e7eb';
const TEXT = '#111827';
const MUTED = '#6b7280';

const activeOrders: OrderDetails[] = [
  {
    id: '#SC1021',
    customer: 'John Doe',
    status: 'Active',
    total: '$249.00',
    date: 'Oct 25, 2023',
    items: [
      { id: '1', name: 'Nike Sneakers', quantity: 1, price: '$120.00' },
      { id: '2', name: 'Wireless Headphones', quantity: 1, price: '$129.00' },
    ],
  },
  {
    id: '#SC1020',
    customer: 'Sarah Kim',
    status: 'Completed',
    total: '$129.99',
    date: 'Oct 22, 2023',
    items: [
      { id: '1', name: 'Minimalist Watch', quantity: 1, price: '$85.50' },
      { id: '2', name: 'Leather Wallet', quantity: 1, price: '$44.49' },
    ],
  },
  {
    id: '#SC1019',
    customer: 'Mike Brown',
    status: 'Cancelled',
    total: '$89.00',
    date: 'Oct 20, 2023',
    items: [
      { id: '1', name: 'T-Shirt', quantity: 2, price: '$50.00' },
      { id: '2', name: 'Socks', quantity: 1, price: '$39.00' },
    ],
  },
  {
    id: '#SC1018',
    customer: 'Emily White',
    status: 'Active',
    total: '$320.50',
    date: 'Oct 18, 2023',
    items: [
      { id: '1', name: 'Backpack', quantity: 1, price: '$120.00' },
      { id: '2', name: 'Running Shoes', quantity: 1, price: '$200.50' },
    ],
  },
  {
    id: '#SC1017',
    customer: 'David Lee',
    status: 'Completed',
    total: '$410.00',
    date: 'Oct 15, 2023',
    items: [
      { id: '1', name: 'Bluetooth Speaker', quantity: 1, price: '$150.00' },
      { id: '2', name: 'Smartwatch', quantity: 1, price: '$260.00' },
    ],
  },
];

export default function ActiveOrders() {
  const router = useRouter();
  const {colors, toggleTheme} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const bottomSheetRef = useRef<OrderDetailsBottomSheetRef>(null);

  return (
    <View style={{flex:1, backgroundColor:colors.background}}>
      <FlatList
        data={activeOrders}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}
             onPress={() => bottomSheetRef.current?.open(item)}
          >
            <View style={styles.row}>
              <Text style={styles.orderId}>{item.id}</Text>
              <Text style={styles.badge}>Active</Text>
            </View>

            <Text style={styles.customer}>{item.customer}</Text>

            <View style={styles.row}>
              <Text style={styles.total}>{item.total}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

       {/* ✅ Reusable BottomSheet */}
      <OrderDetailsBottomSheet ref={bottomSheetRef} />
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightgray,
    padding: 14,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.grayish,
  },
  customer: {
    fontSize: 13,
    color: colors.text,
    marginVertical: 6,
  },
  total: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  date: {
    fontSize: 11,
    color: colors.grayish,
  },
});
