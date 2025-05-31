"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = () => {
    // Implement search logic here
    console.log("Searching for:", searchTerm)
  }

  return (
    <div className="flex gap-4 mb-8">
      <Input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-grow"
      />
      <Button onClick={handleSearch} className="bg-amber-600 hover:bg-amber-700">
        Search
      </Button>
    </div>
  )
}

