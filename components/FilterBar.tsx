"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { SlidersHorizontal, X } from "lucide-react"

interface FilterBarProps {
  onFilterChange: (filters: any) => void
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedRating, setSelectedRating] = useState("")
  const [sortBy, setSortBy] = useState("trending")

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value)
    updateFilters({ priceRange: value })
  }

  const updateFilters = (newFilter: any) => {
    const filters = {
      priceRange,
      location: selectedLocation,
      category: selectedCategory,
      rating: selectedRating,
      sortBy,
      ...newFilter,
    }
    onFilterChange(filters)
  }

  const clearFilters = () => {
    setPriceRange([0, 1000])
    setSelectedLocation("")
    setSelectedCategory("")
    setSelectedRating("")
    setSortBy("trending")
    onFilterChange({})
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4 overflow-x-auto">
          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {/* Mobile Filter Content */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range</label>
                  <Slider
                    min={0}
                    max={1000}
                    step={10}
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
                {/* Other mobile filters... */}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center gap-4 flex-1">
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value)
                updateFilters({ sortBy: value })
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value)
                updateFilters({ category: value })
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="home">Home & Garden</SelectItem>
                <SelectItem value="services">Services</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedLocation}
              onValueChange={(value) => {
                setSelectedLocation(value)
                updateFilters({ location: value })
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-york">New York</SelectItem>
                <SelectItem value="los-angeles">Los Angeles</SelectItem>
                <SelectItem value="chicago">Chicago</SelectItem>
                <SelectItem value="miami">Miami</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Price:</span>
              <div className="w-[200px]">
                <Slider min={0} max={1000} step={10} value={priceRange} onValueChange={handlePriceChange} />
              </div>
              <span className="text-sm text-gray-600">
                ${priceRange[0]} - ${priceRange[1]}
              </span>
            </div>

            {(selectedCategory || selectedLocation || priceRange[1] < 1000) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCategory && (
            <Badge variant="secondary" className="text-sm">
              {selectedCategory}
              <button
                onClick={() => {
                  setSelectedCategory("")
                  updateFilters({ category: "" })
                }}
                className="ml-2"
              >
                ×
              </button>
            </Badge>
          )}
          {selectedLocation && (
            <Badge variant="secondary" className="text-sm">
              {selectedLocation}
              <button
                onClick={() => {
                  setSelectedLocation("")
                  updateFilters({ location: "" })
                }}
                className="ml-2"
              >
                ×
              </button>
            </Badge>
          )}
          {priceRange[1] < 1000 && (
            <Badge variant="secondary" className="text-sm">
              ${priceRange[0]} - ${priceRange[1]}
              <button
                onClick={() => {
                  setPriceRange([0, 1000])
                  updateFilters({ priceRange: [0, 1000] })
                }}
                className="ml-2"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

