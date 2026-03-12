import Banner, { BannerItem } from "@/components/Banner";
import CategoryTile from "@/components/CategoryTile";
import Recommendations from "@/components/Recommendations";
import RenderItem from "@/components/RenderItem";
import SectionHeader from "@/components/SectionHeader";
import ErrorView from "@/components/ui/ErrorView";
import FloatingButton from "@/components/ui/FloatingBtn";
import HelpCenter, { openHelpSideBar } from "@/components/ui/help";
import { Colors } from "@/constants/Colors";
import { banners as bannerImages } from "@/constants/data";
import { useTheme } from "@/contexts/ThemeContext";
import { CATEGORIES_API_URL, Category, GET_SHOPS_API_URL, Product, PRODUCTS_API_URL } from "@/types/product";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, FlatList, LayoutAnimation, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from "react-native";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const banners = bannerImages;

import { useSearchStore } from "@/components/SearchStore";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

const Home = () => {
  const router = useRouter();
  const { colors, toggleTheme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const { query } = useSearchStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [sortMode, setSortMode] = useState<
    "default" | "price_asc" | "price_desc" | "alpha_asc" | "alpha_desc"
  >("default");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortButtonLayout, setSortButtonLayout] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const sortButtonRef = useRef<View>(null);
  const menuAnim = useRef(new Animated.Value(0)).current;
  const [categories, setCategories] = useState<Category[]>([]);
  const [bannerItems, setBannerItems] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, categoriesRes, shopsRes] = await Promise.all([
        fetch(PRODUCTS_API_URL),
        fetch(CATEGORIES_API_URL),
        fetch(GET_SHOPS_API_URL),
      ]);

      if (!productsRes.ok || !categoriesRes.ok || !shopsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [productsData, categoriesData, shopsData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        shopsRes.json(),
      ]);

      setProducts(productsData.filter((item: Product) => item.approved));
      setCategories(categoriesData);

      // Extract shop banner items (cover, id, name)
      if (Array.isArray(shopsData)) {
        const items: BannerItem[] = shopsData
          .map((shop) => ({
            id: shop._id,
            title: shop.shop_name,
            uri: Array.isArray(shop.cover_image)
              ? shop.cover_image[0]
              : shop.cover_image,
          }))
          .filter((item) => item.uri && typeof item.uri === "string");
        setBannerItems(items);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [sortMode, query]);

  const toggleSortMenu = () => {
    if (!showSortMenu && sortButtonRef.current) {
      sortButtonRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setSortButtonLayout({ x: pageX, y: pageY, width, height });
        setShowSortMenu(true);
        menuAnim.setValue(0);
        Animated.spring(menuAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      });
    } else {
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setShowSortMenu(false));
    }
  };

  const handleSortSelect = (mode: typeof sortMode) => {
    setSortMode(mode);
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setShowSortMenu(false));
  };

  const sortOptions: { label: string; value: typeof sortMode }[] = [
    { label: "Default", value: "default" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "A - Z", value: "alpha_asc" },
    { label: "Z - A", value: "alpha_desc" },
  ];

  const getSortIcon = () => {
    if (sortMode === "default") return "filter";
    if (sortMode === "price_asc") return "sort-numeric-asc";
    if (sortMode === "price_desc") return "sort-numeric-desc";
    if (sortMode === "alpha_asc") return "sort-alpha-asc";
    if (sortMode === "alpha_desc") return "sort-alpha-desc";
    return "filter";
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) =>
      (p.product_name || "")
        .toLowerCase()
        .includes((query || "").toLowerCase()),
    );

    if (sortMode === "price_asc") {
      result.sort(
        (a, b) => parseFloat(a.product_price) - parseFloat(b.product_price),
      );
    } else if (sortMode === "price_desc") {
      result.sort(
        (a, b) => parseFloat(b.product_price) - parseFloat(a.product_price),
      );
    } else if (sortMode === "alpha_asc") {
      result.sort((a, b) => a.product_name.localeCompare(b.product_name));
    } else if (sortMode === "alpha_desc") {
      result.sort((a, b) => b.product_name.localeCompare(a.product_name));
    }

    return result;
  }, [products, query, sortMode]);


  const renderEmptyOrLoading = () => {
    if (loading) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
          }}
        >
          <View
            style={{
              padding: 40,
              alignItems: "center",
              backgroundColor: colors.background,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.text, marginTop: 10 }}>
              Loading products...
            </Text>
          </View>
        </View>
      );
    }

    if (error) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
            paddingVertical: 10,
          }}
        >
          <ErrorView message={error} onRetry={fetchData} />
        </View>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <View
          style={{
            padding: 40,
            alignItems: "center",
            backgroundColor: colors.background,
          }}
        >
          <Text style={{ color: colors.text }}>No products available</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.background }}>
        <FlatList
          data={filteredProducts}
          numColumns={2}
          renderItem={({ item, index }) => (
            <RenderItem item={item} index={index}/>
          )}
          keyExtractor={(item) => item._id}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ padding: 8 }}
          ListHeaderComponent={
            <View style={{ backgroundColor: colors.background, flex: 1 }}>
              <Banner
                images={bannerItems.length > 0 ? bannerItems : (banners as any)}
              />
              <SectionHeader
                title="Top Categories"
                actionText={<Ionicons name="chevron-forward" size={20} color={colors.primary} />}
                onActionPress={() => router.push("/(tabs)/categories")}
              />
              <ScrollView
                horizontal
                style={styles.categoriesWrap}
                showsHorizontalScrollIndicator={false}
              >
                {categories.slice(0, 8).map((c, idx) => (
                  <CategoryTile
                    key={idx}
                    title={c.cartegory || c.title || "No Name"}
                    image={
                      typeof c.image === "string" && c.image.length > 0
                        ? { uri: c.image }
                        : Array.isArray(c.image)
                          ? { uri: c.image[0] }
                          : c.image
                            ? c.image
                            : require("@/assets/images/placeholder.webp")
                    }
                  />
                ))}
              </ScrollView>
              <Recommendations />
                <View
                  style={{
                    backgroundColor: colors.card,
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "row",
                    paddingRight: 8,
                    marginBottom: 4,
                  }}
                >
                  <SectionHeader title="All Products" />
                  <View ref={sortButtonRef} collapsable={false}>
                    <TouchableOpacity
                      style={{ padding: 10 }}
                      onPress={toggleSortMenu}
                    >
                      <FontAwesome name={getSortIcon()} size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            }
            ListEmptyComponent={renderEmptyOrLoading}
            showsVerticalScrollIndicator={false}
          />
        </View>
      <HelpCenter />
      <FloatingButton
        onPress={openHelpSideBar}
        icon="message-alert"
        color={Colors.primary}
        onLongPress={toggleTheme}
      />

      <Modal
        visible={showSortMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowSortMenu(false)}
        >
          <View style={[
            styles.sortDropdown,
            sortButtonLayout && {
              top: sortButtonLayout.y + sortButtonLayout.height - 20,
              right: 16
            }
          ]}>
            <Animated.View style={[
              styles.sortDropdownContent,
              {
                opacity: menuAnim,
                transform: [
                  { scale: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
                  { translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }
                ]
              }
            ]}>
              {sortOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.sortOption,
                    sortMode === opt.value && { backgroundColor: colors.primary + '15' }
                  ]}
                  onPress={() => handleSortSelect(opt.value)}
                >
                  <Text style={[
                    styles.sortOptionText,
                    sortMode === opt.value && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {opt.label}
                  </Text>
                  {sortMode === opt.value && (
                    <FontAwesome name="check" size={14} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Home;

const appStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    categoriesWrap: {
      flexDirection: "row",
    },
    gridWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    sortDropdown: {
      position: 'absolute',
    },
    sortDropdownContent: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 6,
      width: 200,
      elevation: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      borderWidth: 1,
      borderColor: colors.lightgray,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)', // Slightly darker for better focus
    },
    sortOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderRadius: 8,
    },
    sortOptionText: {
      color: colors.text,
      fontSize: 16, // slightly larger for easier tapping
    },
  });
