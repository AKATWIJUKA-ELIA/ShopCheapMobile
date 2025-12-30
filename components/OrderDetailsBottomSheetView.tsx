import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@/contexts/ThemeContext";

/* ---------- Types ---------- */
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: string;
}

export interface OrderDetails {
  id: string;
  customer: string;
  status: string;
  total: string;
  date: string;
  items: OrderItem[];
}

export interface OrderDetailsBottomSheetRef {
  open: (order: OrderDetails) => void;
  close: () => void;
}

/* ---------- Component ---------- */
const OrderDetailsBottomSheet = forwardRef<
  OrderDetailsBottomSheetRef
>((_, ref) => {
  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%", "60%", "90%"], []);

  const [order, setOrder] = useState<OrderDetails | null>(null);

  /* Expose methods */
  useImperativeHandle(ref, () => ({
    open: (selectedOrder: OrderDetails) => {
      setOrder(selectedOrder);
      sheetRef.current?.expand();
    },
    close: () => {
      sheetRef.current?.close();
    },
  }));

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}
      overDragResistanceFactor={10}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}   // hide backdrop when sheet is closed
          appearsOnIndex={0}       // show backdrop when sheet is open
          opacity={0.7}            // dimming strength (0 to 1)
          
        />
      )}
      
    >
      <BottomSheetView style={styles.container}>
        {!order ? (
          <Text style={styles.title}>No Order Selected</Text>
        ) : (
          <>
            <Text style={styles.title}>Order {order.id}</Text>

            <FlatList
              data={order.items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={{color: colors.text}}>x{item.quantity}</Text>
                  <Text style={styles.price}>{item.price}</Text>
                </View>
              )}
            />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{order.total}</Text>
            </View>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
});

export default OrderDetailsBottomSheet;

/* ---------- Styles ---------- */
const appStyles = (colors: any) => StyleSheet.create({
    container: { 
      flex: 1, 
      padding: 16, 
      backgroundColor: colors.background
     },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.primary,
      marginBottom: 12,
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderColor: colors.lightgray,
    },
    itemName: { 
      color: colors.text 
    },
    price: { 
      fontWeight: "600", 
      color: colors.primary 
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
    },
    totalLabel: { 
      fontWeight: "700" ,
      color: colors.text
    },
    totalValue: { 
      fontWeight: "700", 
      color: colors.primary 
    },
  });
