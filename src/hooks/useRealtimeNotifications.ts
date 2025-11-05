import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Transaction {
  id: number;
  user_id: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  token: string;
  amount: string;
  status: string;
  tx_hash: string | null;
  created_at: string;
}

interface Withdrawal {
  id: number;
  user_id: string;
  token: string;
  amount: string;
  to_address: string;
  status: string;
  tx_hash: string | null;
  requested_at: string;
  processed_at: string | null;
}

export function useRealtimeNotifications(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;

    const channels: RealtimeChannel[] = [];

    const transactionsChannel = supabase
      .channel('user_transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const transaction = payload.new as Transaction;
          
          if (transaction.type === 'deposit' && transaction.status === 'completed') {
            toast.success('Deposit Received!', {
              description: `${transaction.amount} ${transaction.token} has been credited to your account`,
              duration: 5000,
            });
            
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
          }
          
          if (transaction.type === 'withdraw' && transaction.status === 'completed') {
            toast.success('Withdrawal Completed!', {
              description: `${transaction.amount} ${transaction.token} has been sent`,
              duration: 5000,
            });
            
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
          }
        }
      )
      .subscribe();

    channels.push(transactionsChannel);

    const withdrawalsChannel = supabase
      .channel('user_withdrawals')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'withdrawals',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const withdrawal = payload.new as Withdrawal;
          
          if (withdrawal.status === 'completed') {
            toast.success('Withdrawal Approved!', {
              description: `Your ${withdrawal.token} withdrawal has been processed`,
              duration: 5000,
            });
            
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
          }
          
          if (withdrawal.status === 'rejected') {
            toast.error('Withdrawal Rejected', {
              description: `Your ${withdrawal.token} withdrawal request was rejected`,
              duration: 5000,
            });
            
            if ('vibrate' in navigator) {
              navigator.vibrate(200);
            }
          }
        }
      )
      .subscribe();

    channels.push(withdrawalsChannel);

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [userId]);
}
