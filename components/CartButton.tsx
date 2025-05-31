'use client';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cartSignal } from '@/store';
import Link from 'next/link';
import { useSignal } from 'state-signal';

interface CartButtonProps {
  variant?: 'default' | 'floating';
}

export default function CartButton({ variant = 'default' }: CartButtonProps) {
  const [cart] = useSignal(cartSignal);

  if (variant === 'floating') {
    return (
      <Link
        href="/cart"
        className={`fixed bottom-8 right-8 transition-all duration-300 transform z-50`}>
        <Button
          size="lg"
          className="h-16 w-16 rounded-full bg-amber-600 hover:bg-amber-700 shadow-lg">
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
        </Button>
      </Link>
    );
  }

  return (
    <Link href="/cart">
      <Button variant="ghost" className="relative bg-white text-gray-800">
        <ShoppingCart className="h-5 w-5" />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {cart.length}
          </span>
        )}
      </Button>
    </Link>
  );
}
