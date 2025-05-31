'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { z } from 'zod';
import { toast } from 'sonner';
// Removed Framer Motion imports to fix JSX issues
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, X, Plus } from 'lucide-react';
import { Product, Shop, Ad } from '@/types/types';
// Remove uuid import as we're using our own generateId function

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

type AllowedFileType = typeof ALLOWED_FILE_TYPES[number];

// Define our form field types
type Condition = 'new' | 'used' | 'refurbished';
type TimeUnit = 'days' | 'weeks' | 'months';

// Define the form data type
type FormData = {
  // Product fields
  name: string;
  description: string;
  price: number;
  category: string;
  images: (string | File)[];
  variants: string[];
  brand: string;
  condition: Condition;
  model: string;
  
  // Ad fields
  isPromoted: boolean;
  adLifetime: number;
  adLifetimeUnits: TimeUnit;
  promotionLifetime: number;
  promotionLifetimeUnits: TimeUnit;
  promotionCost: number;
  discountRate: number; // Make it required with a default value
};

// Enhanced validation schema with more specific error messages
const productSchema = z.object({
  // Product fields
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name cannot exceed 100 characters'),
    
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
    
  price: z.number()
    .min(0, 'Price must be a positive number')
    .max(1000000, 'Price seems too high. Please verify.'),
    
  category: z.string().min(1, 'Please select a category'),
  
  images: z.array(
    z.union([z.string().url('Invalid image URL'), z.instanceof(File)])
  ).min(1, 'At least one image is required')
   .max(10, 'Maximum 10 images allowed'),
   
  variants: z.array(
    z.string().min(1, 'Variant cannot be empty')
  ).max(10, 'Maximum 10 variants allowed'),
  
  brand: z.string().max(50, 'Brand name is too long').optional(),
  
  condition: z.enum(['new', 'used', 'refurbished'] as const).default('new'),
  
  model: z.string().max(50, 'Model name is too long').optional(),
  
  // Ad fields
  isPromoted: z.boolean().default(false),
  
  adLifetime: z.number()
    .min(1, 'Ad lifetime must be at least 1')
    .max(365, 'Ad lifetime cannot exceed 365 days'),
    
  adLifetimeUnits: z.enum(['days', 'weeks', 'months'] as const).default('days'),
  
  promotionLifetime: z.number()
    .min(1, 'Promotion lifetime must be at least 1')
    .max(30, 'Promotion cannot exceed 30 days')
    .optional(),
    
  promotionLifetimeUnits: z.enum(['days', 'weeks', 'months'] as const).default('days'),
  
  promotionCost: z.number()
    .min(0, 'Promotion cost cannot be negative')
    .max(1000, 'Promotion cost seems too high')
    .optional(),
    
  discountRate: z.number()
    .min(0, 'Discount rate cannot be negative')
    .max(100, 'Discount rate cannot exceed 100%')
    .default(0),
}).refine(data => !data.isPromoted || (data.promotionLifetime && data.promotionLifetime > 0), {
  message: 'Promotion duration is required when promotion is enabled',
  path: ['promotionLifetime']
}).refine(data => !data.isPromoted || (data.promotionCost !== undefined && data.promotionCost >= 0), {
  message: 'Promotion cost is required when promotion is enabled',
  path: ['promotionCost']
});

interface CreateProductFormProps {
  shop: Shop | null;
  onSuccess?: () => void;
  initialData?: Partial<FormData> & { product_id?: string };
}

