import ServiceCard from '@/components/ServiceCard';
import EmptyState from '@/components/EmptyState';
import { Ad, Service } from '@/types/types';

// todo: fix typeing in here
export const ServicesGrid = ({ services }: { services: any[] }) => {
  if (!services || services.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((item) => (
        <ServiceCard
          key={item.advert_id}
          service={item.services}
          shop={item.shops}
          isPromoted={item.isPromoted}
          views={item.views}
          rating={item.rating || 4.5} // Default rating if not available
        />
      ))}
    </div>
  );
};
