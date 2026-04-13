import ErrorView from "@/components/ui/ErrorView";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import {
        AUTH_TOKEN,
  CREATE_REVIEW_API_URL,
  formatPrice,
  GET_PRODUCT_API_URL,
  GET_RELATED_PRODUCTS_API_URL,
  GET_REVIEWS_API_URL,
  GET_SHOPS_API_URL,
  Product,
  Review,
  Shop
} from "@/types/product";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProductModal() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const productId = id as string;
  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const {
    items,
    addToCart,
    decrementItem,
    incrementItem,
    wishlistIds,
    toggleWishlist,
  } = useCartStore();
  const qty = items.find((i) => i.product._id === productId)?.quantity || 0;

  const { user } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [sellerShop, setSellerShop] = useState<Shop | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const images = useMemo(() => {
    if (!product) return [];
    return Array.isArray(product.product_image)
      ? product.product_image
      : [product.product_image];
  }, [product]);

  const { width: SCREEN_WIDTH } = Dimensions.get("window");

  // Functions defined BEFORE any returns
  const fetchReviews = async () => {
    try {
      const res = await fetch(`${GET_REVIEWS_API_URL}?productId=${productId}`,
        {
                headers: {
                        'Content-Type': 'application/json',
                        "X-Auth-Token": AUTH_TOKEN,
                }
        }
      );
      const data = await res.json();

      let reviewList: Review[] = [];
      if (Array.isArray(data.data)) {
        // console.log("reviews array:", data.data);
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
      const res = await fetch(
        `${GET_RELATED_PRODUCTS_API_URL}?category=${category}`,
        {
          headers: {
            'Content-Type': 'application/json',
            "X-Auth-Token": AUTH_TOKEN,
          }
        }
      );
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
        setRelatedProducts(related.filter((p) => p._id !== productId));
      }
    } catch (err) {
      console.error("Error fetching related products:", err);
    }
  };
  
  const fetchSellerProducts = async (sellerId: string) => {
    try {
      const { GET_PRODUCTS_BY_SELLER_API_URL } = require('@/types/product');
      const res = await fetch(`${GET_PRODUCTS_BY_SELLER_API_URL}?sellerId=${sellerId}`);
      const data = await res.json();
      
      let sellerItems: Product[] = [];
      if (Array.isArray(data)) {
        sellerItems = data;
      } else if (data && Array.isArray(data.products)) {
        sellerItems = data.products;
      } else if (data && Array.isArray(data.data)) {
        sellerItems = data.data;
      }
      
      if (sellerItems.length > 0) {
        setSellerProducts(sellerItems.filter((p) => p._id !== productId).slice(0, 8));
      }
    } catch (err) {
      console.error("Error fetching seller products:", err);
    }
  };

  const fetchSellerShop = async (ownerId: string) => {
    try {
      const res = await fetch(GET_SHOPS_API_URL,
        {
                headers:{
                        'Content-Type': 'application/json',
                        "X-Auth-Token": AUTH_TOKEN,
                }
        }
      );
      const data = await res.json();
      const shop: Shop  = data.data.find((s: Shop) => s.owner_id === ownerId);
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

      const res = await fetch(
        `${GET_PRODUCT_API_URL}?id=${encodeURIComponent(productId)}`,{
                headers: {
                        'Content-Type': 'application/json',
                        "X-Auth-Token": AUTH_TOKEN,
                },
               method: "GET",
        }
      );
      console.log(
        `[ProductDetail] Fetching ID: ${productId}, Status: ${res.status}`,
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(`[ProductDetail] Fetch failed:`, text);
        throw new Error(`Failed to fetch product (${res.status})`);
      }

      const data = await res.json();
      console.log(`[ProductDetail] Raw Data Keys:`, Object.keys(data || {}));

      let fetchedProduct: any = null;

      // 1. Try to find the product object in common wrappers
      if (data && typeof data === "object") {
        if (data._id || data.id) {
          fetchedProduct = data;
        } else if (data.product && typeof data.product === "object") {
          fetchedProduct = data.product;
        } else if (data.data && typeof data.data === "object") {
          fetchedProduct = data.data;
        } else if (data.result && typeof data.result === "object") {
          fetchedProduct = data.result;
        }
      }

      // 2. Normalize ID if found
      if (fetchedProduct) {
        const actualId =
          fetchedProduct._id || fetchedProduct.id || fetchedProduct.product_id;
        if (actualId) {
          fetchedProduct._id = actualId; // Ensure we have _id for our internal logic
        }
      }

      if (fetchedProduct && fetchedProduct._id) {
        setProduct(fetchedProduct);

        // Use any available category field
        const cat =
          fetchedProduct.product_category ||
          fetchedProduct.product_cartegory ||
          fetchedProduct.category;

        if (cat) {
          fetchRelated(cat);
        }

        if (fetchedProduct.product_owner_id || fetchedProduct.owner_id) {
          const ownerId = fetchedProduct.product_owner_id || fetchedProduct.owner_id;
          fetchSellerShop(ownerId);
          fetchSellerProducts(ownerId);
        }
        fetchReviews();
      } else {
        console.warn(
          `[ProductDetail] Product extraction failed for ID ${productId}. Data:`,
          data,
        );
        setError("Product not found or invalid response");
      }
    } catch (err) {
      console.error("fetchProductData error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }

    if (!reviewTitle.trim() || !reviewText.trim()) {
      Alert.alert("Error", "Please fill in both title and review text.");
      return;
    }

    try {
      setIsSubmittingReview(true);
      const res = await fetch(CREATE_REVIEW_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          reviewer_id: user._id,
          title: reviewTitle,
          rating,
          review: reviewText,
          verified: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReviewTitle("");
        setReviewText("");
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
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>
          Loading product...
        </Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.container}>
        <View
          style={{ flexDirection: "row", alignItems: "center", padding: 10 }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, marginLeft: 10, fontSize: 18 }}>
            Error
          </Text>
        </View>
        <ErrorView
          message={error || "Product not found"}
          onRetry={fetchProductData}
        />
      </View>
    );
  }

  // Main Render
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 16 }}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.primary,
            fontSize: 24,
            fontWeight: "bold",
            flex: 1,
          }}
          numberOfLines={1}
        >
          {product.product_name}
        </Text>
      </View>

      <ScrollView
        style={{ padding: 10 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={{ position: "relative" }}>
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
                source={
                  item
                    ? { uri: item }
                    : require("@/assets/images/placeholder.webp")
                }
                style={[styles.image, { width: SCREEN_WIDTH - 20 }]}
                resizeMode="cover"
              />
            )}
          />
          {images.length > 1 ? (
            <View style={styles.paginationDots}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    activeImageIndex === index
                      ? styles.activeDot
                      : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <Text style={styles.title}>{product.product_name}</Text>
        <Text style={styles.price}>{formatPrice(product.product_price)}</Text>

        {product.product_discount !== undefined && product.product_discount > 0 ? (
          <Text style={styles.discount}>
            Discount: {formatPrice(product.product_discount)}
          </Text>
        ) : null}

        <View style={{ height: 8 }} />
        <Text style={styles.description}>{product.product_description}</Text>

        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Category:</Text>
          <Text style={styles.detailValue}>
            {product.product_category || product.product_cartegory || "N/A"}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Condition:</Text>
          <Text style={styles.detailValue}>
            {product.product_condition || "N/A"}
          </Text>
        </View>
        {/* 
        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Product:</Text>
          <Text style={styles.detailValue}>{product.product_sponsorship?.status || 'N/A'}</Text>
        </View> */}

        <View style={{ height: 16 }} />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {qty > 0 ? (
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => decrementItem(product._id)}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => incrementItem(product._id)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(product)}
            >
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          )}


            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                disabled={isBookmarking}
                onPress={async () => {
                  if (!user) {
                    router.push("/(auth)/login");
                    return;
                  }
                  if (!product) return;
                  try {
                    setIsBookmarking(true);
                    await toggleWishlist(product);
                  } catch (err) {
                    console.error("Error bookmarking:", err);
                  } finally {
                    setIsBookmarking(false);
                  }
                }}
              >
                <FontAwesome
                  name={(() => {
                    if (!product) return "heart-o";
                    const isBookmarked = wishlistIds.includes(product._id);
                    return isBookmarked ? "heart" : "heart-o";
                  })()}
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <Text style={styles.detailValue}>Bookmark</Text>
            </View>
          </View>

        {/* Seller Info Section */}
        <View style={styles.sellerSection}>
          <View style={styles.sellerHeader}>
            <View style={styles.sellerInfoMain}>
              <Image 
                source={{ uri: sellerShop?.profile_image || 'https://picsum.photos/100' }} 
                style={styles.sellerAvatar}
              />
              <View style={styles.sellerTextInfo}>
                <Text style={styles.sellerName}>{sellerShop?.shop_name || product.seller.username}</Text>
                <View style={styles.sellerBadgeRow}>
                  {sellerShop?.is_verified ? (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#166534" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.visitShopBtn}
              onPress={() => sellerShop?._id && router.push({ pathname: '/Screens/[id]', params: { id: sellerShop._id } })}
            >
              <Text style={styles.visitShopText}>Visit Shop</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sellerContactDetails}>
            <View style={styles.contactDetailItem}>
              <Ionicons name="person-outline" size={16} color={colors.grayish} />
              <Text style={styles.contactDetailText}>{product.seller.username}</Text>
            </View>
            <View style={styles.contactDetailItem}>
              <Ionicons name="mail-outline" size={16} color={colors.grayish} />
              <Text style={styles.contactDetailText}>{product.seller.email || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.sellerActionRow}>
            <TouchableOpacity 
              style={styles.chatSellerBtn}
              onPress={() => {
                if (!user) {
                  router.push('/(auth)/login');
                  return;
                }
                router.push({ 
                  pathname: '/Screens/chat', 
                  params: { 
                    sellerId: product.seller._id,
                    shopName: sellerShop?.shop_name || product.seller.username,
                    shopImage: sellerShop?.profile_image
                  } 
                });
              }}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#000" />
              <Text style={styles.chatSellerText}>Chat with Seller</Text>
            </TouchableOpacity>

            <View style={styles.contactIconsRow}>
              <TouchableOpacity 
                style={styles.contactIconBtn}
                onPress={() => product.seller.phoneNumber ? Linking.openURL(`tel:${product.seller.phoneNumber}`) : null}
              >
                <Ionicons name="call" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.contactIconBtn}
                onPress={() => product.seller.phoneNumber ? Linking.openURL(`whatsapp://send?phone=${product.seller.phoneNumber}`) : null}
              >
                <FontAwesome name="whatsapp" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Related Products */}
        {relatedProducts.length > 0 ? (
          <View style={{ marginTop: 32 }}>
            <Text style={styles.sectionTitle}>Related Products</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 12 }}
            >
              {relatedProducts.map((p) => (
                <TouchableOpacity
                  key={p._id}
                  style={styles.relatedCard}
                  onPress={() =>
                    router.push({
                      pathname: "/(modals)/product",
                      params: { id: p._id },
                    })
                  }
                >
                  <Image
                    source={{
                      uri: Array.isArray(p.product_image)
                        ? p.product_image[0]
                        : p.product_image,
                    }}
                    style={styles.relatedImage}
                  />
                  <View style={styles.relatedInfo}>
                    <Text style={styles.relatedName} numberOfLines={1}>
                      {p.product_name}
                    </Text>
                    <Text style={styles.relatedPrice}>
                      {formatPrice(p.product_price)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Seller's Other Products */}
        {sellerProducts.length > 0 ? (
          <View style={{ marginTop: 32 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>More from this Seller</Text>
              <TouchableOpacity onPress={() => sellerShop?._id && router.push({ pathname: '/Screens/[id]', params: { id: sellerShop._id } })}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 12 }}
            >
              {sellerProducts.map((p) => (
                <TouchableOpacity
                  key={p._id}
                  style={styles.relatedCard}
                  onPress={() =>
                    router.push({
                      pathname: "/(modals)/product",
                      params: { id: p._id },
                    })
                  }
                >
                  <Image
                    source={{
                      uri: Array.isArray(p.product_image)
                        ? p.product_image[0]
                        : p.product_image,
                    }}
                    style={styles.relatedImage}
                  />
                  <View style={styles.relatedInfo}>
                    <Text style={styles.relatedName} numberOfLines={1}>
                      {p.product_name}
                    </Text>
                    <Text style={styles.relatedPrice}>
                      {formatPrice(p.product_price)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Reviews Section */}
        <View style={{ marginTop: 24, marginBottom: 40 }}>
          <Text style={styles.sectionTitle}>
            Customer Reviews ({reviews.length})
          </Text>

          {user ? (
            <View style={styles.reviewForm}>
              <Text
                style={{
                  color: colors.text,
                  fontWeight: "700",
                  marginBottom: 12,
                }}
              >
                Write a Review
              </Text>
              <View style={{ flexDirection: "row", marginBottom: 12, gap: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={24}
                      color="#FFD700"
                    />
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
                style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                placeholder="Share your experience..."
                placeholderTextColor={colors.grayish}
                multiline
                value={reviewText}
                onChangeText={setReviewText}
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  {
                    width: "100%",
                    marginTop: 12,
                    backgroundColor: isSubmittingReview
                      ? colors.gray
                      : colors.primary,
                  },
                ]}
                onPress={submitReview}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.addButtonText}>Submit Review</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          {reviews.length === 0 ? (
            <Text style={{ color: colors.grayish, marginTop: 16 }}>
              No reviews yet. Be the first to review!
            </Text>
          ) : (
            reviews.map((rev) => (
              <View key={rev._id} style={styles.reviewItem}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: "700" }}>
                    {rev.title}
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name="star"
                        size={12}
                        color={i < rev.rating ? "#FFD700" : "#E0E0E0"}
                      />
                    ))}
                  </View>
                </View>
                <Text
                  style={{ color: colors.grayish, fontSize: 13, marginTop: 4 }}
                >
                  {rev.review}
                </Text>
                <Text
                  style={{ color: colors.grayish, fontSize: 10, marginTop: 4 }}
                >
                  {new Date(rev._creationTime).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const appStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    image: {
      width: "100%",
      height: 320,
      backgroundColor: "#111",
      borderRadius: 8,
    },
    title: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "700",
      marginTop: 12,
    },
    price: {
      color: colors.green,
      fontSize: 16,
      fontWeight: "800",
      marginTop: 4,
    },
    discount: {
      color: colors.success || "#4CAF50",
      fontSize: 14,
      fontWeight: "600",
      marginTop: 4,
    },
    description: {
      color: colors.grayish,
      fontSize: 14,
      lineHeight: 20,
    },
    detailsRow: {
      flexDirection: "row",
      marginTop: 8,
      alignItems: "center",
    },
    detailLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginRight: 8,
    },
    detailValue: {
      color: colors.grayish,
      fontSize: 12,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      width: "50%",
    },
    addButtonText: {
      color: "#000",
      fontWeight: "800",
      fontSize: 16,
    },
    qtyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    qtyBtn: {
      width: 44,
      height: 44,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    qtyBtnText: {
      color: "#000",
      fontSize: 20,
      fontWeight: "900",
    },
    qtyText: {
      color: colors.text,
      fontSize: 16,
      minWidth: 24,
      textAlign: "center",
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginTop: 20,
      marginBottom: 8,
    },
    sellerSection: {
      marginTop: 24,
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.gray + "20",
    },
    sellerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sellerInfoMain: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    sellerAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.gray + "20",
    },
    sellerTextInfo: {
      flex: 1,
    },
    sellerName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    sellerBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 2,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#dcfce7',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      gap: 2,
    },
    verifiedText: {
      color: '#166534',
      fontSize: 10,
      fontWeight: '700',
    },
    visitShopBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    visitShopText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    sellerContactDetails: {
      marginTop: 16,
      gap: 8,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.gray + "10",
    },
    contactDetailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    contactDetailText: {
      color: colors.grayish,
      fontSize: 14,
    },
    sellerActionRow: {
      flexDirection: 'row',
      marginTop: 20,
      gap: 12,
      alignItems: 'center',
    },
    chatSellerBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    chatSellerText: {
      color: '#000',
      fontSize: 14,
      fontWeight: '700',
    },
    contactIconsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    contactIconBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.gray + "20",
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    viewAllText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    relatedCard: {
      marginRight: 16,
      width: 150,
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.gray + "10",
    },
    relatedImage: {
      width: 150,
      height: 150,
      backgroundColor: colors.gray + "10",
    },
    relatedInfo: {
      padding: 8,
    },
    relatedName: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
    },
    relatedPrice: {
      color: colors.green,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 2,
    },
    reviewForm: {
      marginTop: 20,
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.gray + "33",
    },
    reviewItem: {
      marginTop: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray + "33",
      paddingBottom: 12,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.gray + "33",
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      fontSize: 14,
    },
    paginationDots: {
      flexDirection: "row",
      position: "absolute",
      bottom: 16,
      alignSelf: "center",
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
      backgroundColor: "rgba(255, 255, 255, 0.5)",
    },
  });
