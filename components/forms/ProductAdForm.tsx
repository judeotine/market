'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productAdFormSchema, type ProductAdFormValues } from './product-ad-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Shop } from '@/types/types';

interface ProductAdFormProps {
  shop: Shop;
}

export function ProductAdForm({ shop }: ProductAdFormProps) {
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  const form = useForm<ProductAdFormValues>({
    resolver: zodResolver(productAdFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProductAdFormValues) => {
    try {
      // First create the product
      const { error: productError } = await supabase
        .from('products')
        .insert([{
          name: data.name,
          description: data.description,
          shop_id: data.shop_id,
          price: data.price,
          price_currency: data.price_currency,
          rating: 0,
          other: {
            images: data.images,
            category: data.category,
            variants: data.variants,
            brand: data.brand,
            condition: data.condition,
            model: data.model,
          },
        }]);

      if (productError) throw productError;

      // Create the ad
      const { error: adError } = await supabase
        .from('ads')
        .insert([{
          type: 'product',
          product_id: data.product_id,
          shop_id: data.shop_id,
          ad_lifetime: shop.ads_duration,
          ad_lifetime_units: shop.ads_duration_units,
          price_per_ad: shop.price_per_ad,
          price_currency: shop.price_currency,
          isPromoted: data.isPromoted,
          promotion_lifetime: data.isPromoted ? data.promotion_lifetime : null,
          promotion_lifetime_units: data.isPromoted ? data.promotion_lifetime_units : null,
          promotion_cost: data.isPromoted ? data.promotion_cost : null,
          promotion_currency: data.isPromoted ? data.promotion_currency : null,
          is_active: true,
          isTrending: false,
          discount_rate: 0,
          views: 0,
          other: {
            promo_codes: [],
            view_ids: [],
          },
        }]);

      if (adError) throw adError;

      toast({
        title: 'Success',
        description: 'Your product ad has been created successfully!',
      });
    } catch (error) {
      console.error('Error creating ad:', error);
      toast({
        title: 'Error',
        description: 'Failed to create product ad. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Create Product Ad</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  {...form.register('description')}
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="price">Price</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    id="price"
                    placeholder="0.00"
                    {...form.register('price')}
                  />
                  <Input
                    id="price_currency"
                    placeholder="USD"
                    {...form.register('price_currency')}
                  />
                </div>
                {form.formState.errors.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Images</Label>
                <Input
                  type="text"
                  placeholder="Enter image URLs separated by commas"
                  {...form.register('images')}
                />
                {form.formState.errors.images && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.images.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Electronics"
                    {...form.register('category')}
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., Apple"
                    {...form.register('brand')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <Input
                    id="condition"
                    placeholder="e.g., New, Used"
                    {...form.register('condition')}
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="e.g., iPhone 12"
                    {...form.register('model')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="variants">Variants (Optional)</Label>
                <Input
                  id="variants"
                  placeholder="e.g., color, size"
                  {...form.register('variants')}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isPromoted"
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                  {...form.register('isPromoted')}
                />
                <Label htmlFor="isPromoted">Promote this ad</Label>
              </div>

              {form.watch('isPromoted') && (
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="promotion_lifetime">Promotion Duration</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        id="promotion_lifetime"
                        placeholder="1"
                        {...form.register('promotion_lifetime')}
                      />
                      <Input
                        id="promotion_lifetime_units"
                        placeholder="months"
                        {...form.register('promotion_lifetime_units')}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="promotion_cost">Promotion Cost</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        id="promotion_cost"
                        placeholder="0.00"
                        {...form.register('promotion_cost')}
                      />
                      <Input
                        id="promotion_currency"
                        placeholder="USD"
                        {...form.register('promotion_currency')}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full">
                Create Ad
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
