'use client';

import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Wrench, Store, Loader2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import InlineFilters from '@/components/InlineFilters';
import ContentSkeleton from '@/components/ContentSkeleton';
import { HomeHero } from '@/components/home-hero';
import { supabase } from '@/utils/supabase-client';
import { showErrorToast } from '@/utils/error-utils';
import { ProductsGrid } from '@/components/products-grid';
import { ServicesGrid } from '@/components/services-grid';
import { ShopsGrid } from '@/components/shops-grid';
import { FeaturedCategories } from '@/components/featured-categories';

const itemsPerPage = 6;

export default function HomePage() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [featuredShops, setFeaturedShops] = useState<any[]>([]);
  const [allTrendingAds, setAllTrendingAds] = useState<any[]>([]);

  // Real-time subscriptions and initial data fetch
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        const [categoriesData, shopsData, trendingAdsData] = await Promise.all([
          fetchCategories(),
          fetchFeaturedShops(),
          fetchTrendingAds(),
        ]);

        setCategories(categoriesData);
        setFeaturedShops(shopsData);
        setAllTrendingAds(trendingAdsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    // Set up real-time subscriptions
    const categorySubscription = supabase
      .channel('categories')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'categories',
      }, async (payload) => {
        const { data } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        setCategories(data || []);
      })
      .subscribe();

    const shopsSubscription = supabase
      .channel('shops')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'shops',
      }, async (payload) => {
        const { data } = await supabase
          .from('shops')
          .select('*')
          .limit(4);
        setFeaturedShops(data || []);
      })
      .subscribe();

    const adsSubscription = supabase
      .channel('ads')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ads',
      }, async (payload) => {
        const { data } = await supabase
          .from('ads')
          .select('*, products(*), services(*), shops(*)')
          .eq('isPromoted', true)
          .limit(12)
          .order('created_at', { ascending: false });
        setAllTrendingAds(data || []);
      })
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(categorySubscription);
      supabase.removeChannel(shopsSubscription);
      supabase.removeChannel(adsSubscription);
    };
  }, []);

  const [activeTab, setActiveTab] = useState('home');
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // Fetch trending products
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, shops(*)')
          .eq('isTrending', true)
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) throw error;
        setTrendingProducts(data || []);
      } catch (error) {
        console.error('Error fetching trending products:', error);
        showErrorToast('Failed to load trending products');
      }
    };

    if (activeTab === 'trending') {
      fetchTrendingProducts();
    }
  }, [activeTab]);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*, shops(*)')
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
        showErrorToast('Failed to load services');
      }
    };

    if (activeTab === 'services') {
      fetchServices();
    }
  }, [activeTab]);

  // Filter products based on user filters
  const filteredProducts = useMemo(() => {
    let products = allTrendingAds.filter((ad) => ad.type === 'product');

    if (filters.category) {
      products = products.filter(
        (ad) => ad.products?.category_id === filters.category
      );
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      products = products.filter((ad) => {
        const price = ad.products?.price ?? 0;
        return price >= min && price <= max;
      });
    }

    return products;
  }, [allTrendingAds, filters]);

  // Paginate the filtered products
  const paginatedProducts = useMemo(() => {
    const start = 0;
    const end = page * itemsPerPage;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, page]);

  const hasMore = filteredProducts.length > paginatedProducts.length;

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-gradient-to-r from-amber-600 to-amber-400 --mt-8">
        <HomeHero />
        <HomeTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </section>

      <div className="container mx-auto px-4 py-16 md:pb-24">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <InlineFilters
            onFilterChange={(newFilters) => {
              setFilters(newFilters);
              setPage(1); // reset pagination when filters change
            }}
          />
        </div>

        {/* Tab Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="home" className="mt-0">
            <FeaturedCategories categories={categories} />

            {/* Products Grid */}
            <div className="space-y-8">
              <h2 className="text-xl font-semibold">Featured Products</h2>
              {isLoading && page === 1 ? (
                <ContentSkeleton />
              ) : (
                <>
                  <ProductsGrid products={paginatedProducts} />
                  {hasMore && (
                    <LoadMoreButton
                      isLoading={isLoading}
                      onLoadMore={handleLoadMore}
                    />
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="m-0">
            {isLoading ? (
              <ContentSkeleton />
            ) : (
              <ProductsGrid products={trendingProducts} />
            )}
          </TabsContent>

          <TabsContent value="services" className="m-0">
            {isLoading ? (
              <ContentSkeleton />
            ) : (
              <ServicesGrid services={services} />
            )}
          </TabsContent>

          <TabsContent value="shops" className="m-0">
            {isLoading ? (
              <ContentSkeleton />
            ) : (
              <ShopsGrid shops={featuredShops} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Tab Navigation Component
const HomeTabs = ({ 
  activeTab,
  onTabChange,
}: { 
  activeTab: string;
  onTabChange: (tab: string) => void;
}) => (
  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
    <div className="bg-white rounded-lg shadow-lg">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="w-full grid grid-cols-4 cursor-pointer">
          <TabsTrigger asChild value="home">
            <div className="flex items-center justify-center data-[state=active]:bg-amber-50">
              <Home className="h-4 w-4 mr-2" />
              Home
            </div>
          </TabsTrigger>
          <TabsTrigger asChild value="trending">
            <div className="flex items-center justify-center data-[state=active]:bg-amber-50">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </div>
          </TabsTrigger>
          <TabsTrigger asChild value="services">
            <div className="flex items-center justify-center data-[state=active]:bg-amber-50">
              <Wrench className="h-4 w-4 mr-2" />
              Services
            </div>
          </TabsTrigger>
          <TabsTrigger asChild value="shops">
            <div className="flex items-center justify-center data-[state=active]:bg-amber-50">
              <Store className="h-4 w-4 mr-2" />
              Shops
            </div>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  </div>
);

// Load More Button Component
const LoadMoreButton = ({
  isLoading,
  onLoadMore,
}: {
  isLoading: boolean;
  onLoadMore: () => void;
}) => (
  <div className="flex justify-center mt-8">
    <Button onClick={onLoadMore} disabled={isLoading} className="min-w-[200px]">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        'Load More'
      )}
    </Button>
  </div>
);

//
// 🔌 Supabase Fetch Functions (they can be moved to a separate file if needed)
//

async function fetchCategories() {
  try {
    // First, check if the categories table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .rpc('table_exists', { table_name: 'categories' });
    
    if (tableCheckError) {
      console.warn('Error checking if categories table exists:', tableCheckError);
      // Continue execution as the table might exist but the function doesn't
    }
    
    if (tableExists === false) {
      console.warn('Categories table does not exist');
      // Return default categories or empty array
      return [];
    }
    
    // If we get here, the table exists, so fetch categories
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      showErrorToast('Failed to load categories');
      return [];
    }
    
    // If no categories exist, return an empty array instead of null
    return data || [];
    
  } catch (error) {
    console.error('Unexpected error in fetchCategories:', error);
    // Don't show error toast for missing table to prevent user confusion
    if (!error.message?.includes('relation "categories" does not exist')) {
      showErrorToast('Failed to load categories');
    }
    return [];
  }
}

async function fetchFeaturedShops() {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .limit(4);
    
    if (error) {
      console.error('Error fetching featured shops:', error);
      showErrorToast('Failed to load featured shops');
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching featured shops:', error);
    showErrorToast('Failed to load featured shops');
    return [];
  }
}

async function fetchTrendingAds() {
  try {
    console.log('Fetching trending ads...');
    
    // First, verify if the table exists
    const { data: tableData, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'ads' })
      .single();

    if (tableError) {
      console.error('Error checking ads table:', tableError);
      console.error('This might indicate the table does not exist or there are permission issues');
      showErrorToast('Database configuration error');
      return [];
    }

    console.log('Table info:', tableData);
    
    // Now try to fetch the ads
    const { data, error, status, statusText } = await supabase
      .from('ads')
      .select('*, products(*), services(*), shops(*)')
      .eq('isPromoted', true)
      .limit(12)
      .order('created_at', { ascending: false });
    
    console.log('Fetch status:', { status, statusText });
    
    if (error) {
      console.error('Error fetching trending ads:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      showErrorToast('Failed to load trending ads');
      return [];
    }
    
    console.log('Fetched trending ads:', data?.length || 0);
    return data || [];
  } catch (error: any) {
    if (error instanceof Error) {
      console.error('Unexpected error in fetchTrendingAds:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('Unknown error in fetchTrendingAds:', error);
    }
    showErrorToast('Failed to load trending ads');
    return [];
  }
}
