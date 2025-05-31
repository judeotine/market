'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showErrorToast, showSuccessToast } from '@/lib/utils';

interface ReviewDialogProps {
  orderId: string;
  itemId: string;
  itemType: 'product' | 'service';
  shopId: string;
  buyerId: string;
  itemName: string;
  onReviewSubmitted?: () => void;
}

export function ReviewDialog({
  orderId,
  itemId,
  itemType,
  shopId,
  buyerId,
  itemName,
  onReviewSubmitted
}: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      showErrorToast('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      showErrorToast('Please write a review comment');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([
          {
            order_id: orderId,
            [itemType === 'product' ? 'product_id' : 'service_id']: itemId,
            shop_id: shopId,
            buyer_id: buyerId,
            rating,
            comment,
            type: itemType,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      showSuccessToast('Review submitted successfully');
      setIsOpen(false);
      setRating(0);
      setComment('');
      onReviewSubmitted?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      showErrorToast('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Leave a Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Review {itemName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`p-1 ${
                  star <= rating
                    ? 'text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
                onClick={() => setRating(star)}
              >
                <StarIcon className="w-8 h-8" />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Write your review here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
