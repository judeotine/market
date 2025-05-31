import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Toys',
  'Books',
  'Health & Beauty',
  'Automotive',
  'Other',
];

// Format currency for UGX
const formatUGX = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    currencyDisplay: 'narrowSymbol'
  }).format(amount);
};

// Convert price to slider value (logarithmic scale)
const priceToSliderValue = (price: number, min: number, max: number): number => {
  const minLog = Math.log10(min || 1);
  const maxLog = Math.log10(max);
  const valueLog = Math.log10(price || 1);
  return ((valueLog - minLog) / (maxLog - minLog)) * 100;
};

// Convert slider value back to price (logarithmic scale)
const sliderValueToPrice = (value: number, min: number, max: number): number => {
  const minLog = Math.log10(min || 1);
  const maxLog = Math.log10(max);
  const valueLog = minLog + (value / 100) * (maxLog - minLog);
  return Math.round(Math.pow(10, valueLog) / 1000) * 1000; // Round to nearest 1000
};

interface ProductFiltersProps {
  onFilterChange: (filters: {
    categories: string[];
    priceRange: [number, number];
    location: string;
  }) => void;
  onClearFilters: () => void;
  className?: string;
  priceRange: [number, number];
  location: string;
  selectedCategories: string[];
}

export function ProductFilters({
  onFilterChange,
  onClearFilters,
  className = '',
  priceRange = [0, 10000000], // 0 to 10M UGX by default
  location = '',
  selectedCategories = [],
}: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState({
    categories: selectedCategories,
    priceRange: priceRange as [number, number],
    location: location,
  });
  
  // Track slider values separately for better UX
  const [sliderValues, setSliderValues] = useState<[number, number]>([
    priceToSliderValue(priceRange[0], 0, 10000000),
    priceToSliderValue(priceRange[1], 0, 10000000)
  ]);
  
  // Update slider values when price range changes
  useEffect(() => {
    setSliderValues([
      priceToSliderValue(priceRange[0], 0, 10000000),
      priceToSliderValue(priceRange[1], 0, 10000000)
    ]);
  }, [priceRange]);
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryChange = (category: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleApplyFilters = () => {
    onFilterChange({
      categories: localFilters.categories,
      priceRange: localFilters.priceRange,
      location: localFilters.location,
    });
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setLocalFilters({
      categories: [],
      priceRange: [0, 10000000],
      location: '',
    });
    onClearFilters();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`gap-2 ${className}`}>
          <Filter className="h-4 w-4" />
          Filters
          {(localFilters.categories.length > 0 || localFilters.location || localFilters.priceRange[1] < 10000000) && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {localFilters.categories.length + 
               (localFilters.location ? 1 : 0) + 
               (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 10000000 ? 1 : 0)}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filters</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground"
              onClick={handleClearFilters}
            >
              Clear all
            </Button>
          </div>

          <div>
            <h5 className="mb-2 text-sm font-medium">Price Range</h5>
            <div className="space-y-4 px-2">
              <div className="relative pt-8 pb-8">
                {/* Slider track */}
                <div className="absolute h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full top-1/2 -translate-y-1/2">
                  <div 
                    className="absolute h-full bg-primary/80 rounded-full transition-all duration-200 ease-out"
                    style={{
                      left: `${sliderValues[0]}%`,
                      width: `${sliderValues[1] - sliderValues[0]}%`,
                    }}
                  />
                </div>

                {/* Slider handles */}
                <div className="relative">
                  <Slider
                    value={[sliderValues[0], sliderValues[1]]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(values) => {
                      const [min, max] = values as [number, number];
                      setSliderValues([min, max]);
                      
                      // Convert slider values back to prices
                      const minPrice = sliderValueToPrice(min, 0, 10000000);
                      const maxPrice = sliderValueToPrice(max, 0, 10000000);
                      
                      setLocalFilters(prev => ({
                        ...prev,
                        priceRange: [minPrice, maxPrice]
                      }));
                    }}
                    className="relative z-10 w-full"
                  />
                </div>
                
                {/* Tooltips */}
                <div 
                  className="absolute -top-1 text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded-md shadow-lg whitespace-nowrap transition-all duration-200"
                  style={{ 
                    left: `${sliderValues[0]}%`, 
                    transform: 'translateX(-50%)',
                    opacity: sliderValues[0] > 0 ? 1 : 0
                  }}
                >
                  {formatUGX(localFilters.priceRange[0])}
                </div>
                
                <div 
                  className="absolute -top-1 text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded-md shadow-lg whitespace-nowrap transition-all duration-200"
                  style={{ 
                    left: `${sliderValues[1]}%`, 
                    transform: 'translateX(-50%)',
                    opacity: sliderValues[1] < 100 ? 1 : 0
                  }}
                >
                  {formatUGX(localFilters.priceRange[1])}
                </div>
                
                {/* Min/Max labels */}
                <div className="flex justify-between mt-6 text-xs text-muted-foreground">
                  <span>Min: {formatUGX(0)}</span>
                  <span>Max: {formatUGX(10000000)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Min Price</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">UGX</span>
                    <Input
                      type="number"
                      value={localFilters.priceRange[0]}
                      onChange={(e) => {
                        const min = Math.min(Number(e.target.value), localFilters.priceRange[1] - 1000);
                        const newMin = Math.max(0, min);
                        setLocalFilters(prev => ({
                          ...prev,
                          priceRange: [newMin, prev.priceRange[1]]
                        }));
                        setSliderValues([
                          priceToSliderValue(newMin, 0, 10000000),
                          sliderValues[1]
                        ]);
                      }}
                      className="h-9 pl-12 text-sm"
                      min={0}
                      max={localFilters.priceRange[1] - 1000}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Max Price</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">UGX</span>
                    <Input
                      type="number"
                      value={localFilters.priceRange[1]}
                      onChange={(e) => {
                        const max = Math.max(Number(e.target.value), localFilters.priceRange[0] + 1000);
                        const newMax = Math.min(10000000, max);
                        setLocalFilters(prev => ({
                          ...prev,
                          priceRange: [prev.priceRange[0], newMax]
                        }));
                        setSliderValues([
                          sliderValues[0],
                          priceToSliderValue(newMax, 0, 10000000)
                        ]);
                      }}
                      className="h-9 pl-12 text-sm"
                      min={localFilters.priceRange[0] + 1000}
                      max={10000000}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="mb-2 text-sm font-medium">Categories</h5>
            <div className="space-y-2">
              {CATEGORIES.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category}`}
                    checked={localFilters.categories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <label
                    htmlFor={`cat-${category}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="mb-2 text-sm font-medium">Location</h5>
              <Input
                placeholder="City or country"
                value={localFilters.location}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
