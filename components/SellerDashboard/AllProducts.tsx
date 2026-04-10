import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/store/useAuthStore";
import { formatPrice, GET_PRODUCTS_BY_SELLER_API_URL, Product } from "@/types/product";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ErrorView from "../ui/ErrorView";

export default function AllProductsScreen() {
  const router = useRouter();
  const { colors, toggleTheme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const { user } = useAuthStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${GET_PRODUCTS_BY_SELLER_API_URL}?sellerId=${user._id}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching seller products:", error);
      setError("Unable to load products. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.product_category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={18} color={colors.grayish} />
            <TextInput
              placeholder="Search products..."
              placeholderTextColor={colors.grayish}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Loading/Error States */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : error ? (
          <ErrorView message={error} onRetry={fetchProducts} />
        ) : (
          <>
            {/* Products */}
            {filteredProducts.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ color: colors.grayish }}>No products found.</Text>
              </View>
            ) : (
              filteredProducts.map((p) => (
                <View key={p._id} style={styles.productCard}>
                  {/* Left: Product Image */}
                  <View style={styles.productLeft}>
                    {p.product_image && p.product_image[0] ? (
                      <Image source={{ uri: p.product_image[0] }} style={styles.image} />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <MaterialIcons name="image" size={22} color={colors.grayish} />
                      </View>
                    )}
                  </View>

                  {/* Right: Product Info */}
                  <View style={styles.productInfo}>
                    <View style={styles.productTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.productName} numberOfLines={1}>
                          {p.product_name}
                        </Text>
                        <Text style={styles.category}>{p.product_category}</Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: p.approved ? "#DCFCE7" : "#FEF3C7" }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: p.approved ? "#15803D" : "#B45309" }
                        ]}>
                          {p.approved ? "Approved" : "Pending"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.middleRow}>
                      <Text style={styles.conditionText}>Condition: {p.product_condition}</Text>
                    </View>

                    <View style={styles.productBottom}>
                      <Text style={styles.price}>{formatPrice(p.product_price)}</Text>
                      <View style={styles.actions}>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => router.push({ pathname: '/(modals)/product', params: { id: p._id } })}
                        >
                          <MaterialIcons name="visibility" size={18} color={colors.text} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
            <Text style={styles.footerText}>Showing {filteredProducts.length} products</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}


/* ---------------- STYLES ---------------- */

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 16,
    backgroundColor: colors.background
  },
  searchRow: {
    flexDirection: "row",
    marginBottom: 12
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 8,
    borderColor: colors.lightgray,
    borderWidth: 1
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 6,
    color: colors.text
  },
  filterBtn: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 12,
  },

  productCard: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lightgray,
    marginBottom: 10,
    flexDirection: "row",
  },
  productLeft: {
    alignItems: "center",
    marginRight: 10
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 6,
  },

  image: {
    width: 64,
    height: 64,
    borderRadius: 8
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  productInfo: {
    flex: 1
  },
  productTop: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text
  },
  category: {
    fontSize: 12,
    color: colors.grayish
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600"
  },
  productBottom: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  priceLabel: {
    fontSize: 11,
    color: colors.grayish
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text
  },
  actions: {
    flexDirection: "row"
  },
  actionBtn: {
    backgroundColor: colors.background,
    padding: 6,
    borderRadius: 6,
    marginRight: 6,
  },
  editBtn: {
    backgroundColor: "rgba(249,115,22,0.15)",
    padding: 6,
    borderRadius: 6,
  },

  footerText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    color: colors.grayish,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 8,
  },
  conditionText: {
    fontSize: 11,
    color: colors.grayish,
  },
  dateText: {
    fontSize: 11,
    color: colors.grayish,
  },
});
