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
import { ShopData } from "@/types/webTypes";
import { CATEGORIES_API_URL,
        Category,
        GET_SHOPS_API_URL,
        Product,
        PRODUCTS_API_URL,
        AUTH_TOKEN
} from "@/types/product";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from "react-native";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const banners = bannerImages;

import { useSearchStore } from "@/components/SearchStore";
import { FontAwesome } from "@expo/vector-icons";

const Home = () => {
  const router = useRouter();
  const { colors, toggleTheme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const { query } = useSearchStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [sortMode, setSortMode] = useState<
    "default" | "price_asc" | "price_desc" | "alpha_asc" | "alpha_desc"
  >("default");
  const [categories, setCategories] = useState<Category[]>([]);
  const [bannerItems, setBannerItems] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
        // console.log("base url:", PRODUCTS_API_URL);
        // console.log("auth token:", AUTH_TOKEN);
      const [productsRes, categoriesRes, shopsRes] = await Promise.all([
        fetch(PRODUCTS_API_URL,{
                headers: {
                        'Content-Type': 'application/json',
                        "X-Auth-Token": AUTH_TOKEN
                },
               method: "GET",
        }),

        fetch(CATEGORIES_API_URL,{
                headers: {
                        'Content-Type': 'application/json',
                        "X-Auth-Token": AUTH_TOKEN
                },
               method: "GET",
        }),
        fetch(GET_SHOPS_API_URL,{
                headers: {
                        'Content-Type': 'application/json',
                        "X-Auth-Token": AUTH_TOKEN, 
                },
               method: "GET",
        }),
      ]);

      if (!productsRes 
        // || !categoriesRes.ok || !shopsRes.ok
) {
        throw new Error("Failed to fetch data");
      }

      const [productsData, categoriesData, shopsData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        shopsRes.json(),
      ]);
// console.log("categories response status:",categoriesData);
      setProducts(productsData?.data?.page);
      setCategories(categoriesData.data);

      // Extract shop banner items (cover, id, name)
      if (Array.isArray(shopsData.data)) {
        const items: BannerItem[] = shopsData.data
          .map((shop: ShopData) => ({
            id: shop._id,
            title: shop.shop_name,
            uri: Array.isArray(shop.cover_image)
              ? shop.cover_image[0]
              : shop.cover_image,
          }))
          .filter((item: BannerItem) => item.uri && typeof item.uri === "string");
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

  const handleSortCycle = () => {
    setSortMode((current) => {
      if (current === "default") return "price_asc";
      if (current === "price_asc") return "price_desc";
      if (current === "price_desc") return "alpha_asc";
      if (current === "alpha_asc") return "alpha_desc";
      return "default";
    });
  };

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
          <View style={{ height: 200, backgroundColor: colors.background }} />
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
        <View style={{ height: 200, backgroundColor: colors.background }} />
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
            <RenderItem item={item} index={index} />
          )}
          keyExtractor={(item) => item._id}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ padding: 7 }}
          ListHeaderComponent={
            <View style={{ backgroundColor: colors.background, flex: 1 }}>
              <Banner
                images={bannerItems.length > 0 ? bannerItems : (banners as any)}
              />
              <SectionHeader
                title="Top Categories"
                actionText="See all"
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

              <View style={{ marginTop: 14, backgroundColor: colors.background }} />

              <View
                style={{
                  backgroundColor: colors.primary,
                  marginTop: 10,
                  marginBottom: 10,
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <SectionHeader title="All Products" />
                <TouchableOpacity
                  style={{ right: 0, padding: 10 }}
                  onPress={handleSortCycle}
                >
                  <FontAwesome name={getSortIcon()} size={24} color={colors.light} />
                </TouchableOpacity>
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
      flexWrap: "wrap",
      backgroundColor:"#f2ebeb",
      padding: 7,
    },
    gridWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
  });
