"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { supabase } from '@/utils/supabase-client';
import { useEffect } from 'react';

export default function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Search products and services
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('category', category || undefined)
        .eq('location', location || undefined)
        .limit(20)

      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('category', category || undefined)
        .eq('location', location || undefined)
        .limit(20)

      if (productsError || servicesError) {
        throw productsError || servicesError
      }

      // Combine and sort results
      const combinedResults = [...(products || []), ...(services || [])]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setSearchResults(combinedResults)
    } catch (error) {
      console.error('Error searching:', error)
      setError('Failed to search. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Real-time search updates
  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      if (searchTerm.length > 2) {
        handleSearch()
      }
    }, 500)

    return () => clearTimeout(searchDebounce)
  }, [searchTerm])

  // Save search preferences
  useEffect(() => {
    const saveSearchPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase
          .from('user_search_preferences')
          .upsert({
            user_id: user.id,
            preferred_category: category,
            preferred_location: location
          })
      } catch (error) {
        console.error('Error saving search preferences:', error)
      }
    }

    saveSearchPreferences()
  }, [category, location])

  return (
    <div className="space-y-4 mb-8">
      <div className="flex gap-4">
        <Input
          type="text"
          placeholder="Search products or services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={handleSearch} className="bg-amber-600 hover:bg-amber-700">
          Search
        </Button>
      </div>
      <div className="flex gap-4">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="clothing">Clothing</SelectItem>
            <SelectItem value="services">Services</SelectItem>
          </SelectContent>
        </Select>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new-york">New York</SelectItem>
            <SelectItem value="los-angeles">Los Angeles</SelectItem>
            <SelectItem value="chicago">Chicago</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

