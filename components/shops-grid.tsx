import { ShopCard } from '@/components/shop-card';
import EmptyState from '@/components/EmptyState';
import { Shop } from '@/types/types';

export const ShopsGrid = ({ shops }: { shops: Shop[] }) => {
  if (!shops || shops.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {shops.map((shop) => (
        <ShopCard key={shop.shop_id} shop={shop} />
      ))}
    </div>
  );
};
