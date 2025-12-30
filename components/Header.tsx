import { useSearchStore } from "@/components/SearchStore";
// import { useCartStore } from "@/components/Operations";
import SearchBar from "@/components/SearchBar"; // ✅ Your custom SearchBar
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HelpCenter from "./ui/help";

const HomeHeader = () => {
  const router = useRouter();
  const { query, setQuery } = useSearchStore();
  // const { items } = useCartStore();
  // const distinctCount = items.length;
  const [showSearch, setShowSearch] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0)); // for smooth animation

  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const { theme, toggleTheme } = useTheme();

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      // Reset search when closing? Optional. Based on UX preference. 
      // For now, let's keep it so user can see what they searched.
    }
    Animated.timing(slideAnim, {
      toValue: showSearch ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const slideDown = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0], // Slide from hidden (-60) to visible (0)
  });

  return (
    <View style={styles.header}>
      {/* Top Row: Menu + Title + Search + Cart */}
      <View style={styles.topRow}>
        {/* Menu */}
        <TouchableOpacity style={styles.iconButton}
          onPress={() => router.push('/Seller/(SellerDashboard)')}
          onLongPress={toggleTheme}
        >
          {/* <Ionicons name="menu" size={26} color={Colors.primary} /> */}
          <Image source={require('@/assets/images/sc.png')}
            style={{
              width: 30,
              height: 30,
              marginRight: 4,
              borderRadius: 99,
            }}
          />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>ShopCheap</Text>

        {/* <Avatar.Text
                size={80}
                label={getInitials(profile.name)}
                style={styles.avatar}
              /> */}

        {/* Search Icon */}
        <TouchableOpacity style={[styles.iconButton, { right: 0, left: 'auto' }]} onPress={toggleSearch}>
          <Ionicons name="search" size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* Cart with badge (distinct products count)
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(tabs)/cart')} activeOpacity={0.85}>
          <View>
            <Ionicons name="cart-outline" size={24} color={colors.primary} />
            {distinctCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{distinctCount > 99 ? '99+' : distinctCount}</Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity> */}
      </View>

      <HelpCenter />

      {/* Animated SearchBar */}
      {showSearch && (
        <Animated.View style={[styles.searchWrapper, { transform: [{ translateY: slideDown }] }]}>
          <SearchBar placeholder="Search..." value={query} onChangeText={setQuery} />
        </Animated.View>
      )}


    </View>
  );
};

export default HomeHeader;

const appStyles = (colors: any) => StyleSheet.create({
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  iconButton: {
    padding: 6,
    borderRadius: 50,
    backgroundColor: colors.background,
    marginHorizontal: 2,
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1
  },
  badgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800'
  },
  searchWrapper: {
    paddingHorizontal: 16,
    marginBottom: 5,
  },
});
