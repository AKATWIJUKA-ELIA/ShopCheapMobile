import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Animated, Dimensions, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { useCartStore } from "../Operations";
import { useTheme } from "@/contexts/ThemeContext";
import { BlurView } from "@react-native-community/blur";



const { height } = Dimensions.get("window");

const orders = [
  {
    id: '1',
    date: '2025-09-01',
    status: 'Delivered',
    total: 120000,
  },
  {
    id: '2',
    date: '2025-09-05',
    status: 'Processing',
    total: 85000,
  },
  {
    id: '3',
    date: '2025-09-08',
    status: 'Cancelled',
    total: 45000,
  },
  {
    id: '4',
    date: '2025-09-08',
    status: 'Cancelled',
    total: 45000,
  },
  {
    id: '5',
    date: '2025-09-08',
    status: 'Cancelled',
    total: 45000,
  },
  {
    id: '6',
    date: '2025-09-08',
    status: 'Cancelled',
    total: 45000,
  },
  {
    id: '7',
    date: '2025-09-08',
    status: 'Completed',
    total: 45000,
  },
];

const CartHeader = ({ title = "My Cart" }) => {
  const router = useRouter();
  const { items, total } = useCartStore();
  const translateY = useState(new Animated.Value(height))[0];

  const {colors} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);


  const renderOrder = ({ item }: any) => (
    <TouchableOpacity style={styles.orderCard} activeOpacity={0.5}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <Text style={styles.orderStatus}>{item.status}</Text>
      </View>
      <Text style={styles.orderDate}>Date: {item.date}</Text>
      <Text style={styles.orderTotal}>Total: UGX {item.total.toLocaleString()}</Text>
    </TouchableOpacity>
  );


  //for the bottomsheet modal
  const [visible, setVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(height));

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
      <Text style={styles.title}>${total.toFixed(2)}</Text>

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
                { transform: [{ 
                  translateY: translateY.interpolate({
                      inputRange: [0, height],
                      outputRange: [0, height],
                      extrapolate: "clamp",
                    }),
                }] },
              ]}
            >
              <View style={[styles.orderHeader, { marginBottom: 16, borderBottomColor: colors.primary, borderBottomWidth:1 }]}>
                <Text style={[styles.headerTitle, {padding:10}]}>My Orders</Text>
                <View style={{ width: 24 }} /> 
              </View>

              <TouchableOpacity onPress={closeModal} style={{
                position: 'absolute',
                top: 12,
                right: 12
              }}>
                <Ionicons name="caret-down" size={24} color={colors.grayish}/>
              </TouchableOpacity>


              <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={renderOrder}
                contentContainerStyle={{ padding: 16 }}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                showsVerticalScrollIndicator={false}
              />
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
    backgroundColor: colors.lightgray,
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
    color: colors.primary,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  orderDate: {
    fontSize: 14,
    color: colors.grayish,
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.grayish,
  }, 
});
