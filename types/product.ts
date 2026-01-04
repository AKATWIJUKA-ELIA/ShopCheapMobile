// API Product interface matching the backend
export interface Product {
    _id: string;
    _creationTime: number;
    product_name: string;
    product_image: string;
    product_price: string;
    product_description: string;
    product_cartegory: string;
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
}

export interface Category {
    _id: string;
    // _creationTime: number; 
    cartegory: string; // The API uses this typo
    category?: string; // Optional for compatibility
    title?: string; // Fallback
    image?: {
        uri: string;
    } | string | any;
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
