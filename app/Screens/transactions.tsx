import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { formatPrice, GET_USER_ORDERS_API_URL } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TransactionsPage() {
  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const router = useRouter();
  const { user } = useAuthStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${GET_USER_ORDERS_API_URL}?userId=${user._id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        // Handle cases where data might be { success: true, orders: [...] }
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching user orders:", err);
      // Fallback to empty if API fails (since buyer orders might not be symmetrical)
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const getStatusInfo = (status: string) => {
    const s = status?.toLowerCase() || 'pending';
    switch (s) {
      case 'delivered':
      case 'completed':
      case 'paid':
        return { color: '#22c55e', bg: '#dcfce7', icon: 'checkmark-circle' };
      case 'pending':
      case 'processing':
        return { color: '#f59e0b', bg: '#fef3c7', icon: 'time' };
      case 'out-for-delivery':
        return { color: '#3b82f6', bg: '#dbeafe', icon: 'bicycle' };
      case 'cancelled':
      case 'failed':
        return { color: '#ef4444', bg: '#fee2e2', icon: 'close-circle' };
      default:
        return { color: colors.grayish, bg: colors.borderLine, icon: 'help-circle' };
    }
  };

  const renderOrder = ({ item, index }: { item: any, index: number }) => {
    const status = getStatusInfo(item.order_status || item.status);
    const date = item._creationTime ? new Date(item._creationTime).toLocaleDateString() : (item.date || 'Recent');
    const cost = item.cost || item.amount || 0;

    return (
      <View style={styles.timelineItem}>
        {/* Timeline Path */}
        <View style={styles.timelinePath}>
          <View style={[styles.timelineNode, { backgroundColor: status.color }]} />
          {index !== orders.length - 1 && <View style={styles.timelineLine} />}
        </View>

        {/* Content Card */}
        <TouchableOpacity style={styles.orderCard} activeOpacity={0.8}>
          <View style={styles.orderTop}>
            <View>
              <Text style={styles.orderDate}>{date}</Text>
              <Text style={styles.orderId}>ID: {item._id?.slice(-8).toUpperCase() || item.id}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Ionicons name={status.icon as any} size={14} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>
                {(item.order_status || item.status || 'PENDING').toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.orderBottom}>
            <Text style={styles.productName}>{item.product?.product_name || 'Multiple Items'}</Text>
            <Text style={styles.amountText}>{formatPrice(cost)}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="receipt-outline" size={48} color={colors.grayish} />
          </View>
          <Text style={styles.emptyTitle}>No Transactions</Text>
          <Text style={styles.emptySubtitle}>You haven't made any purchases yet.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const appStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    timelineItem: {
      flexDirection: 'row',
      minHeight: 100,
    },
    timelinePath: {
      width: 30,
      alignItems: 'center',
    },
    timelineNode: {
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 3,
      borderColor: colors.background,
      zIndex: 1,
      marginTop: 20,
    },
    timelineLine: {
      flex: 1,
      width: 2,
      backgroundColor: colors.borderLine,
      marginTop: -10,
    },
    orderCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      marginBottom: 20,
      marginLeft: 10,
      borderWidth: 1,
      borderColor: colors.borderLine,
      shadowColor: "#000",
      shadowOpacity: 0.03,
      shadowRadius: 10,
      elevation: 2,
    },
    orderTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    orderDate: {
      fontSize: 12,
      color: colors.grayish,
      fontWeight: '600',
    },
    orderId: {
      fontSize: 11,
      color: colors.grayish,
      marginTop: 2,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '800',
    },
    orderBottom: {
      borderTopWidth: 1,
      borderTopColor: colors.borderLine,
      paddingTop: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    productName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
      marginRight: 10,
    },
    amountText: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.primary,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyIconBox: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.grayish,
      textAlign: 'center',
    },
  });
