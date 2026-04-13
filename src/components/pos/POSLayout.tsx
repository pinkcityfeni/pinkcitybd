import { Outlet, Link, useLocation } from 'react-router-dom';
import { ScanBarcode, ShoppingCart, Barcode, Store, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/data/auth';
import { useNavigate } from 'react-router-dom';

const NAV = [
  { to: '/pos', label: 'Sales', icon: ShoppingCart, end: true },
  { to: '/pos/sales', label: 'Sales History', icon: ScanBarcode },
  { to: '/pos/barcode', label: 'Barcode Scanner', icon: Barcode },
];

export default function POSLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(var(--pos-bg))', color: 'hsl(var(--pos-foreground))' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b shrink-0" style={{ borderColor: 'hsl(var(--pos-border))' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold">
            <ScanBarcode className="h-5 w-5 text-primary" />
            POS Terminal
          </div>
          <nav className="hidden sm:flex items-center gap-1 ml-4">
            {NAV.map(n => {
              const active = n.end ? location.pathname === n.to : location.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    active ? 'bg-primary/20 text-primary' : 'opacity-60 hover:opacity-100 hover:bg-primary/10'
                  }`}
                >
                  <n.icon className="h-3.5 w-3.5" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user && <span className="text-xs opacity-50 hidden sm:block">{user.name}</span>}
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link to="/"><Store className="h-4 w-4 mr-1" /> Shop</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link to="/admin"><LayoutDashboard className="h-4 w-4 mr-1" /> Admin</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
