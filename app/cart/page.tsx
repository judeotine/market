'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseDb } from '@/utils/supabase-utils';
import { toast } from 'sonner';
import { CartItem } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const { data: user } = await supabaseDb.auth.getUser();
      
      if (!user?.user) {
        toast.error('Please login to view your cart');
        router.push('/login');
        return;
      }

      const { data, error } = await supabaseDb
        .from('cart_items')
        .select('*')
        .eq('user_id', user.user.id);

      if (error) throw error;

      setCartItems(data || []);
    } catch (error) {
      toast.error('Error loading cart items');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabaseDb
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;

      toast.success('Item removed from cart');
      fetchCartItems();
    } catch (error) {
      toast.error('Error removing item from cart');
      console.error('Error:', error);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      const { error } = await supabaseDb
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) throw error;

      toast.success('Quantity updated');
      fetchCartItems();
    } catch (error) {
      toast.error('Error updating quantity');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p>Your cart is empty</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.product_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <p className="text-gray-600">Price: ${item.price}</p>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <div className="mt-4">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-4 py-2 bg-gray-200 rounded mr-2"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-4 py-2 bg-amber-500 text-white rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={() => router.push('/checkout')}
          className="bg-amber-500 text-white px-6 py-2 rounded hover:bg-amber-600"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
