import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/store/useAuthStore";
import { formatPrice, GET_ORDERS_BY_SELLER_API_URL } from "@/types/product";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import OrderDetailsBottomSheet, { OrderDetails, OrderDetailsBottomSheetRef } from "../OrderDetailsBottomSheetView";


// export default function AllOrders() {
//   const { colors } = useTheme();
//   const styles = useMemo(() => appStyles(colors), [colors]);

//   const sheetRef = useRef<BottomSheet>(null);
//   const snapPoints = useMemo(() => ["30%", "60%"], []);

//   const [selectedOrder, setSelectedOrder] = useState<any>(null);

//   const openOrder = (order: any) => {
//     setSelectedOrder(order);
//     sheetRef.current?.expand(); // This expands the sheet
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.background }}>
//       <FlatList
//         data={orders}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={{ padding: 16 }}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             style={styles.card}
//             onPress={() => openOrder(item)}
//           >
//             <Text style={styles.orderId}>{item.id}</Text>
//             <Text style={styles.customer}>{item.customer}</Text>
//             <View style={styles.row}>
//               <Text style={styles.total}>{item.total}</Text>
//               <Text style={styles.date}>{item.date}</Text>
//             </View>
//           </TouchableOpacity>
//         )}
//       />

//       {/* Non-modal BottomSheet as per docs */}
//       <BottomSheet
//         ref={sheetRef}
//         index={-1} // start closed
//         snapPoints={snapPoints}
//         enablePanDownToClose
//       >
//         <BottomSheetView style={styles.sheetContent}>
//           {selectedOrder ? (
//             <>
//               <Text style={styles.sheetTitle}>Order {selectedOrder.id}</Text>
//               <FlatList
//                 data={selectedOrder.items}
//                 keyExtractor={(i) => i.id}
//                 renderItem={({ item }) => (
//                   <View style={styles.itemRow}>
//                     <Text>{item.name}</Text>
//                     <Text>x{item.quantity}</Text>
//                     <Text>{item.price}</Text>
//                   </View>
//                 )}
//               />
//               <Text style={styles.totalLabel}>
//                 Total: {selectedOrder.total}
//               </Text>
//             </>
//           ) : (
//             <Text style={styles.sheetTitle}>No Order Selected</Text>
//           )}
//         </BottomSheetView>
//       </BottomSheet>
//     </View>
//   );
// }

export default function AllOrders() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const bottomSheetRef = useRef<OrderDetailsBottomSheetRef>(null);

  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`${GET_ORDERS_BY_SELLER_API_URL}?sellerId=${user._id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped: OrderDetails[] = data.map(o => ({
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
      console.error("Error fetching seller orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={18} color={colors.grayish} />
          <TextInput
            placeholder="Search orders (ID, Customer)..."
            placeholderTextColor={colors.grayish}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: colors.grayish }}>No orders found.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
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
    case 'pending': return '#F59E0B'; // Amber
    case 'confirmed': return '#3B82F6'; // Blue
    case 'out-for-delivery': return '#8B5CF6'; // Violet
    case 'delivered': return colors.success || '#10B981'; // Green
    case 'cancelled': return '#EF4444'; // Red
    default: return colors.grayish;
  }
};


const appStyles = (colors: any) =>
  StyleSheet.create({
    searchRow: {
      flexDirection: "row",
      padding: 16,
      paddingBottom: 8,
      backgroundColor: colors.background
    },
    searchBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      paddingHorizontal: 10,
      borderRadius: 10,
      borderColor: colors.lightgray,
      borderWidth: 1
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      marginLeft: 6,
      color: colors.text,
      height: 40
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.lightgray,
      padding: 14,
      marginBottom: 12,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between"
    },
    orderId: {
      fontWeight: "700",
      color: colors.text
    },
    customer: {
      marginVertical: 6,
      color: colors.text
    },
    total: {
      fontWeight: "700",
      color: colors.primary
    },
    date: {
      color: colors.grayish
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
    sheetContent: {
      padding: 16,
      flex: 1
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 12
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    totalLabel: {
      fontSize: 16,
      marginTop: 12,
      fontWeight: "700"
    },
  });
