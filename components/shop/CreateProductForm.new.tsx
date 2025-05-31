'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, X, Plus } from 'lucide-react';
import { Shop } from '@/types/types';

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Schema for form validation
const productSchema = z.object({
  // Product fields
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  images: z.array(z.union([z.string(), z.instanceof(File)])).min(1, 'At least one image is required'),
  variants: z.array(z.string()),
  brand: z.string().optional(),
  condition: z.string().default('new'),
  model: z.string().optional(),
  
  // Ad fields
  isPromoted: z.boolean().default(false),
  adLifetime: z.number().min(1, 'Ad lifetime must be at least 1'),
  adLifetimeUnits: z.enum(['days', 'weeks', 'months']).default('days'),
  promotionLifetime: z.number().min(1, 'Promotion lifetime must be at least 1'),
  promotionLifetimeUnits: z.enum(['days', 'weeks', 'months']).default('days'),
  promotionCost: z.number().min(0, 'Promotion cost cannot be negative'),
  discountRate: z.number().min(0).max(100, 'Discount rate must be between 0 and 100').optional(),
});

type FormData = z.infer<typeof productSchema>;

interface CreateProductFormProps {
  shop: Shop;
  initialData?: Partial<Omit<FormData, 'images'>> & { 
    product_id?: string;
    images?: string[];
  };
  onSuccess?: () => void;
}

