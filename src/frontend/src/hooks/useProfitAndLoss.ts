import { useState } from 'react';
import { useActor } from './useActor';
import { useSales } from './useSales';
import { useExpenses } from './useExpenses';
import { parseDateFromInput } from '../lib/dateUtils';
import { ExpenseCategory, ExpenseType } from '../backend';

const categoryLabels: Record<ExpenseCategory, string> = {
  [ExpenseCategory.foodCost]: 'Food Cost',
  [ExpenseCategory.supplies]: 'Supplies',
  [ExpenseCategory.maintenance]: 'Maintenance',
  [ExpenseCategory.utilities]: 'Utilities',
  [ExpenseCategory.rent]: 'Rent',
  [ExpenseCategory.payroll]: 'Payroll',
  [ExpenseCategory.marketing]: 'Marketing',
  [ExpenseCategory.other]: 'Other',
};

export function useProfitAndLoss() {
  const { actor } = useActor();
  const { sales } = useSales();
  const { expenses } = useExpenses();
  const [report, setReport] = useState<{
    totalSales: number;
    totalExpenses: number;
    fixedExpenses: number;
    variableExpenses: number;
    netProfitLoss: number;
  } | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ category: string; total: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async (startDate: string, endDate: string) => {
    if (!actor) return;

    setIsLoading(true);
    try {
      const startDateNum = parseDateFromInput(startDate);
      const endDateNum = parseDateFromInput(endDate);

      // Filter sales and expenses by date range
      const filteredSales = sales.filter((sale) => sale.date >= startDateNum && sale.date <= endDateNum);
      const filteredExpenses = expenses.filter((expense) => expense.date >= startDateNum && expense.date <= endDateNum);

      // Calculate totals
      const totalSales = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
      const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Calculate fixed and variable expenses
      const fixedExpenses = filteredExpenses
        .filter((expense) => expense.expenseType === ExpenseType.fixed)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      const variableExpenses = filteredExpenses
        .filter((expense) => expense.expenseType === ExpenseType.variable)
        .reduce((sum, expense) => sum + expense.amount, 0);

      const netProfitLoss = totalSales - totalExpenses;

      // Calculate category breakdown
      const categoryMap = new Map<ExpenseCategory, number>();
      filteredExpenses.forEach((expense) => {
        const current = categoryMap.get(expense.category) || 0;
        categoryMap.set(expense.category, current + expense.amount);
      });

      const breakdown = Array.from(categoryMap.entries())
        .map(([category, total]) => ({
          category: categoryLabels[category],
          total,
        }))
        .sort((a, b) => b.total - a.total);

      setReport({
        totalSales,
        totalExpenses,
        fixedExpenses,
        variableExpenses,
        netProfitLoss,
      });
      setCategoryBreakdown(breakdown);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    report,
    categoryBreakdown,
    isLoading,
    fetchReport,
  };
}
