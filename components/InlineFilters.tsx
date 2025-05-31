"use client"

import { useState } from "react"
import { Combobox } from "@/components/ui/combobox"
import PriceRangeInput from "@/components/PriceRangeInput"

const locationOptions = [
  { value: "kampala", label: "Kampala" },
  { value: "entebbe", label: "Entebbe" },
  { value: "jinja", label: "Jinja" },
  { value: "mbarara", label: "Mbarara" },
  { value: "gulu", label: "Gulu" },
  { value: "fortportal", label: "Fort Portal" },
  { value: "mbale", label: "Mbale" },
  { value: "masaka", label: "Masaka" },
  { value: "kasese", label: "Kasese" },
  { value: "soroti", label: "Soroti" },
  { value: "lira", label: "Lira" },
  { value: "kabale", label: "Kabale" },
  { value: "arua", label: "Arua" },
  { value: "hoima", label: "Hoima" },
  { value: "kotido", label: "Kotido" },
  { value: "moroto", label: "Moroto" },
  { value: "kisoro", label: "Kisoro" },
  { value: "kabong", label: "Kabong" },
  { value: "kamwenge", label: "Kamwenge" },
  { value: "kiboga", label: "Kiboga" },
  { value: "kiryandongo", label: "Kiryandongo" },
  { value: "kumi", label: "Kumi" },
  { value: "luuka", label: "Luuka" },
  { value: "luwero", label: "Luwero" },
  { value: "mityana", label: "Mityana" },
  { value: "nakapiripirit", label: "Nakapiripirit" },
  { value: "nakaseke", label: "Nakaseke" },
  { value: "nakasongola", label: "Nakasongola" },
  { value: "nwoya", label: "Nwoya" },
  { value: "otuke", label: "Otuke" },
  { value: "pader", label: "Pader" },
  { value: "pallisa", label: "Pallisa" },
  { value: "rakai", label: "Rakai" },
  { value: "ruhengeri", label: "Ruhengeri" },
  { value: "ssembabule", label: "Ssembabule" },
  { value: "tororo", label: "Tororo" },
  { value: "wakiso", label: "Wakiso" },
  { value: "yumbe", label: "Yumbe" },
  { value: "zombo", label: "Zombo" }
]

const categoryOptions = [
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "home", label: "Home & Garden" },
  { value: "services", label: "Services" },
]

interface InlineFiltersProps {
  onFilterChange: (filters: any) => void
}

import { supabase } from '@/utils/supabase-client';

export default function InlineFilters({ onFilterChange }: InlineFiltersProps) {
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1000)
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handlePriceChange = async (min: number, max: number) => {
    try {
      setIsLoading(true)
      setMinPrice(min)
      setMaxPrice(max)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Update filters in Supabase
      const { error } = await supabase
        .from('user_filters')
        .upsert({
          user_id: user.id,
          min_price: min,
          max_price: max,
          location,
          category
        })

      if (error) throw error

      updateFilters({ minPrice: min, maxPrice: max })
    } catch (error) {
      console.error('Error updating filters:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFilters = async (newFilter: any) => {
    try {
      setIsLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Update filters in Supabase
      const { error } = await supabase
        .from('user_filters')
        .upsert({
          user_id: user.id,
          min_price: minPrice,
          max_price: maxPrice,
          location: newFilter.location || location,
          category: newFilter.category || category
        })

      if (error) throw error

      onFilterChange({
        minPrice,
        maxPrice,
        location: newFilter.location || location,
        category: newFilter.category || category,
      })
    } catch (error) {
      console.error('Error updating filters:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Price Range</label>
        <PriceRangeInput min={minPrice} max={maxPrice} onPriceChange={handlePriceChange} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Location</label>
        <Combobox
          options={locationOptions}
          value={location}
          onValueChange={(value) => {
            setLocation(value)
            updateFilters({ location: value })
          }}
          placeholder="Select location"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Combobox
          options={categoryOptions}
          value={category}
          onValueChange={(value) => {
            setCategory(value)
            updateFilters({ category: value })
          }}
          placeholder="Select category"
        />
      </div>
    </div>
  )
}

