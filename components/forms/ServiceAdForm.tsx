'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceAdFormSchema, type ServiceAdFormValues, defaultValues } from './service-ad-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Shop } from '@/types/types';

interface ServiceAdFormProps {
  shop: Shop;
}

export function ServiceAdForm({ shop }: ServiceAdFormProps) {
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  const form = useForm<ServiceAdFormValues>({
    resolver: zodResolver(serviceAdFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: ServiceAdFormValues) => {
    try {
      // First create the service
      const { error: serviceError, data: serviceData } = await supabase
        .from('services')
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
            duration: data.duration,
            duration_units: data.duration_units,
            availability: data.availability,
          },
        }])
        .select()
        .single();

      if (serviceError) throw serviceError;
      if (!serviceData) throw new Error('Failed to create service');

      // Then create the ad
      const { error: adError } = await supabase
        .from('ads')
        .insert([{
          service_id: serviceData.service_id,
          shop_id: data.shop_id,
          ad_lifetime: 30,
          ad_lifetime_units: 'days',
          promotion_cost: data.promotion_cost || 0,
          promotion_currency: data.promotion_currency || 'USD',
          created_at: new Date().toISOString(),
        }]);

      if (adError) throw adError;

      toast({
        title: 'Success',
        description: 'Service and ad created successfully',
      });
      form.reset();
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create service',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Create Service Ad</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter service name"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Enter service description"
              />
              {form.formState.errors.description && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...form.register('price')}
                  placeholder="Enter price"
                />
                {form.formState.errors.price && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  {...form.register('price_currency')}
                  placeholder="e.g., USD"
                />
                {form.formState.errors.price_currency && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.price_currency.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Images (URLs)</Label>
              <Input
                id="images"
                {...form.register('images')}
                placeholder="Enter image URLs separated by commas"
              />
              {form.formState.errors.images && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.images.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...form.register('category')}
                placeholder="Enter service category"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <div className="flex gap-2">
                <Input
                  id="duration"
                  type="number"
                  {...form.register('duration')}
                  placeholder="Enter duration"
                />
                <select
                  id="duration_units"
                  {...form.register('duration_units')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Input
                id="availability"
                {...form.register('availability')}
                placeholder="e.g., Monday-Friday 9am-5pm"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isPromoted"
                type="checkbox"
                {...form.register('isPromoted')}
              />
              <Label htmlFor="isPromoted">Promote this ad</Label>
            </div>

            {form.watch('isPromoted') && (
              <div className="space-y-2 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="promotion_lifetime">Promotion Duration</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promotion_lifetime"
                      type="number"
                      {...form.register('promotion_lifetime')}
                      placeholder="Enter duration"
                    />
                    <select
                      id="promotion_lifetime_units"
                      {...form.register('promotion_lifetime_units')}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promotion_cost">Promotion Cost</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promotion_cost"
                      type="number"
                      step="0.01"
                      {...form.register('promotion_cost')}
                      placeholder="Enter cost"
                    />
                    <select
                      id="promotion_currency"
                      {...form.register('promotion_currency')}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full md:w-auto">
              Create Service Ad
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
