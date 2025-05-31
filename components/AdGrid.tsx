import type { Ad, Product, Service } from '@/types/types';
import AdCard from './AdCard';

interface EnhancedAd extends Ad {
  product?: Product;
  service?: Service;
}

interface AdGridProps {
  ads: EnhancedAd[];
}

export default function AdGrid({ ads }: AdGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ads.map((ad) => (
        <AdCard key={ad.advert_id} ad={ad} item={ad.product || ad.service} />
      ))}
    </div>
  );
}
