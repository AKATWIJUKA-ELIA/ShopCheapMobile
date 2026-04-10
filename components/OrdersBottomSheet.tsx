import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/store/useAuthStore";
import { useBottomSheetStore } from "@/store/useBottomSheetStore";
import { formatPrice, GET_USER_ORDERS_API_URL, getFirstImage, Order } from "@/types/product";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

export interface OrdersBottomSheetRef {
    open: () => void;
    close: () => void;
}

const OrdersBottomSheet = forwardRef<OrdersBottomSheetRef>((_, ref) => {
    const { colors } = useTheme();
    const { user } = useAuthStore();
    const router = useRouter();
    const styles = useMemo(() => appStyles(colors), [colors]);

    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["50%", "70%", "90%"], []);

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

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
    }, [user]);

    useImperativeHandle(ref, () => ({
        open: () => {
            fetchOrders();
            sheetRef.current?.expand();
        },
        close: () => {
            sheetRef.current?.close();
        },
    }));

    const openOrderDetails = useBottomSheetStore(state => state.openOrderDetails);

    const renderOrder = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={styles.orderCard}
            activeOpacity={0.7}
            onPress={() => {
                openOrderDetails(item);
            }}
        >
            <View style={styles.orderCardContent}>
                <Image
                    source={{ uri: getFirstImage(item.product?.product_image) || 'https://via.placeholder.com/150' }}
                    style={styles.orderImage}
                    resizeMode="cover"
                />
                <View style={styles.orderInfo}>
                    <View style={styles.orderHeader}>
                        <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.order_status) + '20' }]}>
                            <Text style={[styles.orderStatus, { color: getStatusColor(item.order_status) }]}>
                                {item.order_status.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.orderDate}>Date: {new Date(item._creationTime).toLocaleDateString()}</Text>
                    <Text style={styles.orderTotal}>Total: {formatPrice(item.cost || 0)}</Text>
                </View>
            </View>
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

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
            />
        ),
        []
    );

    return (
        <BottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            backgroundStyle={{ backgroundColor: colors.background }}
            handleIndicatorStyle={{ backgroundColor: colors.primary }}
            onChange={(index) => {
                if (index === -1) {
                    useBottomSheetStore.getState().closeOrdersBottomSheet();
                }
            }}
        >
            <BottomSheetView style={styles.contentContainer}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Orders</Text>
                </View>

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
                    <BottomSheetFlatList
                        data={orders}
                        keyExtractor={(item) => item._id}
                        renderItem={renderOrder}
                        contentContainerStyle={{ padding: 16 }}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </BottomSheetView>
        </BottomSheet>
    );
});

const appStyles = (colors: any) => StyleSheet.create({
    contentContainer: {
        flex: 1,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayish + '20',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
    },
    orderCard: {
        backgroundColor: colors.card || '#1a1a1a',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.grayish + '20',
    },
    orderCardContent: {
        flexDirection: 'row',
        gap: 12,
    },
    orderImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
    },
    orderInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    orderId: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    orderStatus: {
        fontSize: 10,
        fontWeight: '800',
    },
    orderDate: {
        fontSize: 12,
        color: colors.grayish,
        marginBottom: 2,
    },
    orderTotal: {
        fontSize: 15,
        fontWeight: '800',
        color: colors.primary,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.grayish,
        textAlign: 'center',
        marginTop: 8,
    },
});

export default OrdersBottomSheet;
