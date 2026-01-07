import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { formatPrice, GET_USER_ORDERS_API_URL, Order } from '@/types/product';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OrderDetailsScreen() {
    const { id } = useLocalSearchParams();
    const { colors } = useTheme();
    const router = useRouter();
    const { user } = useAuthStore();
    const styles = useMemo(() => appStyles(colors), [colors]);

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrderDetails = async () => {
        if (!user || !id) return;
        try {
            setLoading(true);
            const res = await fetch(`${GET_USER_ORDERS_API_URL}?userId=${user._id}`);
            const data = await res.json();
            const ordersList = Array.isArray(data) ? data : (data.orders || []);
            const foundOrder = ordersList.find((o: Order) => o._id === id);
            setOrder(foundOrder || null);
        } catch (error) {
            console.error("Error fetching order details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id, user]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.center}>
                <Text style={{ color: colors.grayish }}>Order not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const orderStatus = order.order_status?.toLowerCase() || 'pending';
    const statusColor = orderStatus === 'completed' || orderStatus === 'delivered' ? '#22c55e' :
        orderStatus === 'cancelled' ? '#ef4444' : '#f59e0b';

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Status Card */}
                <View style={styles.statusCard}>
                    <View style={[styles.statusIcon, { backgroundColor: statusColor + '20' }]}>
                        <MaterialCommunityIcons
                            name={orderStatus === 'completed' || orderStatus === 'delivered' ? "check-decagram" : "clock-outline"}
                            size={32}
                            color={statusColor}
                        />
                    </View>
                    <Text style={styles.statusLabel}>Order Status</Text>
                    <Text style={[styles.statusValue, { color: statusColor }]}>{orderStatus.toUpperCase()}</Text>
                    <Text style={styles.orderIdText}>Order ID: #{order._id.toUpperCase()}</Text>
                </View>

                {/* Items Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Items</Text>
                    <View style={styles.card}>
                        <View style={styles.itemRow}>
                            <Image
                                source={{ uri: Array.isArray(order.product?.product_image) ? order.product.product_image[0] : order.product?.product_image }}
                                style={styles.itemImage}
                            />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName} numberOfLines={1}>{order.product?.product_name || 'Product Name'}</Text>
                                <Text style={styles.itemQty}>Quantity: {order.quantity}</Text>
                                <Text style={styles.itemPrice}>{formatPrice(order.product?.product_price || 0)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Payment Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Summary</Text>
                    <View style={styles.card}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>{formatPrice(order.cost || 0)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Text style={styles.summaryValue}>UGX 0</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>{formatPrice(order.cost || 0)}</Text>
                        </View>
                    </View>
                </View>

                {/* Additional Info */}
                {(order.specialInstructions || order._creationTime) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Additional Information</Text>
                        <View style={styles.card}>
                            {order._creationTime && (
                                <View style={styles.infoRow}>
                                    <Feather name="calendar" size={16} color={colors.grayish} />
                                    <Text style={styles.infoText}>Placed on {new Date(order._creationTime).toLocaleString()}</Text>
                                </View>
                            )}
                            {order.specialInstructions && (
                                <View style={[styles.infoRow, { marginTop: 12 }]}>
                                    <Feather name="info" size={16} color={colors.grayish} />
                                    <Text style={styles.infoText}>{order.specialInstructions}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                <TouchableOpacity style={styles.helpBtn} activeOpacity={0.8}>
                    <Feather name="message-circle" size={18} color={colors.primary} />
                    <Text style={styles.helpBtnText}>Need Help with this Order?</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const appStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 16,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.primary,
        letterSpacing: 0.5,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    statusCard: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: colors.card,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.borderLine,
        marginBottom: 24,
    },
    statusIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusLabel: {
        fontSize: 14,
        color: colors.grayish,
        fontWeight: '600',
        marginBottom: 4,
    },
    statusValue: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 8,
    },
    orderIdText: {
        fontSize: 11,
        color: colors.grayish,
        textTransform: 'uppercase',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.grayish,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.borderLine,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: colors.primary + '10',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 16,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    itemQty: {
        fontSize: 13,
        color: colors.grayish,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: '800',
        color: colors.primary,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.grayish,
    },
    summaryValue: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLine,
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.primary,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    infoText: {
        fontSize: 13,
        color: colors.text,
        flex: 1,
    },
    helpBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.primary,
        marginTop: 8,
    },
    helpBtnText: {
        color: colors.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    backBtn: {
        marginTop: 20,
        padding: 10,
    }
});
