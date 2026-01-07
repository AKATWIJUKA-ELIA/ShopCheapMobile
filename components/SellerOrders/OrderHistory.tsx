import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { formatPrice, GET_ORDERS_BY_SELLER_API_URL } from '@/types/product';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import OrderDetailsBottomSheet, { OrderDetails, OrderDetailsBottomSheetRef } from "../OrderDetailsBottomSheetView";


export default function OrderHistory() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const bottomSheetRef = useRef<OrderDetailsBottomSheetRef>(null);

  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`${GET_ORDERS_BY_SELLER_API_URL}?sellerId=${user._id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const historyStatuses = ['delivered', 'cancelled'];
        const mapped: OrderDetails[] = data
          .filter(o => historyStatuses.includes(o.order_status.toLowerCase()))
          .map(o => ({
            id: o._id.slice(-6).toUpperCase(),
            customer: `Customer ${o.user_id.slice(-4)}`,
            status: o.order_status,
            total: formatPrice(o.cost || 0),
            date: new Date(o._creationTime).toLocaleDateString(),
            items: [
              {
                id: o.product?._id || o.product_id,
                name: o.product?.product_name || "Unknown Product",
                quantity: o.quantity,
                price: formatPrice((o.cost || 0) / (o.quantity || 1))
              }
            ]
          }));
        setOrders(mapped);
      }
    } catch (error) {
      console.error("Error fetching historical seller orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: colors.grayish }}>No historical orders.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}
            onPress={() => bottomSheetRef.current?.open(item)}
          >
            <View style={styles.row}>
              <Text style={styles.orderId}>#{item.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, colors) + '22' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status, colors) }]}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.customer}>{item.customer}</Text>

            <View style={styles.row}>
              <Text style={styles.total}>{item.total}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <OrderDetailsBottomSheet ref={bottomSheetRef} />
    </View>
  );
}

const getStatusColor = (status: string, colors: any) => {
  switch (status.toLowerCase()) {
    case 'delivered': return colors.success || '#10B981'; // Green
    case 'cancelled': return '#EF4444'; // Red
    default: return colors.grayish;
  }
};

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
  status: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  cancelled: {
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
