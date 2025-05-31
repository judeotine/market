import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

type SearchFilters = {
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  location?: string;
};

type SearchResult = {
  products: any[];
  loading: boolean;
  error: string | null;
  search: (query: string, filters?: SearchFilters) => Promise<void>;
};

export function useProductSearch(): SearchResult {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string, filters: SearchFilters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            filters,
          }),
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setProducts(data.results || []);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to perform search. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return {
    products,
    loading,
    error,
    search: debouncedSearch,
  };
}
