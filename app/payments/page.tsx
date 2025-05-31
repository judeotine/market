'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabaseDb } from '@/utils/supabase-utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Payment } from '@/types/types';
import { User } from '@/types/types';
import { useUser } from '@/state/user';

type PaymentWithUser = Payment & {
  user: User;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user] = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const { data: paymentsData, error: paymentsError } = await supabaseDb
        .from('payments')
        .select('*, users(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        setError('Failed to load payments');
        toast.error('Failed to load payments');
        return;
      }

      setPayments(paymentsData || []);

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-600 mb-6">Your Payments</h1>
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.payment_id}>
                  <TableCell>{payment.payment_id}</TableCell>
                  <TableCell>{`${payment.amount} ${payment.currency}`}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === 'success' ? 'default' : 'secondary'
                      }>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.mode}</TableCell>
                  <TableCell>{payment.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
