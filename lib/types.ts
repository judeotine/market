import { SquareLibrary } from "lucide-react"

export interface User {
  id: string
  username: string
  email: string
  phone: string
}

export interface Profile {
  profile_id: string
  name: string
  avatar: string
  is_active: boolean
  trial_ads_count: number
  is_banned: boolean
  ban_reason?: string
  user_id: User["id"]
  other: {
    preferences?: {}
  }
}

export interface ShopOther {
  location?: string
  address?: string
  contact_email?: string
  contact_phone?: string
  banner_url?: string
  [key: string]: any // Allow additional properties
}

export interface Shop {
  // Primary identifier
  id: string;
  // For backward compatibility
  shop_id?: string;
  
  // Shop details
  name: string;
  description: string;
  profile_id: string;
  logo: string;
  rating: string;
  
  // Advertisement settings
  ads_count: number;
  ads_duration: number;
  ads_duration_units: string;
  price_per_ad: number;
  price_currency: string;
  ads_payment_id: string;
  
  // Additional properties
  other: ShopOther;
}

export interface Product {
  product_id: string
  name: string
  description: string
  shop_id: string
  price: number
  price_currency: string
  other: {
    images: string[]
    category?: string
    variants?: string[]
    brand?: string[]
    condition?: string
    model?: string
  }
}

export interface Service {
  service_id: string
  name: string
  description: string
  price: number
  price_currency: string
  other: {
    images: string[]
    category?: string
    variants?: string[]
  }
}

export type AdType = "product" | "service"

export interface Ad {
  advert_id: string
  type: AdType
  product_id?: string
  service_id?: string
  date_created: string
  ad_lifetime: number
  ad_lifetime_units: string
  shop_id: string
  isPromoted: boolean
  promotion_lifetime: number
  promotion_lifetime_units: string
  promotion_cost: number
  promotion_payment_id?: string
  promotion_currency: string
  isTrending: boolean
  is_active: boolean
  discount_rate: number
  views: number
  other: {
    promo_codes?: string[]
    view_ids: string[]
  }
}

