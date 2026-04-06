import ErrorView from '@/components/ui/ErrorView';
import { useTheme } from '@/contexts/ThemeContext';
import { AUTH_TOKEN, GET_PRODUCTS_BY_SELLER_API_URL, GET_SHOPS_BY__API_URL, GET_USER_API_URL, Product, Shop, formatPrice } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ShopDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const [shop, setShop] = useState<Shop | null>(null);
  const [sellerUser, setSellerUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch all shops to find this one (since there's no single shop fetch by ID)
      const shopRes = await fetch(`${GET_SHOPS_BY__API_URL}?shopId=${id}`,
        {
                headers: {
                        'Content-Type': 'application/json',
                        "X-Auth-Token": AUTH_TOKEN,
                }
        }
      );
      if (!shopRes.ok) throw new Error('Failed to fetch shops');
      const shopData = await shopRes.json();
//       console.log("Fetched shop data:", shopData);
      if (!shopData) {
        throw new Error('Shop not found');
      }
      setShop(shopData.data);

      // 2. Fetch owner details
      if (shopData.data.owner_id) {
        try {
          const userRes = await fetch(`${GET_USER_API_URL}?id=${shopData.data.owner_id}`, {
            headers: {
              'Content-Type': 'application/json',
              "X-Auth-Token": AUTH_TOKEN,
            }
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setSellerUser(userData);
          }
        } catch (e) {
          console.error("Error fetching seller user details:", e);
        }
      }

      // 3. Fetch products for this shop/seller
      const prodRes = await fetch(`${GET_PRODUCTS_BY_SELLER_API_URL}?sellerId=${shopData.data.owner_id}`,{
        headers: {
                        'Content-Type': 'application/json',
                        "X-Auth-Token": AUTH_TOKEN,
                },
               method: "GET",
      });
      if (!prodRes.ok) throw new Error('Failed to fetch products');
      const prodData = await prodRes.json();
      setProducts(Array.isArray(prodData.data.page) ? prodData.data.page : []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string | undefined) => {
    if (!phone) {
      Alert.alert('Not Available', 'This seller has not provided a phone number.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string | undefined) => {
    if (!email) {
      Alert.alert('Not Available', 'This seller has not provided an email address.');
      return;
    }
    Linking.openURL(`mailto:${email}`);
  };

  useEffect(() => {
    if (id) {
      fetchShopDetails();
    }
  }, [id]);

  const Header = () => {
    if (!shop) return null;

    return (
      <View>
        <Image
          source={{ uri: shop.cover_image || 'https://picsum.photos/600/300?blur=10' }}
          style={styles.banner}
        />

        <View style={styles.profile}>
          <Image
            source={{ uri: shop.profile_image || 'https://picsum.photos/200?blur=10' }}
            style={styles.avatar}
          />

          <Text style={styles.shopName}>{shop.shop_name}</Text>
          <Text style={styles.username}>@{shop.shop_name.toLowerCase().replace(/\s+/g, '-')}</Text>

          <View style={styles.badges}>
            <Text style={shop.isOpen ? styles.openBadge : styles.closedBadge}>
              {shop.isOpen ? 'Open' : 'Closed'}
            </Text>
            {shop.is_verified && <Text style={styles.verifiedBadge}>Verified Seller</Text>}
            {/* Rating - Placeholder for now as API doesn't provide it */}
            <View style={styles.rating}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.ratingText}>4.6</Text>
            </View>
          </View>

          <Text style={styles.description}>
            {shop.description}
          </Text>
          {shop.slogan && (
            <Text style={[styles.description, { fontStyle: 'italic', marginTop: 4 }]}>
              "{shop.slogan}"
            </Text>
          )}

          <View style={{ marginTop: 8, alignItems: 'center' }}>
            {shop.phone && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="call" size={12} color={colors.grayish} style={{ marginRight: 4 }} />
                <Text style={{ color: colors.grayish, fontSize: 12 }}>{sellerUser?.phoneNumber || shop?.phone || 'N/A'}</Text>
              </View>
            )}
            {shop.email && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Ionicons name="mail" size={12} color={colors.grayish} style={{ marginRight: 4 }} />
                <Text style={{ color: colors.grayish, fontSize: 12 }}>{sellerUser?.email || shop?.email || 'N/A'}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>Loading shop...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorView message={error} onRetry={fetchShopDetails} />
        <TouchableOpacity onPress={() => router.back()} style={[styles.contactBtn, {
          position: 'absolute',
          top: 20,
          left: 20
        }]}>
          <Ionicons name="arrow-back" size={20} color={colors.light} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Products */}
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item._id}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 10 }}
        ListHeaderComponent={<Header />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => router.push({ pathname: '/(modals)/product', params: { id: item._id } })}
            activeOpacity={0.8}
          >
            <View style={styles.productImageWrapper}>
              {item.product_condition && (
                <Text style={styles.productBadge}>{item.product_condition}</Text>
              )}
              <Image source={{ uri: (Array.isArray(item.product_image) ? item.product_image[0] : item.product_image) || 'https://picsum.photos/200' }} style={styles.productImage} />
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>{item.product_name}</Text>
              <Text style={styles.productDesc} numberOfLines={2}>{item.product_description}</Text>
              <Text style={styles.productPrice}>{formatPrice(item.product_price)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: colors.grayish }}>No products available from this seller.</Text>
          </View>
        }
      />
      <View style={styles.fixedContacts}>
        <TouchableOpacity style={styles.contactBtn} onPress={() => handleCall(sellerUser?.phoneNumber)}>
          <Ionicons name="call" size={18} color={colors.light} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactBtn} onPress={() => handleEmail(sellerUser?.email)}>
          <Ionicons name="mail" size={18} color={colors.light} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.back()} style={[styles.contactBtn, {
        position: 'absolute',
        top: 20,
        left: 20
      }]}>
        <Ionicons name="arrow-back" size={20} color={colors.light} />
      </TouchableOpacity>
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 7
  },
  banner: {
    height: 160,
    width: '100%'

  },
  profile: {
    alignItems: 'center',
    padding: 16,
    marginTop: -50
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: colors.light,
  },
  shopName: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
    color: colors.primary
  },
  username: {
    color: colors.grayish,
    fontSize: 13
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8
  },
  openBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    paddingHorizontal: 8,
    borderRadius: 6,
    fontSize: 12,
  },
  closedBadge: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    paddingHorizontal: 8,
    borderRadius: 6,
    fontSize: 12,
  },
  verifiedBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    paddingHorizontal: 8,
    borderRadius: 6,
    fontSize: 12,
  },
  unverifiedBadge: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    paddingHorizontal: 8,
    borderRadius: 6,
    fontSize: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb', // subtle amber bg
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  description: {
    textAlign: 'center',
    color: colors.grayish,
    fontSize: 13
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    padding: 10
  },
  productCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: colors.lightgray,
    borderWidth: 1
  },
  productImageWrapper: {
    position: 'relative',
    aspectRatio: 1

  },
  productBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    color: '#fff',
    fontSize: 10,
    paddingHorizontal: 6,
    borderRadius: 4,
    zIndex: 1,
  },
  productImage: {
    width: '100%',
    height: '100%'
  },
  productInfo: {
    padding: 8
  },
  productName: {
    fontWeight: '700',
    fontSize: 13,
    color: colors.text
  },
  productDesc: {
    fontSize: 11,
    color: colors.grayish
  },
  productPrice: {
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4
  },
  fixedContacts: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
    zIndex: 20,           // stays above content
  },

  contactBtn: {
    backgroundColor: colors.primary,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,         // Android shadow
    shadowColor: '#000',  // iOS shadow
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  contactIcon: {
    color: '#fff',
    fontSize: 20,
  },
});
