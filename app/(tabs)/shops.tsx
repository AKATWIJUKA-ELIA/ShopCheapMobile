import ErrorView from '@/components/ui/ErrorView';
import FloatingButton from '@/components/ui/FloatingBtn';
import HelpCenter, { openHelpSideBar } from '@/components/ui/help';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_SHOPS_API_URL, Product, PRODUCTS_API_URL, Shop } from '@/types/product';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// interface Shop {
//   _id: string;
//   shop_name: string;
//   description: string;
//   owner_id: string;
//   slogan: string;
//   profile_image: string;
//   cover_image: string;
//   is_verified: boolean;
//   isOpen: boolean;
//   location: { lat: number; lng: number };
// }

export default function ShopsScreen() {
  const router = useRouter();
  const { colors, toggleTheme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const [shops, setShops] = useState<Shop[]>([]);
  const [sortMode, setSortMode] = useState<'default' | 'alpha_asc' | 'alpha_desc' | 'newest_desc' | 'newest_asc'>('default');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchShops = async (isRefresing = false) => {
    try {
      setError(null);
      if (!isRefresing) setLoading(true);

      const [shopsRes, productsRes] = await Promise.all([
        fetch(GET_SHOPS_API_URL),
        fetch(PRODUCTS_API_URL)
      ]);

      const shopsData: Shop[] = await shopsRes.json();
      const productsData: Product[] = await productsRes.json();

      if (Array.isArray(shopsData) && Array.isArray(productsData)) {
        // Count products per seller
        const counts: Record<string, number> = {};
        productsData.forEach(p => {
          const ownerId = p.product_owner_id;
          if (ownerId) {
            counts[ownerId] = (counts[ownerId] || 0) + 1;
          }
        });

        // Attach counts to shops
        const shopsWithCounts = shopsData.map(shop => ({
          ...shop,
          productCount: counts[shop.owner_id] || 0
        }));

        setShops(shopsWithCounts);
      } else if (Array.isArray(shopsData)) {
        setShops(shopsData);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      setError("Network request failed. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchShops(true);
  };

  const handleSortCycle = () => {
    setSortMode(current => {
      if (current === 'default') return 'alpha_asc';
      if (current === 'alpha_asc') return 'alpha_desc';
      if (current === 'alpha_desc') return 'newest_desc';
      if (current === 'newest_desc') return 'newest_asc';
      return 'default';
    });
  };

  const getSortIcon = () => {
    if (sortMode === 'default') return 'filter';
    if (sortMode === 'alpha_asc') return 'sort-alpha-asc';
    if (sortMode === 'alpha_desc') return 'sort-alpha-desc';
    if (sortMode === 'newest_desc') return 'sort-amount-desc';
    if (sortMode === 'newest_asc') return 'sort-amount-asc';
    return 'filter';
  };

  const filteredShops = useMemo(() => {
    let result = shops.filter(shop =>
      shop.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.slogan.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortMode === 'alpha_asc') {
      result.sort((a, b) => a.shop_name.localeCompare(b.shop_name));
    } else if (sortMode === 'alpha_desc') {
      result.sort((a, b) => b.shop_name.localeCompare(a.shop_name));
    } else if (sortMode === 'newest_desc') {
      result.sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));
    } else if (sortMode === 'newest_asc') {
      result.sort((a, b) => (a._creationTime || 0) - (b._creationTime || 0));
    }

    return result;
  }, [shops, searchQuery, sortMode]);

  const HeroSection = () => {
    return (
      <View style={styles.hero}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
          <TouchableOpacity style={styles.heroIcon} onPress={() => router.push('/Seller/(SellerDashboard)/shop')}>
            <MaterialIcons name="storefront" size={26} color={colors.light} />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Explore Shops</Text>
        </View>
        <Text style={styles.heroSubtitle}>
          Discover amazing sellers on ShopCheap
        </Text>

        <TouchableOpacity style={{ position: 'absolute', top: 16, right: 16 }} onPress={handleSortCycle}>
          <FontAwesome name={getSortIcon()} size={18} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.grayish} />
          <TextInput
            placeholder="Search shops by name, description or slogan..."
            placeholderTextColor={colors.grayish}
            style={styles.searchInput}
            cursorColor={colors.primary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.grayish} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  const renderShopItem = ({ item }: { item: Shop }) => (
    <View
      style={styles.card}
    >
      <View style={styles.cover}>
        <Image
          source={{ uri: (Array.isArray(item.cover_image) ? item.cover_image[0] : item.cover_image) || 'https://picsum.photos/600/300?blur=10' }}
          style={styles.coverImage}
        />
        <View
          style={[
            styles.status,
            { backgroundColor: item.isOpen ? '#22C55E' : '#6B7280' },
          ]}
        >
          <MaterialIcons
            name="schedule"
            size={10}
            color={colors.light}
          />
          <Text style={styles.statusText}>
            {item.isOpen ? 'Open' : 'Closed'}
          </Text>
        </View>

        <View style={styles.logoWrap}>
          <Image
            source={{ uri: (Array.isArray(item.profile_image) ? item.profile_image[0] : item.profile_image) || 'https://picsum.photos/200?blur=10' }}
            style={styles.logoImg}
          />
        </View>

        {item.is_verified && (
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={12} color={colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.shopName} numberOfLines={1}>{item.shop_name}</Text>
        <Text style={styles.tagline} numberOfLines={1}>"{item.slogan}"</Text>
        <Text numberOfLines={2} style={styles.desc}>
          {item.description}
        </Text>

        <View style={styles.productCount}>
          <Text style={{ color: colors.grayish, fontSize: 12 }}>{item.productCount || 0} Products</Text>
          {/* <TouchableOpacity onPress={() => {}}>
            <Ionicons name='location' size={18} color={colors.lightgray}/>
          </TouchableOpacity> */}
        </View>

        <TouchableOpacity style={styles.visitBtn}
          onPress={() => router.push(`/Screens/${item._id}`)}
        >
          <Text style={styles.visitText}>Visit Shop</Text>
          <MaterialIcons
            name="arrow-forward"
            size={16}
            color={colors.light}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={error || (loading && !refreshing) ? [] : filteredShops}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
        ListHeaderComponent={<HeroSection />}
        renderItem={renderShopItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          loading && !refreshing ? (
            <View style={{ padding: 40, alignItems: 'center', paddingVertical: 200 }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.text, marginTop: 10 }}>Loading shops...</Text>
            </View>
          ) : error ? (
            <ErrorView message={error} onRetry={() => fetchShops()} />
          ) : (
            <View style={{ padding: 20, alignItems: 'center', height: 432 }}>
              <Text style={{ color: colors.grayish }}>No shops found matching your search.</Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
      />

      <HelpCenter />
      <FloatingButton
        onPress={openHelpSideBar}
        icon='message-alert'
        color={Colors.primary}
        onLongPress={toggleTheme}
      />
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    height: '100%'
  },
  hero: {
    backgroundColor: colors.background,
    padding: 16,
    alignItems: 'center',
    width: '100%'
  },
  heroIcon: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text
  },
  heroSubtitle: {
    fontSize: 12,
    color: colors.grayish,
    marginBottom: 12
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    width: '100%',
    borderColor: colors.primary,
    borderWidth: 1
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 8,
    color: colors.text,
    fontSize: 12,
  },
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.lightgray,
    marginBottom: 12
  },
  cover: {
    height: 120,
    backgroundColor: '#D1D5DB'
  },
  coverImage: {
    width: '100%',
    height: '100%'
  },
  status: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: colors.light,
    fontWeight: '600'
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    position: 'absolute',
    bottom: -18,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.light,
    overflow: 'hidden',
  },
  logoImg: {
    width: '100%',
    height: '100%'
  },

  cardBody: {
    padding: 12,
    paddingTop: 24
  },
  shopName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary
  },
  tagline: {
    fontSize: 10,
    color: colors.grayish,
    fontStyle: 'italic'
  },
  desc: {
    fontSize: 12,
    color: colors.grayish,
    marginVertical: 6
  },

  visitBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    alignItems: 'center',
  },
  visitText: {
    color: colors.light,
    fontSize: 12,
    fontWeight: '600'
  },
  productCount: {
    borderTopColor: colors.lightgray,
    borderTopWidth: 1,
    paddingBottom: 2,
    padding: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});
