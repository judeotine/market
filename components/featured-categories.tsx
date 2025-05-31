import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import CategoryScroll from '@/components/CategoryScroll';

export const FeaturedCategories = ({ categories }: { categories: any[] }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Categories</h2>
        <Button asChild variant="link" className="text-amber-600">
          <Link href="/categories">
            View All Categories <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
      <CategoryScroll categories={categories} />
    </div>
  );
};
