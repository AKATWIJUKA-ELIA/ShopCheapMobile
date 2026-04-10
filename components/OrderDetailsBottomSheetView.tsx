import { useTheme } from "@/contexts/ThemeContext";
import { useBottomSheetStore } from "@/store/useBottomSheetStore";
import { Order, formatPrice, getFirstImage } from "@/types/product";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

/* ---------- Types ---------- */
export interface OrderDetailsBottomSheetRef {
  open: (order: Order) => void;
  close: () => void;
}

/* ---------- Component ---------- */
const OrderDetailsBottomSheetView = forwardRef<OrderDetailsBottomSheetRef>((_, ref) => {
  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%", "80%"], []);

  const [order, setOrder] = useState<Order | null>(null);

  /* Expose methods */
  useImperativeHandle(ref, () => ({
    open: (selectedOrder: Order) => {
      setOrder(selectedOrder);
      // Small delay to ensure the previous close animation doesn't interfere
      setTimeout(() => {
        sheetRef.current?.snapToIndex(1);
      }, 100);
    },
    close: () => {
      sheetRef.current?.close();
    },
  }));

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
    />
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}
      backdropComponent={renderBackdrop}
      onChange={(index) => {
        if (index === -1) {
          useBottomSheetStore.getState().closeOrderDetails();
        }
      }}
    >
      <BottomSheetView style={styles.container}>
        {!order ? (
          <View style={styles.center}>
            <Text style={styles.title}>No Order Selected</Text>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Order Details</Text>
              <Text style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.order_status, colors) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(order.order_status, colors) }]}>
                  {order.order_status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product</Text>
              <View style={styles.productRow}>
                <Image
                  source={{ uri: getFirstImage(order.product?.product_image) }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {order.product?.product_name || 'Unknown Product'}
                  </Text>
                  <Text style={styles.productQty}>Quantity: {order.quantity}</Text>
                  <Text style={styles.productPrice}>
                    {formatPrice(order.product?.product_price || 0)}
                  </Text>
                </View>
              </View>
            </View>

            {order.specialInstructions && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Special Instructions</Text>
                <Text style={styles.instructions}>{order.specialInstructions}</Text>
              </View>
            )}

            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Price</Text>
                <Text style={styles.totalValue}>{formatPrice(order.cost || 0)}</Text>
              </View>
              <Text style={styles.date}>Ordered on {new Date(order._creationTime).toLocaleDateString()}</Text>
            </View>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
});

const getStatusColor = (status: string, colors: any) => {
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

export default OrderDetailsBottomSheetView;

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayish + '20',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  orderId: {
    fontSize: 14,
    color: colors.grayish,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  productRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.card || '#1a1a1a',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.grayish + '20',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  productQty: {
    fontSize: 14,
    color: colors.grayish,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  instructions: {
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: colors.grayish + '20',
    paddingTop: 15,
    paddingBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  date: {
    fontSize: 12,
    color: colors.grayish,
    textAlign: 'right',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
