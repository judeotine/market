'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
export const HomeHero = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <div className="absolute inset-0">
        <Image
          src="/grocery-1232944_1280.jpg"
          alt="Hero background"
          fill
          className="object-cover opacity-20"
        />
      </div>
      <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-white text-center">
        <motion.h1
          className="text-4xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          Discover Amazing Products & Services Near You
        </motion.h1>
        <form onSubmit={handleSearch} className="w-full max-w-2xl">
          <motion.div
            className="w-full relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            <Input
              type="text"
              placeholder="Search for products, services, or shops..."
              className="w-full h-12 pl-12 pr-24 rounded-full text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search for products, services, or shops"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full h-8 px-6"
              disabled={!searchQuery.trim()}
            >
              Search
            </Button>
          </motion.div>
        </form>
      </div>
    </>
  );
};
