import CategoryTile from '@/components/CategoryTile'
import { AddToCart, decrementCartItem, getCartQuantity, incrementCartItem, useCartStore } from '@/components/Operations'
import { triggerShare } from '@/components/Share'
import { categories } from '@/constants/data'
import { useTheme } from '@/contexts/ThemeContext'
import { formatPrice, Product, PRODUCTS_API_URL } from '@/types/product'
import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function ProductModal() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  useCartStore() // Subscribe to store updates
  const productId = id as string

  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const qty = getCartQuantity(productId);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(PRODUCTS_API_URL);

      if (!response.ok) {
        throw new Error('Failed to get product');
      }

      const data: Product[] = await response.json();
      const foundProduct = data.find(p => p._id === productId);

      if (!foundProduct) {
        setError('Product not found');
      } else {
        setProduct(foundProduct);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <View style={styles.containerCenter}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>Loading product...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.title}>{error || 'Product not found'}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    )
  }


  return (
    <View style={styles.container}>

      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => router.back()} style={{
          backgroundColor: colors.background,
          padding: 8,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        >
          {Platform.OS === 'android' ? <Ionicons name="arrow-back" size={24} color={colors.primary} /> : undefined}
        </TouchableOpacity>

        <Text style={{ color: colors.primary, fontSize: 24, fontWeight: 'bold', padding: 20, flex: 1 }} numberOfLines={1}>
          {product.product_name}
        </Text>
      </View>

      <ScrollView style={{ padding: 5 }}>
        <Image source={{ uri: product.product_image }} style={styles.image} resizeMode='cover' />

        <Text style={styles.title}>{product.product_name}</Text>
        <Text style={styles.price}>{formatPrice(product.product_price)}</Text>

        {product.product_discount && product.product_discount > 0 && (
          <Text style={styles.discount}>Discount: {formatPrice(product.product_discount)}</Text>
        )}

        <View style={{ height: 8 }} />
        <Text style={styles.description}>{product.product_description}</Text>

        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Category:</Text>
          <Text style={styles.detailValue}>{product.product_cartegory || 'N/A'}</Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Condition:</Text>
          <Text style={styles.detailValue}>{product.product_condition || 'N/A'}</Text>
        </View>

        {/* {product.product_views !== undefined && (
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Views:</Text>
            <Text style={styles.detailValue}>{product.product_views}</Text>
          </View>
        )}

        {product.product_likes !== undefined && (
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Likes:</Text>
            <Text style={styles.detailValue}>{product.product_likes}</Text>
          </View>
        )} */}

        <View style={{ height: 16 }} />

        <View style={{ flexDirection: 'row', flex: 1 }}>
          {qty > 0 ? (
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => decrementCartItem(product._id)}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => incrementCartItem(product._id)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addButton} onPress={() => AddToCart(product)}>
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          )}

          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity style={{ marginLeft: 20 }}>
                <Entypo name='eye' size={28} color={colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.detailValue, { marginLeft: 18 }]}>{product.product_views}</Text>
            </View>

            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity style={{ marginLeft: 20 }}>
                <FontAwesome name='thumbs-o-up' size={28} color={colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.detailValue, { marginLeft: 18 }]}>{product.product_likes}</Text>
            </View>

            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity style={{ marginLeft: 20 }}
                onPress={() => triggerShare(`Check out ${product.product_name} on ShopCheap!`, 'https://www.shopcheapug.com/home')}
              >
                <Entypo name='share' size={28} color={colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.detailValue, { marginLeft: 18 }]}>Share</Text>
            </View>
          </View>
        </View>

        {/* seller details */}
        <View style={{
          marginTop: 24,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.gray,
          borderRadius: 8,
          marginBottom: 50
        }}
        >
          <Text style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 12
          }}
          >
            Seller Details
          </Text>
          <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' }} >
            <View>
              <Text style={styles.sellerDetails}>Seller ID:</Text>
            </View>

            <View>
              <Text style={styles.sellerDetails}>{product.product_owner_id}</Text>
            </View>
          </View>
        </View>

        {/*  More products from the same seller        */}
        <View style={{ marginTop: -10, marginBottom: 100 }}>
          <Text style={styles.sellerDetails}>More Products from the Seller</Text>
          <View style={{}}>
            <ScrollView horizontal style={[styles.categoriesWrap, { marginTop: 12 }]}
              showsHorizontalScrollIndicator={false}
            >
              {categories.slice(0, 8).map((c, idx) => (
                <CategoryTile key={idx} title={c.title} image={c.image} />
              ))}
            </ScrollView>
          </View>
        </View>


        {/*  Related Products     */}
        <View style={{ marginTop: -50, marginBottom: 100 }}>
          <Text style={styles.sellerDetails}>Related Products</Text>
          <View style={{}}>
            <ScrollView horizontal style={[styles.categoriesWrap, { marginTop: 12 }]}
              showsHorizontalScrollIndicator={false}
            >
              {categories.slice(0, 8).map((c, idx) => (
                <CategoryTile key={idx} title={c.title} image={c.image} />
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  containerCenter: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  image: {
    width: '100%',
    height: 320,
    backgroundColor: '#111',
    borderRadius: 8,
    flex:1,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12
  },
  price: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4
  },
  discount: {
    color: colors.success || '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4
  },
  description: {
    color: colors.grayish,
    fontSize: 14,
    lineHeight: 20
  },
  detailsRow: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center'
  },
  detailLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8
  },
  detailValue: {
    color: colors.grayish,
    fontSize: 12
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '60%'
  },
  addButtonText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 16
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyBtnText: {
    color: '#000',
    fontSize: 20,
    fontWeight: '900'
  },
  qtyText: {
    color: colors.text,
    fontSize: 16,
    minWidth: 24,
    textAlign: 'center'
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12
  },
  buttonText: {
    color: '#000',
    fontWeight: '700'
  },
  sellerDetails: {
    color: colors.text,
    fontSize: 16,
    marginTop: 4
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
})
