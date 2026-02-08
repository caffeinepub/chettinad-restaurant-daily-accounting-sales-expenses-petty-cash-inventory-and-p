import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, ShoppingCart, Wallet, Package, TrendingUp, Receipt } from 'lucide-react';

type Page = 'dashboard' | 'sales' | 'expenses' | 'petty-cash' | 'inventory' | 'reports';

interface DashboardPageProps {
  onNavigate: (page: Page) => void;
}

const modules = [
  {
    id: 'sales' as Page,
    title: 'Sales',
    description: 'Record and track daily sales',
    icon: DollarSign,
    color: 'text-chart-1',
  },
  {
    id: 'expenses' as Page,
    title: 'Expenses',
    description: 'Manage restaurant expenses',
    icon: Receipt,
    color: 'text-chart-2',
  },
  {
    id: 'petty-cash' as Page,
    title: 'Petty Cash',
    description: 'Track petty cash transactions',
    icon: Wallet,
    color: 'text-chart-3',
  },
  {
    id: 'inventory' as Page,
    title: 'Inventory',
    description: 'Manage stock and items',
    icon: Package,
    color: 'text-chart-4',
  },
  {
    id: 'reports' as Page,
    title: 'Reports',
    description: 'View profit & loss reports',
    icon: TrendingUp,
    color: 'text-chart-5',
  },
];

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section with Background Pattern */}
      <div
        className="relative rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 p-8 md:p-12"
        style={{
          backgroundImage: 'url(/assets/generated/chettinad-pattern.dim_1600x900.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="relative z-10 bg-background/80 backdrop-blur-sm rounded-lg p-6 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Welcome to Your Restaurant Dashboard
          </h2>
          <p className="text-muted-foreground text-lg">
            Manage your daily operations with ease. Track sales, expenses, inventory, and generate reports all in one place.
          </p>
        </div>
      </div>

      {/* Module Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card
              key={module.id}
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/50"
              onClick={() => onNavigate(module.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className={`h-10 w-10 ${module.color}`} />
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="text-xl mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full group-hover:bg-primary/10">
                  Open {module.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Overview</CardTitle>
          <CardDescription>Your restaurant at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Today's Sales</p>
              <p className="text-2xl font-bold">-</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Today's Expenses</p>
              <p className="text-2xl font-bold">-</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Petty Cash Balance</p>
              <p className="text-2xl font-bold">-</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
