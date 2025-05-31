'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface LoadingSkeletonProps {
  type?: 'shop' | 'ad';
  count?: number;
}

export function LoadingSkeleton({ type = 'shop', count = 3 }: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  const shimmer = {
    initial: { x: '-100%' },
    animate: { x: '100%' },
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    },
  };

  if (type === 'shop') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skeletons.map((index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="relative">
                <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  <motion.div
                    className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    {...shimmer}
                  />
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 overflow-hidden">
                    <motion.div
                      className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      {...shimmer}
                    />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 overflow-hidden">
                    <motion.div
                      className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      {...shimmer}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full overflow-hidden">
                  <motion.div
                    className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    {...shimmer}
                  />
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4 overflow-hidden">
                  <motion.div
                    className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    {...shimmer}
                  />
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2 overflow-hidden">
                  <motion.div
                    className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    {...shimmer}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Ad skeleton
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletons.map((index) => (
          <Card key={index} className="overflow-hidden">
            <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
              <motion.div
                className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                {...shimmer}
              />
            </div>
            <CardContent className="space-y-3 pt-4">
              <div className="h-5 bg-gray-200 rounded w-3/4 overflow-hidden">
                <motion.div
                  className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  {...shimmer}
                />
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/2 overflow-hidden">
                <motion.div
                  className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  {...shimmer}
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/4 overflow-hidden">
                  <motion.div
                    className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    {...shimmer}
                  />
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/4 overflow-hidden">
                  <motion.div
                    className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    {...shimmer}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
