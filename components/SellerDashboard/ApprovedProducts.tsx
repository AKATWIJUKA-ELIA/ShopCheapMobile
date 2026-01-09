import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { formatPrice, GET_PRODUCTS_BY_SELLER_API_URL, Product } from '@/types/product';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ErrorView from '../ui/ErrorView';


export default function ApprovedProductsScreen() {
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
        setProducts(data.filter(p => p.approved));
      }
    } catch (error) {
      console.error("Error fetching approved products:", error);
      setError("Unable to load approved products.");
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
    <SafeAreaView style={styles.container}>
      {/* CONTENT */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={18} color={colors.grayish} />
          <TextInput
            placeholder="Search approved products..."
            placeholderTextColor={colors.grayish}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : error ? (
        <ErrorView message={error} onRetry={fetchProducts} />
      ) : (
        <FlatList
          contentContainerStyle={styles.content}
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: colors.grayish }}>No approved products found.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/(modals)/product', params: { id: item._id } })}
            >
              {item.product_image && item.product_image[0] ? (
                <Image source={{ uri: item.product_image[0] }} style={styles.image} />
              ) : (
                <View style={[styles.image, { backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }]}>
                  <MaterialIcons name="image" size={30} color={colors.grayish} />
                </View>
              )}

              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.product_name}
                  </Text>
                </View>

                <Text style={styles.category}>{item.product_category}</Text>

                <View style={styles.badges}>
                  <Text style={styles.approvedBadge}>Approved</Text>
                  <Text style={styles.conditionBadge}>{item.product_condition}</Text>
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.price}>{formatPrice(item.product_price)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    backgroundColor: colors.background
  },
  searchRow: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 8,
    backgroundColor: colors.background
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderColor: colors.lightgray,
    borderWidth: 1
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 6,
    color: colors.text,
    height: 40
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  boostBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boostText: {
    color: '#047857',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#B91C1C',
    fontWeight: '600',
    fontSize: 13,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.lightgray,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
    color: colors.text,
  },
  category: {
    fontSize: 12,
    color: colors.grayish,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  approvedBadge: {
    fontSize: 10,
    backgroundColor: '#DCFCE7',
    color: '#047857',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  conditionBadge: {
    fontSize: 10,
    backgroundColor: '#E5E7EB',
    color: '#4B5563',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: '#F97316',
    fontWeight: '700',
    fontSize: 16,
  },
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 10,
    color: colors.grayish,
  },
});
