import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Heart, LogOut, Menu, X } from 'lucide-react';
import { useStore } from '@/data/store';
import { useAuth } from '@/data/auth';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function StoreLayout() {
  const cart = useStore(s => s.cart);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Top banner */}
      <div className="bg-primary/5 text-center py-1.5 text-xs text-muted-foreground border-b">
        ✨ Free shipping on orders over $50 · Earn points on every purchase
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/90 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">💎</span>
            <span className="font-display text-lg font-semibold tracking-tight">Glamora</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  location.pathname === l.to
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <div className="hidden sm:block relative w-44">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 h-9 text-xs rounded-full bg-muted/50 border-0 focus-visible:ring-primary/30" />
            </div>
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-muted transition-colors">
              <ShoppingCart className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 p-0 flex items-center justify-center text-[9px] bg-primary text-primary-foreground border-2 border-card">
                  {cartCount}
                </Badge>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/account" className="p-2 rounded-full hover:bg-muted transition-colors">
                  <User className="h-4.5 w-4.5" />
                </Link>
                <button onClick={handleLogout} className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <Button asChild variant="outline" size="sm" className="rounded-full text-xs h-8 px-3">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
            {/* Mobile menu toggle */}
            <button className="md:hidden p-2 rounded-full hover:bg-muted" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-card animate-fade-in">
            <div className="container mx-auto px-4 py-3 space-y-1">
              {navLinks.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === l.to ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-2 px-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search products..." className="pl-9 rounded-full bg-muted/50 border-0 text-sm" />
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💎</span>
                <span className="font-display font-semibold">Glamora</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your destination for elegant jewelry & premium cosmetics.
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm mb-3">Shop</h4>
              <div className="space-y-2">
                <Link to="/shop" className="block text-xs text-muted-foreground hover:text-primary transition-colors">All Products</Link>
                <Link to="/category" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Categories</Link>
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm mb-3">Account</h4>
              <div className="space-y-2">
                <Link to="/login" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Sign In</Link>
                <Link to="/signup" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Create Account</Link>
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm mb-3">Admin</h4>
              <div className="space-y-2">
                <Link to="/admin" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
                <Link to="/pos" className="block text-xs text-muted-foreground hover:text-primary transition-colors">POS Terminal</Link>
              </div>
            </div>
          </div>
          <div className="border-t pt-6 text-center text-xs text-muted-foreground">
            © 2026 Glamora. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
