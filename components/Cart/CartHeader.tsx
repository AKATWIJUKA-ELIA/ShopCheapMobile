import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from '@/store/useCartStore';
import { formatPrice, GET_USER_ORDERS_API_URL, Order } from "@/types/product";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "@react-native-community/blur";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";


const { height } = Dimensions.get("window");

const CartHeader = ({ title = "My Cart" }) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { total } = useCartStore();

  //for the bottomsheet modal
  const [visible, setVisible] = useState(false);
  const translateY = useState(new Animated.Value(height))[0];

  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`${GET_USER_ORDERS_API_URL}?userId=${user._id}`);

      if (!res.ok) {
        const text = await res.text();
        console.error(`Orders Fetch Failed (${res.status}):`, text);
        setOrders([]);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchOrders();
    }
  }, [visible]);


  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      activeOpacity={0.7}
      onPress={() => {
        closeModal();
        router.push({ pathname: '/Screens/order-details/[id]', params: { id: item._id } });
      }}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.order_status) + '20' }]}>
          <Text style={[styles.orderStatus, { color: getStatusColor(item.order_status) }]}>{item.order_status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.orderDate}>Date: {new Date(item._creationTime).toLocaleDateString()}</Text>
      <Text style={styles.orderTotal}>Total: {formatPrice(item.cost || 0)}</Text>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return '#22c55e';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return colors.primary;
    }
  };

  //for the bottomsheet modal

  const openModal = () => {
    setVisible(true);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.state === 5) {
      // 5 = GestureHandlerState.END
      if (nativeEvent.translationY > 150) {
        closeModal();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <View style={styles.header}>
      {/* Back Button */}
      <View style={styles.iconButton}>
        <Ionicons name="cart" size={24} color={colors.primary} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{formatPrice(total)}</Text>

      <TouchableOpacity style={styles.iconButton} onPress={openModal}>
        <MaterialCommunityIcons name="order-bool-descending" size={24} color={colors.primary} />
      </TouchableOpacity>


      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={closeModal}
      >
        {/* Bottom Sheet */}
        <BlurView style={styles.overlay}
          blurType="light"
          blurAmount={5}
        >
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [{
                    translateY: translateY.interpolate({
                      inputRange: [0, height],
                      outputRange: [0, height],
                      extrapolate: "clamp",
                    }),
                  }]
                },
              ]}
            >
              <View style={[styles.orderHeader, { marginBottom: 16, borderBottomColor: colors.primary, borderBottomWidth: 1 }]}>
                <Text style={[styles.headerTitle, { padding: 10 }]}>My Orders</Text>
                <View style={{ width: 24 }} />
              </View>

              <TouchableOpacity onPress={closeModal} style={{
                position: 'absolute',
                top: 12,
                right: 12
              }}>
                <Ionicons name="caret-down" size={24} color={colors.grayish} />
              </TouchableOpacity>


              {loading ? (
                <View style={styles.center}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : orders.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={48} color={colors.grayish} />
                  <Text style={styles.emptyTitle}>No Orders Yet</Text>
                  <Text style={styles.emptySubtitle}>You haven't made any purchases with this account.</Text>
                </View>
              ) : (
                <FlatList
                  data={orders}
                  keyExtractor={(item) => item._id}
                  renderItem={renderOrder}
                  contentContainerStyle={{ padding: 16 }}
                  ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                  showsVerticalScrollIndicator={false}
                />
              )}
              {/* <Pressable style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable> */}
            </Animated.View>
          </PanGestureHandler>
        </BlurView>
      </Modal>


    </View>
  );
};

export default CartHeader;

const appStyles = (colors: any) => StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  iconButton: {
    padding: 6,
    borderRadius: 50,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  clearButton: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 99,
    backgroundColor: 'red'
  },
  clearText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
  },



  //styles for the bottomsheet modal
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: height * 0.91, // adjust this to 0.25 (quarter), 0.5 (half), 0.75 (three-quarters)
    backgroundColor: colors.gray,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 5,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 10,
    alignSelf: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
  },



  //for orders
  orderContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // orderHeader: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   padding: 16,
  //   backgroundColor: Colors.primary,
  // },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  orderCard: {
    backgroundColor: colors.card,
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
    color: colors.light
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
  },
  orderStatus: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray,
  },
  center: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.dark,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.grayish,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});
