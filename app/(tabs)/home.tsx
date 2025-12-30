import Banner from '@/components/Banner'
import CategoryTile from '@/components/CategoryTile'
import RenderItem from '@/components/RenderItem'
import SectionHeader from '@/components/SectionHeader'
import FloatingButton from '@/components/ui/FloatingBtn'
import HelpCenter, { openHelpSideBar } from '@/components/ui/help'
import { Colors } from '@/constants/Colors'
import { banners as bannerImages, categories as categoriesData } from '@/constants/data'
import { useTheme } from '@/contexts/ThemeContext'
import { Product, PRODUCTS_API_URL } from '@/types/product'
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const banners = bannerImages
const categories = categoriesData;

import { useSearchStore } from '@/components/SearchStore'

const Home = () => {
  const router = useRouter();
  const { colors, toggleTheme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const { query } = useSearchStore();

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

      // Filter only approved products
      const approvedProducts = data.filter((item) => item.approved);

      setProducts(approvedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const HeroSection = () => {
    return (
      <View style={{ backgroundColor: colors.background, flex: 1 }}>
        <Banner images={banners as any} />
        <SectionHeader title='Top Categories' actionText='See all' onActionPress={() => router.push('/(tabs)/categories')} />
        <ScrollView horizontal style={styles.categoriesWrap}
          showsHorizontalScrollIndicator={false}
        >
          {categories.slice(0, 8).map((c, idx) => (
            <CategoryTile key={idx} title={c.title} image={c.image} />
          ))}
        </ScrollView>

        <View style={{ marginTop: 14 }} />

        <View style={{ backgroundColor: colors.primary, marginTop: 10, marginBottom: 10, justifyContent: 'center', alignItems: 'center' }}>
          <SectionHeader title='All Products' />
        </View>
      </View>
    )
  }

  const renderEmptyOrLoading = () => {
    if (loading) {
      return (
        <View style={{ padding: 40, alignItems: 'center', backgroundColor:colors.background }}>
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
        <Text style={{ color: colors.text }}>No products available</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View>
        <FlatList
          data={products.filter(p => p.product_name.toLowerCase().includes(query.toLowerCase()))}
          numColumns={2}
          renderItem={({ item, index }) => (<RenderItem item={item} index={index} />)}
          keyExtractor={(item) => item._id}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ padding: 7 }}
          ListHeaderComponent={<HeroSection />}
          ListEmptyComponent={renderEmptyOrLoading}
        />
      </View>
      <HelpCenter />
      <FloatingButton
        onPress={openHelpSideBar}
        icon='message-alert'
        color={Colors.primary}
        onLongPress={toggleTheme}
      />
    </View>
  )
}

export default Home

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  }
})