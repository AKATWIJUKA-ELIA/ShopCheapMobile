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

                // Optimistic update locally
                if (isBookmarked) {
                    set({
                        wishlistIds: wishlistIds.filter((id) => id !== product._id),
                        wishlistItems: get().wishlistItems.filter((p) => p._id !== product._id)
                    });
                } else {
                    set({
                        wishlistIds: [...wishlistIds, product._id],
                        wishlistItems: [...get().wishlistItems, product]
                    });
                }

                if (user) {
                    try {
                        if (!isBookmarked) {
                            // Use the new /bookmarks/add API
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
                                    const { wishlistIds: prevIds, wishlistItems: prevItems } = get();
                                    set({
                                        wishlistIds: prevIds.filter(id => id !== product._id),
                                        wishlistItems: prevItems.filter(p => p._id !== product._id)
                                    });
                                }
                            }
                        } else {
                            // Removing bookmark
                            const { API_BASE_URL } = await import('@/types/product');
                            const res = await fetch(`${API_BASE_URL}/bookmarks/toggle`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: user._id, productId: product._id, user_id: user._id, product_id: product._id })
                            });
                            if (!res.ok) {
                                console.log(`[BookmarkSync] Toggle/Remove failed: ${res.status}`);
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

                const { GET_BOOKMARKS_API_URL } = await import('@/types/product');
                try {
                    console.log(`[BookmarkSync] Fetching for user: ${user._id}`);
                    const res = await fetch(`${GET_BOOKMARKS_API_URL}?userId=${user._id}`);

                    if (!res.ok) {
                        const text = await res.text();
                        console.error(`[BookmarkSync] Fetch failed (${res.status}):`, text);
                        return;
                    }

                    const data = await res.json();
                    console.log(`[BookmarkSync] Raw data from /bookmarks:`, JSON.stringify(data, null, 2));
                    let bookmarks: Product[] = [];

                    if (Array.isArray(data)) {
                        bookmarks = data;
                    } else if (data && Array.isArray(data.bookmarks)) {
                        bookmarks = data.bookmarks;
                    } else if (data && Array.isArray(data.data)) {
                        bookmarks = data.data;
                    }

                    // Handle case where products might be wrapped: { product: { ... } }
                    const sanitizedBookmarks = bookmarks.map((item: any) => {
                        let p = { ...item }; // Start with a copy
                        if (item.product && typeof item.product === 'object') {
                            p = { ...item.product };
                        }

                        // Ensure we have the standard field names
                        // Prioritize product_id/productId if they exist as they are more likely to be the actual product IDs
                        const actualId = p.product_id || p.productId || p._id || p.id;
                        p._id = actualId;

                        if (!p.product_name) p.product_name = p.name || p.title || p.productName;
                        if (!p.product_price) p.product_price = p.price || p.productPrice;
                        if (!p.product_image) p.product_image = p.image || p.images || p.productImage || p.product_images;
                        if (!p.product_category) p.product_category = p.category || p.product_cartegory || p.cartegory;

                        return p;
                    }).filter((p: any) => p && p._id);

                    console.log(`[BookmarkSync] Sanitized IDs:`, sanitizedBookmarks.map(p => p._id));

                    // Compare IDs to see if they changed
                    const currentIds = get().wishlistIds;
                    const newIds = sanitizedBookmarks.map((p: any) => p._id);

                    if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
                        set({
                            wishlistItems: sanitizedBookmarks,
                            wishlistIds: newIds
                        });
                        console.log(`[BookmarkSync] Updated state with ${sanitizedBookmarks.length} items. First item:`, JSON.stringify(sanitizedBookmarks[0], null, 2));
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
                let body: any = { user_id: user._id, product_Id: productId };

                switch (action) {
                    case 'add':
                        url = CREATE_CART_API_URL;
                        body = { CartItem: { product_id: productId, quantity, cart_Owner_id: user._id } };
                        break;
                    case 'increase':
                        url = INCREASE_CART_API_URL;
                        break;
                    case 'reduce':
                        url = REDUCE_CART_API_URL;
                        break;
                    case 'delete':
                        url = DELETE_CART_API_URL;
                        break;
                }

                try {
                    await fetch(url, {
                        method: 'POST',
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
