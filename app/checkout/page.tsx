'use client';

import { useState, useEffect } from 'react';
import { useSignal } from 'state-signal';
import { cartSignal } from '@/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/utils/supabase-client';
import type { Product, Service } from '@/types/types';

export default function CheckoutPage() {
  const [cart] = useSignal(cartSignal);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'card',
  });

  useEffect(() => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
    }
  }, [cart]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    return cart.reduce((total: number, item: Product | Service) => {
      return total + (item.price || 0);
    }, 0);
  };

  const handleCheckout = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Create order in Supabase
      const { error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            status: 'pending',
            type: 'product', // TODO: Handle service type
            total_amount: calculateTotal(),
            currency: 'USD',
            buyer_name: formData.name,
            buyer_email: formData.email,
            buyer_phone: formData.phone,
            delivery_address: formData.address,
            payment_method: formData.paymentMethod,
          },
        ]);

      if (orderError) throw orderError;

      // Clear cart
      cartSignal.value = [];

      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-4">Add some items to your cart to proceed with checkout.</p>
          <Button onClick={() => window.location.href = '/'}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cart Items */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Cart Items</h2>
          <div className="space-y-4">
            {cart.map((item: Product | Service, index: number) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">${item.price}</p>
                  </div>
                  <p className="font-medium">x1</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold">${calculateTotal()}</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Checkout</h2>
          <form className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="123-456-7890"
              />
            </div>

            <div>
              <Label htmlFor="address">Delivery Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City, State, ZIP"
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash on Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="button" onClick={handleCheckout} disabled={loading}>
              {loading ? 'Processing...' : 'Complete Purchase'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
