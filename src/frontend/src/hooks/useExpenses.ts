import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ExpenseEntry, ExpenseCategory, PaymentMethod, ExpenseType } from '../backend';

export function useExpenses() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const expensesQuery = useQuery<ExpenseEntry[]>({
    queryKey: ['expenses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllExpenseEntries();
    },
    enabled: !!actor && !isFetching,
  });

  const createExpense = useMutation({
    mutationFn: async (data: {
      date: bigint;
      category: ExpenseCategory;
      expenseType: ExpenseType;
      amount: number;
      paymentMethod: PaymentMethod;
      notes: string | null;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createExpenseEntry(
        data.date,
        data.category,
        data.expenseType,
        data.amount,
        data.paymentMethod,
        data.notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const updateExpense = useMutation({
    mutationFn: async (data: {
      id: bigint;
      date: bigint;
      category: ExpenseCategory;
      expenseType: ExpenseType;
      amount: number;
      paymentMethod: PaymentMethod;
      notes: string | null;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateExpenseEntry(
        data.id,
        data.date,
        data.category,
        data.expenseType,
        data.amount,
        data.paymentMethod,
        data.notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteExpenseEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  return {
    expenses: expensesQuery.data || [],
    isLoading: expensesQuery.isLoading,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}
