import { createClient } from '../supabase/client';
import { Product, Ad } from '../../types/types';

const supabase = createClient();

export async function createProductWithAd(
  product: Omit<Product, 'product_id' | 'created_at' | 'updated_at'>,
  ad: Omit<Ad, 'advert_id' | 'date_created' | 'is_active' | 'views'>,
  userId: string
) {
  try {
    // Start a transaction
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (productError) throw productError;
    if (!productData) throw new Error('Failed to create product');

    // Add the product ID to the ad
    const adWithProductId = {
      ...ad,
      product_id: productData.product_id,
    };

    const { data: adData, error: adError } = await supabase
      .from('ads')
      .insert([adWithProductId])
      .select()
      .single();

    if (adError) throw adError;
    if (!adData) throw new Error('Failed to create ad');

    // If this is a promoted ad, create a payment record
    if (ad.isPromoted) {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          amount: ad.promotion_cost,
          currency: 'USD',
          reason: `Promotion for product: ${product.name}`,
          status: 'success',
          mode: 'card',
          user_id: userId,
          other: {},
        }]);

      if (paymentError) throw paymentError;
    }

    return { product: productData, ad: adData };
  } catch (error) {
    console.error('Error in createProductWithAd:', error);
    throw error;
  }
}

export async function getProductById(productId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, ads(*)')
    .eq('product_id', productId)
    .single();

  if (error) throw error;
  return data;
}

export async function getProductsByShop(shopId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, ads(*)')
    .eq('shop_id', shopId);

  if (error) throw error;
  return data;
}

export async function updateProduct(
  productId: string,
  updates: Partial<Product>,
  adUpdates?: Partial<Ad>
) {
  const updatesToApply = { ...updates };
  
  // Remove fields that shouldn't be updated
  delete updatesToApply.product_id;
  delete updatesToApply.created_at;
  
  const { data: productData, error: productError } = await supabase
    .from('products')
    .update(updatesToApply)
    .eq('product_id', productId)
    .select()
    .single();

  if (productError) throw productError;
  
  // If there are ad updates, apply them
  if (adUpdates) {
    const adUpdatesToApply = { ...adUpdates };
    delete adUpdatesToApply.advert_id;
    
    const { error: adError } = await supabase
      .from('ads')
      .update(adUpdatesToApply)
      .eq('product_id', productId);
      
    if (adError) throw adError;
  }
  
  return productData;
}

export async function deleteProduct(productId: string) {
  // First, delete the ad associated with the product
  const { error: adError } = await supabase
    .from('ads')
    .delete()
    .eq('product_id', productId);
    
  if (adError) throw adError;
  
  // Then delete the product
  const { error: productError } = await supabase
    .from('products')
    .delete()
    .eq('product_id', productId);
    
  if (productError) throw productError;
    
  return true;
}
