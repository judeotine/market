import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/EmptyState';
import { Ad, Product } from '@/types/types';

// todo: fix types in here
export const ProductsGrid = ({ products }: { products: any[] }) => {
  if (!products || products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((item) => (
        <ProductCard
          key={item.advert_id}
          product={item.products}
          shop={item.shops}
          isPromoted={item.isPromoted}
          views={item.views}
          rating={item.rating || 4.5} // Default rating if not available
        />
      ))}
    </div>
  );
};
