import { triggerShare } from '@/components/Share';
import ErrorView from '@/components/ui/ErrorView';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { API_BASE_URL, CREATE_REVIEW_API_URL, formatPrice, GET_PRODUCT_API_URL, GET_RELATED_PRODUCTS_API_URL, GET_REVIEWS_API_URL, GET_SHOPS_API_URL, Product, Review, Shop } from '@/types/product';
import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProductModal() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const productId = id as string;
  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const { items, addToCart, decrementItem, incrementItem, wishlistIds, toggleWishlist } = useCartStore();
  const qty = items.find(i => i.product._id === productId)?.quantity || 0;

  const { user } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [sellerShop, setSellerShop] = useState<Shop | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const images = useMemo(() => {
    if (!product) return [];
    return Array.isArray(product.product_image) ? product.product_image : [product.product_image];
  }, [product]);

  const { width: SCREEN_WIDTH } = Dimensions.get('window');

  // Functions defined BEFORE any returns
  const fetchReviews = async () => {
    try {
      const res = await fetch(`${GET_REVIEWS_API_URL}?productId=${productId}`);
      const data = await res.json();

      let reviewList: Review[] = [];
      if (Array.isArray(data)) {
        reviewList = data;
      } else if (data && Array.isArray(data.reviews)) {
        reviewList = data.reviews;
      } else if (data && Array.isArray(data.data)) {
        reviewList = data.data;
      }

      if (reviewList.length > 0) {
        setReviews(reviewList);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const fetchRelated = async (category: string) => {
    try {
      const res = await fetch(`${GET_RELATED_PRODUCTS_API_URL}?category=${category}`);
      const data = await res.json();

      let related: Product[] = [];
      if (Array.isArray(data)) {
        related = data;
      } else if (data && Array.isArray(data.products)) {
        related = data.products;
      } else if (data && Array.isArray(data.data)) {
        related = data.data;
      }

      if (related.length > 0) {
        setRelatedProducts(related.filter(p => p._id !== productId));
      }
    } catch (err) {
      console.error("Error fetching related products:", err);
    }
  };

  const fetchSellerShop = async (ownerId: string) => {
    try {
      const res = await fetch(GET_SHOPS_API_URL);
      const data: Shop[] = await res.json();
      const shop = data.find(s => s.owner_id === ownerId);
      if (shop) setSellerShop(shop);
    } catch (err) {
      console.error("Error fetching seller shop:", err);
    }
  };

  const fetchProductData = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${GET_PRODUCT_API_URL}?id=${encodeURIComponent(productId)}`);
      console.log(`[ProductDetail] Fetching ID: ${productId}, Status: ${res.status}`);

      if (!res.ok) {
        const text = await res.text();
        console.error(`[ProductDetail] Fetch failed:`, text);
        throw new Error(`Failed to fetch product (${res.status})`);
      }

      const data = await res.json();
      console.log(`[ProductDetail] Raw Data Keys:`, Object.keys(data || {}));

      let fetchedProduct: any = null;

      // 1. Try to find the product object in common wrappers
      if (data && typeof data === 'object') {
        if (data._id || data.id) {
          fetchedProduct = data;
        } else if (data.product && typeof data.product === 'object') {
          fetchedProduct = data.product;
        } else if (data.data && typeof data.data === 'object') {
          fetchedProduct = data.data;
        } else if (data.result && typeof data.result === 'object') {
          fetchedProduct = data.result;
        }
      }

      // 2. Normalize ID if found
      if (fetchedProduct) {
        const actualId = fetchedProduct._id || fetchedProduct.id || fetchedProduct.product_id;
        if (actualId) {
          fetchedProduct._id = actualId; // Ensure we have _id for our internal logic
        }
      }

      if (fetchedProduct && fetchedProduct._id) {
        setProduct(fetchedProduct);

        // Use any available category field
        const cat = fetchedProduct.product_category ||
          fetchedProduct.product_cartegory ||
          fetchedProduct.category;

        if (cat) {
          fetchRelated(cat);
        }

        if (fetchedProduct.product_owner_id || fetchedProduct.owner_id) {
          fetchSellerShop(fetchedProduct.product_owner_id || fetchedProduct.owner_id);
        }
        fetchReviews();
      } else {
        console.warn(`[ProductDetail] Product extraction failed for ID ${productId}. Data:`, data);
        setError('Product not found or invalid response');
      }
    } catch (err) {
      console.error("fetchProductData error:", err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }

    if (!reviewTitle.trim() || !reviewText.trim()) {
      Alert.alert("Error", "Please fill in both title and review text.");
      return;
    }

    try {
      setIsSubmittingReview(true);
      const res = await fetch(CREATE_REVIEW_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          reviewer_id: user._id,
          title: reviewTitle,
          rating,
          review: reviewText,
          verified: true
        })
      });

      const data = await res.json();
      if (data.success) {
        setReviewTitle('');
        setReviewText('');
        setRating(5);
        fetchReviews();
        Alert.alert("Success", "Review submitted successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      Alert.alert("Error", "An error occurred while submitting your review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Hooks registered AFTER functions but BEFORE returns
  useEffect(() => {
    fetchProductData();
  }, [productId]);

  // Loading/Error Returns
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>Loading product...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, marginLeft: 10, fontSize: 18 }}>Error</Text>
        </View>
        <ErrorView message={error || "Product not found"} onRetry={fetchProductData} />
      </View>
    );
  }

  // Main Render
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 16 }}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <Text style={{ color: colors.primary, fontSize: 24, fontWeight: 'bold', flex: 1 }} numberOfLines={1}>
          {product.product_name}
        </Text>
      </View>

      <ScrollView style={{ padding: 10 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ position: 'relative' }}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            onMomentumScrollEnd={(e) => {
              const offset = e.nativeEvent.contentOffset.x;
              const index = Math.round(offset / (SCREEN_WIDTH - 20));
              setActiveImageIndex(index);
            }}
            renderItem={({ item }) => (
              <Image
                source={item ? { uri: item } : require('@/assets/images/placeholder.png')}
                style={[styles.image, { width: SCREEN_WIDTH - 20 }]}
                resizeMode='cover'
              />
            )}
          />
          {images.length > 1 && (
            <View style={styles.paginationDots}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    activeImageIndex === index ? styles.activeDot : styles.inactiveDot
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <Text style={styles.title}>{product.product_name}</Text>
        <Text style={styles.price}>{formatPrice(product.product_price)}</Text>

        {product.product_discount && product.product_discount > 0 && (
          <Text style={styles.discount}>Discount: {formatPrice(product.product_discount)}</Text>
        )}

        <View style={{ height: 8 }} />
        <Text style={styles.description}>{product.product_description}</Text>

        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Category:</Text>
          <Text style={styles.detailValue}>{product.product_category || product.product_cartegory || 'N/A'}</Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Condition:</Text>
          <Text style={styles.detailValue}>{product.product_condition || 'N/A'}</Text>
        </View>
{/* 
        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Product:</Text>
          <Text style={styles.detailValue}>{product.product_sponsorship?.status || 'N/A'}</Text>
        </View> */}

        <View style={{ height: 16 }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {qty > 0 ? (
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => decrementItem(product._id)}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => incrementItem(product._id)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addButton} onPress={() => addToCart(product)}>
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          )}

          <View style={{ flexDirection: 'row', gap: 15 }}>
            {/* <View style={{ alignItems: 'center' }}>
              <TouchableOpacity>
                <Entypo name='eye' size={24} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.detailValue}>{product.product_views || 0}</Text>
            </View> */}

            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity disabled={isLiking} onPress={async () => {
                if (!user) {
                  router.push('/(auth)/login');
                  return;
                }
                try {
                  setIsLiking(true);
                  const res = await fetch(`${API_BASE_URL}/product/like`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: product._id, userId: user._id })
                  });
                  if (res.ok) {
                    setLiked(!liked);
                    fetchProductData(); // Refresh to get new like count
                  }
                } catch (err) {
                  console.error("Error liking product:", err);
                  // fallback toggle for UI even if backend fails (optional)
                  setLiked(!liked);
                } finally {
                  setIsLiking(false);
                }
              }}>
                <FontAwesome name={liked ? 'thumbs-up' : 'thumbs-o-up'} size={24} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.detailValue}>{product.product_likes || 0}</Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity onPress={() => triggerShare(`Check out ${product.product_name} on ShopCheap!`, 'https://www.shopcheapug.com/home')}>
                <Entypo name='share' size={24} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.detailValue}>Share</Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity disabled={isBookmarking} onPress={async () => {
                if (!user) {
                  router.push('/(auth)/login');
                  return;
                }
                try {
                  setIsBookmarking(true);
                  await toggleWishlist(product);
                } catch (err) {
                  console.error("Error bookmarking:", err);
                } finally {
                  setIsBookmarking(false);
                }
              }}>
                <FontAwesome
                  name={wishlistIds.includes(product._id) ? 'bookmark' : 'bookmark-o'}
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <Text style={styles.detailValue}>Bookmark</Text>
            </View>
          </View>
        </View>

        {/* Seller Info */}
        <View style={styles.sellerSection}>
          <Text style={styles.sectionTitle}>Seller Details</Text>
          <View style={[styles.detailsRow,]}>
            <Text style={styles.detailLabel}>Seller:</Text>
            <Text style={styles.detailValue}>{product.seller.username || product.product_owner_id}</Text>
          </View>
          <View style={[styles.detailsRow,]}>
            <Text style={styles.detailLabel}>Contact:</Text>
            <Text style={styles.detailValue}>{product.seller.phoneNumber || 'N/A'}</Text>
          </View>
          <View style={[styles.detailsRow,]}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{product.seller.email|| 'N/A'}</Text>
          </View>
          {sellerShop?.phone && (
            <TouchableOpacity style={styles.detailsRow} onPress={() => Linking.openURL(`tel:${sellerShop.phone}`)}>
              <Ionicons name="call-outline" size={14} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.detailValue, { color: colors.primary }]}>{sellerShop.phone}</Text>
            </TouchableOpacity>
          )}
          {sellerShop?.email && (
            <TouchableOpacity style={styles.detailsRow} onPress={() => Linking.openURL(`mailto:${sellerShop.email}`)}>
              <Ionicons name="mail-outline" size={14} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.detailValue, { color: colors.primary }]}>{sellerShop.email}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.sectionTitle}>Related Products</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              {relatedProducts.map((p) => (
                <TouchableOpacity
                  key={p._id}
                  style={{ marginRight: 15, width: 140 }}
                  onPress={() => router.push({ pathname: '/(modals)/product', params: { id: p._id } })}
                >
                  <Image source={{ uri: Array.isArray(p.product_image) ? p.product_image[0] : p.product_image }} style={{ width: 140, height: 140, borderRadius: 8, backgroundColor: '#eee' }} />
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600', marginTop: 4 }} numberOfLines={1}>{p.product_name}</Text>
                  <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{formatPrice(p.product_price)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Reviews Section */}
        <View style={{ marginTop: 24, marginBottom: 40 }}>
          <Text style={styles.sectionTitle}>Customer Reviews ({reviews.length})</Text>

          {user && (
            <View style={styles.reviewForm}>
              <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 12 }}>Write a Review</Text>
              <View style={{ flexDirection: 'row', marginBottom: 12, gap: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Ionicons name={star <= rating ? "star" : "star-outline"} size={24} color="#FFD700" />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.input, { marginBottom: 12 }]}
                placeholder="Review Title"
                placeholderTextColor={colors.grayish}
                value={reviewTitle}
                onChangeText={setReviewTitle}
              />
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Share your experience..."
                placeholderTextColor={colors.grayish}
                multiline
                value={reviewText}
                onChangeText={setReviewText}
              />
              <TouchableOpacity
                style={[styles.addButton, { width: '100%', marginTop: 12, backgroundColor: isSubmittingReview ? colors.gray : colors.primary }]}
                onPress={submitReview}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? <ActivityIndicator color="#000" /> : <Text style={styles.addButtonText}>Submit Review</Text>}
              </TouchableOpacity>
            </View>
          )}

          {reviews.length === 0 ? (
            <Text style={{ color: colors.grayish, marginTop: 16 }}>No reviews yet. Be the first to review!</Text>
          ) : (
            reviews.map((rev) => (
              <View key={rev._id} style={styles.reviewItem}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{rev.title}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons key={i} name="star" size={12} color={i < rev.rating ? "#FFD700" : "#E0E0E0"} />
                    ))}
                  </View>
                </View>
                <Text style={{ color: colors.grayish, fontSize: 13, marginTop: 4 }}>{rev.review}</Text>
                <Text style={{ color: colors.grayish, fontSize: 10, marginTop: 4 }}>{new Date(rev._creationTime).toLocaleDateString()}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  image: {
    width: '100%',
    height: 320,
    backgroundColor: '#111',
    borderRadius: 8
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
    width: '50%'
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
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8
  },
  sellerSection: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray + '33',
    borderRadius: 8
  },
  reviewForm: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray + '33'
  },
  reviewItem: {
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray + '33',
    paddingBottom: 12
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gray + '33',
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 14,
  },
  paginationDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 20,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  }
});
