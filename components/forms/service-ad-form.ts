import { z } from 'zod';
import { Shop } from '@/types/types';

export const serviceAdFormSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be positive'),
  price_currency: z.string(),
  images: z.array(z.string().url('Please enter valid image URLs')).min(1, 'At least one image is required'),
  category: z.string().optional(),
  duration: z.number().min(0, 'Duration must be positive'),
  duration_units: z.enum(['hours', 'days', 'weeks']),
  availability: z.string(),
  shop_id: z.string(),
  isPromoted: z.boolean().default(false),
  promotion_lifetime: z.number().optional(),
  promotion_lifetime_units: z.enum(['days', 'weeks', 'months']).optional(),
  promotion_cost: z.number().optional(),
  promotion_currency: z.string().optional(),
});

export type ServiceAdFormValues = z.infer<typeof serviceAdFormSchema>;

export const defaultValues: Partial<ServiceAdFormValues> = {
  isPromoted: false,
  duration_units: 'hours',
  promotion_lifetime_units: 'months',
  promotion_currency: 'USD',
};
