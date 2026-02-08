import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { useSales } from '../hooks/useSales';
import { formatDateForInput, parseDateFromInput, formatDateForDisplay, filterByDateRange } from '../lib/dateUtils';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from 'sonner';

export function SalesPage() {
  const { sales, isLoading, createSale, updateSale, deleteSale } = useSales();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<{ id: bigint; date: string; amount: string; notes: string } | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [formData, setFormData] = useState({ date: formatDateForInput(new Date()), amount: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredSales = filterByDateRange(sales || [], startDate, endDate);

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

      if (editingSale) {
        await updateSale.mutateAsync({
          id: editingSale.id,
          date: dateNum,
          amount,
          notes: formData.notes || null,
        });
        toast.success('Sales entry updated successfully');
        setEditingSale(null);
      } else {
        await createSale.mutateAsync({
          date: dateNum,
          amount,
          notes: formData.notes || null,
        });
        toast.success('Sales entry added successfully');
        setIsAddDialogOpen(false);
      }
      setFormData({ date: formatDateForInput(new Date()), amount: '', notes: '' });
    } catch (error) {
      toast.error('Failed to save sales entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (sale: any) => {
    setEditingSale({
      id: sale.id,
      date: formatDateForInput(new Date(Number(sale.date.toString().slice(0, 4)), Number(sale.date.toString().slice(4, 6)) - 1, Number(sale.date.toString().slice(6, 8)))),
      amount: sale.amount.toString(),
      notes: sale.notes || '',
    });
    setFormData({
      date: formatDateForInput(new Date(Number(sale.date.toString().slice(0, 4)), Number(sale.date.toString().slice(4, 6)) - 1, Number(sale.date.toString().slice(6, 8)))),
      amount: sale.amount.toString(),
      notes: sale.notes || '',
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSale.mutateAsync(deleteId);
      toast.success('Sales entry deleted successfully');
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete sales entry');
    }
  };

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales</h2>
          <p className="text-muted-foreground">Record and track daily sales</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Sale
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Sales</CardTitle>
          <CardDescription>Filter sales entries by date range</CardDescription>
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
              <Button variant="outline" onClick={() => { setStartDate(''); setEndDate(''); }} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">₹{totalSales.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-1">{filteredSales.length} entries</p>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSales.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No sales entries found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id.toString()}>
                      <TableCell>{formatDateForDisplay(sale.date)}</TableCell>
                      <TableCell className="font-medium">₹{sale.amount.toFixed(2)}</TableCell>
                      <TableCell className="max-w-xs truncate">{sale.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(sale)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(sale.id)}>
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
      <Dialog open={isAddDialogOpen || !!editingSale} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingSale(null);
          setFormData({ date: formatDateForInput(new Date()), amount: '', notes: '' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSale ? 'Edit Sale' : 'Add Sale'}</DialogTitle>
            <DialogDescription>
              {editingSale ? 'Update the sales entry details' : 'Enter the details for the new sales entry'}
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
              <Button type="button" variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                setEditingSale(null);
                setFormData({ date: formatDateForInput(new Date()), amount: '', notes: '' });
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingSale ? 'Update' : 'Add'}
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
        title="Delete Sales Entry"
        description="Are you sure you want to delete this sales entry? This action cannot be undone."
      />
    </div>
  );
}
