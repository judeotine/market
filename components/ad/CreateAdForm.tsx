'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/supabase';
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userSignal } from '@/store';
import { Ad, Product, Shop } from '@/types/types';

const adSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  category: z.string().min(1, 'Category is required'),
  images: z
    .array(z.string().url('Please enter valid image URLs'))
    .min(1, 'At least one image URL is required'),
  isPromoted: z.boolean(),
  promotionDuration: z.number().optional(),
  condition: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  variants: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof adSchema>;

const INITIAL_FORM_DATA: FormData = {
  name: '',
  description: '',
  price: 0,
  currency: 'UGX',
  category: '',
  images: [''],
  isPromoted: false,
  promotionDuration: 30,
  condition: '',
  brand: '',
  model: '',
  variants: [],
};

interface CreateAdFormProps {
  onSuccess?: () => void;
}

export function CreateAdForm({ onSuccess }: CreateAdFormProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);
  
  // Fetch shop data when component mounts
  useEffect(() => {
    if (!user) return;
    
    const fetchShop = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError || !profileData) {
          throw profileError || new Error('Profile not found');
        }

        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('profile_id', profileData.id)
          .single();

        if (shopError) {
          if (shopError.code === 'PGRST116') {
            router.push('/create-shop');
            return;
          }
          throw shopError;
        }

        setShop(shopData as Shop);
      } catch (error) {
        console.error('Error fetching shop:', error);
        toast.error('Failed to load shop data');
      }
    };

    fetchShop();
  }, [user, router, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPromoted: checked }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) {
      toast.error('Please create a shop first');
      return;
    }
    if (!user) {
      toast.error('Please sign in to create an ad');
      return;
    }

    setIsSubmitting(true);
    try {
      const validatedData = adSchema.parse({
        ...formData,
        images: formData.images.filter((img: string) => img !== ''),
      });

      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          name: validatedData.name,
          description: validatedData.description,
          shop_id: shop.shop_id,
          price: validatedData.price,
          price_currency: validatedData.currency,
          other: {
            images: validatedData.images,
            category: validatedData.category,
            variants: validatedData.variants || [],
            brand: validatedData.brand || '',
            condition: validatedData.condition || '',
            model: validatedData.model || '',
          },
        } as Product)
        .select()
        .single();

      if (productError) throw productError;
      if (!productData) throw new Error('Failed to create product');

      const adData = {
        type: 'product' as const,
        product_id: productData.product_id,
        date_created: new Date().toISOString(),
        ad_lifetime: shop.ads_duration,
        ad_lifetime_units: shop.ads_duration_units,
        shop_id: shop.shop_id,
        isPromoted: validatedData.isPromoted,
        promotion_lifetime: validatedData.isPromoted ? validatedData.promotionDuration : 0,
        promotion_lifetime_units: 'days' as const,
        promotion_cost: validatedData.isPromoted ? shop.price_per_ad : 0,
        promotion_currency: shop.price_currency,
        isTrending: false,
        is_active: true,
        discount_rate: 0,
        views: 0,
        other: {
          promo_codes: [],
          view_ids: [],
        },
      };

      const { error: adError } = await supabase
        .from('ads')
        .insert(adData);

      if (adError) throw adError;

      // Update shop's ad count
      const { error: shopError } = await supabase
        .from('shops')
        .update({ ads_count: (shop.ads_count || 0) + 1 })
        .eq('shop_id', shop.shop_id);

      if (shopError) throw shopError;

      toast.success('Ad created successfully!');
      router.push('/shop'); // Redirect to shop page
    } catch (error) {
      console.error('Error creating ad:', error);
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create ad';
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Create New Product Ad</CardTitle>
          <CardDescription>
            Fill in the details below to create a new product advertisement
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Basic Details */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  name="currency"
                  value={formData.currency}
                  onValueChange={handleSelectChange('currency')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UGX">UGX</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                name="category"
                value={formData.category}
                onValueChange={handleSelectChange('category')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  {/* Add more categories */}
                </SelectContent>
              </Select>
            </div>

            {/* Image URLs */}
            <div className="space-y-2">
              <Label>Product Images</Label>
              {formData.images.map((url, index) => (
                <Input
                  key={index}
                  value={url}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="Enter image URL"
                  className="mb-2"
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addImageField}
                className="w-full"
              >
                Add Another Image
              </Button>
            </div>

            {/* Promotion Options */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="promotion">Promote Ad</Label>
                <div className="text-sm text-muted-foreground">
                  Cost: {shop?.price_per_ad} {shop?.price_currency} per month
                </div>
              </div>
              <Switch
                id="promotion"
                checked={formData.isPromoted}
                onCheckedChange={handleSwitchChange}
              />
            </div>

            {formData.isPromoted && (
              <div className="space-y-2">
                <Label htmlFor="promotionDuration">Promotion Duration (Days)</Label>
                <Input
                  id="promotionDuration"
                  name="promotionDuration"
                  type="number"
                  value={formData.promotionDuration}
                  onChange={handleChange}
                  min={1}
                  max={365}
                />
              </div>
            )}

            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  name="condition"
                  value={formData.condition}
                  onValueChange={handleSelectChange('condition')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="refurbished">Refurbished</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Enter brand name"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Ad'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
