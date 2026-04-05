import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Store, LogOut } from 'lucide-react';
import { useStore } from '@/data/store';
import { useAuth } from '@/data/auth';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function StoreLayout() {
  const cart = useStore(s => s.cart);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/category', label: 'Categories' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Store className="h-6 w-6 text-primary" />
            <span>ShopFlow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === l.to ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block relative w-48">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 h-9 text-sm" />
            </div>
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-accent text-accent-foreground">
                  {cartCount}
                </Badge>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/account" className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <User className="h-5 w-5" />
                </Link>
                <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 ShopFlow. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-3">
            <Link to="/admin" className="hover:text-primary">Admin</Link>
            <Link to="/pos" className="hover:text-primary">POS</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
