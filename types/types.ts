export type UserType = 'buyer' | 'seller' | 'admin';

export type BaseUser = {
  id: string;
  email: string;
  phone: string;
  username?: string;
  name?: string;
  created_at: string;
  updated_at: string;
  other?: {
    profile_image?: string;
    address?: string;
    bio?: string;
    preferences?: Record<string, any>;
  };
};

export type Buyer = BaseUser & {
  userType: 'buyer';
  totalSpent?: number;
  lastPurchaseDate?: string;
  monthlyOrders?: number;
  averageOrderValue?: number;
  membershipLevel?: string;
};

export type Seller = BaseUser & {
  userType: 'seller';
  shop_id: string;
  businessType: string;
  businessName: string;
  productCount: number;
  productsAddedToday: number;
  totalSales: number;
  orderCount: number;
};

export type Admin = BaseUser & {
  userType: 'admin';
};

export type User = Buyer | Seller | Admin;

export type Profile = {
  profile_id: string;
  name: string;
  phone: string;
  avatar: string;
  user_type: UserType;
  is_active: boolean;
  trial_ads_count: number;
  is_banned: boolean;
  ban_reason?: string;
  user_id: User['id'];
  other: {
    preferences?: Record<string, any>;
  };
};

export type Shop = {
  id?: string; // Alternative to shop_id
  shop_id: string;
  name: string;
  ads_count: number;
  ads_duration: number;
  ads_duration_units: string;
  price_per_ad: number;
  price_currency: string;
  ads_payment_id: Payment['payment_id'];
  description: string;
  profile_id: Profile['profile_id'];
  logo: string;
  rating: string;
  other: {
    location?: string;
  };
};

export type Product = {
  product_id: string;
  name: string;
  description: string;
  shop_id: Shop['shop_id'];
  price: number;
  price_currency: string;
  rating: number;
  other: {
    images: string[];
    category?: string;
    variants?: string[];
    brand?: string[];
    condition?: string;
    model?: string;
  };
};

export type Service = {
  service_id: string;
  name: string;
  description: string;
  price: number;
  price_currency: string;
  other: {
    images: string[];
    category?: string;
    variants?: string[];
  };
};

type AdType = 'product' | 'service';

export type Ad = {
  advert_id: string;
  type: AdType;
  product_id?: Product['product_id'];
  service_id?: Service['service_id'];
  date_created: string;
  ad_lifetime: number;
  ad_lifetime_units: string;
  shop_id: Shop['shop_id'];
  isPromoted: boolean;
  promotion_lifetime: number;
  promotion_lifetime_units: string;
  promotion_cost: number;
  promotion_payment_id: Payment['payment_id'];
  promotion_currency: string;
  isTrending: boolean;
  is_active: boolean;
  discount_rate: number;
  views: number;
  other: {
    promo_codes?: string[];
    view_ids: string[];
  };
};

export type Review = {
  review_id: string;
  user_id: User['id'];
  ad_id: Ad['advert_id'];
  rating: number;
  comment: string;
};

type PaymentStatus = 'pending' | 'success' | 'failed';
type PaymentMode = 'cash' | 'mobile money' | 'card' | 'other';

export type Payment = {
  payment_id: string;
  amount: number;
  currency: string;
  reason: string;
  external_id: string;
  status: PaymentStatus;
  mode: PaymentMode;
  user_id: User['id'];
  phone: string;
  other: Record<string, any>;
};

type OrderStatus = 'pending' | 'success' | 'failed' | 'cancelled';

export type CartItem = {
  id: string;
  user_id: User['id'];
  product_id: Product['product_id'];
  product_name: string;
  price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type Order = {
  order_id: string;
  payment_id?: string;
  payment_mode: PaymentMode;
  status: OrderStatus;
  buyer_id: Profile['profile_id'];
  shop_id: Shop['shop_id'];
  is_delivered: boolean;
  buyer_order_comment?: string;
  seller_order_comment?: string;
  type: AdType;
  ad_id: Ad['advert_id'];
  ad_price: number;
  currency: string;
  quantity: number;
  other: {
    per_item_discount: number;
    order_discount: number;
    total_amount: number;
  };
};

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'profile_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'profile_id' | 'created_at' | 'updated_at'>>;
      };
      shops: {
        Row: Shop;
        Insert: Omit<Shop, 'shop_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Shop, 'shop_id' | 'created_at' | 'updated_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'product_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'product_id' | 'created_at' | 'updated_at'>>;
      };
      ads: {
        Row: Ad;
        Insert: Omit<Ad, 'advert_id' | 'date_created'>;
        Update: Partial<Omit<Ad, 'advert_id' | 'date_created'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'payment_id' | 'created_at'>;
        Update: Partial<Omit<Payment, 'payment_id' | 'created_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'order_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'order_id' | 'created_at' | 'updated_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'review_id' | 'created_at'>;
        Update: Partial<Omit<Review, 'review_id' | 'created_at'>>;
      };
      cart_items: {
        Row: CartItem;
        Insert: Omit<CartItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CartItem, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_type: UserType;
      payment_status: PaymentStatus;
      payment_mode: PaymentMode;
      order_status: OrderStatus;
    };
  };
};