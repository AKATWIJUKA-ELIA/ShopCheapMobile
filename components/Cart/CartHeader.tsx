import { useTheme } from "@/contexts/ThemeContext";
import { useBottomSheetStore } from "@/store/useBottomSheetStore";
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from "@/types/product";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CartHeader = ({ title = "My Cart" }) => {
  const router = useRouter();
  const { total } = useCartStore();
  const { openOrdersBottomSheet } = useBottomSheetStore();

  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      {/* Back Button */}
      <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>{formatPrice(total)}</Text>

      <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(modals)/orders')} activeOpacity={0.85}>
        <MaterialCommunityIcons name="order-bool-descending" size={24} color={colors.primary} />
      </TouchableOpacity>
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
    borderBottomColor: colors.grayish + '20',
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
});
