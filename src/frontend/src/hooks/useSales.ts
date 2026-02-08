import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { SalesEntry } from '../backend';

export function useSales() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const salesQuery = useQuery<SalesEntry[]>({
    queryKey: ['sales'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSalesEntries();
    },
    enabled: !!actor && !isFetching,
  });

  const createSale = useMutation({
    mutationFn: async (data: { date: bigint; amount: number; notes: string | null }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createSalesEntry(data.date, data.amount, data.notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });

  const updateSale = useMutation({
    mutationFn: async (data: { id: bigint; date: bigint; amount: number; notes: string | null }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateSalesEntry(data.id, data.date, data.amount, data.notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });

  const deleteSale = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteSalesEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });

  return {
    sales: salesQuery.data || [],
    isLoading: salesQuery.isLoading,
    createSale,
    updateSale,
    deleteSale,
  };
}
