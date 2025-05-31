"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Cable, Shirt, Cherry, Volleyball, Smile, Blocks, Car, BookText } from "lucide-react";
import Link from "next/link";

interface CategoryScrollProps {
  categories: string[];
}

// Defined category icons 
const categoryIcons: { [key: string]: JSX.Element } = {
  Electronics: <Cable size={40} className="text-gray-800 hover:text-amber-500" />,
  Fashion: <Shirt size={40} className="text-gray-800 hover:text-amber-500" />,
  Home: <Cherry size={40} className="text-gray-800 hover:text-amber-500" />,
  Sports: <Volleyball size={40} className="text-gray-800 hover:text-amber-500" />,
  Beauty: <Smile size={40} className="text-gray-800 hover:text-amber-500" />,
  Toys: <Blocks size={40} className="text-gray-800 hover:text-amber-500" />,
  Automotive: <Car size={40} className="text-gray-800 hover:text-amber-500" />,
  Books: <BookText size={40} className="text-gray-800 hover:text-amber-500" />,
};

export default function CategoryScroll({ categories }: CategoryScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative group">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((category) => (
          <Link
            href={`/category/${category.toLowerCase().replace(/ & /g, "-")}`}
            key={category}
            className="flex-shrink-0 group/item"
          >
            <div className="w-24 text-center">
              <div className="w-24 h-24 flex items-center justify-center rounded-xl overflow-hidden mb-2 bg-white border hover:border-amber-600 transition-colors">
                {categoryIcons[category] || <div className="text-gray-500">?</div>}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {category}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        disabled={scrollRef.current?.scrollLeft === 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
