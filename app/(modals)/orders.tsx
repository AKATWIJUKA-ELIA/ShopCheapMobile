import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/store/useAuthStore";
import { formatPrice, GET_USER_ORDERS_API_URL, getFirstImage, Order, Shop, GET_SHOPS_API_URL } from "@/types/product";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, ScrollView } from "react-native";
import * as Linking from "expo-linking";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export default function OrdersModal() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const styles = useMemo(() => appStyles(colors, width), [colors, width]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sellerShop, setSellerShop] = useState<Shop | null>(null);

  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`${GET_USER_ORDERS_API_URL}?userId=${user._id}`);
      if (!res.ok) {
        setOrders([]);
        return;
      }
      const data = await res.json();
      const fetchedOrders = Array.isArray(data) ? data : (data.orders || []);
      
      // Sort: Latest on top
      const sorted = [...fetchedOrders].sort((a, b) => {
        return new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime();
      });
      
      setOrders(sorted);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const fetchSellerShop = useCallback(async (ownerId: string) => {
    try {
      setSellerShop(null);
      const res = await fetch(GET_SHOPS_API_URL);
      const data: Shop[] = await res.json();
      const shop = data.find((s) => s.owner_id === ownerId);
      if (shop) setSellerShop(shop);
    } catch (err) {
      console.error("Error fetching seller shop:", err);
    }
  }, []);

  useEffect(() => {
    if (selectedOrder?.sellerId) {
      fetchSellerShop(selectedOrder.sellerId);
    } else if (selectedOrder?.product?.product_owner_id) {
       // Fallback if sellerId is missing but product owner is there
       fetchSellerShop(selectedOrder.product.product_owner_id);
    }
  }, [selectedOrder, fetchSellerShop]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return colors.green;
      case "pending":
        return "#f59e0b";
      case "cancelled":
        return "#ef4444";
      default:
        return colors.primary;
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={[
        styles.orderCard,
        { 
          borderLeftColor: getStatusColor(item.order_status),
          borderColor: getStatusColor(item.order_status)
        },
      ]}
      activeOpacity={0.7}
      onPress={() => {
        setSelectedOrder(item);
        translateX.value = withSpring(-width, { damping: 15 });
      }}
    >
      <View style={styles.orderCardContent}>
        <Image
          source={{
            uri:
              getFirstImage(item.product?.product_image) ||
              "https://via.placeholder.com/150",
          }}
          style={styles.orderImage}
          resizeMode="cover"
        />
        <View style={styles.orderInfo}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>
              Order #{item._id.slice(-6).toUpperCase()}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { 
                  backgroundColor: getStatusColor(item.order_status) + "10",
                  borderColor: getStatusColor(item.order_status) + "30",
                  borderWidth: 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.orderStatus,
                  { color: getStatusColor(item.order_status) },
                ]}
              >
                {item.order_status.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.orderDate}>
            Date: {new Date(item._creationTime).toLocaleDateString()}
          </Text>
          <Text style={styles.orderTotal}>
            Total: {formatPrice(item.cost || 0)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.flexContainer}>
      <Animated.View style={[styles.horizontalWrapper, animatedStyle]}>
        {/* Listing Page */}
        <View style={styles.page}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
               <Ionicons name="close" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Orders</Text>
          </View>
          <FlatList
            data={orders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrder}
            ListEmptyComponent={
              loading ? (
                <View style={styles.center}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="receipt-outline"
                    size={48}
                    color={colors.grayish}
                  />
                  <Text style={styles.emptyTitle}>No Orders Yet</Text>
                  <Text style={styles.emptySubtitle}>
                    You haven't made any purchases with this account.
                  </Text>
                </View>
              )
            }
            contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 16, paddingTop: 16 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            showsVerticalScrollIndicator={true}
            style={{ flex: 1 }}
          />
        </View>

        {/* Details Page */}
        <View style={styles.page}>
          <View style={styles.detailsHeader}>
            <TouchableOpacity
              onPress={() => {
                translateX.value = withSpring(0, { damping: 15 });
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={{ paddingVertical: 12 }}>
              <Text style={styles.headerTitle}>Order Details</Text>
              {selectedOrder && (
                <Text style={styles.orderIdText}>
                  #{selectedOrder._id.slice(-8).toUpperCase()}
                </Text>
              )}
            </View>
          </View>
          
          {selectedOrder ? (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Status</Text>
                <View
                  style={[
                    styles.statusBadgeLarge,
                    {
                      backgroundColor:
                        getStatusColor(selectedOrder.order_status) + "10",
                      borderColor: getStatusColor(selectedOrder.order_status) + "30",
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTextLarge,
                      { color: getStatusColor(selectedOrder.order_status) },
                    ]}
                  >
                    {selectedOrder.order_status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Product</Text>
                <View style={styles.productRowDetails}>
                  <Image
                    source={{
                      uri: getFirstImage(selectedOrder.product?.product_image),
                    }}
                    style={styles.detailsProductImage}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfoDetails}>
                    <Text style={styles.productNameDetails} numberOfLines={2}>
                      {selectedOrder.product?.product_name || "Unknown Product"}
                    </Text>
                    <Text style={styles.productQtyDetails}>
                      Quantity: {selectedOrder.quantity}
                    </Text>
                    <Text style={styles.productPriceDetails}>
                      {formatPrice(selectedOrder.product?.product_price || 0)}
                    </Text>
                  </View>
                </View>
              </View>

              {selectedOrder.specialInstructions && (
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Special Instructions</Text>
                  <Text style={styles.instructionsText}>
                    {selectedOrder.specialInstructions}
                  </Text>
                </View>
              )}

              {/* Seller Details Section */}
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Seller Details</Text>
                {sellerShop ? (
                  <View style={styles.sellerCard}>
                    <View style={styles.sellerHeader}>
                      <Image
                        source={{ uri: sellerShop.profile_image || "https://via.placeholder.com/50" }}
                        style={styles.sellerAvatar}
                      />
                      <View>
                        <Text style={styles.sellerName}>{sellerShop.shop_name}</Text>
                        <Text style={styles.sellerSlogan}>{sellerShop.slogan || "Trusted Seller"}</Text>
                        <View style={{ marginTop: 4 }}>
                          {sellerShop.phone && (
                            <Text style={styles.sellerDetailText}>Tel: {sellerShop.phone}</Text>
                          )}
                          {sellerShop.email && (
                            <Text style={styles.sellerDetailText}>Email: {sellerShop.email}</Text>
                          )}
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.sellerActions}>
                      {sellerShop.phone && (
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: colors.green + "15" }]}
                          onPress={() => Linking.openURL(`tel:${sellerShop.phone}`)}
                        >
                          <Ionicons name="call" size={18} color={colors.green} />
                          <Text style={[styles.actionText, { color: colors.green }]}>Call Seller</Text>
                        </TouchableOpacity>
                      )}
                      
                      {sellerShop.email && (
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: colors.primary + "15" }]}
                          onPress={() => Linking.openURL(`mailto:${sellerShop.email}`)}
                        >
                          <Ionicons name="mail" size={18} color={colors.primary} />
                          <Text style={[styles.actionText, { color: colors.primary }]}>Email</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={styles.sellerCardPlaceholder}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={{ color: colors.grayish, marginLeft: 8 }}>Loading seller info...</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailsFooter}>
                <View style={styles.totalRowText}>
                  <Text style={styles.totalLabelText}>Total Price</Text>
                  <Text style={styles.totalValueText}>
                    {formatPrice(selectedOrder.cost || 0)}
                  </Text>
                </View>
                <Text style={styles.footerDateText}>
                  Ordered on{" "}
                  {new Date(selectedOrder._creationTime).toLocaleDateString()}
                </Text>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.center}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const appStyles = (colors: any, width: number) =>
  StyleSheet.create({
    horizontalWrapper: {
      flexDirection: "row",
      width: width * 2,
      height: "100%",
    },
    page: {
      width: width,
      height: "100%",
    },
    flexContainer: {
      flex: 1,
      overflow: 'hidden',
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.grayish + "20",
      alignItems: "center",
      flexDirection: 'row',
      justifyContent: 'center',
    },
    closeButton: {
      position: 'absolute',
      left: 16,
      zIndex: 10,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.primary,
    },
    orderCard: {
      backgroundColor: colors.card || "#1a1a1a",
      borderRadius: 12,
      borderWidth: 0,
      borderColor: colors.grayish + "20",
      borderLeftWidth: 5,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      overflow: 'hidden',
    },
    orderCardContent: {
      flexDirection: "row",
      padding: 12,
      gap: 12,
    },
    orderImage: {
      width: 70,
      height: 70,
      borderRadius: 8,
    },
    orderInfo: {
      flex: 1,
      justifyContent: "center",
    },
    orderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    orderId: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    orderStatus: {
      fontSize: 10,
      fontWeight: "800",
    },
    orderDate: {
      fontSize: 12,
      color: colors.grayish,
      marginBottom: 2,
    },
    orderTotal: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.green,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.grayish,
      textAlign: "center",
      marginTop: 8,
    },
    detailsContainer: {
      flex: 1,
      padding: 20,
    },
    detailsHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.grayish + "20",    
      marginLeft:10
    },
    backButton: {
      padding: 4,
    },
    orderIdText: {
      fontSize: 12,
      color: colors.grayish,
      fontWeight: "600",
    },
    detailsSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 12,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    statusBadgeLarge: {
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    statusTextLarge: {
      fontSize: 12,
      fontWeight: "800",
    },
    productRowDetails: {
      flexDirection: "row",
      gap: 12,
      backgroundColor: colors.card || "#1a1a1a",
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.grayish + "20",
    },
    detailsProductImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
    },
    productInfoDetails: {
      flex: 1,
      justifyContent: "center",
    },
    productNameDetails: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    productQtyDetails: {
      fontSize: 14,
      color: colors.grayish,
      marginBottom: 4,
    },
    productPriceDetails: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.primary,
    },
    instructionsText: {
      fontSize: 14,
      color: colors.text,
      fontStyle: "italic",
      lineHeight: 20,
    },
    detailsFooter: {
      marginTop: "auto",
      borderTopWidth: 1,
      borderTopColor: colors.grayish + "20",
      paddingTop: 15,
      paddingBottom: 20,
    },
    totalRowText: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    totalLabelText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    totalValueText: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.primary,
    },
    footerDateText: {
      fontSize: 12,
      color: colors.grayish,
      textAlign: "right",
    },
    sellerCard: {
      backgroundColor: colors.card || "#1a1a1a",
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.grayish + "20",
      marginTop: 8,
    },
    sellerHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    sellerAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.grayish + "10",
    },
    sellerName: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    sellerSlogan: {
      fontSize: 12,
      color: colors.grayish,
    },
    sellerDetailText: {
      fontSize: 12,
      color: colors.grayish,
      marginTop: 2,
    },
    sellerActions: {
      flexDirection: "row",
      gap: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      borderRadius: 8,
      gap: 8,
    },
    actionText: {
      fontSize: 14,
      fontWeight: "600",
    },
    sellerCardPlaceholder: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: colors.card || "#1a1a1a",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.grayish + "20",
    },
  });
