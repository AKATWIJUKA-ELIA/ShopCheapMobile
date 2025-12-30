import RenderItem from '@/components/RenderItem'
import { Colors } from '@/constants/Colors'
import { useTheme } from '@/contexts/ThemeContext'
import { Product, PRODUCTS_API_URL } from '@/types/product'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function CategoryModal() {
  const { name } = useLocalSearchParams()
  const categoryName = String(name || '')

  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(PRODUCTS_API_URL);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data: Product[] = await response.json();

      // Filter products by category and approval status
      const categoryProducts = data.filter((item) =>
        item.approved &&
        (item.product_cartegory === categoryName || item.product_cartegory === name)
      );

      setProducts(categoryProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryName]);

  const renderEmptyOrLoading = () => {
    if (loading) {
      return (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 10 }}>Loading products...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
          <TouchableOpacity
            onPress={fetchProducts}
            style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
          >
            <Text style={{ color: colors.light }}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <Text style={{ color: colors.text }}>No products found in this category</Text>
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row' }}>
        {Platform.OS === 'android' ? (
          <TouchableOpacity onPress={() => router.back()} style={{
            backgroundColor: colors.background,
            padding: 20
          }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
        ) : undefined}

        <Text style={{ color: colors.primary, fontSize: 24, fontWeight: 'bold', padding: 20 }}>
          {categoryName}
        </Text>
      </View>

      {/* <Text style={styles.title}>{categoryName}</Text> */}
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({ item, index }) => (<RenderItem item={item} index={index} />)}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
        ListEmptyComponent={renderEmptyOrLoading}
      />
    </View>
  )
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    padding: 16
  }
})



