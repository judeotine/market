import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Product, Review } from '@/types/types';
import { StarIcon } from 'lucide-react';

interface Props {
  product: Product;
  reviews: Review[];
}

export const ProductDetailsTab = ({ product, reviews }: Props) => {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
        <TabsTrigger
          value="description"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-600">
          Description
        </TabsTrigger>
        <TabsTrigger
          value="specifications"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-600">
          Specifications
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-600">
          Reviews
        </TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="mt-6">
        <div className="prose max-w-none">
          <p>{product.description}</p>
          <ul className="mt-4">
            <li>Premium quality materials</li>
            <li>Designed for durability</li>
            <li>Perfect for everyday use</li>
          </ul>
        </div>
      </TabsContent>
      <TabsContent value="specifications" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Product Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-600">Brand</div>
              <div>{product.other.brand?.join(', ')}</div>
              <div className="text-gray-600">Model</div>
              <div>{product.other.model}</div>
              <div className="text-gray-600">Condition</div>
              <div>{product.other.condition}</div>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="reviews" className="mt-6">
        <div className="space-y-6">
          {reviews?.map((review: any) => (
            <div key={review.review_id} className="border-b pb-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div>
                  <div className="font-medium">Anonymous User</div>
                  <div className="flex items-center text-sm text-gray-600">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'text-yellow-400'
                            : 'text-gray-200'
                        }`}
                        fill="currentColor"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};
