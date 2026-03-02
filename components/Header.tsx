import RecentSearches from "@/components/RecentSearches";
import SearchBar from "@/components/SearchBar"; // ✅ Your custom SearchBar
import { useSearchStore } from "@/components/SearchStore";
import { useTheme } from "@/contexts/ThemeContext";
import { useCartStore } from "@/store/useCartStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Animated, Image, Keyboard, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HelpCenter from "./ui/help";

const HomeHeader = () => {
  const router = useRouter();
  const { query, setQuery, addSearch } = useSearchStore();
  const { items } = useCartStore();
  const distinctCount = items.length;
  const [showSearch, setShowSearch] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const isInteractingRef = useRef(false);
  const [slideAnim] = useState(new Animated.Value(0)); // for smooth animation


  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const { theme, toggleTheme } = useTheme();

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setIsSearchFocused(false);
    }
    Animated.timing(slideAnim, {
      toValue: showSearch ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const onSearchSubmit = () => {
    if (query.trim()) {
      addSearch(query.trim());
      // Here you would typically navigate to search results or filter
      // router.push({ pathname: '/(tabs)/home', params: { search: query } });
    }
    setIsSearchFocused(false);
    Keyboard.dismiss();
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
        <View style={styles.iconButton}
        // onPress={() => router.push('/Seller/(SellerDashboard)')}
        // onLongPress={toggleTheme}
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
        </View>

        {/* Title */}
        <Text style={styles.title}>ShopCheap</Text>

        {/* <Avatar.Text
                size={80}
                label={getInitials(profile.name)}
                style={styles.avatar}
              /> */}

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Search Icon */}
          <TouchableOpacity style={[styles.iconButton, { right: 0, left: 'auto' }]} onPress={toggleSearch}>
            <Ionicons name="search" size={24} color={colors.primary} />
          </TouchableOpacity>

          {/* Cart with badge (distinct products count) */}
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(tabs)/cart')} activeOpacity={0.85}>
            <View>
              <Ionicons name="cart-outline" size={24} color={colors.primary} />
              {distinctCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{distinctCount > 99 ? '99+' : distinctCount}</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <HelpCenter />

      {/* Animated SearchBar */}
      {showSearch && (
        <Animated.View style={[styles.searchWrapper, { transform: [{ translateY: slideDown }] }]}>
          <SearchBar
            placeholder="Search..."
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => {
              setTimeout(() => {
                if (!isInteractingRef.current) {
                  setIsSearchFocused(false);
                }
                isInteractingRef.current = false;
              }, 200);
            }}
            onSubmitEditing={onSearchSubmit}
          />
          {isSearchFocused && (
            <RecentSearches onInteraction={() => { isInteractingRef.current = true; }} />
          )}
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
    elevation: 10, // Higher elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 100, // Ensure header is above page content
    position: 'relative', // for absolute children
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
    zIndex: 200, // Above other header elements
  },
});
