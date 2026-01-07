import { useTheme } from '@/contexts/ThemeContext';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice, Product } from '@/types/product';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BookmarksPage() {
  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const router = useRouter();
  const { wishlistItems, toggleWishlist, fetchBookmarks } = useCartStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchBookmarks();
      setLoading(false);
    };
    loadData();
  }, []);

  const onRefresh = async () => {
    setLoading(true);
    await fetchBookmarks();
    setLoading(false);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const images = Array.isArray(item.product_image) ? item.product_image : [item.product_image];

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: '/(modals)/product', params: { id: item._id } })}
      >
        <Image
          source={images[0] ? { uri: images[0] } : require('@/assets/images/placeholder.png')}
          style={styles.productImage}
        />

        <View style={styles.productDetails}>
          <View>
            <Text style={styles.categoryText}>{item.product_category || item.product_cartegory || 'Product'}</Text>
            <Text style={styles.productName} numberOfLines={1}>{item.product_name}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{formatPrice(item.product_price)}</Text>
            <TouchableOpacity
              style={styles.heartBtn}
              onPress={async () => {
                await toggleWishlist(item);
                // No need to refresh manually, the store should handle it
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="heart" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {loading && wishlistItems.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : wishlistItems.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBox}>
            <Feather name="heart" size={48} color={colors.grayish} />
          </View>
          <Text style={styles.emptyTitle}>Wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>Save items you love to find them later!</Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.exploreBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={renderProduct}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const appStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    productCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.borderLine,
      shadowColor: "#000",
      shadowOpacity: 0.03,
      shadowRadius: 10,
      elevation: 2,
    },
    productImage: {
      width: 100,
      height: 100,
      borderRadius: 16,
      backgroundColor: colors.primary + '10',
    },
    productDetails: {
      flex: 1,
      marginLeft: 16,
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    categoryText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 2,
    },
    productName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    priceText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '800',
    },
    heartBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#fee2e2',
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyIconBox: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.grayish,
      textAlign: 'center',
      marginBottom: 30,
    },
    exploreBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 14,
    },
    exploreBtnText: {
      color: colors.background,
      fontWeight: '800',
      fontSize: 15,
    },
  });
