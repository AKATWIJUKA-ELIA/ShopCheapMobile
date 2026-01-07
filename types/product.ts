// API Product interface matching the backend
export interface Product {
    _id: string;
    _creationTime: number;
    product_name: string;
    product_image: string | string[];
    product_price: string;
    product_description: string;
    product_category: string;
    product_cartegory?: string; // Support for misspelled field
    product_condition: string;
    product_owner_id: string;
    product_likes?: number;
    product_views?: number;
    product_discount?: number;
    product_embeddings?: any[];
    product_image_embeddings?: any[];
    product_sponsorship?: {
        duration: number;
        status: string;
        type: string;
    };
    approved: boolean;
    seller: {
        _id: string;
        username: string;
        isVerified: boolean;
        phoneNumber?: string;
        email?: string;
    };
}

export interface Review {
    _id: string;
    product_id: string;
    reviewer_id: string;
    title: string;
    rating: number;
    review: string;
    verified: boolean | null;
    _creationTime: number;
}

export interface Category {
    _id: string;
    // _creationTime: number; 
    category: string; // Corrected from cartegory
    cartegory: string;
    title?: string; // Fallback
    image?: {
        uri: string;
    } | string | any;
}

export interface Shop {
    _id: string;
    shop_name: string;
    description: string;
    owner_id: string;
    slogan: string;
    profile_image: string;
    cover_image: string;
    is_verified: boolean;
    isOpen: boolean;
    location: {
        lat: number;
        lng: number;
    };
    phone?: string;
    email?: string;
    productCount?: number;
    _creationTime?: number;
}

export interface Order {
    _id: string;
    _creationTime: number;
    order_status: string;
    product_id: string;
    quantity: number;
    user_id: string;
    cost: number | null;
    specialInstructions: string | null;
    sellerId: string | null;
    product?: {
        _id: string;
        product_name: string;
        product_image: string | string[];
        product_price: string;
    };
}

// Format price with UGX currency
export function formatPrice(price: string | number): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'UGX 0';
    return `UGX ${numPrice.toLocaleString()}`;
}

// API endpoint
export const API_BASE_URL = 'https://cheery-cod-687.convex.site';
export const PRODUCTS_API_URL = `${API_BASE_URL}/products`;
export const CATEGORIES_API_URL = `${API_BASE_URL}/categories`;
export const AUTH_API_URL = `${API_BASE_URL}/auth`;
export const CREATE_USER_API_URL = `${API_BASE_URL}/create-user`;
export const UPDATE_USER_API_URL = `${API_BASE_URL}/update-user`;
export const SELLER_REGISTER_API_URL = `${API_BASE_URL}/seller/register`;
export const CREATE_SHOP_API_URL = `${API_BASE_URL}/create/shop`;
export const CREATE_PRODUCT_API_URL = `${API_BASE_URL}/create-product`;
export const GET_SHOP_BY_OWNER_API_URL = `${API_BASE_URL}/shop/owner`;
export const GET_PRODUCTS_BY_SELLER_API_URL = `${API_BASE_URL}/products/seller`;
export const GET_ORDERS_BY_SELLER_API_URL = `${API_BASE_URL}/orders/seller`;
export const GET_PRODUCT_API_URL = `${API_BASE_URL}/product`;
export const GET_RELATED_PRODUCTS_API_URL = `${API_BASE_URL}/products/related`;
export const CREATE_REVIEW_API_URL = `${API_BASE_URL}/create-review`;
export const GET_REVIEWS_API_URL = `${API_BASE_URL}/review`;
export const GET_CART_API_URL = `${API_BASE_URL}/cart`;
export const CREATE_CART_API_URL = `${API_BASE_URL}/create-cart`;
export const INCREASE_CART_API_URL = `${API_BASE_URL}/increase-cart`;
export const REDUCE_CART_API_URL = `${API_BASE_URL}/reduce-cart`;
export const DELETE_CART_API_URL = `${API_BASE_URL}/delete-cart`;
export const GET_SHOPS_API_URL = `${API_BASE_URL}/shops`;
export const GET_USER_API_URL = `${API_BASE_URL}/user`;
export const GET_BOOKMARKS_API_URL = `${API_BASE_URL}/bookmarks`;
export const GET_USER_ORDERS_API_URL = `${API_BASE_URL}/orders`;
