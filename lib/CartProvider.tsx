"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import type { Product, Service } from "@/lib/types"

interface CartItem {
  id: string
  type: "product" | "service"
  quantity: number
  item: Product | Service
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Product | Service, type: "product" | "service") => void
  removeFromCart: (id: string) => void
  cartCount: number
  cartTotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = (item: Product | Service, type: "product" | "service") => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (i) => i.id === (type === "product" ? (item as Product).product_id : (item as Service).service_id),
      )

      if (existingItem) {
        return currentItems.map((i) => (i.id === existingItem.id ? { ...i, quantity: i.quantity + 1 } : i))
      }

      return [
        ...currentItems,
        {
          id: type === "product" ? (item as Product).product_id : (item as Service).service_id,
          type,
          quantity: 1,
          item,
        },
      ]
    })
  }

  const removeFromCart = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id))
  }

  const cartCount = items.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = items.reduce((total, item) => total + item.item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

