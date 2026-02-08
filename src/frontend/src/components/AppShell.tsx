import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

type Page = 'dashboard' | 'sales' | 'expenses' | 'petty-cash' | 'inventory' | 'reports';

interface AppShellProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'sales', label: 'Sales' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'petty-cash', label: 'Petty Cash' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'reports', label: 'Reports' },
];

export function AppShell({ children, currentPage, onNavigate }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/Restaurant_1.png"
              alt="Sikandar Indian Restaurant"
              className="h-10 w-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-foreground">Sikandar Indian Restaurant</h1>
              <p className="text-xs text-muted-foreground">Daily Accounting</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? 'default' : 'ghost'}
                onClick={() => handleNavigate(item.id)}
                className="text-sm"
              >
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-2 mt-8">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? 'default' : 'ghost'}
                    onClick={() => handleNavigate(item.id)}
                    className="justify-start"
                  >
                    {item.label}
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 md:py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 mt-12">
        <div className="container px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            © 2026. Built with ❤️ using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
