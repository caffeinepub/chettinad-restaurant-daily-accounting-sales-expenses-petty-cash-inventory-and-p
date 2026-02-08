import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PettyCashTransaction, Variant_out_cashIn } from '../backend';
import { useMemo } from 'react';

export function usePettyCash() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery<PettyCashTransaction[]>({
    queryKey: ['pettyCash'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPettyCashTransactions();
    },
    enabled: !!actor && !isFetching,
  });

  const balance = useMemo(() => {
    if (!transactionsQuery.data) return 0;
    return transactionsQuery.data.reduce((acc, txn) => {
      if (txn.transactionType === 'cashIn') {
        return acc + txn.amount;
      } else {
        return acc - txn.amount;
      }
    }, 0);
  }, [transactionsQuery.data]);

  const addTransaction = useMutation({
    mutationFn: async (data: { transactionType: Variant_out_cashIn; amount: number; reason: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addPettyCashTransaction(data.transactionType, data.amount, data.reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pettyCash'] });
    },
  });

  return {
    transactions: transactionsQuery.data || [],
    balance,
    isLoading: transactionsQuery.isLoading,
    addTransaction,
  };
}
