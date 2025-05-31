import { z } from 'zod';
import { Product, Ad } from '@/types/types';

export const productFormSchema = z.object({
  // Product fields
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  price: z.coerce.number().min(0, {
    message: 'Price must be a positive number.',
  }),
  images: z.array(z.string().url({
    message: 'Must be a valid URL',
  })).min(1, {
    message: 'At least one image is required.',
  }),
  category: z.string().min(1, {
    message: 'Category is required.',
  }),
  variants: z.array(z.string()).optional(),
  brand: z.string().optional(),
  condition: z.enum(['new', 'used', 'refurbished']).default('new'),
  model: z.string().optional(),
  
  // Ad fields
  isPromoted: z.boolean().default(false),
  promotionDuration: z.number().min(1).max(30).optional(),
  promotionCost: z.number().min(0).optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

// Helper function to transform form values to Product and Ad objects
export function transformToProductAndAd(
  values: ProductFormValues,
  shopId: string,
  userId: string
): { product: Omit<Product, 'product_id' | 'created_at' | 'updated_at'>, ad: Omit<Ad, 'advert_id' | 'date_created' | 'is_active' | 'views'> } {
  const product: Omit<Product, 'product_id' | 'created_at' | 'updated_at'> = {
    name: values.name,
    description: values.description,
    shop_id: shopId,
    price: values.price,
    price_currency: 'USD', // Default currency
    rating: 0, // New product starts with 0 rating
    other: {
      images: values.images,
      category: values.category,
      variants: values.variants,
      brand: values.brand ? [values.brand] : undefined,
      condition: values.condition,
      model: values.model,
    },
  };

  const ad: Omit<Ad, 'advert_id' | 'date_created' | 'is_active' | 'views'> = {
    type: 'product',
    product_id: '', // Will be set after product creation
    shop_id: shopId,
    isPromoted: values.isPromoted || false,
    promotion_lifetime: values.isPromoted ? (values.promotionDuration || 7) : 0,
    promotion_lifetime_units: 'days',
    promotion_cost: values.isPromoted ? (values.promotionCost || 0) : 0,
    promotion_currency: 'USD',
    promotion_payment_id: '', // Will be set after payment
    isTrending: false,
    ad_lifetime: 30, // Default 30 days
    ad_lifetime_units: 'days',
    discount_rate: 0,
    other: {
      promo_codes: [],
      view_ids: [],
    },
  };

  return { product, ad };
}
