import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, AlertTriangle, Package } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { toast } from 'sonner';
import { Variant_out_adjustment_stockIn } from '../backend';

export function InventoryPage() {
  const { items, movements, stockLevels, isLoading, addItem, addMovement } = useInventory();
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isAddMovementDialogOpen, setIsAddMovementDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<bigint | null>(null);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    unit: '',
    lowStockThreshold: '',
  });
  const [movementFormData, setMovementFormData] = useState({
    itemId: '',
    movementType: Variant_out_adjustment_stockIn.stockIn,
    quantity: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.name || !itemFormData.unit) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addItem.mutateAsync({
        name: itemFormData.name,
        unit: itemFormData.unit,
        lowStockThreshold: itemFormData.lowStockThreshold ? parseFloat(itemFormData.lowStockThreshold) : null,
      });
      toast.success('Item added successfully');
      setIsAddItemDialogOpen(false);
      setItemFormData({ name: '', unit: '', lowStockThreshold: '' });
    } catch (error) {
      toast.error('Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementFormData.itemId || !movementFormData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addMovement.mutateAsync({
        itemId: BigInt(movementFormData.itemId),
        movementType: movementFormData.movementType,
        quantity: parseFloat(movementFormData.quantity),
        notes: movementFormData.notes || null,
      });
      toast.success('Stock movement recorded successfully');
      setIsAddMovementDialogOpen(false);
      setMovementFormData({
        itemId: '',
        movementType: Variant_out_adjustment_stockIn.stockIn,
        quantity: '',
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to record stock movement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openMovementDialog = (itemId: bigint) => {
    setMovementFormData({
      ...movementFormData,
      itemId: itemId.toString(),
    });
    setIsAddMovementDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground">Manage stock and inventory items</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddMovementDialogOpen(true)}>
            <Package className="mr-2 h-4 w-4" />
            Record Movement
          </Button>
          <Button onClick={() => setIsAddItemDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-6">
          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>All items with current stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : items.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No items found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Low Stock Threshold</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const stock = stockLevels[item.id.toString()] || 0;
                        const isLowStock = item.lowStockThreshold && stock < item.lowStockThreshold;
                        return (
                          <TableRow key={item.id.toString()}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className={isLowStock ? 'text-destructive font-bold' : ''}>
                              {stock.toFixed(2)}
                            </TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell>
                              {item.lowStockThreshold ? item.lowStockThreshold.toFixed(2) : '-'}
                            </TableCell>
                            <TableCell>
                              {isLowStock ? (
                                <Badge variant="destructive" className="gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Low Stock
                                </Badge>
                              ) : (
                                <Badge variant="outline">Normal</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openMovementDialog(item.id)}
                              >
                                Record Movement
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          {/* Movements Table */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Movements</CardTitle>
              <CardDescription>History of all stock movements</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : movements.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No movements found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map((movement) => {
                        const item = items.find((i) => i.id === movement.itemId);
                        const date = new Date(Number(movement.dateTime) / 1000000);
                        const typeLabel =
                          movement.movementType === Variant_out_adjustment_stockIn.stockIn
                            ? 'Stock In'
                            : movement.movementType === Variant_out_adjustment_stockIn.out
                            ? 'Stock Out'
                            : 'Adjustment';
                        return (
                          <TableRow key={movement.id.toString()}>
                            <TableCell>
                              {date.toLocaleDateString()} {date.toLocaleTimeString()}
                            </TableCell>
                            <TableCell className="font-medium">{item?.name || 'Unknown'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{typeLabel}</Badge>
                            </TableCell>
                            <TableCell>
                              {movement.quantity.toFixed(2)} {item?.unit}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{movement.notes || '-'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog
        open={isAddItemDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddItemDialogOpen(false);
            setItemFormData({ name: '', unit: '', lowStockThreshold: '' });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Add a new item to your inventory</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddItem}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={itemFormData.name}
                  onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  placeholder="e.g., kg, liters, pieces"
                  value={itemFormData.unit}
                  onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Low Stock Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  step="0.01"
                  value={itemFormData.lowStockThreshold}
                  onChange={(e) => setItemFormData({ ...itemFormData, lowStockThreshold: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddItemDialogOpen(false);
                  setItemFormData({ name: '', unit: '', lowStockThreshold: '' });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Movement Dialog */}
      <Dialog
        open={isAddMovementDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddMovementDialogOpen(false);
            setMovementFormData({
              itemId: '',
              movementType: Variant_out_adjustment_stockIn.stockIn,
              quantity: '',
              notes: '',
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Stock Movement</DialogTitle>
            <DialogDescription>Record a stock in, out, or adjustment</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMovement}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="itemId">Item *</Label>
                <Select
                  value={movementFormData.itemId}
                  onValueChange={(value) => setMovementFormData({ ...movementFormData, itemId: value })}
                >
                  <SelectTrigger id="itemId">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id.toString()} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="movementType">Movement Type *</Label>
                <Select
                  value={movementFormData.movementType}
                  onValueChange={(value) =>
                    setMovementFormData({ ...movementFormData, movementType: value as Variant_out_adjustment_stockIn })
                  }
                >
                  <SelectTrigger id="movementType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Variant_out_adjustment_stockIn.stockIn}>Stock In</SelectItem>
                    <SelectItem value={Variant_out_adjustment_stockIn.out}>Stock Out</SelectItem>
                    <SelectItem value={Variant_out_adjustment_stockIn.adjustment}>Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={movementFormData.quantity}
                  onChange={(e) => setMovementFormData({ ...movementFormData, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={movementFormData.notes}
                  onChange={(e) => setMovementFormData({ ...movementFormData, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddMovementDialogOpen(false);
                  setMovementFormData({
                    itemId: '',
                    movementType: Variant_out_adjustment_stockIn.stockIn,
                    quantity: '',
                    notes: '',
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Movement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
