import { Product } from '@/types/product';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, ToastAndroid } from 'react-native';

// Re-export Product type for convenience
export type { Product } from '@/types/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

// In-memory stores (simple and lightweight)
const cartItems: CartItem[] = []
const wishlistIds = new Set<string>()

// Simple pub/sub for reactive UI
type Listener = () => void
const listeners = new Set<Listener>()

// Stable snapshot for useSyncExternalStore
type CartSnapshot = { items: CartItem[]; count: number; total: number }
let currentSnapshot: CartSnapshot = { items: cartItems, count: 0, total: 0 }
let hydrated = false

function recomputeSnapshot() {
  currentSnapshot = {
    items: cartItems,
    count: cartItems.reduce((sum, ci) => sum + ci.quantity, 0),
    total: cartItems.reduce((sum, ci) => sum + parseFloat(ci.product.product_price) * ci.quantity, 0),
  }
}

function emitChange() {
  recomputeSnapshot()
  // persist after state change
  void persistState()
  listeners.forEach(l => l())
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Helpers
function findCartIndexByProductId(productId: string): number {
  return cartItems.findIndex(ci => ci.product._id === productId)
}

// Cart operations
export function addToCart(product: Product, qty: number = 1): void {
  const index = findCartIndexByProductId(product._id)
  if (index >= 0) {
    cartItems[index].quantity += qty
  } else {
    cartItems.push({ product, quantity: Math.max(1, qty) })
  }
  ToastAndroid.showWithGravity(`${product.product_name} added to cart!`, ToastAndroid.SHORT, ToastAndroid.TOP
  );
  emitChange()
}

export function incrementCartItem(productId: string): void {
  const index = findCartIndexByProductId(productId)
  if (index >= 0) {
    cartItems[index].quantity += 1
    emitChange()
  }
}

export function decrementCartItem(productId: string): void {
  const index = findCartIndexByProductId(productId)
  if (index >= 0) {
    cartItems[index].quantity -= 1
    if (cartItems[index].quantity <= 0) cartItems.splice(index, 1)
    emitChange()
  }
}

export function removeFromCart(productId: string): void {
  const index = findCartIndexByProductId(productId)
  if (index >= 0) {
    cartItems.splice(index, 1)
    ToastAndroid.showWithGravity(`Item removed from cart!`, ToastAndroid.SHORT, ToastAndroid.TOP)
    emitChange()
  }
}

export function clearCart(): void {
  if (cartItems.length === 0) return;

  cartItems.length = 0;
  ToastAndroid.showWithGravity(`Cart Cleared`, ToastAndroid.SHORT, ToastAndroid.TOP)
  emitChange();
}

export function confirmClearCart() {
  Alert.alert(
    "Clear Cart?",
    "Are you sure you want to remove all items from your cart?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes Clear ",
        style: "destructive",
        onPress: () => clearCart()
      }
    ]
  );
};



export function getCartItems(): CartItem[] {
  return cartItems
}

export function getCartCount(): number {
  return cartItems.reduce((sum, ci) => sum + ci.quantity, 0)
}

export function getCartTotal(): number {
  return cartItems.reduce((sum, ci) => sum + parseFloat(ci.product.product_price) * ci.quantity, 0)
}

export function getCartQuantity(productId: string): number {
  const index = findCartIndexByProductId(productId)
  return index >= 0 ? cartItems[index].quantity : 0
}

// Wishlist operations
export function addToWishlist(product: Product): void {
  if (!wishlistIds.has(product._id)) {
    wishlistIds.add(product._id)
    Alert.alert('Added to Wishlist', `${product.product_name} has been added to your wishlist!`)
    emitChange()
  }
}

export function removeFromWishlist(productId: string): void {
  wishlistIds.delete(productId)
  emitChange()
}

export function toggleWishlist(product: Product): void {
  if (wishlistIds.has(product._id)) {
    wishlistIds.delete(product._id)
    Alert.alert('Removed from Wishlist', `${product.product_name} has been removed from your wishlist!`)
  } else {
    wishlistIds.add(product._id)
    Alert.alert('Added to Wishlist', `${product.product_name} has been added to your wishlist!`)
  }
  emitChange()
}

export function isInWishlist(productId: string): boolean {
  return wishlistIds.has(productId)
}

export function getWishlistIds(): string[] {
  return Array.from(wishlistIds)
}

// Convenience wrappers expected by UI
export function AddToCart(product: Product): void {
  addToCart(product, 1)
}

export function AddToWishlist(product: Product): void {
  addToWishlist(product)
}

// React hooks using useSyncExternalStore for stable subscriptions
import { useSyncExternalStore } from 'react';

export function useCartStore() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => currentSnapshot,
    () => ({ items: [], count: 0, total: 0 })
  )
  return snapshot
}

export function useWishlistStore() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => ({
      ids: getWishlistIds(),
    }),
    () => ({ ids: [] })
  )
  return snapshot
}

// Persistence
const CART_KEY = 'shopcheap_cart_v2'
const WISHLIST_KEY = 'shopcheap_wishlist_v2'

async function persistState() {
  try {
    const cartPayload = cartItems.map(ci => ({ product: ci.product, quantity: ci.quantity }))
    const wishlistPayload = Array.from(wishlistIds)
    await AsyncStorage.multiSet([
      [CART_KEY, JSON.stringify(cartPayload)],
      [WISHLIST_KEY, JSON.stringify(wishlistPayload)],
    ])
  } catch (e) {
    // no-op persist failure
  }
}

async function hydrateState() {
  if (hydrated) return
  hydrated = true
  try {
    const stores = await AsyncStorage.multiGet([CART_KEY, WISHLIST_KEY]) as [string, string | null][]
    const cartRaw = stores.find(([key]) => key === CART_KEY)?.[1]
    const wishlistRaw = stores.find(([key]) => key === WISHLIST_KEY)?.[1]
    if (cartRaw) {
      const parsed: { product: Product; quantity: number }[] = JSON.parse(cartRaw)
      cartItems.splice(0, cartItems.length, ...parsed)
    }
    if (wishlistRaw) {
      const parsedIds: string[] = JSON.parse(wishlistRaw)
      wishlistIds.clear()
      parsedIds.forEach(id => wishlistIds.add(id))
    }
  } catch (e) {
    // ignore hydration errors
  } finally {
    emitChange()
  }
}

// kick off hydration on module load
void hydrateState()

export function useHydrationReady(): boolean {
  return true
}