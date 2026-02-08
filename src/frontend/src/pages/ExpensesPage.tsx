import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { formatDateForInput, parseDateFromInput, formatDateForDisplay, filterByDateRange } from '../lib/dateUtils';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from 'sonner';
import { ExpenseCategory, PaymentMethod, ExpenseType } from '../backend';

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

const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.cash]: 'Cash',
  [PaymentMethod.bank]: 'Bank',
  [PaymentMethod.creditCard]: 'Credit Card',
  [PaymentMethod.other]: 'Other',
};

const expenseTypeLabels: Record<ExpenseType, string> = {
  [ExpenseType.fixed]: 'Fixed',
  [ExpenseType.variable]: 'Variable',
};

export function ExpensesPage() {
  const { expenses, isLoading, createExpense, updateExpense, deleteExpense } = useExpenses();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expenseTypeFilter, setExpenseTypeFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [formData, setFormData] = useState({
    date: formatDateForInput(new Date()),
    category: ExpenseCategory.foodCost,
    expenseType: ExpenseType.variable,
    amount: '',
    paymentMethod: PaymentMethod.cash,
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  let filteredExpenses = filterByDateRange(expenses || [], startDate, endDate);
  if (categoryFilter !== 'all') {
    filteredExpenses = filteredExpenses.filter((exp) => exp.category === categoryFilter);
  }
  if (expenseTypeFilter !== 'all') {
    filteredExpenses = filteredExpenses.filter((exp) => exp.expenseType === expenseTypeFilter);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const dateNum = parseDateFromInput(formData.date);
      const amount = parseFloat(formData.amount);

      if (editingExpense) {
        await updateExpense.mutateAsync({
          id: editingExpense.id,
          date: dateNum,
          category: formData.category,
          expenseType: formData.expenseType,
          amount,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes || null,
        });
        toast.success('Expense updated successfully');
        setEditingExpense(null);
      } else {
        await createExpense.mutateAsync({
          date: dateNum,
          category: formData.category,
          expenseType: formData.expenseType,
          amount,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes || null,
        });
        toast.success('Expense added successfully');
        setIsAddDialogOpen(false);
      }
      setFormData({
        date: formatDateForInput(new Date()),
        category: ExpenseCategory.foodCost,
        expenseType: ExpenseType.variable,
        amount: '',
        paymentMethod: PaymentMethod.cash,
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      date: formatDateForInput(new Date(Number(expense.date.toString().slice(0, 4)), Number(expense.date.toString().slice(4, 6)) - 1, Number(expense.date.toString().slice(6, 8)))),
      category: expense.category,
      expenseType: expense.expenseType,
      amount: expense.amount.toString(),
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || '',
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteExpense.mutateAsync(deleteId);
      toast.success('Expense deleted successfully');
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">Track and manage restaurant expenses</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Expenses</CardTitle>
          <CardDescription>Filter expenses by date range, category, and type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseType">Expense Type</Label>
              <Select value={expenseTypeFilter} onValueChange={setExpenseTypeFilter}>
                <SelectTrigger id="expenseType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value={ExpenseType.fixed}>Fixed</SelectItem>
                  <SelectItem value={ExpenseType.variable}>Variable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setCategoryFilter('all');
                  setExpenseTypeFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">₹{totalExpenses.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-1">{filteredExpenses.length} entries</p>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No expense entries found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id.toString()}>
                      <TableCell>{formatDateForDisplay(expense.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{categoryLabels[expense.category]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={expense.expenseType === ExpenseType.fixed ? 'secondary' : 'default'}>
                          {expenseTypeLabels[expense.expenseType]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">₹{expense.amount.toFixed(2)}</TableCell>
                      <TableCell>{paymentMethodLabels[expense.paymentMethod]}</TableCell>
                      <TableCell className="max-w-xs truncate">{expense.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(expense.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddDialogOpen || !!editingExpense}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingExpense(null);
            setFormData({
              date: formatDateForInput(new Date()),
              category: ExpenseCategory.foodCost,
              expenseType: ExpenseType.variable,
              amount: '',
              paymentMethod: PaymentMethod.cash,
              notes: '',
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
            <DialogDescription>
              {editingExpense ? 'Update the expense details' : 'Enter the details for the new expense'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as ExpenseCategory })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseType">Expense Type *</Label>
                <Select
                  value={formData.expenseType}
                  onValueChange={(value) => setFormData({ ...formData, expenseType: value as ExpenseType })}
                >
                  <SelectTrigger id="expenseType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ExpenseType.fixed}>Fixed</SelectItem>
                    <SelectItem value={ExpenseType.variable}>Variable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(paymentMethodLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingExpense(null);
                  setFormData({
                    date: formatDateForInput(new Date()),
                    category: ExpenseCategory.foodCost,
                    expenseType: ExpenseType.variable,
                    amount: '',
                    paymentMethod: PaymentMethod.cash,
                    notes: '',
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingExpense ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
      />
    </div>
  );
}
