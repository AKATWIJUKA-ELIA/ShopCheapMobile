
export interface Product {
        _id:string,
        approved: boolean,
        product_cartegory: string,
        product_condition: "new"|"used"| "refurbished",
        product_description: string,
        product_image: string[]
        product_name: string,
        product_owner_id: string,
        product_price: string,
        product_embeddings?: number[],
        product_image_embeddings?: number[],
        product_likes?: number,
        product_views?: number,
        product_sponsorship?: {
                type?: "basic" | "premium" | "platinum",
                duration?: number,
                status?: "active" | "expired"
        }
        _creationTime: number
}
export interface User {
        _id:string,
        username: string,
        email: string,
        passwordHash: string|undefined,
        phoneNumber?: string,
        profilePicture?: string,
        isVerified: boolean | false,
        role: "admin"|"user"|"seller",
        reset_token?:string
        reset_token_expires:number,
        updatedAt: number,
        lastLogin?: number,
        _creationTime:number,
}
export type User2 = Omit<User, "_id"|"passwordHash"| "reset_token"|"reset_token_expires"| "lastLogin"|"_creationTime"| "updatedAt"| "role"| "isVerified">
export type UpdateUserFields = Omit<Partial<User>,"_id"|"_creationTime"|"updatedAt"|"updatedAt"|"reset_token"|"reset_token_expires"|"_creationTime"|"role"> 
export type GoogleSignUpData = Omit<User2, "_id"|"passwordHash"| "reset_token"|"reset_token_expires"| "lastLogin"|"_creationTime"| "updatedAt"| "role"| "isVerified">&{
        password:string,
        phoneNumber:string,
        profilePicture:string,
}

export interface Bookmark {
        _id?:string,
        product_id?: string,
        user_id?: string,
        _creationTime?: number,
        product?: {
                approved: boolean;
                product_cartegory: string;
                product_condition: "new" | "used" | "refurbished";
                product_description: string;
                product_image: string[];
                product_name: string;
                product_owner_id: string;
                product_price: string;
                _creationTime: number;
                _id: string;
  }|null;
}
export interface Boost {
        product_id:string,
        boost_type: "premium" | "basic" | "platinum",
        duration: string,
        status: "active" | "expired" | undefined
        amount?: number,
}
export interface FetchBoost {
        product_id:string,
        boost_type: "premium" | "basic" | "platinum",
        duration: number,
        status: "active" | "expired" | undefined
        amount?: number,
}
export interface Interaction{
          user_id: string
          product_id: string
          count:number
          type:  {
                  view:{
                          count:number
                  },
                  cart:{
                          count:number
                  }
            },
}
export interface BoostWithInteraction extends Product {
        interaction?: Interaction
}

export type Order = {
  _id:string,
  user_id:string,
  order_status: "pending" | "confirmed" | "out-for-delivery" | "delivered" | "cancelled"
  _creationTime: number
  updated_at?: string
  sellerId?:string 
  product_id: string
  specialInstructions?: string
  quantity: number
  cost?: number
user?: User | null;
  product?: Product|null | undefined
}

export type OrderItem = {
    order_status: "pending" | "confirmed" | "out-for-delivery" | "delivered" | "cancelled";
    _id:string;
    specialInstructions?: string;
    cost?: number;
    sellerId?:string;
    product_id:string;
    quantity: number;
    user_id:string;
    updatedAt?: number;
};
export type Transaction = {
        _id:string;
  user_id: string;
  order_id?:string;
  amount: number;
  currency?: string;
  status: "pending" | "completed" | "failed" | "cancelled" | "refunded";
  payment_method: "card" | "mobile-money" | "bank-transfer" | "cash" | "other";
  reference?: string;
  type: "purchase" | "refund" | "becoming-a-seller" | "other";
        _creationTime: number;
};
export interface HereSuggestions {
  title: string;
  id: string;
  resultType: string;
  localityType: string;
  address: {
    label: string;
    countryCode: string;
    countryName: string;
    stateCode: string;
    state: string;
    countyCode: string;
    county: string;
    city: string;
    postalCode: string;
  };
  position: {
    lat: number;
    lng: number;
  };
  mapView: {
    west: number;
    south: number;
    east: number;
    north: number;
  };
  scoring: {
    queryScore: number;
    fieldScore: {
      city: number;
    };
  };
}

export interface LocationResult {
  items: HereSuggestions[];
}
export interface Application {
  user_id: string;
  store_name: string;
  description: string;
  profile_image: string;
  cover_image: string;
  slogan?: string;
  region?: string;
  district?: string;
  locationDetails?: string;
  location?: {
    lat: number;
    lng: number;
  };
  status: "pending" | "approved" | "rejected";
  _creationTime:number
}

// Operating hours schedule for a single day
export interface DaySchedule {
    open: string;  // Time in HH:MM format (24-hour)
    close: string; // Time in HH:MM format (24-hour)
    isClosed?: boolean; // If true, shop is closed this day
}

// Weekly operating hours schedule
export interface WeeklySchedule {
    monday?: DaySchedule;
    tuesday?: DaySchedule;
    wednesday?: DaySchedule;
    thursday?: DaySchedule;
    friday?: DaySchedule;
    saturday?: DaySchedule;
    sunday?: DaySchedule;
}

// Operating hours configuration
export interface OperatingHours {
    timezone: string; // e.g., "Africa/Kampala"
    schedule: WeeklySchedule;
    autoManageStatus: boolean; // Whether to auto-manage open/close based on schedule
}

// Manual override for immediate open/close control
export interface ManualOverride {
    isActive: boolean;
    expiresAt?: number; // Timestamp when override expires (undefined = indefinite)
}

export interface ShopData {
 _id: string;
 slogan?: string;
    _creationTime: number;
    location?: {
        lat: number;
        lng: number;
    } | undefined;
    profile_image?: string | null;
    cover_image?: string | null;
    promo_videos?: {videoId:string,videoUrl:string}[] | null;
    description: string;
    owner_id: string;
    shop_name: string;
    isOpen: boolean;
        is_verified: boolean;
    region?: string;
    district?: string;
    isSuspended?: boolean;
    followers?:string[] | null;
    suspendedAt?: number;
    suspensionReason?: string;
    locationDetails?: string;
    operatingHours?: OperatingHours;
    manualOverride?: ManualOverride;
}
export interface Review {
        product_id: string,
            reviewer_id: string,
            title: string,
            rating: number,
            review: string,
             verified?: boolean,
            _creationTime: number,
}

export interface Category {
  _id:string;
  _creationTime: number;
  image?: string | undefined;
  cartegory: string;
}