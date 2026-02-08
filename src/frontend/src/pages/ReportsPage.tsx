import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { useProfitAndLoss } from '../hooks/useProfitAndLoss';
import { formatDateForInput } from '../lib/dateUtils';
import { toast } from 'sonner';

export function ReportsPage() {
  const [startDate, setStartDate] = useState(formatDateForInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [endDate, setEndDate] = useState(formatDateForInput(new Date()));
  const { report, categoryBreakdown, isLoading, fetchReport } = useProfitAndLoss();

  const handleFetchReport = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    fetchReport(startDate, endDate);
  };

  const netProfit = report ? report.totalSales - report.totalExpenses : 0;
  const isProfitable = netProfit >= 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">View profit & loss reports</p>
      </div>

      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Date Range</CardTitle>
          <CardDescription>Choose the period for your profit & loss report</CardDescription>
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
              <Button onClick={handleFetchReport} className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <TrendingUp className="h-4 w-4 text-chart-1" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-1">₹{report.totalSales.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-chart-2" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-2">₹{report.totalExpenses.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className={isProfitable ? 'border-green-500/50' : 'border-red-500/50'}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit/Loss</CardTitle>
                {isProfitable ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{netProfit.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isProfitable ? 'Profit' : 'Loss'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fixed vs Variable Expenses */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fixed Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{report.fixedExpenses.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.totalExpenses > 0
                    ? `${((report.fixedExpenses / report.totalExpenses) * 100).toFixed(1)}% of total`
                    : '0% of total'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Variable Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{report.variableExpenses.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.totalExpenses > 0
                    ? `${((report.variableExpenses / report.totalExpenses) * 100).toFixed(1)}% of total`
                    : '0% of total'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown by Category</CardTitle>
              <CardDescription>Detailed breakdown of expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryBreakdown.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No expenses in this period</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">% of Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryBreakdown.map(({ category, total }) => {
                        const percentage = report.totalExpenses > 0 ? (total / report.totalExpenses) * 100 : 0;
                        return (
                          <TableRow key={category}>
                            <TableCell className="font-medium">{category}</TableCell>
                            <TableCell className="text-right">₹{total.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{percentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="font-bold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">₹{report.totalExpenses.toFixed(2)}</TableCell>
                        <TableCell className="text-right">100%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!report && !isLoading && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Select a date range and click "Generate Report" to view your profit & loss statement
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
