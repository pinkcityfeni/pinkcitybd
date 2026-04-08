import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, Menu, X, Home, Grid3X3, Globe, MapPin, Phone, Mail } from 'lucide-react';
import { useStore } from '@/data/store';
import { useAuth } from '@/data/auth';
import { useLanguage } from '@/data/language';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import logoImg from '@/assets/logo.jpg';

export default function StoreLayout() {
  const cart = useStore(s => s.cart);
  const wishlist = useStore(s => s.wishlist);
  const products = useStore(s => s.products);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/shop', label: t('nav.shop') },
    { to: '/category', label: t('nav.category') },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const toggleLang = () => setLang(lang === 'bn' ? 'en' : 'bn');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logoImg} alt="PINK CITY" className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all" />
            <span className="font-display text-lg font-semibold tracking-tight">
              <span className="text-gradient-pink">PINK</span> <span className="text-foreground">CITY</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${location.pathname === l.to ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground flex items-center gap-1"
              title={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold">{lang === 'bn' ? 'EN' : 'বা'}</span>
            </button>

            <form onSubmit={handleSearch} className="hidden sm:block relative w-44">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={t('nav.search')}
                className="pl-8 h-9 text-xs rounded-full bg-muted/50 border-0 focus-visible:ring-primary/30"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </form>
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-muted transition-colors">
              <ShoppingCart className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 p-0 flex items-center justify-center text-[9px] bg-primary text-primary-foreground border-2 border-card">{cartCount}</Badge>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/account" className="p-2 rounded-full hover:bg-muted transition-colors"><User className="h-4.5 w-4.5" /></Link>
                <button onClick={handleLogout} className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"><LogOut className="h-3.5 w-3.5" /></button>
              </>
            ) : (
              <Button asChild variant="outline" size="sm" className="rounded-full text-xs h-8 px-3"><Link to="/login">{t('nav.signIn')}</Link></Button>
            )}
            <button className="md:hidden p-2 rounded-full hover:bg-muted" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-card animate-fade-in">
            <div className="container mx-auto px-4 py-3 space-y-1">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${location.pathname === l.to ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
                  {l.label}
                </Link>
              ))}
              <div className="pt-2 px-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder={t('nav.search')} className="pl-9 rounded-full bg-muted/50 border-0 text-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </form>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 pb-16 md:pb-0"><Outlet /></main>

      <MobileBottomNav cartCount={cartCount} wishlistCount={wishlist.length} />

      <footer className="border-t bg-gradient-to-b from-card/50 to-muted/30 mt-16">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand + Address */}
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img src={logoImg} alt="PINK CITY" className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20" />
                <span className="font-display font-semibold text-gradient-pink">PINK CITY</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{t('footer.tagline')}</p>
              <div className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>Appayon Afroz Tower (1st floor, Shop 11-12), College Road, Feni 3900, Bangladesh</span>
              </div>
              <div className="flex gap-2 mt-3">
                <span className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs hover:bg-primary/20 transition-colors cursor-pointer">📱</span>
                <span className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs hover:bg-primary/20 transition-colors cursor-pointer">💬</span>
                <span className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs hover:bg-primary/20 transition-colors cursor-pointer">📷</span>
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm mb-3">{t('footer.shop')}</h4>
              <div className="space-y-2">
                <Link to="/shop" className="block text-xs text-muted-foreground hover:text-primary transition-colors">{t('footer.allProducts')}</Link>
                <Link to="/category" className="block text-xs text-muted-foreground hover:text-primary transition-colors">{t('footer.categories')}</Link>
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm mb-3">{t('footer.accountSection')}</h4>
              <div className="space-y-2">
                <Link to="/login" className="block text-xs text-muted-foreground hover:text-primary transition-colors">{t('footer.login')}</Link>
                <Link to="/signup" className="block text-xs text-muted-foreground hover:text-primary transition-colors">{t('footer.newAccount')}</Link>
              </div>
            </div>
            {user?.role === 'admin' && (
              <div>
                <h4 className="font-display font-semibold text-sm mb-3">{t('footer.admin')}</h4>
                <div className="space-y-2">
                  <Link to="/admin" className="block text-xs text-muted-foreground hover:text-primary transition-colors">{t('footer.dashboard')}</Link>
                  <Link to="/pos" className="block text-xs text-muted-foreground hover:text-primary transition-colors">POS</Link>
                </div>
              </div>
            )}
          </div>
          <div className="border-t pt-6 text-center">
            <p className="text-xs text-muted-foreground">© 2026 <span className="text-gradient-pink font-semibold">PINK CITY</span>. All rights reserved. 💕</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileBottomNav({ cartCount, wishlistCount }: { cartCount: number; wishlistCount: number }) {
  const location = useLocation();
  const { t } = useLanguage();

  const tabs = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/category', icon: Grid3X3, label: t('nav.category') },
    { to: '/cart', icon: ShoppingCart, label: t('nav.cart'), badge: cartCount },
    { to: '/account', icon: User, label: t('nav.account') },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {tabs.map(t => {
          const active = t.to === '/' ? location.pathname === '/' : location.pathname.startsWith(t.to);
          return (
            <Link key={t.to} to={t.to} className={`flex flex-col items-center gap-0.5 px-3 py-1 relative transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className="relative">
                <t.icon className="h-5 w-5" />
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 min-w-[16px] px-1 flex items-center justify-center text-[9px] font-bold bg-primary text-primary-foreground rounded-full">{t.badge}</span>
                )}
              </div>
              <span className="text-[10px] font-medium">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
