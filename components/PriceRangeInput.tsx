"use client"

import type React from "react"

import { Input } from "@/components/ui/input"

interface PriceRangeInputProps {
  min: number
  max: number
  onPriceChange: (min: number, max: number) => void
}

export default function PriceRangeInput({ min, max, onPriceChange }: PriceRangeInputProps) {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    onPriceChange(value, max)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    onPriceChange(min, value)
  }

  return (
    <div className="flex items-center gap-2">
      <Input type="number" placeholder="Min" value={min || ""} onChange={handleMinChange} className="w-24" />
      <span className="text-gray-500">to</span>
      <Input type="number" placeholder="Max" value={max || ""} onChange={handleMaxChange} className="w-24" />
    </div>
  )
}