// Helper function to generate unique IDs
const generateId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Helper function to process and validate files
const processFiles = (files: File[]): File[] => {
  return files.filter(file => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type as AllowedFileType)) {
      toast.error(`File type not supported: ${file.name}. Please upload a JPG, PNG, or WebP image.`);
      return false;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large: ${file.name}. Maximum size is 5MB.`);
      return false;
    }
    
    return true;
  });
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function CreateProductForm({ shop, onSuccess, initialData = {} }: CreateProductFormProps) {
  // Initialize form data with defaults or values from initialData
  const [formData, setFormData] = useState<FormData>(() => ({
    name: initialData.name || '',
    description: initialData.description || '',
    price: initialData.price || 0,
    category: initialData.category || '',
    images: Array.isArray(initialData.images) ? initialData.images : [],
    variants: Array.isArray(initialData.variants) ? initialData.variants : [],
    brand: initialData.brand || '',
    condition: initialData.condition || 'new',
    model: initialData.model || '',
    isPromoted: Boolean(initialData.isPromoted),
    adLifetime: initialData.adLifetime || 30,
    adLifetimeUnits: initialData.adLifetimeUnits || 'days',
    promotionLifetime: initialData.promotionLifetime || 7,
    promotionLifetimeUnits: initialData.promotionLifetimeUnits || 'days',
    promotionCost: initialData.promotionCost || 0,
    discountRate: initialData.discountRate || 0,
  }));
  
  const [variantInput, setVariantInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!e.dataTransfer.files?.length) return;
    
    const files = Array.from(e.dataTransfer.files) as File[];
    const validFiles = processFiles(files);
    
    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles]
      }));
    }
  };
  
  // Handle file input click
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };
  
  // Calculate promotion end date
  const promotionEndDate = new Date();
  if (formData.isPromoted) {
    const days = formData.promotionLifetime * (
      formData.promotionLifetimeUnits === 'weeks' ? 7 : 
      formData.promotionLifetimeUnits === 'months' ? 30 : 1
    );
    promotionEndDate.setDate(promotionEndDate.getDate() + days);
  }

  // Helper function to update form data with type safety
  const handleChange = <K extends keyof FormData>(
    name: K,
    value: FormData[K] | ((prev: FormData[K]) => FormData[K])
  ) => {
    setFormData(prev => ({
      ...prev,
      [name]: typeof value === 'function' ? (value as (prev: FormData[K]) => FormData[K])(prev[name]) : value
    }));
  };

  // Handle input change events with proper type safety
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle different input types
    if (type === 'number') {
      const numValue = parseFloat(value) || 0;
      handleChange(name as keyof FormData, numValue);
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      handleChange(name as keyof FormData, checked);
    } else {
      handleChange(name as keyof FormData, value);
    }
  };
  
  // Handle select changes with proper type safety
  const handleSelectChange = (name: keyof FormData, value: string) => {
    if (name === 'condition') {
      if (['new', 'used', 'refurbished'].includes(value)) {
        handleChange('condition', value as Condition);
      }
    } else if (name.endsWith('Units') && ['days', 'weeks', 'months'].includes(value)) {
      // Handle time unit changes
      if (name === 'adLifetimeUnits' || name === 'promotionLifetimeUnits') {
        handleChange(name, value as TimeUnit);
      }
    } else {
      // For other fields, just update the value as is
      handleChange(name, value);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    try {
      setIsUploading(true);
      const files = Array.from(e.target.files);
      const validFiles = processFiles(files);
      
      if (validFiles.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...validFiles]
        }));
        toast.success(`Added ${validFiles.length} file(s) successfully`);
      }
      
      // Reset file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Failed to process files. Please try again.');
    } finally {
      setIsUploading(false);
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
    
    try {
      setIsUploading(true);
      
      for (const file of files) {
        try {
          // If it's already a URL, keep it
          if (typeof file === 'string') {
            uploadedUrls.push(file);
            continue;
          }
          
          // Generate a unique filename
          const fileExt = file.name.split('.').pop();
          const fileName = `${generateId()}.${fileExt}`;
          const filePath = `products/${fileName}`;
          
          // Upload the file
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw new Error(`Failed to upload ${file.name}. Please try again.`);
          }
          
          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);
            
          uploadedUrls.push(publicUrl);
          
        } catch (error) {
          console.error(`Error uploading ${file instanceof File ? file.name : 'file'}:`, error);
          throw error;
        }
      }
      
      return uploadedUrls;
      
    } catch (error) {
      console.error('Error in uploadImages:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const addVariant = () => {
    const trimmedVariant = variantInput.trim();
    if (trimmedVariant && !formData.variants.includes(trimmedVariant)) {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, trimmedVariant],
      }));
      setVariantInput('');
    }
  };

  const removeVariant = (variant: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((v) => v !== variant),
    }));
  };

  const validateForm = (): boolean => {
    try {
      productSchema.parse(formData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shop) {
      toast.error('Shop information is not available. Please try refreshing the page.');
      return;
    }
    
    // Enhanced validation with better error messages
    try {
      productSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Find the first error to show to the user
        const firstError = error.errors[0];
        toast.error(firstError.message);
        
        // Scroll to the first error field
        const element = document.querySelector(`[name="${firstError.path[0]}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Focus the element if it's an input
          if (element instanceof HTMLElement) {
            element.focus();
          }
        }
      } else {
        toast.error('Please check your input and try again.');
      }
      return;
    }
    
    if (isSubmitting) {
      toast.warning('Please wait while we process your request');
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading('Saving product...');
    
    try {
      // Upload images first
      const uploadedImageUrls = await Promise.all(
        formData.images.map(async (file) => {
          if (typeof file === 'string') return file; // Already a URL
          
          const fileExt = file.name.split('.').pop();
          const fileName = `${generateId()}.${fileExt}`;
          const filePath = `products/${shop.shop_id}/${fileName}`;
          
          // Upload the file
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw new Error(`Failed to upload ${file.name}. Please try again.`);
          }
          
          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);
            
          return publicUrl;
        })
      );
      
      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        category: formData.category,
        images: uploadedImageUrls,
        variants: formData.variants,
        brand: formData.brand ? [formData.brand] : [],
        condition: formData.condition,
        model: formData.model?.trim(),
        shop_id: shop.shop_id,
        is_promoted: formData.isPromoted,
        ad_lifetime: formData.adLifetime,
        ad_lifetime_units: formData.adLifetimeUnits,
        promotion_lifetime: formData.promotionLifetime,
        promotion_lifetime_units: formData.promotionLifetimeUnits,
        promotion_cost: formData.promotionCost,
        discount_rate: formData.discountRate,
        rating: 0, // Default rating for new product
        price_currency: 'USD', // Default currency
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Save or update product based on whether we have an initial ID
      let result;
      if (initialData?.product_id) {
        // Update existing product
        const { data, error } = await supabase
          .from('products')
          .update({
            ...productData,
            updated_at: new Date().toISOString()
          })
          .eq('id', initialData.product_id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }
      
      toast.success(
        initialData?.product_id 
          ? 'Product updated successfully!' 
          : 'Product created successfully!', 
        { id: toastId }
      );
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior: redirect to products page
        router.push('/dashboard/shop/products');
      }
      
    } catch (error: unknown) {
      console.error('Error saving product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save product: ${errorMessage}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants for form sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  // Animation variants temporarily removed to fix JSX issues

  // Render the form UI
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>
              {initialData?.product_id ? 'Edit Product' : 'Create New Product Ad'}
            </CardTitle>
            <CardDescription>
              Fill in the details below to {initialData?.product_id ? 'update' : 'create'} your product listing.
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
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand (Optional)</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="Enter brand name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="home">Home & Garden</SelectItem>
                        <SelectItem value="sports">Sports & Outdoors</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => handleSelectChange('condition', value)}
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
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model">Model (Optional)</Label>
                    <Input
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="Enter model number or name"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Product Images *</Label>
                <div 
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={handleFileClick}
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Drag & drop images here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, or WebP up to 5MB (max 10 images)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_FILE_TYPES.join(',')}
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of your product"
                  rows={5}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Variants (Optional)</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={variantInput}
                      onChange={(e) => setVariantInput(e.target.value)}
                      placeholder="Add variant (e.g., Size, Color)"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVariant())}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVariant}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                  
                  {formData.variants.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.variants.map((variant, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {variant}
                          <button
                            type="button"
                            onClick={() => removeVariant(variant)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Ad Settings Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Promotion Settings</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPromoted"
                    checked={formData.isPromoted}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPromoted: checked }))}
                  />
                  <Label htmlFor="isPromoted">Promote this product</Label>
                </div>
              </div>
              
              {formData.isPromoted && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="promotionLifetime">Promotion Duration</Label>
                      <div className="flex gap-2">
                        <Input
                          id="promotionLifetime"
                          name="promotionLifetime"
                          type="number"
                          min="1"
                          value={formData.promotionLifetime}
                          onChange={handleChange}
                          className="flex-1"
                        />
                        <Select
                          value={formData.promotionLifetimeUnits}
                          onValueChange={(value) => handleSelectChange('promotionLifetimeUnits', value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select unit" />
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
                      <Label htmlFor="promotionCost">Promotion Cost (USD)</Label>
                      <Input
                        id="promotionCost"
                        name="promotionCost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.promotionCost}
                        onChange={handleInputChange}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="discountRate">Discount Rate (%)</Label>
                      <Input
                        id="discountRate"
                        name="discountRate"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discountRate}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Promotion End Date</Label>
                      <div className="p-2 border rounded-md bg-background">
                        {promotionEndDate.toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-1">
                  <h4 className="font-medium">Standard Listing</h4>
                  <p className="text-sm text-muted-foreground">
                    Your ad will be active for {formData.adLifetime} {formData.adLifetimeUnits}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-medium">Free</p>
                </div>
              </div>
              
              {formData.isPromoted && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="space-y-1">
                    <h4 className="font-medium">Promotion</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.promotionLifetime} {formData.promotionLifetimeUnits} promotion
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium">${formData.promotionCost.toFixed(2)}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t font-semibold">
                <span>Total</span>
                <span>${formData.isPromoted ? formData.promotionCost.toFixed(2) : '0.00'}</span>
              </div>
            </div>
          </CardContent>
          
          <div className="p-6 pt-0 flex justify-end space-x-3">
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
            <div>
              <Button 
                type="submit" 
                disabled={isSubmitting || isUploading}
                className="min-w-[150px]"
              >
                {isSubmitting || isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? 'Uploading...' : initialData?.product_id ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{initialData?.product_id ? 'Update Product' : 'Create Product'}</>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