export function CreateProductForm({ shop, initialData, onSuccess }: CreateProductFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    category: initialData?.category || '',
    images: initialData?.images?.length ? initialData.images : [],
    variants: initialData?.variants || [],
    brand: initialData?.brand || '',
    condition: initialData?.condition || 'new',
    model: initialData?.model || '',
    isPromoted: initialData?.isPromoted || false,
    adLifetime: initialData?.adLifetime || 30,
    adLifetimeUnits: initialData?.adLifetimeUnits || 'days',
    promotionLifetime: initialData?.promotionLifetime || 7,
    promotionLifetimeUnits: initialData?.promotionLifetimeUnits || 'days',
    promotionCost: initialData?.promotionCost || 0,
    discountRate: initialData?.discountRate || 0,
  });
  
  const [variantInput, setVariantInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // Calculate promotion end date
  const promotionEndDate = new Date();
  if (formData.isPromoted) {
    const days = formData.promotionLifetime * (
      formData.promotionLifetimeUnits === 'weeks' ? 7 : 
      formData.promotionLifetimeUnits === 'months' ? 30 : 1
    );
    promotionEndDate.setDate(promotionEndDate.getDate() + days);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files);
    const validFiles: File[] = [];
    
    for (const file of files) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only JPG, PNG, and WebP are allowed.`);
        continue;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large: ${file.name}. Max size is 5MB.`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles]
      }));
    }
  };
  
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  const uploadImages = async (files: (File | string)[]) => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      // If it's already a URL, keep it
      if (typeof file === 'string') {
        uploadedUrls.push(file);
        continue;
      }
      
      // Upload new files
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `products/${shop.shop_id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error('Failed to upload one or more images');
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
        
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const addVariant = () => {
    if (variantInput.trim() && !formData.variants.includes(variantInput)) {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, variantInput.trim()]
      }));
      setVariantInput('');
    }
  };

  const removeVariant = (variant: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v !== variant)
    }));
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files.length) return;
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles: File[] = [];
    
    for (const file of files) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only JPG, PNG, and WebP are allowed.`);
        continue;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large: ${file.name}. Max size is 5MB.`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      const result = productSchema.safeParse(formData);
      if (!result.success) {
        const errors = result.error.errors.map(err => err.message).join('\n');
        toast.error(`Validation error: ${errors}`);
        return;
      }

      // Upload images
      setIsUploading(true);
      const imageUrls = await uploadImages(formData.images);
      
      // Prepare product data
      const productData = {
        shop_id: shop.shop_id,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        images: imageUrls,
        variants: formData.variants,
        brand: formData.brand || null,
        condition: formData.condition,
        model: formData.model || null,
      };

      // Save product to database
      const { data: product, error: productError } = await supabase
        .from('products')
        .upsert({
          ...productData,
          ...(initialData?.product_id ? { id: initialData.product_id } : {}),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (productError) throw productError;

      // Save ad data if promoted
      if (formData.isPromoted && product) {
        const adData = {
          product_id: product.id,
          is_promoted: true,
          promotion_starts_at: new Date().toISOString(),
          promotion_ends_at: promotionEndDate.toISOString(),
          promotion_cost: formData.promotionCost,
          discount_rate: formData.discountRate || 0,
        };

        const { error: adError } = await supabase
          .from('ads')
          .upsert(adData);

        if (adError) throw adError;
      }

      // Show success message and redirect
      toast.success(initialData?.product_id ? 'Product updated successfully' : 'Product created successfully');
      onSuccess?.();
      router.push(`/dashboard/shop/${shop.shop_id}/products`);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(`Failed to save product: ${error.message}`);
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>
              {initialData?.product_id ? 'Edit Product' : 'Create New Product Ad'}
            </CardTitle>
            <CardDescription>
              {initialData?.product_id 
                ? 'Update your product details and promotion settings'
                : 'Fill in the details below to create a new product listing'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Product Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      name="category"
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="home">Home & Garden</SelectItem>
                        <SelectItem value="beauty">Beauty</SelectItem>
                        <SelectItem value="sports">Sports & Outdoors</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (UGX) *</Label>
                    <div className="relative">
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                        className="pl-8"
                      />
                      <span className="absolute left-3 top-2.5 text-muted-foreground">UGX</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select 
                      name="condition"
                      value={formData.condition}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like_new">Like New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Product Images *</Label>
                    <div 
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={handleFileClick}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                        multiple
                      />
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop images here, or click to select
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Up to 10 images (max 5MB each)
                      </p>
                    </div>
                    
                    {/* Image previews */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {formData.images.map((img, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={img instanceof File ? URL.createObjectURL(img) : img}
                              alt={`Preview ${index + 1}`}
                              className="h-24 w-full object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter detailed product description"
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Variants (e.g., Size, Color)</Label>
                <div className="flex gap-2">
                  <Input
                    value={variantInput}
                    onChange={(e) => setVariantInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVariant())}
                    placeholder="Add variant (e.g., Red, Large)"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addVariant}
                    disabled={!variantInput.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                
                {formData.variants.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.variants.map((variant, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {variant}
                        <button
                          type="button"
                          onClick={() => removeVariant(variant)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Ad Settings Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Promotion Settings</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="promote-ad"
                    checked={formData.isPromoted}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPromoted: checked }))}
                  />
                  <Label htmlFor="promote-ad">Promote this ad</Label>
                </div>
              </div>
              
              <AnimatePresence>
                {formData.isPromoted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="promotion-lifetime">Promotion Duration</Label>
                          <div className="flex gap-2">
                            <Input
                              id="promotion-lifetime"
                              name="promotionLifetime"
                              type="number"
                              min="1"
                              value={formData.promotionLifetime}
                              onChange={handleChange}
                              className="w-20"
                            />
                            <Select 
                              value={formData.promotionLifetimeUnits}
                              onValueChange={(value) => setFormData(prev => ({ 
                                ...prev, 
                                promotionLifetimeUnits: value as 'days' | 'weeks' | 'months' 
                              }))}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="days">Days</SelectItem>
                                <SelectItem value="weeks">Weeks</SelectItem>
                                <SelectItem value="months">Months</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="discount-rate">Discount Rate (%)</Label>
                          <Input
                            id="discount-rate"
                            name="discountRate"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.discountRate}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-32"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="space-y-2">
                          <Label>Promotion Cost</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              name="promotionCost"
                              type="number"
                              min="0"
                              value={formData.promotionCost}
                              onChange={handleChange}
                              className="w-32"
                            />
                            <span className="text-muted-foreground">UGX</span>
                          </div>
                        </div>
                        
                        {formData.isPromoted && (
                          <div className="text-sm text-muted-foreground pt-2">
                            <p>Promotion ends: {promotionEndDate.toLocaleDateString()}</p>
                            <p>Discounted price: {formData.discountRate ? 
                              `${(formData.price * (1 - (formData.discountRate / 100))).toFixed(2)} UGX` : 'None'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-1">
                  <h4 className="font-medium">Standard Listing</h4>
                  <p className="text-sm text-muted-foreground">
                    Your ad will be active for {formData.adLifetime} {formData.adLifetimeUnits}
                  </p>
                </div>
                <Button 
                  type="button" 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newUnits = 
                      formData.adLifetimeUnits === 'days' ? 'weeks' :
                      formData.adLifetimeUnits === 'weeks' ? 'months' : 'days';
                    setFormData(prev => ({
                      ...prev,
                      adLifetimeUnits: newUnits as 'days' | 'weeks' | 'months',
                      adLifetime: newUnits === 'days' ? 30 : newUnits === 'weeks' ? 4 : 1
                    }));
                  }}
                >
                  Change Duration
                </Button>
              </div>
            </div>
          </CardContent>
          
          <div className="p-6 pt-0 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : initialData?.product_id ? (
                'Update Product'
              ) : (
                'Create Product & Publish Ad'
              )}
            </Button>
          </div>
        </Card>
      </form>
    </motion.div>
  );
}
