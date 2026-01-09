import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { formatPrice, GET_PRODUCTS_BY_SELLER_API_URL, Product } from '@/types/product';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ErrorView from '../ui/ErrorView';



export default function PendingProductsScreen() {
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
        setProducts(data.filter(p => !p.approved));
      }
    } catch (error) {
      console.error("Error fetching pending products:", error);
      setError("Unable to load pending products.");
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
    p.product_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Action Row
      <View style={styles.actionRow}>
        <Text style={styles.selectedText}>
          {selected.length} items selected
        </Text>

        <TouchableOpacity style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={DANGER} />
          <Text style={styles.deleteText}>Delete Selected</Text>
        </TouchableOpacity>
      </View> */}

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={18} color={colors.grayish} />
          <TextInput
            placeholder="Search pending products..."
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
          data={filteredProducts}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: colors.grayish }}>No pending products found.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/(modals)/product', params: { id: item._id } })}
            >
              <Image source={{ uri: item.product_image?.[0] || 'https://via.placeholder.com/320' }} style={styles.image} />

              <View style={styles.info}>
                <View style={styles.row}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.product_name}
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Pending</Text>
                  </View>
                </View>

                <Text style={styles.desc} numberOfLines={1}>
                  {item.product_description}
                </Text>

                <View style={styles.row}>
                  <Text style={styles.price}>{formatPrice(item.product_price)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  selectedText: {
    fontSize: 13,
    color: colors.gray,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteText: {
    color: '#ef4444',
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightgray,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.light,
  },
  info: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
  },
  desc: {
    fontSize: 13,
    color: colors.grayish,
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 11,
    color: colors.grayish,
  },
});
