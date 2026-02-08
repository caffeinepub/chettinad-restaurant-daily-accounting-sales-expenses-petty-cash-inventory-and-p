import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { InventoryItem, StockMovement, Variant_out_adjustment_stockIn } from '../backend';
import { useMemo } from 'react';

export function useInventory() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const itemsQuery = useQuery<InventoryItem[]>({
    queryKey: ['inventoryItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInventoryItems();
    },
    enabled: !!actor && !isFetching,
  });

  const movementsQuery = useQuery<StockMovement[]>({
    queryKey: ['stockMovements'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStockMovements();
    },
    enabled: !!actor && !isFetching,
  });

  const stockLevels = useMemo(() => {
    if (!movementsQuery.data) return {};
    const levels: Record<string, number> = {};
    movementsQuery.data.forEach((movement) => {
      const itemId = movement.itemId.toString();
      if (!levels[itemId]) levels[itemId] = 0;
      if (movement.movementType === 'stockIn') {
        levels[itemId] += movement.quantity;
      } else if (movement.movementType === 'out') {
        levels[itemId] -= movement.quantity;
      } else {
        levels[itemId] = movement.quantity;
      }
    });
    return levels;
  }, [movementsQuery.data]);

  const addItem = useMutation({
    mutationFn: async (data: { name: string; unit: string; lowStockThreshold: number | null }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addInventoryItem(data.name, data.unit, data.lowStockThreshold);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
    },
  });

  const addMovement = useMutation({
    mutationFn: async (data: {
      itemId: bigint;
      movementType: Variant_out_adjustment_stockIn;
      quantity: number;
      notes: string | null;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addStockMovement(data.itemId, data.movementType, data.quantity, data.notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
    },
  });

  return {
    items: itemsQuery.data || [],
    movements: movementsQuery.data || [],
    stockLevels,
    isLoading: itemsQuery.isLoading || movementsQuery.isLoading,
    addItem,
    addMovement,
  };
}
