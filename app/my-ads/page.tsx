import { AdList } from '@/components/ad/AdList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyAdsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-amber-600">My Ads</h1>
        <Button asChild>
          <Link href="/create-ad">Create New Ad</Link>
        </Button>
      </div>
      <AdList />
    </div>
  );
}
