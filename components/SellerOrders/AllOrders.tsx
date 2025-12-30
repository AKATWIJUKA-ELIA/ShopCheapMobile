import React, { useMemo, useRef, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import OrderDetailsBottomSheet, {OrderDetailsBottomSheetRef, OrderDetails} from "../OrderDetailsBottomSheetView";

const orders: OrderDetails[] = [
  {
    id: "#SC1021",
    customer: "John Doe",
    status: "Active",
    total: "$249.00",
    date: "Oct 25, 2023",
    items: [
      { id: "1", name: "Nike Sneakers", quantity: 1, price: "$120.00" },
      { id: "2", name: "Wireless Headphones", quantity: 1, price: "$129.00" },
    ],
  },
  {
    id: "#SC1020",
    customer: "Sarah Kim",
    status: "Completed",
    total: "$129.99",
    date: "Oct 22, 2023",
    items: [
      { id: "1", name: "Minimalist Watch", quantity: 1, price: "$85.50" },
      { id: "2", name: "Leather Wallet", quantity: 1, price: "$44.49" },
    ],
  },
  {
    id: "#SC1019",
    customer: "Mike Brown",
    status: "Cancelled",
    total: "$89.00",
    date: "Oct 20, 2023",
    items: [
      { id: "1", name: "T-Shirt", quantity: 2, price: "$50.00" },
      { id: "2", name: "Socks", quantity: 1, price: "$39.00" },
    ],
  },
  {
    id: "#SC1018",
    customer: "Emily White",
    status: "Active",
    total: "$320.50",
    date: "Oct 18, 2023",
    items: [
      { id: "1", name: "Backpack", quantity: 1, price: "$120.00" },
      { id: "2", name: "Running Shoes", quantity: 1, price: "$200.50" },
    ],
  },
  {
    id: "#SC1017",
    customer: "David Lee",
    status: "Completed",
    total: "$410.00",
    date: "Oct 15, 2023",
    items: [
      { id: "1", name: "Bluetooth Speaker", quantity: 1, price: "$150.00" },
      { id: "2", name: "Smartwatch", quantity: 1, price: "$260.00" },
    ],
  },
];

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
  const styles = useMemo(() => appStyles(colors), [colors]);

  const bottomSheetRef = useRef<OrderDetailsBottomSheetRef>(null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => bottomSheetRef.current?.open(item)}
          >
            <Text style={styles.orderId}>{item.id}</Text>
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


const appStyles = (colors: any) =>
  StyleSheet.create({
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
