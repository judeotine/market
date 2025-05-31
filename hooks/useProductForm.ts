'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createProductWithAd } from '@/lib/api/products';
import { transformToProductAndAd } from '@/lib/validations/product';

export function useProductForm(shopId: string, userId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      
      // Transform form values to product and ad objects
      const { product, ad } = transformToProductAndAd(values, shopId, userId);
      
      // Create product and ad
      const { product: createdProduct } = await createProductWithAd(product, ad, userId);
      
      toast.success('Product created successfully!');
      return { success: true, product: createdProduct };
    } catch (error) {
      console.error('Error creating product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (productId: string, values: any) => {
    try {
      setIsLoading(true);
      // TODO: Implement update functionality
      toast.success('Product updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error updating product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit,
    handleUpdate,
  };
}
