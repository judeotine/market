'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProductForm } from '@/hooks/useProductForm';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { productFormSchema, ProductFormValues } from '@/lib/validations/product';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  shopId: string;
  userId: string;
  onSuccess?: () => void;
  defaultValues?: Partial<ProductFormValues>;
}

export function ProductForm({ shopId, userId, onSuccess, defaultValues }: ProductFormProps) {
  const [imageInput, setImageInput] = useState('');
  const { isLoading, handleSubmit: submitProduct } = useProductForm(shopId, userId);
  const router = useRouter();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      images: [],
      category: '',
      condition: 'new',
      isPromoted: false,
      promotionDuration: 7,
      promotionCost: 10,
      ...defaultValues,
    },
  });

  const watchIsPromoted = form.watch('isPromoted');
  const watchImages = form.watch('images') || [];

  const addImage = () => {
    if (!imageInput) return;
    
    const currentImages = form.getValues('images') || [];
    form.setValue('images', [...currentImages, imageInput]);
    setImageInput('');
  };

  const removeImage = (index: number) => {
    const currentImages = [...(form.getValues('images') || [])];
    currentImages.splice(index, 1);
    form.setValue('images', currentImages);
  };

  const addVariant = () => {
    const variants = form.getValues('variants') || [];
    form.setValue('variants', [...variants, '']);
  };

  const updateVariant = (index: number, value: string) => {
    const variants = [...(form.getValues('variants') || [])];
    variants[index] = value;
    form.setValue('variants', variants);
  };

  const removeVariant = (index: number) => {
    const variants = [...(form.getValues('variants') || [])];
    variants.splice(index, 1);
    form.setValue('variants', variants);
  };

  const onSubmit = async (values: ProductFormValues) => {
    const { success } = await submitProduct(values);
    
    if (success) {
      if (onSuccess) {
        onSuccess();
      } else {
        // Default success behavior
        router.push(`/shop/${shopId}`);
      }
    }
  };

  // Handle form errors
  useEffect(() => {
    const subscription = form.formState.subscribe(({ errors }) => {
      if (Object.keys(errors).length > 0) {
        console.log('Form errors:', errors);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.formState]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Enter details about your product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="pl-8"
                          placeholder="0.00"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your product in detail..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Electronics, Clothing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Apple, Nike" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="refurbished">Refurbished</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <div className="flex items-center justify-between">
                <FormLabel>Product Images *</FormLabel>
                <span className="text-sm text-muted-foreground">
                  {watchImages.length} {watchImages.length === 1 ? 'image' : 'images'} added
                </span>
              </div>
              
              <div className="mt-2 flex gap-2">
                <Input
                  type="url"
                  placeholder="Paste image URL"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                  className="flex-1"
                />
                <Button type="button" onClick={addImage} variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
              
              {form.formState.errors.images && (
                <p className="text-sm font-medium text-destructive mt-1">
                  {form.formState.errors.images.message}
                </p>
              )}
              
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {watchImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-lg border">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {watchImages.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No images added yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Add image URLs above
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <FormLabel>Variants</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Variant
                </Button>
              </div>
              
              <div className="mt-2 space-y-2">
                {form.watch('variants')?.map((variant, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={variant}
                      onChange={(e) => updateVariant(index, e.target.value)}
                      placeholder={`Variant ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariant(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                
                {!form.watch('variants')?.length && (
                  <p className="text-sm text-muted-foreground">
                    No variants added yet. Add options like size, color, etc.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promotion</CardTitle>
            <CardDescription>Boost your product's visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="isPromoted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Promote this product</FormLabel>
                      <FormDescription>
                        Get more visibility for your product in search results and featured sections.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {watchIsPromoted && (
                <div className="space-y-4 pl-6 border-l-2 border-muted">
                  <FormField
                    control={form.control}
                    name="promotionDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotion Duration</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="14">14 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How long do you want to promote this product?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Promotion Cost</span>
                      <span className="text-lg font-bold">
                        ${form.watch('promotionCost')?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      This will be charged when you publish the product.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Product'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
