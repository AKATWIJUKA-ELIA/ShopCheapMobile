import Banner from '@/components/Banner'
import CategoryTile from '@/components/CategoryTile'
import RenderItem from '@/components/RenderItem'
import SectionHeader from '@/components/SectionHeader'
import FloatingButton from '@/components/ui/FloatingBtn'
import HelpCenter, { openHelpSideBar } from '@/components/ui/help'
import { Colors } from '@/constants/Colors'
import { banners as bannerImages } from '@/constants/data'
import { useTheme } from '@/contexts/ThemeContext'
import { CATEGORIES_API_URL, Category, Product, PRODUCTS_API_URL } from '@/types/product'
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const banners = bannerImages;

import { useSearchStore } from '@/components/SearchStore'

const Home = () => {
  const router = useRouter();
  const { colors, toggleTheme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const { query } = useSearchStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, categoriesRes] = await Promise.all([
        fetch(PRODUCTS_API_URL),
        fetch(CATEGORIES_API_URL)
      ]);

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [productsData, categoriesData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json()
      ]);

      setProducts(productsData.filter((item: Product) => item.approved));
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
            <CategoryTile
              key={idx}
              title={c.cartegory || c.category || c.title || 'No Name'}
              image={typeof c.image === 'string' && c.image.length > 0 ?
                { uri: c.image } : c.image ? c.image : require('@/assets/images/placeholder.png')}
            />
          ))}
        </ScrollView>

        <View style={{ marginTop: 14, backgroundColor: colors.background }} />

        <View style={{ backgroundColor: colors.primary, marginTop: 10, marginBottom: 10, justifyContent: 'center', alignItems: 'center' }}>
          <SectionHeader title='All Products' />
        </View>
      </View>
    )
  }

  const renderEmptyOrLoading = () => {
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
          <View style={{ padding: 40, alignItems: 'center', backgroundColor: colors.background, }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.text, marginTop: 10 }}>Loading products...</Text>
          </View>
          <View style={{height:200, backgroundColor:colors.background}}/>
        </View>
      );
    }

    if (error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
          <View style={{ padding: 40, alignItems: 'center', backgroundColor: colors.background }}>
            <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
            <TouchableOpacity
              onPress={fetchData}
              style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
            >
              <Text style={{ color: colors.light }}>Retry</Text>
            </TouchableOpacity>
          </View>
          <View style={{height:200, backgroundColor:colors.background}}/>
        </View>
      );
    }

    return (
     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
       <View style={{ padding: 40, alignItems: 'center', backgroundColor: colors.background }}>
          <Text style={{ color: colors.text }}>No products available</Text>
        </View>
        <View style={{height:200, backgroundColor:colors.background}}/>
     </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.background }}>
        <FlatList
          data={products.filter(p => (p.product_name || '').toLowerCase().includes((query || '').toLowerCase()))}
          numColumns={2}
          renderItem={({ item, index }) => (<RenderItem item={item} index={index} />)}
          keyExtractor={(item) => item._id}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ padding: 7 }}
          ListHeaderComponent={<HeroSection />}
          ListEmptyComponent={renderEmptyOrLoading}
          showsVerticalScrollIndicator={false}
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