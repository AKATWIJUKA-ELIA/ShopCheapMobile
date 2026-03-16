import { ADD_BOOKMARK_API_URL, CREATE_CART_API_URL, DELETE_CART_API_URL, GET_CART_API_URL, INCREASE_CART_API_URL, Product, REDUCE_CART_API_URL } from '@/types/product';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    wishlistIds: string[];
    total: number;
    count: number;

    // Actions
    addToCart: (product: Product, quantity?: number) => void;
    incrementItem: (productId: string) => void;
    decrementItem: (productId: string) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;

    // Wishlist Actions
    wishlistItems: Product[];
    toggleWishlist: (product: Product) => void;
    isInWishlist: (productId: string) => boolean;
    fetchBookmarks: () => Promise<void>;

    // API Sync
    fetchCart: () => Promise<void>;
    syncCartItem: (productId: string, action: 'add' | 'increase' | 'reduce' | 'delete', quantity?: number) => Promise<void>;

    // Internal recompute
    recompute: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            wishlistIds: [],
            wishlistItems: [],
            total: 0,
            count: 0,

            recompute: () => {
                const { items } = get();
                const total = items.reduce((sum, item) => sum + parseFloat(item.product.product_price) * item.quantity, 0);
                const count = items.reduce((sum, item) => sum + item.quantity, 0);
                set({ total, count });
            },

            addToCart: async (product, quantity = 1) => {
                const { items, recompute, syncCartItem } = get();
                const user = useAuthStore.getState().user;

                if (user) {
                    await syncCartItem(product._id, 'add', quantity);
                    // Fetch fresh cart from backend after successful sync
                    await get().fetchCart();
                } else {
                    const index = items.findIndex((i) => i.product._id === product._id);
                    if (index >= 0) {
                        items[index].quantity += quantity;
                        set({ items: [...items] });
                    } else {
                        set({ items: [...items, { product, quantity }] });
                    }
                    recompute();
                }
            },

            incrementItem: async (productId) => {
                const { syncCartItem } = get();
                const user = useAuthStore.getState().user;

                if (user) {
                    await syncCartItem(productId, 'increase');
                    await get().fetchCart();
                } else {
                    const { items, recompute } = get();
                    const index = items.findIndex((i) => i.product._id === productId);
                    if (index >= 0) {
                        items[index].quantity += 1;
                        set({ items: [...items] });
                        recompute();
                    }
                }
            },

            decrementItem: async (productId) => {
                const { syncCartItem } = get();
                const user = useAuthStore.getState().user;

                if (user) {
                    await syncCartItem(productId, 'reduce');
                    await get().fetchCart();
                } else {
                    const { items, recompute } = get();
                    const index = items.findIndex((i) => i.product._id === productId);
                    if (index >= 0) {
                        const currentQty = items[index].quantity;
                        if (currentQty > 1) {
                            items[index].quantity -= 1;
                            set({ items: [...items] });
                        } else {
                            set({ items: items.filter((i) => i.product._id !== productId) });
                        }
                        recompute();
                    }
                }
            },

            removeFromCart: async (productId) => {
                const { syncCartItem } = get();
                const user = useAuthStore.getState().user;

                if (user) {
                    await syncCartItem(productId, 'delete');
                    await get().fetchCart();
                } else {
                    const { items, recompute } = get();
                    set({ items: items.filter((i) => i.product._id !== productId) });
                    recompute();
                }
            },

            clearCart: async () => {
                const { items, syncCartItem } = get();
                const user = useAuthStore.getState().user;

                if (user) {
                    try {
                        // Delete each item from backend
                        for (const item of items) {
                            await syncCartItem(item.product._id, 'delete');
                        }
                        await get().fetchCart();
                    } catch (error) {
                        console.error("Error clearing cart on backend:", error);
                    }
                } else {
                    set({ items: [], total: 0, count: 0 });
                }
            },

            toggleWishlist: async (product) => {
                const { wishlistIds } = get();
                const user = useAuthStore.getState().user;
                const isBookmarked = wishlistIds.includes(product._id);

                console.log(`[BookmarkSync] toggleWishlist called. Product ID: ${product._id}, isBookmarked: ${isBookmarked}, user: ${user?._id}`);
                console.log(`[BookmarkSync] Current wishlistIds:`, wishlistIds);

                // Optimistic update locally
                if (isBookmarked) {
                    console.log(`[BookmarkSync] Removing from local state...`);
                    set({
                        wishlistIds: wishlistIds.filter((id) => id !== product._id),
                        wishlistItems: get().wishlistItems.filter((p) => p._id !== product._id)
                    });
                } else {
                    console.log(`[BookmarkSync] Adding to local state...`);
                    set({
                        wishlistIds: [...wishlistIds, product._id],
                        wishlistItems: [...get().wishlistItems, product]
                    });
                }

                if (user) {
                    try {
                        if (!isBookmarked) {
                            // Adding bookmark
                            console.log(`[BookmarkSync] Calling ADD API...`);
                            const res = await fetch(ADD_BOOKMARK_API_URL, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    product_id: product._id,
                                    user_id: user._id,
                                    productId: product._id,
                                    userId: user._id,
                                }),
                            });

                            if (!res.ok) {
                                const errorText = await res.text();
                                console.log(`[BookmarkSync] Add FAILED (${res.status}): ${errorText}`);
                                if (errorText.includes("already bookmarked")) {
                                    console.log("[BookmarkSync] Item already bookmarked on server, keeping local state.");
                                } else {
                                    // REVERT on other errors
                                    console.log("[BookmarkSync] Reverting local state due to server error.");
                                    set({
                                        wishlistIds: get().wishlistIds.filter(id => id !== product._id),
                                        wishlistItems: get().wishlistItems.filter(p => p._id !== product._id)
                                    });
                                }
                            } else {
                                console.log(`[BookmarkSync] Add SUCCESS`);
                            }
                        } else {
                            // Removing bookmark
                            console.log(`[BookmarkSync] Calling DELETE API with product_id: ${product._id}, user_id: ${user._id}`);
                            const { API_BASE_URL } = await import('@/types/product');
                            const deleteUrl = `${API_BASE_URL}/bookmarks/delete`;
                            console.log(`[BookmarkSync] DELETE URL: ${deleteUrl}`);

                            const res = await fetch(deleteUrl, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    product_id: product._id,
                                    user_id: user._id
                                })
                            });

                            const responseText = await res.text();
                            console.log(`[BookmarkSync] Delete response (${res.status}): ${responseText}`);

                            if (!res.ok) {
                                console.log(`[BookmarkSync] Delete failed (${res.status})`);
                                // Revert optimistic removal if it failed
                                if (res.status !== 404) { // Don't revert if it just wasn't found
                                    set({
                                        wishlistIds: [...get().wishlistIds, product._id],
                                        wishlistItems: [...get().wishlistItems, product]
                                    });
                                }
                            } else {
                                console.log(`[BookmarkSync] Delete SUCCESS`);
                            }
                        }
                        // Always refetch to stay in sync
                        console.log("[BookmarkSync] Triggering fetchBookmarks after toggle.");
                        await get().fetchBookmarks();
                    } catch (error) {
                        console.error("[BookmarkSync] Error toggling bookmark on backend:", error);
                    }
                }
            },

            isInWishlist: (productId) => {
                return get().wishlistIds.includes(productId);
            },

            fetchBookmarks: async () => {
                const user = useAuthStore.getState().user;
                if (!user) return;

                const { GET_BOOKMARKS_API_URL, GET_PRODUCT_API_URL } = await import('@/types/product');
                try {
                    console.log(`[BookmarkSync] Fetching for user: ${user._id}`);
                    const res = await fetch(`${GET_BOOKMARKS_API_URL}?userId=${user._id}`);

                    if (!res.ok) {
                        const text = await res.text();
                        console.error(`[BookmarkSync] Fetch failed (${res.status}):`, text);
                        return;
                    }

                    const data = await res.json();
                    let bookmarksRaw: any[] = [];

                    if (Array.isArray(data)) {
                        bookmarksRaw = data;
                    } else if (data && Array.isArray(data.bookmarks)) {
                        bookmarksRaw = data.bookmarks;
                    } else if (data && Array.isArray(data.data)) {
                        bookmarksRaw = data.data;
                    }

                    console.log(`[BookmarkSync] Raw bookmarks count: ${bookmarksRaw.length}`);

                    // 1. Sanitize and extract IDs
                    const bookmarksWithPartialData = bookmarksRaw.map((item: any) => {
                        let p = { ...(item.product && typeof item.product === 'object' ? item.product : item) };
                        const actualId = p.product_id || p.productId || p._id || p.id || item.product_id || item.productId;
                        p._id = actualId;
                        return p;
                    }).filter(p => p && p._id);

                    // 2. Identify which ones need full data fetch (missing essential fields)
                    const itemsToFetch = bookmarksWithPartialData.filter(p => !p.product_name || !p.product_price);

                    console.log(`[BookmarkSync] Items needing full detail fetch: ${itemsToFetch.length}`);

                    // 3. Fetch missing details concurrently
                    const fullDetails = await Promise.all(itemsToFetch.map(async (partial) => {
                        try {
                            const pRes = await fetch(`${GET_PRODUCT_API_URL}?id=${partial._id}`);
                            if (pRes.ok) {
                                const pData = await pRes.json();
                                // Handle both direct object or { product: { ... } }
                                return pData.product || pData.data || pData.result || pData;
                            }
                        } catch (err) {
                            console.error(`[BookmarkSync] Failed to fetch details for ${partial._id}:`, err);
                        }
                        return null;
                    }));

                    // 4. Merge partial and full data
                    const detailedBookmarks = bookmarksWithPartialData.map(partial => {
                        const full = fullDetails.find(f => f && (f._id === partial._id || f.id === partial._id));
                        if (full) {
                            // Merge and ensure standard fields
                            const merged = { ...partial, ...full };
                            merged._id = partial._id; // Keep our verified ID
                            if (!merged.product_name) merged.product_name = merged.name || merged.title;
                            if (!merged.product_price) merged.product_price = merged.price || merged.productPrice;
                            if (!merged.product_image) merged.product_image = merged.image || merged.images || merged.productImage;
                            return merged;
                        }
                        return partial;
                    });

                    // 5. Final sanitization/normalization
                    const sanitizedBookmarks = detailedBookmarks.map((p: any) => {
                        if (!p.product_name) p.product_name = p.name || p.title || p.productName || 'Unknown Product';
                        if (!p.product_price) p.product_price = p.price || p.productPrice || '0';
                        if (!p.product_image) p.product_image = p.image || p.images || p.productImage || p.product_images;
                        if (!p.product_category) p.product_category = p.category || p.product_cartegory || p.cartegory || 'Product';
                        return p;
                    });

                    const newIds = sanitizedBookmarks.map((p: any) => p._id);
                    const currentIds = get().wishlistIds;

                    // Always update if we fetched details, or if IDs changed
                    if (itemsToFetch.length > 0 || JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
                        set({
                            wishlistItems: sanitizedBookmarks,
                            wishlistIds: newIds
                        });
                        console.log(`[BookmarkSync] State updated with ${sanitizedBookmarks.length} items.`);
                    } else {
                        console.log(`[BookmarkSync] No changes detected in bookmarks`);
                    }
                } catch (error) {
                    console.error("[BookmarkSync] Error fetching bookmarks:", error);
                }
            },

            fetchCart: async () => {
                const user = useAuthStore.getState().user;
                if (!user) return;

                try {
                    console.log(`[CartSync] Fetching cart for user: ${user._id}`);
                    const res = await fetch(`${GET_CART_API_URL}?userId=${user._id}`);
                    console.log(`[CartSync] API Status: ${res.status}`);

                    if (!res.ok) {
                        const text = await res.text();
                        console.error(`[CartSync] Fetch failed:`, text);
                        return;
                    }

                    const data = await res.json();
                    console.log(`[CartSync] Received data length: ${Array.isArray(data) ? data.length : 'Not an array'}`);

                    if (Array.isArray(data)) {
                        const cartItems: CartItem[] = data.map(item => ({
                            product: item.product,
                            quantity: item.quantity
                        }));

                        // Simple check to avoid redundant sets if nothing changed
                        const currentItems = get().items;
                        if (JSON.stringify(currentItems) !== JSON.stringify(cartItems)) {
                            set({ items: cartItems });
                            get().recompute();
                            console.log(`[CartSync] Cart state updated with ${cartItems.length} items`);
                        } else {
                            console.log(`[CartSync] No changes detected in cart`);
                        }
                    } else if (data && typeof data === 'object' && Array.isArray(data.cart)) {
                        // Handle potential { success: true, cart: [...] } format
                        const cartItems: CartItem[] = data.cart.map((item: any) => ({
                            product: item.product,
                            quantity: item.quantity
                        }));

                        const currentItems = get().items;
                        if (JSON.stringify(currentItems) !== JSON.stringify(cartItems)) {
                            set({ items: cartItems });
                            get().recompute();
                            console.log(`[CartSync] Cart state updated with ${cartItems.length} items (nested object)`);
                        } else {
                            console.log(`[CartSync] No changes detected in cart (nested object)`);
                        }
                    } else {
                        console.warn("[CartSync] Unexpected data format:", data);
                    }
                } catch (error) {
                    console.error("[CartSync] Error fetching cart from API:", error);
                }
            },

            syncCartItem: async (productId, action, quantity = 1) => {
                const user = useAuthStore.getState().user;
                if (!user) return;

                let url = '';
                let method = 'POST';
                let body: any = { user_id: user._id, product_Id: productId };

                switch (action) {
                    case 'add':
                        url = CREATE_CART_API_URL;
                        method = 'POST';
                        body = { CartItem: { product_id: productId, quantity, cart_Owner_id: user._id } };
                        break;
                    case 'increase':
                        url = INCREASE_CART_API_URL;
                        method = 'POST';
                        break;
                    case 'reduce':
                        url = REDUCE_CART_API_URL;
                        method = 'POST';
                        break;
                    case 'delete':
                        url = DELETE_CART_API_URL;
                        method = 'DELETE';
                        break;
                }

                try {
                    await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                } catch (error) {
                    console.error(`Error syncing cart action ${action}:`, error);
                }
            },
        }),
        {
            name: 'shopcheap-cart-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
