import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { usePettyCash } from '../hooks/usePettyCash';
import { formatDateForInput } from '../lib/dateUtils';
import { toast } from 'sonner';
import { Variant_out_cashIn } from '../backend';

export function PettyCashPage() {
  const { transactions, balance, isLoading, addTransaction } = usePettyCash();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: Variant_out_cashIn.cashIn,
    amount: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTransactions = (transactions || []).filter((txn) => {
    if (!startDate && !endDate) return true;
    const txnDate = new Date(Number(txn.dateTime) / 1000000);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start && txnDate < start) return false;
    if (end && txnDate > end) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const amount = parseFloat(formData.amount);
      await addTransaction.mutateAsync({
        transactionType: formData.type,
        amount,
        reason: formData.reason,
      });
      toast.success('Transaction added successfully');
      setIsAddDialogOpen(false);
      setFormData({
        type: Variant_out_cashIn.cashIn,
        amount: '',
        reason: '',
      });
    } catch (error) {
      toast.error('Failed to add transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Petty Cash</h2>
          <p className="text-muted-foreground">Manage petty cash transactions</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Balance Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
          <CardDescription>Total petty cash available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary">₹{balance.toFixed(2)}</p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Transactions</CardTitle>
          <CardDescription>Filter transactions by date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
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
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No transactions found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((txn) => {
                    const date = new Date(Number(txn.dateTime) / 1000000);
                    const isIn = txn.transactionType === Variant_out_cashIn.cashIn;
                    return (
                      <TableRow key={txn.id.toString()}>
                        <TableCell>
                          {date.toLocaleDateString()} {date.toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={isIn ? 'default' : 'secondary'} className="gap-1">
                            {isIn ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {isIn ? 'Cash In' : 'Cash Out'}
                          </Badge>
                        </TableCell>
                        <TableCell className={`font-medium ${isIn ? 'text-green-600' : 'text-red-600'}`}>
                          {isIn ? '+' : '-'}₹{txn.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{txn.reason}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setFormData({
              type: Variant_out_cashIn.cashIn,
              amount: '',
              reason: '',
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>Record a new petty cash transaction</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as Variant_out_cashIn })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Variant_out_cashIn.cashIn}>Cash In</SelectItem>
                    <SelectItem value={Variant_out_cashIn.out}>Cash Out</SelectItem>
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
                <Label htmlFor="reason">Reason *</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setFormData({
                    type: Variant_out_cashIn.cashIn,
                    amount: '',
                    reason: '',
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Transaction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
