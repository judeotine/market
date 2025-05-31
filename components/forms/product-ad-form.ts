import { z } from 'zod';
import { Product, Shop } from '@/types/types';

export const productAdFormSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be positive'),
  price_currency: z.string(),
  images: z.array(z.string().url('Please enter valid image URLs')).min(1, 'At least one image is required'),
  category: z.string().optional(),
  variants: z.array(z.string()).optional(),
  brand: z.string().optional(),
  condition: z.string().optional(),
  model: z.string().optional(),
  shop_id: z.string(),
  isPromoted: z.boolean().default(false),
  promotion_lifetime: z.number().optional(),
  promotion_lifetime_units: z.string().optional(),
  promotion_cost: z.number().optional(),
  promotion_currency: z.string().optional(),
});

export type ProductAdFormValues = z.infer<typeof productAdFormSchema>;

export const defaultValues: Partial<ProductAdFormValues> = {
  isPromoted: false,
  promotion_lifetime_units: 'months',
  promotion_currency: 'USD',
};
