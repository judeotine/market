'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Shop } from '@/types/types';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FiShoppingBag, 
  FiPlus, 
  FiStar, 
  FiMapPin, 
  FiAlertCircle, 
  FiSearch, 
  FiFilter, 
  FiChevronDown,
  FiClock,
  FiTrendingUp,
  FiX,
  FiAward,
  FiCheck
} from 'react-icons/fi';
import { userSignal } from '@/store';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

type SortOption = 'newest' | 'rating' | 'popular' | 'name-asc' | 'name-desc';

interface ShopWithProfile extends Omit<Shop, 'rating' | 'other'> {
  profiles?: {
    name: string;
    avatar: string;
  } | null;
  // Override rating to handle both number and string types
  rating: number | string;
  review_count?: number;
  created_at?: string;
  categories?: string[];
  is_featured?: boolean;
  is_verified?: boolean;
  // Ensure other is required and includes all necessary properties
  other: {
    location?: string;
    [key: string]: any;
  };
  // Include all required Shop properties
  shop_id: string;
  name: string;
  ads_count: number;
  ads_duration: number;
  ads_duration_units: string;
  price_per_ad: number;
  price_currency: string;
  ads_payment_id: string;
  description: string;
  profile_id: string;
  logo: string;
}

export default function ShopsPage() {
  const [shops, setShops] = useState<ShopWithProfile[]>([]);
  const [myShop, setMyShop] = useState<ShopWithProfile | null>(null);
  const [isLoadingMyShop, setIsLoadingMyShop] = useState(true);
  const [isLoadingShops, setIsLoadingShops] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const user = userSignal.value || null;
  
  // Memoize filtered shops based on search query
  const filteredShops = useMemo(() => {
    if (!searchQuery.trim()) return shops;
    
    const query = searchQuery.toLowerCase().trim();
    return shops.filter(shop => 
      shop.name.toLowerCase().includes(query) ||
      shop.description?.toLowerCase().includes(query) ||
      shop.other?.location?.toLowerCase().includes(query) ||
      shop.profiles?.name.toLowerCase().includes(query)
    );
  }, [shops, searchQuery]);
  
  // Debounce search input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Fetch user's shop
  useEffect(() => {
    if (!user) {
      setIsLoadingMyShop(false);
      return;
    }

    async function fetchMyShop() {
      if (!user) return;
      
      try {
        setIsLoadingMyShop(true);
        
        // Get profile and shop in a single query using a join
        const { data, error: shopError } = await supabase
          .from('profiles')
          .select(`
            profile_id,
            shops:shops!inner(
              *,
              profiles:profile_id (
                name,
                avatar
              )
            )
          `)
          .eq('user_id', user?.id || '')
          .single();

        if (shopError) throw shopError;
        
        if (data?.shops) {
          setMyShop(Array.isArray(data.shops) ? data.shops[0] : data.shops);
        }
      } catch (err) {
        console.error('Error fetching my shop:', err);
        setError('Failed to load your shop');
      } finally {
        setIsLoadingMyShop(false);
      }
    }

    fetchMyShop();
  }, [user]);

  // Fetch all shops
  useEffect(() => {
    async function fetchAllShops() {
      try {
        setIsLoadingShops(true);
        
        // Always fetch all shops, but exclude the user's own shop if logged in
        let query = supabase
          .from('shops')
          .select(`
            *,
            profiles:profile_id (
              name,
              avatar
            )
          `);
        
        // If user is logged in and has a shop, exclude it from the results
        if (user && myShop) {
          query = query.neq('shop_id', myShop.shop_id);
        }
        
        const { data, error: shopsError } = await query;
        
        if (shopsError) throw shopsError;
        setShops(data || []);
      } catch (err) {
        console.error('Error fetching shops:', err);
        setError('Failed to load shops');
      } finally {
        setIsLoadingShops(false);
      }
    }

    fetchAllShops();
  }, [user]);

  const isLoading = isLoadingMyShop || isLoadingShops;
  
  if (isLoading && !myShop && shops.length === 0) {
    return <LoadingSkeleton type="shop" count={6} />;
  }

  if (shops.length === 0 && !isLoadingShops) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Shops Found</CardTitle>
            <CardDescription>
              Be the first to create a shop!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/create-shop">
              <Button className="bg-amber-600 hover:bg-amber-700">
                Create Shop
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ShopCard = ({ 
    shop, 
    isMyShop = false,
    index = 0 
  }: { 
    shop: ShopWithProfile; 
    isMyShop?: boolean;
    index?: number;
  }) => (
    <Card 
      className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border border-gray-100 rounded-xl overflow-hidden hover:border-amber-100"
      style={{
        animation: `fadeIn 0.3s ease-out ${index * 0.05}s`,
        animationFillMode: 'both',
      }}
    >
      <div className="relative h-40 bg-gradient-to-r from-amber-50 to-amber-100 flex items-center justify-center">
        {shop.logo ? (
          <img
            src={shop.logo}
            alt={shop.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md">
            <FiShoppingBag className="w-8 h-8 text-amber-600" />
          </div>
        )}
        {isMyShop && (
          <span className="absolute top-3 left-3 bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Your Shop
          </span>
        )}
      </div>
      <CardHeader className="flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-gray-900">{shop.name}</CardTitle>
          {shop.rating && (
            <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-sm">
              <FiStar className="w-4 h-4 fill-amber-400 mr-1" />
              {shop.rating}
            </div>
          )}
        </div>
        
        {shop.other?.location && (
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <FiMapPin className="w-4 h-4 mr-1" />
            <span>{shop.other.location}</span>
          </div>
        )}
        
        {shop.description && (
          <p className="text-gray-600 mt-3 line-clamp-3 text-sm">
            {shop.description}
          </p>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link href={`/shops/${shop.shop_id}`} className="block w-full">
            <Button 
              variant={isMyShop ? "default" : "outline"}
              className={`w-full justify-center ${isMyShop ? 'bg-amber-600 hover:bg-amber-700' : 'text-amber-700 border-amber-200 hover:bg-amber-50 hover:border-amber-300'}`}
            >
              {isMyShop ? 'Manage Shop' : 'Visit Shop'}
            </Button>
          </Link>
        </div>
      </CardHeader>
    </Card>
  );

  // Add fadeIn animation for search results
  const fadeInKeyframes = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <style jsx>{fadeInKeyframes}</style>
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
          <FiAlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="space-y-12">
        {/* My Shop Section - Only show if user is logged in */}
        {user && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Shop</h2>
              {!myShop && !isLoadingMyShop && (
                <Link href="/create-shop">
                  <Button className="bg-amber-600 hover:bg-amber-700 flex items-center gap-2">
                    <FiPlus className="w-4 h-4" />
                    Create Shop
                  </Button>
                </Link>
              )}
            </div>
            
            {isLoadingMyShop ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <LoadingSkeleton type="shop" count={1} />
              </div>
            ) : myShop ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ShopCard shop={myShop} isMyShop={true} />
              </div>
            ) : (
              <Card className="border-2 border-dashed border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <FiPlus className="w-8 h-8 text-amber-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">Create Your Shop</CardTitle>
                  <CardDescription className="text-gray-600 max-w-md mb-6">
                    Start selling your products and services today! Set up your shop in minutes and reach new customers.
                  </CardDescription>
                  <Link href="/create-shop">
                    <Button className="bg-amber-600 hover:bg-amber-700 px-6">
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </section>
        )}
      
        {/* Sign In Prompt for Non-Logged In Users */}
        {!user && (
          <section>
            <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mb-4 shadow-sm">
                  <FiShoppingBag className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Selling Today</h2>
                <p className="text-gray-600 max-w-lg mb-6">
                  Create your own shop and start selling your products or services to customers worldwide. It's free to get started!
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto px-6">
                      Create Account
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto px-6">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* All Shops Section */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Shops</h2>
              <p className="text-gray-500 text-sm mt-1">
                {filteredShops.length} {filteredShops.length === 1 ? 'shop' : 'shops'} available
                {searchQuery && filteredShops.length > 0 && (
                  <span className="text-amber-600 ml-2">
                    (matching "{searchQuery}")
                  </span>
                )}
              </p>
            </div>
            <div className="w-full sm:w-80">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search shops by name, location..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {isLoadingShops ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LoadingSkeleton type="shop" count={6} />
            </div>
          ) : filteredShops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShops.map((shop, index) => (
                <ShopCard key={shop.shop_id} shop={shop} isMyShop={false} index={index} />
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                  <FiSearch className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No matching shops found' : 'No shops available yet'}
                </h3>
                <p className="text-gray-500 max-w-sm mb-6">
                  {searchQuery 
                    ? `We couldn't find any shops matching "${searchQuery}". Try a different search term.`
                    : 'There are currently no shops available. Check back later or create your own shop to get started!'}
                </p>
                {user && (
                  <Link href="/create-shop">
                    <Button className="bg-amber-600 hover:bg-amber-700">
                      Create Your Shop
                    </Button>
                  </Link>
                )}
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    className="mt-3 text-amber-600 border-amber-200 hover:bg-amber-50"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
