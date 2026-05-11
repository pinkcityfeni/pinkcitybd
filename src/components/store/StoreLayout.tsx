import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, Menu, X, Home, Grid3X3, Globe, MapPin, Heart, Phone, Mail, Facebook, ChevronRight, ChevronDown, ShieldCheck } from 'lucide-react';
import { useStore } from '@/data/store';
import { useAuth } from '@/data/auth';
import { useLanguage } from '@/data/language';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { useState, useRef, useEffect } from 'react';
import { useAppSettings } from '@/hooks/useSupabaseData';

function AnnouncementBar() {
  const { data: settings } = useAppSettings();
  const text = settings?.announcement_text || '🚚 Free delivery in Feni | Cash on delivery nationwide';
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const safeText = text.trim();

  useEffect(() => {
    const check = () => {
      if (containerRef.current && measureRef.current) {
        setShouldScroll(measureRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [text]);

  return (
    <div ref={containerRef} className="announcement-bar py-1.5 text-xs font-medium tracking-wide overflow-hidden whitespace-nowrap relative">
      <span ref={measureRef} className="invisible absolute whitespace-nowrap">{safeText}</span>
      {shouldScroll ? (
        <div className="flex min-w-max animate-marquee">
          <span className="px-4 sm:px-8">{safeText}</span>
          <span className="px-4 sm:px-8">{safeText}</span>
        </div>
      ) : (
        <div className="px-3 text-center truncate"><span>{safeText}</span></div>
      )}
    </div>
  );
}
import logoImg from '@/assets/logo.jpg';
import logoIcon from '@/assets/logo-icon.png';
import pinkCityText from '@/assets/pink-city-text.jpg';

export default function StoreLayout() {
  const cart = useStore(s => s.cart);
  const wishlist = useStore(s => s.wishlist);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = searchBarRef.current;
    if (!el) return;
    const update = () => {
      document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/shop', label: t('nav.shop') },
    { to: '/category', label: t('nav.category') },
  ];

  const handleLogout = async () => { await logout(); navigate('/'); };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const toggleLang = () => { setLang(lang === 'bn' ? 'en' : 'bn'); setLangDropdownOpen(false); };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top announcement bar */}
      <AnnouncementBar />

      {/* Main Header */}
      <header className="z-50 bg-background border-b">
        {/* Falling rose petals across the header */}
        <div className="petal-field" aria-hidden="true">
          <span className="petal petal-1">🌸</span>
          <span className="petal petal-2">🌸</span>
          <span className="petal petal-3">🌸</span>
          <span className="petal petal-4">🌸</span>
          <span className="petal petal-5">🌸</span>
          <span className="petal petal-6">🌸</span>
          <span className="petal petal-7">🌸</span>
          <span className="petal petal-8">🌸</span>
          <span className="petal petal-9">🌸</span>
          <span className="petal petal-10">🌸</span>
          <span className="petal petal-11">🌸</span>
          <span className="petal petal-12">🌸</span>
          <span className="petal petal-13">🌸</span>
          <span className="petal petal-14">🌸</span>
          <span className="petal petal-15">🌸</span>
        </div>
        <div className="container mx-auto flex items-center justify-between h-14 px-2 sm:px-4 relative gap-2 overflow-hidden">
          {/* Left: Hamburger + Logo icon */}
          <div className="flex items-center gap-1 shrink-0 -ml-1">
            <button className="md:hidden p-1.5 rounded-lg hover:bg-muted shrink-0" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <Link to="/" className="flex items-center shrink-0">
              <img src={logoIcon} alt="PINK CITY" className="h-9 w-9 object-contain shrink-0" />
            </Link>
          </div>

          {/* Center: Pink City text image (absolute on mobile, in-flow on desktop to avoid nav overlap) */}
          <Link to="/" className="flex items-center absolute md:static left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 max-w-[56vw] sm:max-w-none pointer-events-auto">
            <img src={pinkCityText} alt="Pink City" className="h-10 sm:h-12 max-w-full object-contain" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 ml-auto mr-4">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  location.pathname === l.to
                    ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-0 sm:gap-1 shrink-0">
            {isAuthenticated ? (
              <>
                <Link to="/account" className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </Link>
                <button onClick={handleLogout} className="hidden sm:flex p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background animate-fade-in">
            <div className="container mx-auto px-4 py-3 space-y-1">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setMobileMenuOpen(false)} className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === l.to ? 'bg-primary/5 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
                  {l.label}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ))}
              {!isAuthenticated && (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-primary">
                  {t('nav.signIn')}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Sticky Search Bar (kept frozen on scroll) */}
      <div ref={searchBarRef} className="sticky top-0 z-40 border-b border-t bg-background overflow-hidden px-3 py-1.5">
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={t('nav.search')}
            className="pl-9 h-8 text-xs rounded-lg bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <main className="flex-1 pb-16 md:pb-0"><Outlet /></main>

      
      <MobileBottomNav cartCount={cartCount} wishlistCount={wishlist.length} />

      {/* Professional Footer */}
      <footer className="border-t bg-foreground text-background mt-12">
        {/* Trust badges */}
        <div className="border-b border-background/10">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="trust-badge">
                <div className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{lang === 'bn' ? '100% Original' : '100% Original'}</p>
                  <p className="text-[10px] text-background/60">{lang === 'bn' ? 'Guaranteed' : 'Guaranteed'}</p>
                </div>
              </div>
              <div className="trust-badge">
                <div className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center">
                  <span className="text-lg font-bold">৳</span>
                </div>
                <div>
                  <p className="text-xs font-semibold">{lang === 'bn' ? 'Best price' : 'Best Price'}</p>
                  <p className="text-[10px] text-background/60">{lang === 'bn' ? 'Affordable price' : 'Affordable'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={logoImg} alt="PINK CITY" className="h-10 w-10 rounded-lg object-cover" />
                <div>
                  <span className="text-lg block uppercase" style={{ fontFamily: "'Bungee', sans-serif" }}>PINK CITY</span>
                </div>
              </div>
              <p className="text-xs text-background/60 leading-relaxed mb-4">{t('footer.tagline')}</p>
              <a href="https://maps.google.com/?q=Appayon+Afroz+Tower,+College+Road,+Feni+3900" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-xs text-background/60 hover:text-background transition-colors leading-relaxed mb-4">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>Appayon Afroz Tower (1st floor, Shop 11-12), College Road, Feni 3900</span>
              </a>
              <a href="tel:+8801715307271" className="flex items-center gap-2 text-xs text-background/60 hover:text-background transition-colors mb-2">
                <Phone className="h-3 w-3" />
                <span>+880 1715-307271</span>
              </a>
              <a href="mailto:pinkcity.feni@gmail.com" className="flex items-center gap-2 text-xs text-background/60 hover:text-background transition-colors">
                <Mail className="h-3 w-3" />
                <span>pinkcity.feni@gmail.com</span>
              </a>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider text-background/80" style={{ fontFamily: 'DM Sans, sans-serif' }}>{t('footer.shop')}</h4>
              <div className="space-y-2.5">
                <Link to="/shop" className="block text-xs text-background/50 hover:text-background transition-colors">{t('footer.allProducts')}</Link>
                <Link to="/category" className="block text-xs text-background/50 hover:text-background transition-colors">{t('footer.categories')}</Link>
                <Link to="/wishlist" className="block text-xs text-background/50 hover:text-background transition-colors">{t('nav.wishlist')}</Link>
              </div>
            </div>

            {/* Account */}
            <div>
              <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider text-background/80" style={{ fontFamily: 'DM Sans, sans-serif' }}>{t('footer.accountSection')}</h4>
              <div className="space-y-2.5">
                <Link to="/login" className="block text-xs text-background/50 hover:text-background transition-colors">{t('footer.login')}</Link>
                <Link to="/signup" className="block text-xs text-background/50 hover:text-background transition-colors">{t('footer.newAccount')}</Link>
                <Link to="/account" className="block text-xs text-background/50 hover:text-background transition-colors">{t('nav.account')}</Link>
              </div>
            </div>

            {/* Follow Us */}
            <div>
              <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider text-background/80" style={{ fontFamily: 'DM Sans, sans-serif' }}>{lang === 'bn' ? 'Follow us' : 'Follow Us'}</h4>
              <a href="https://www.facebook.com/share/17KZiPoqUF/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-background/70 hover:text-background transition-colors mb-4">
                <Facebook className="h-4 w-4" />
                <span>Facebook Page</span>
              </a>
            </div>
          </div>

          <div className="border-t border-background/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-background/40">© 2026 PINK CITY. All rights reserved.</p>
            <div className="flex items-center gap-4 text-[11px] text-background/40">
              <span>bKash</span>
              <span>Nagad</span>
              <span>COD</span>
              <span>Bank Transfer</span>
            </div>
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
    { to: '/wishlist', icon: Heart, label: t('nav.wishlist'), badge: wishlistCount },
    { to: '/category', icon: Grid3X3, label: t('nav.category') },
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/cart', icon: ShoppingCart, label: t('nav.cart'), badge: cartCount },
    { to: '/account', icon: User, label: t('nav.account') },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom pt-6">
      <div className="relative bg-background/95 backdrop-blur-xl border-t h-14 grid grid-cols-5 items-center px-1">
        {tabs.map(tab => {
          const isHome = tab.to === '/';
          const active = isHome ? location.pathname === '/' : location.pathname.startsWith(tab.to);

          if (isHome) {
            return (
              <Link key={tab.to} to={tab.to} className="flex min-w-0 flex-col items-center -mt-5 relative z-10 justify-self-center">
                <div className={`h-11 w-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${active ? 'bg-primary text-primary-foreground shadow-primary/30' : 'bg-primary text-primary-foreground shadow-primary/20'}`}>
                  <tab.icon className="h-5 w-5" />
                </div>
                <span className={`mt-0.5 max-w-full truncate px-1 text-[9px] font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link key={tab.to} to={tab.to} className={`flex min-w-0 flex-col items-center gap-0.5 py-1 relative transition-colors justify-self-center ${active ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className="relative">
                <tab.icon className="h-5 w-5" />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 min-w-[16px] px-1 flex items-center justify-center text-[9px] font-bold bg-primary text-primary-foreground rounded-full">{tab.badge}</span>
                )}
              </div>
              <span className="max-w-full truncate px-1 text-[9px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
