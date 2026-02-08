import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { SalesPage } from './pages/SalesPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { PettyCashPage } from './pages/PettyCashPage';
import { InventoryPage } from './pages/InventoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { useState } from 'react';

const queryClient = new QueryClient();

type Page = 'dashboard' | 'sales' | 'expenses' | 'petty-cash' | 'inventory' | 'reports';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'sales':
        return <SalesPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'petty-cash':
        return <PettyCashPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
          {renderPage()}
        </AppShell>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
