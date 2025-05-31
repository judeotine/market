'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Product, Shop } from '@/types/types';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Loader2, Plus, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductListProps {
  shop_id: string;
  products: Product[];
  loading: boolean;
  onProductCreated: () => void;
  refreshKey: number;
  onAddProduct?: () => void;
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const ProductStatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { label: string; variant: BadgeVariant }> = {
    active: { label: 'Active', variant: 'default' },
    draft: { label: 'Draft', variant: 'outline' },
    archived: { label: 'Archived', variant: 'secondary' },
    out_of_stock: { label: 'Out of Stock', variant: 'destructive' },
  };

  const statusInfo = statusMap[status] || { label: status, variant: 'outline' as BadgeVariant };

  return (
    <Badge variant={statusInfo.variant} className="capitalize">
      {statusInfo.label}
    </Badge>
  );
};

export function ProductList({ shop_id, products, loading, onProductCreated, refreshKey, onAddProduct }: ProductListProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setDeletingProductId(productId);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('product_id', productId);

      if (error) throw error;

      toast.success('Product deleted successfully');
      onProductCreated();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeletingProductId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/3 mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 border-2 border-dashed rounded-lg"
      >
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No products yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start selling by adding your first product to your shop.
        </p>
        <Button 
          onClick={onAddProduct || (() => router.push(`/shop/${shop_id}/products/new`))}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Your First Product
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Your Products</h2>
          <p className="text-muted-foreground">
            Manage your shop's products and inventory
          </p>
        </div>
        <Button 
          onClick={onAddProduct || (() => router.push(`/shop/${shop_id}/products/new`))}
          className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.product_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Card className="h-full flex flex-col hover:shadow-md transition-shadow overflow-hidden">
              <div className="aspect-square bg-muted/50 relative group">
                {product.other?.images?.[0] ? (
                  <Image
                    src={product.other.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-muted/30 group-hover:bg-muted/50 transition-colors">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <CardHeader className="flex-1 p-4">
                <div className="flex justify-between items-start gap-2">
                  <div key={product.product_id} className="group relative">
                    <Link href={`/shop/${shop_id}/products/${product.product_id}`} className="block">
                      <h3 className="font-medium line-clamp-2 break-words">{product.name}</h3>
                    </Link>
                    <div className="flex-shrink-0">
                      <ProductStatusBadge status={(product.other as any)?.status || 'draft'} />
                    </div>
                  </div>
                  {product.description && (
                    <p className="text-muted-foreground text-sm mt-1 line-clamp-2 break-words">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-medium text-lg">
                      {formatCurrency(product.price || 0, product.price_currency || 'UGX')}
                    </span>
                    {('stock_quantity' in product) && 
                     (product as any).stock_quantity !== null && 
                     (product as any).stock_quantity !== undefined && 
                     Number((product as any).stock_quantity) <= 0 && (
                      <span className="text-xs text-destructive">Out of Stock</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="p-4 pt-0 border-t">
                <div className="flex justify-between w-full">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/shop/${shop_id}/products/${product.product_id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90" onClick={() => handleDelete(product.product_id)}>
                    {deletingProductId === product.product_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
