import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Users, Warehouse, FolderTree, ScanBarcode, Store, ChevronLeft, ChevronRight, LogOut, Menu, X, Image, Star, Globe, Facebook, Sparkles, Tag, Ticket, Truck, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/data/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/data/language';

const NAV_KEYS = [
  { to: '/admin/dashboard', key: 'admin.dashboard' as const, icon: LayoutDashboard },
  { to: '/admin/products', key: 'admin.products' as const, icon: Package },
  { to: '/admin/fb-import', key: 'admin.fbImport' as const, icon: Facebook },
  { to: '/admin/brands', key: 'admin.brands' as const, icon: Tag },
  { to: '/admin/vouchers', key: 'admin.vouchers' as const, icon: Ticket },
  { to: '/admin/categories', key: 'admin.categories' as const, icon: FolderTree },
  { to: '/admin/banners', key: 'admin.banners' as const, icon: Image },
  { to: '/admin/orders', key: 'admin.orders' as const, icon: ShoppingCart },
  { to: '/admin/inventory', key: 'admin.inventory' as const, icon: Warehouse },
  { to: '/admin/sales', key: 'admin.sales' as const, icon: BarChart3 },
  { to: '/admin/reviews', key: 'admin.reviews' as const, icon: Star },
  { to: '/admin/users', key: 'admin.users' as const, icon: Users },
  { to: '/admin/customers', key: 'admin.customers' as const, icon: Sparkles },
  { to: '/admin/delivery-areas', key: 'admin.deliveryAreas' as const, icon: Truck },
];

function SidebarContent({ onNavigate, collapsed }: { onNavigate?: () => void; collapsed?: boolean }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLink = () => onNavigate?.();

  return (
    <>
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border gap-2">
        <LayoutDashboard className="h-5 w-5 text-sidebar-primary shrink-0" />
        {!collapsed && <span className="font-bold text-sm text-sidebar-primary-foreground">{t('admin.panel')}</span>}
      </div>
      <Link
        to="/"
        onClick={handleLink}
        className="mx-2 mt-2 flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-sidebar-primary/10 hover:bg-sidebar-primary/20 text-sidebar-primary-foreground font-medium transition-colors"
      >
        <Home className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{t('nav.home')}</span>}
      </Link>
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_KEYS.map(n => {
          const active = location.pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={handleLink}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50'}`}
            >
              <n.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{t(n.key)}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-sidebar-border space-y-0.5">
        {!collapsed && user && (
          <div className="px-3 py-2 text-xs opacity-60 truncate">{user.name}</div>
        )}
        <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50 w-full text-left">
          <Globe className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>}
        </button>
        <Link to="/pos" onClick={handleLink} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50">
          <ScanBarcode className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t('admin.pos')}</span>}
        </Link>
        <Link to="/" onClick={handleLink} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50">
          <Store className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t('admin.storefront')}</span>}
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50 w-full text-left">
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t('admin.logout')}</span>}
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-background">
      {isMobile && (
        <>
          <header className="fixed top-0 left-0 right-0 z-40 h-12 bg-sidebar text-sidebar-foreground flex items-center px-3 gap-3">
            <button onClick={() => setMobileOpen(true)} className="p-1">
              <Menu className="h-5 w-5" />
            </button>
            <LayoutDashboard className="h-4 w-4 text-sidebar-primary" />
            <span className="font-bold text-sm text-sidebar-primary-foreground flex-1">{t('admin.panel')}</span>
            <Link to="/" className="p-1.5 rounded-lg hover:bg-sidebar-accent/50" aria-label="Home">
              <Home className="h-5 w-5" />
            </Link>
          </header>

          {mobileOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
              <aside className="relative w-64 max-w-[80vw] bg-sidebar text-sidebar-foreground flex flex-col h-full animate-in slide-in-from-left duration-200">
                <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 p-1 text-sidebar-foreground/70 hover:text-sidebar-foreground">
                  <X className="h-5 w-5" />
                </button>
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </aside>
            </div>
          )}
        </>
      )}

      {!isMobile && (
        <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-200 shrink-0`}>
          <SidebarContent collapsed={collapsed} />
          <div className="p-2 border-t border-sidebar-border">
            <button onClick={() => setCollapsed(c => !c)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50 w-full">
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4 shrink-0" /><span>{t('admin.collapse')}</span></>}
            </button>
          </div>
        </aside>
      )}

      <main className={`flex-1 overflow-auto ${isMobile ? 'pt-12' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
