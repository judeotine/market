'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Filter, X } from 'lucide-react';
import { toast } from 'sonner';

// Libs
import { createClient } from '@/lib/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

// Types
import type { Product, Ad } from '@/types/types';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/search/SearchBar';
import { ProductFilters } from '@/components/search/ProductFilters';

// Create a single Supabase client for interacting with your database
const supabase = createClient();

interface SearchResult {
  product_id: string;
  name: string;
  description: string;
  price: number;
  price_currency: string;
  rating: number;
  shop_id: string;
  other: {
    images?: string[];
    category?: string;
  };
  ads: {
    advert_id: string;
    isPromoted: boolean;
    views: number;
  };
  shops: {
    name: string;
    other: {
      location?: string;
    };
  };
}

const ITEMS_PER_PAGE = 12;

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  
  // Filters
  const [filters, setFilters] = useState({
    categories: [] as string[],
    priceRange: [0, 10000000] as [number, number], // 0 to 10M UGX by default
    location: '',
  });

  // Format currency for UGX
  const formatUGX = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };


  // Search function
  const searchProducts = useCallback(async () => {
    const searchQuery = query.trim();
    
    // Don't search if no query or filters are active
    if (!searchQuery && !filters.categories.length && !filters.location) {
      setResults([]);
      setHasMore(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Start with a base query for products
      let queryBuilder = supabase
        .from('products')
        .select(
          `
          *,
          ads!left (
            advert_id,
            ispromoted,
            views
          ),
          shops!left (
            name,
            other->location
          )
        `,
          { count: 'exact' }
        )
        .order('product_id', { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      // Apply search query if it exists
      if (searchQuery) {
        queryBuilder = queryBuilder.or(
          `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      // Apply category filter if categories are selected
      if (filters.categories.length > 0) {
        // For multiple categories, we use the 'in' operator
        if (filters.categories.length === 1) {
          queryBuilder = queryBuilder.contains('other', { category: filters.categories[0] });
        } else {
          // For multiple categories, we need to use or conditions
          const orConditions = filters.categories.map(
            category => `other->>'category'.ilike.%${category}%`
          ).join(',');
          queryBuilder = queryBuilder.or(orConditions);
        }
      }


      // Apply price range filter (convert to cents for storage if needed)
      const [minPrice, maxPrice] = filters.priceRange;
      queryBuilder = queryBuilder
        .gte('price', minPrice)
        .lte('price', maxPrice);

      // Apply location filter
      if (filters.location) {
        queryBuilder = queryBuilder.ilike('shops.other->>location', `%${filters.location}%`);
      }

      // Execute the query
      const { data, error, count } = await queryBuilder;

      if (error) throw error;

      // Transform the data to match SearchResult type
      const transformedResults = (data || []).map((product: any) => {
        // Handle case where ads might be an array or single object
        const ad = Array.isArray(product.ads) ? product.ads[0] : product.ads;
        // Handle case where shops might be an array or single object
        const shop = Array.isArray(product.shops) ? product.shops[0] : product.shops;
        
        return {
          ...product,
          ads: {
            advert_id: ad?.advert_id || '',
            isPromoted: ad?.ispromoted || false,
            views: ad?.views || 0
          },
          shops: shop || { name: '', other: { location: '' } },
        };
      });

      setResults(transformedResults);
      setHasMore((count || 0) > page * ITEMS_PER_PAGE);
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Failed to load search results. Please try again.');
      setResults([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [query, filters.categories, filters.priceRange, filters.location, page]);

  // Memoize the search function to prevent unnecessary re-renders
  const memoizedSearchProducts = useMemo(() => searchProducts, [searchProducts]);

  // Trigger search when query or filters change
  useEffect(() => {
    const search = async () => {
      await memoizedSearchProducts();
    };
    
    // Only trigger search if we have a query or active filters
    if (query.trim() || filters.categories.length || filters.location) {
      search();
    } else {
      setResults([]);
      setHasMore(false);
    }
  }, [query, filters.categories, filters.priceRange, filters.location, page, memoizedSearchProducts]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: {
    categories: string[];
    priceRange: [number, number];
    location: string;
  }) => {
    // Only update if filters have actually changed
    setFilters(prevFilters => {
      const filtersChanged = 
        JSON.stringify(prevFilters.categories) !== JSON.stringify(newFilters.categories) ||
        JSON.stringify(prevFilters.priceRange) !== JSON.stringify(newFilters.priceRange) ||
        prevFilters.location !== newFilters.location;
      
      if (filtersChanged) {
        return {
          categories: [...newFilters.categories],
          priceRange: [...newFilters.priceRange],
          location: newFilters.location,
        };
      }
      return prevFilters;
    });
    
    // Always reset to first page when filters change
    setPage(1);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      categories: [],
      priceRange: [0, 10000000],
      location: '',
    });
    setPage(1);
  }, []);

  // Initialize search from URL params
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 10000000;
    const location = searchParams.get('location') || '';

    setQuery(query);
    setFilters({
      categories,
      priceRange: [minPrice, maxPrice] as [number, number],
      location,
    });
  }, [searchParams]);

  // Update URL with search params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters.categories.length) params.set('categories', filters.categories.join(','));
    
    const [minPrice, maxPrice] = filters.priceRange;
    if (minPrice > 0 || maxPrice < 10000000) {
      params.set('minPrice', minPrice.toString());
      params.set('maxPrice', maxPrice.toString());
    }
    
    if (filters.location) params.set('location', filters.location);
    
    const queryString = params.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    
    // Update URL without causing a page reload
    window.history.pushState({}, '', newUrl);
  }, [query, filters]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Search Products</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar 
                onSearch={(q) => setQuery(q)}
                initialValue={query}
              />
            </div>
            <ProductFilters
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              priceRange={filters.priceRange}
              location={filters.location}
              selectedCategories={filters.categories}
              className="ml-2"
            />
          </div>

          {/* Active Filters */}
          {(filters.categories.length > 0 || 
            filters.priceRange[0] > 0 || 
            filters.priceRange[1] < 10000000 || 
            filters.location) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {filters.categories.map((category) => (
                <Badge key={category} variant="secondary" className="gap-1">
                  {category}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        categories: prev.categories.filter((c) => c !== category),
                      }))
                    }
                  />
                </Badge>
              ))}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000) && (
                <Badge variant="secondary" className="gap-1">
                  {formatUGX(filters.priceRange[0])} - {formatUGX(filters.priceRange[1])}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setFilters(prev => ({
                        ...prev,
                        priceRange: [0, 10000000]
                      }))
                    }
                  />
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="gap-1">
                  {filters.location}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        location: '',
                      }))
                    }
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-8">
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="rounded-lg border p-8 text-center">
              <h3 className="text-lg font-medium">No results found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map((product) => (
                  <Card key={product.product_id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-muted relative">
                      {product.other?.images?.[0] ? (
                        <img
                          src={product.other.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )}
                      {product.ads.isPromoted && (
                        <Badge className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm">
                          Sponsored
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium line-clamp-2">
                          {product.name}
                        </h3>
                        <span className="font-semibold whitespace-nowrap ml-2">
                          {product.price_currency} {product.price?.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {product.shops.name}
                        {product.shops.other?.location && ` • ${product.shops.other.location}`}
                      </p>
                      <div className="mt-2 flex justify-between items-center">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-1 text-sm text-muted-foreground">
                            {product.rating?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {product.ads.views} views
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasMore || loading}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
