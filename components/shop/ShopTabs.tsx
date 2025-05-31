'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Plus, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductList } from '@/components/shop/ProductList';
import { Shop, Product } from '@/types/types';

// Enhanced session check with retry and refresh token handling
const checkAndRefreshSession = async (supabase: any, retries = 2, delay = 300) => {
  for (let i = 0; i <= retries; i++) {
    try {
      // First try to get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      // If we have a valid session, return it
      if (session) {
        return { session, error: null };
      }
      
      // If no session, try to refresh it
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) throw refreshError;
      if (refreshedSession) {
        return { session: refreshedSession, error: null };
      }
      
      // If we're still here, wait and retry
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    } catch (error) {
      console.error(`Session check/refresh attempt ${i + 1} failed:`, error);
      if (i === retries) {
        console.error('Max retries reached for session check/refresh');
        return { session: null, error };
      }
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  return { session: null, error: new Error('Unable to establish session') };
};

interface ShopTabsProps {
  shop?: Shop | null;
  onProductCreated?: () => void;
}

export function ShopTabs({ shop, onProductCreated }: ShopTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const supabase = createClientComponentClient();
  const [shopState, setShopState] = useState<Shop | null>(shop || null);
  
  // Update internal state when the shop prop changes
  useEffect(() => {
    setShopState(shop || null);
  }, [shop]);

  // Helper function to safely get and validate shop ID from different possible fields
  const getShopId = useCallback((): string | null => {
    // Helper function to try getting ID from URL
    const tryGetIdFromUrl = (): string | null => {
      if (typeof window === 'undefined') return null;
      
      try {
        const pathParts = window.location.pathname.split('/');
        const shopIdIndex = pathParts.indexOf('shop') + 1;
        if (shopIdIndex > 0 && shopIdIndex < pathParts.length) {
          const shopId = pathParts[shopIdIndex];
          if (shopId && shopId !== 'undefined' && shopId !== 'null') {
            console.log('Using shop ID from URL path:', shopId);
            return shopId;
          }
        }
      } catch (error) {
        console.error('Error getting shop ID from URL path:', error);
      }
      
      return null;
    };

    // Helper to validate if an ID is valid
    const isValidId = (id: any): boolean => {
      return id && 
             typeof id === 'string' && 
             id.trim() !== '' && 
             id !== 'undefined' && 
             id !== 'null';
    };

    try {
      // First try to get from shop state or props
      const currentShop = shopState || shop;
      
      if (currentShop) {
        // Check all possible ID fields in order of preference
        const possibleIds = [
          currentShop.shop_id,
          currentShop.profile_id
        ].filter(Boolean); // Remove any undefined/null values
        
        const validId = possibleIds.find(isValidId);
        
        if (validId) {
          console.log('Using shop ID from shop object:', validId);
          return validId;
        }
        
        console.warn('No valid ID found in shop object, trying URL...');
      } else {
        console.warn('No shop data available, trying URL...');
      }
      
      // If we get here, try to get from URL as fallback
      const urlId = tryGetIdFromUrl();
      if (urlId) {
        return urlId;
      }
      
      console.error('No valid shop ID found in any source');
      return null;
      
    } catch (error) {
      console.error('Error in getShopId:', error);
      return tryGetIdFromUrl();
    }
  }, [shop, shopState]);

  const handleProductCreated = () => {
    setRefreshKey(prev => prev + 1); // This will trigger a re-fetch of products
  };

  // Helper function to get shop ID from URL with better error handling and validation
  const getShopIdFromUrl = (): string | null => {
    // Skip if not in browser environment
    if (typeof window === 'undefined') {
      console.log('getShopIdFromUrl: Not in browser environment');
      return null;
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    // First try to get from URL path
    try {
      const url = new URL(window.location.href);
      const pathParts = url.pathname.split('/').filter(Boolean); // Remove empty strings
      
      // Find the index of 'shop' in the path
      const shopIndex = pathParts.findIndex(part => part.toLowerCase() === 'shop');
      
      if (shopIndex !== -1 && shopIndex < pathParts.length - 1) {
        const potentialId = pathParts[shopIndex + 1];
        
        // Validate the ID format
        if (potentialId && uuidRegex.test(potentialId)) {
          console.log('getShopIdFromUrl: Found valid shop ID in URL path:', potentialId);
          return potentialId;
        }
      }
    } catch (error) {
      console.error('Error parsing URL path for shop ID:', error);
    }
    
    // If not found in path, try to get from URL parameters
    try {
      const url = new URL(window.location.href);
      const shopIdParam = url.searchParams.get('shopId') || url.searchParams.get('shop_id');
      
      if (shopIdParam && uuidRegex.test(shopIdParam)) {
        console.log('getShopIdFromUrl: Found valid shop ID in URL parameters:', shopIdParam);
        return shopIdParam;
      }
    } catch (error) {
      console.error('Error parsing URL parameters for shop ID:', error);
    }
    
    // Last resort: try to extract from the full URL using regex
    try {
      const url = window.location.href;
      const shopIdMatch = url.match(/[\/&?](?:shop[_-]?id|shop)[=:\/]([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i);
      
      if (shopIdMatch && shopIdMatch[1]) {
        console.log('getShopIdFromUrl: Extracted shop ID from URL using regex:', shopIdMatch[1]);
        return shopIdMatch[1];
      }
    } catch (error) {
      console.error('Error extracting shop ID from URL using regex:', error);
    }
    
    console.log('getShopIdFromUrl: No valid shop ID found in URL');
    return null;
  };

  const handleAddProduct = useCallback(async (e?: React.MouseEvent) => {
    // Prevent default form submission if this was triggered by a button click
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('handleAddProduct called');
    
    // Get session first to ensure we're authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Not authenticated:', sessionError);
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.pathname);
      window.location.href = `/login?redirectTo=${returnUrl}`;
      return;
    }
    
    // Define UUID regex at function scope
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    let shopId: string | null = null;
    let source = 'none';
    
    try {
      // Get the current shop from state or props
      const currentShop = shopState || shop;
      console.log('Current shop data:', currentShop);
      
      // First, try to get shop ID directly from the shop object
      if (currentShop?.shop_id && uuidRegex.test(currentShop.shop_id)) {
        shopId = currentShop.shop_id;
        source = 'shop_id from shop object';
      } 
      // If no shop_id but we have profile_id, use that
      else if (currentShop?.profile_id && uuidRegex.test(currentShop.profile_id)) {
        // Try to fetch the shop by profile_id first
        try {
          console.log('Attempting to fetch shop by profile ID:', currentShop.profile_id);
          const { data: shopData, error } = await supabase
            .from('shops')
            .select('shop_id')
            .eq('profile_id', currentShop.profile_id)
            .single();
            
          if (!error && shopData?.shop_id) {
            shopId = shopData.shop_id;
            source = 'fetched from profile_id';
            console.log('Fetched shop ID:', shopId);
          } else {
            // If we can't find the shop by profile_id, use profile_id as a fallback
            shopId = currentShop.profile_id;
            source = 'profile_id as fallback';
          }
        } catch (fetchError) {
          console.error('Error fetching shop by profile ID:', fetchError);
          shopId = currentShop.profile_id;
          source = 'profile_id after error';
        }
      }
      
      if (shopId) {
        source = 'shop state/props';
        console.log('Using shop ID from shop state/props:', shopId);
      }
      
      // 2. If we still don't have an ID, try to get from URL as fallback
      if (!shopId) {
        const urlShopId = getShopIdFromUrl();
        if (urlShopId) {
          shopId = urlShopId;
          source = 'URL';
          console.log('Using shop ID from URL:', shopId);
        }
      }
      
      // 4. Validate we have a shop ID
      if (!shopId) {
        const errorDetails = { 
          hasShopState: !!shopState,
          hasShopProp: !!shop,
          shopStateKeys: shopState ? Object.keys(shopState) : [],
          shopPropKeys: shop ? Object.keys(shop) : [],
          currentPath: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
          fullUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
          profileId: currentShop?.profile_id || 'none'
        };
        
        console.error('No valid shop ID found:', errorDetails);
        
        // Log the full shop objects for debugging
        if (shopState) console.log('shopState object:', JSON.stringify(shopState, null, 2));
        if (shop) console.log('shop prop object:', JSON.stringify(shop, null, 2));
        
        toast.error('Unable to determine shop. Please ensure you are on a valid shop page.');
        return;
      }
      
      // 3. Navigate to the new product page with the shop ID in the route
      const targetUrl = `/shop/${shopId}/products/new`;
      console.log('Navigating to new product page:', { targetUrl, source });
      
      try {
        // First ensure we have a valid session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('No active session, redirecting to login');
          window.location.href = `/login?redirectTo=${encodeURIComponent(targetUrl)}`;
          return;
        }

        // Add a small delay to ensure any state updates are processed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Use window.location.assign() instead of href to maintain auth state
        console.log('Using window.location.assign() for navigation');
        window.location.assign(targetUrl);
        
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback to a full page reload with the target URL
        window.location.href = targetUrl;
      }
      
    } catch (error) {
      console.error('Error in handleAddProduct:', error);
      
      // If we have a shop ID but failed to navigate, try a full page reload
      if (shopId) {
        console.log('Attempting full page reload to product creation page');
        window.location.href = `/shop/${shopId}/products/new`;
        return;
      }
      
      toast.error('An error occurred while adding a product. Please try again.');
    }
  }, [shop, shopState, router, getShopIdFromUrl, supabase.auth]);

  // Debug log when component mounts or shop props change
  useEffect(() => {
    console.log('ShopTabs mounted or shop props changed', {
      shopProps: shop ? 'available' : 'not available',
      shopState: shopState ? 'available' : 'not available',
      shopPropKeys: shop ? Object.keys(shop) : 'N/A',
      shopStateKeys: shopState ? Object.keys(shopState) : 'N/A',
      shopIdFromProps: shop?.shop_id,
      shopIdFromState: shopState?.shop_id,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
      fullUrl: typeof window !== 'undefined' ? window.location.href : 'N/A'
    });
    
    const fetchShop = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user session
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setError('Please sign in to view your shop');
          return;
        }
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', user.id)
          .single();
          
        if (profileError || !profile) {
          setError('User profile not found');
          return;
        }
        
        // Get shop data
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('profile_id', profile.id)
          .maybeSingle();
          
        if (shopError) {
          throw shopError;
        }
        
        if (shopData) {
          setShopState(shopData);
        } else {
          console.log('No shop found for user:', profile.id);
        }
      } catch (err) {
        console.error('Error fetching shop data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShop();
    
        // Set up real-time subscription for shop updates if we have a shop
    if (shop?.shop_id) {
      const channel = supabase
        .channel('shop-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'shops',
            filter: `shop_id=eq.${shop.shop_id}`
          }, 
          (payload) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              setShopState(payload.new as Shop);
            } else if (payload.eventType === 'DELETE') {
              setShopState(null);
            }
          }
        )
        .subscribe();
        
      return () => {
        channel.unsubscribe();
      };
    }
    
    return undefined; // Add a default return value
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get shop ID first
        const shopId = getShopId();
        if (!shopId) {
          const errorMsg = 'Unable to determine shop identifier. Please refresh the page.';
          console.warn(errorMsg);
          setError(errorMsg);
          setProducts([]);
          return;
        }
        
        // Get current shop for logging purposes
        const currentShop = shopState || shop;
        console.log('Fetching products for shop ID:', shopId, 'Shop name:', currentShop?.name);
        
        // Fetch products from the database
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopId);
          
        if (productsError) {
          throw new Error(`Database error: ${productsError.message}`);
        }
        
        // Update products state
        setProducts(products || []);
        
        // Call the onProductCreated callback if products were fetched successfully
        if (onProductCreated && products?.length) {
          onProductCreated();
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? `Error loading products: ${err.message}`
          : 'An unknown error occurred while loading products';
          
        console.error(errorMessage, err);
        setError(errorMessage);
        setProducts([]);
        
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [shop, shopState, getShopId, onProductCreated, refreshKey, supabase]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // Show error state if there's an error
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading shop data...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="font-medium">Error Loading Shop</h3>
          </div>
          <p className="mt-1 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm font-medium text-red-700 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no shop found
  if (!shopState) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h3 className="font-medium">No Shop Found</h3>
          </div>
          <p className="mt-1 text-sm">You don't have a shop yet. Create one to start selling your products.</p>
          <div className="mt-4">
            <Button onClick={() => router.push('/dashboard/shop/create')}>
              Create Shop
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no shop is available
  if (!shop) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
        <p>No shop information available. Please create a shop first.</p>
      </div>
    );
  }

  // Main content
  return (
    <Tabs 
      defaultValue="products" 
      className="w-full mt-6"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <div className="flex justify-between items-center mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {activeTab === 'products' && (
          <Button 
            onClick={handleAddProduct}
            className="bg-amber-600 hover:bg-amber-700"
            disabled={!shop}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      <TabsContent value="products" className="mt-0">
        {products.length === 0 ? (
          <div className="bg-white rounded-lg border p-6 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new product.</p>
            <div className="mt-6">
              <Button
                onClick={handleAddProduct}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                New Product
              </Button>
            </div>
          </div>
        ) : (
          <ProductList 
            products={products} 
            shop_id={shop.shop_id}
            loading={loading}
            onProductCreated={handleProductCreated}
            onAddProduct={handleAddProduct}
            refreshKey={refreshKey}
          />
        )}
      </TabsContent>
      
      <TabsContent value="analytics" className="mt-6">
        {!shop && !shopState ? (
          <div className="bg-white rounded-lg border p-6">
            <p className="text-muted-foreground">Shop information is not available.</p>
          </div>
        ) : !(shop?.id || shop?.shop_id || shopState?.id || shopState?.shop_id) ? (
          <div className="bg-white rounded-lg border p-6">
            <p className="text-muted-foreground">Shop ID is missing. Please check your shop information.</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 mb-2">Debug information:</p>
              <pre className="text-xs bg-black/5 p-2 rounded overflow-auto">
                {JSON.stringify({
                  hasShop: !!shop,
                  hasShopState: !!shopState,
                  shopIdFromShop: shop?.shop_id,
                  shopIdFromState: shopState?.shop_id,
                  shopKeys: shop ? Object.keys(shop) : [],
                  shopStateKeys: shopState ? Object.keys(shopState) : [],
                  shopObject: shop || shopState,
                  currentPath: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
                  searchParams: typeof window !== 'undefined' ? window.location.search : 'N/A'
                }, (key, value) => {
                  // Handle circular references and large objects
                  if (key === 'shopObject' && value) {
                    return {
                      ...value,
                      // Add any other properties you want to include
                    };
                  }
                  return value;
                }, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4">Shop Analytics</h3>
            <p className="text-muted-foreground">
              View your shop's performance metrics and insights here.
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm font-medium mb-2">Shop ID: {shop?.id || shop?.shop_id || shopState?.id || shopState?.shop_id}</p>
              <p className="text-sm text-gray-600">Analytics data will be displayed here.</p>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

export default ShopTabs;
