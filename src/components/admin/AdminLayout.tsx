import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Users, Warehouse, FolderTree, ScanBarcode, Store, ChevronLeft, ChevronRight, LogOut, Menu, X, Image, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/data/auth';
import { useIsMobile } from '@/hooks/use-mobile';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/banners', label: 'Banners', icon: Image },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/admin/sales', label: 'Sales', icon: BarChart3 },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/users', label: 'Users', icon: Users },
];

function SidebarContent({ onNavigate, collapsed }: { onNavigate?: () => void; collapsed?: boolean }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLink = () => onNavigate?.();

  return (
    <>
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border gap-2">
        <LayoutDashboard className="h-5 w-5 text-sidebar-primary shrink-0" />
        {!collapsed && <span className="font-bold text-sm text-sidebar-primary-foreground">Admin Panel</span>}
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV.map(n => {
          const active = location.pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={handleLink}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50'}`}
            >
              <n.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{n.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-sidebar-border space-y-0.5">
        {!collapsed && user && (
          <div className="px-3 py-2 text-xs opacity-60 truncate">{user.name}</div>
        )}
        <Link to="/pos" onClick={handleLink} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50">
          <ScanBarcode className="h-4 w-4 shrink-0" />
          {!collapsed && <span>POS</span>}
        </Link>
        <Link to="/" onClick={handleLink} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50">
          <Store className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Storefront</span>}
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50 w-full text-left">
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
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

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile: top bar + drawer */}
      {isMobile && (
        <>
          <header className="fixed top-0 left-0 right-0 z-40 h-12 bg-sidebar text-sidebar-foreground flex items-center px-3 gap-3">
            <button onClick={() => setMobileOpen(true)} className="p-1">
              <Menu className="h-5 w-5" />
            </button>
            <LayoutDashboard className="h-4 w-4 text-sidebar-primary" />
            <span className="font-bold text-sm text-sidebar-primary-foreground">Admin Panel</span>
          </header>

          {/* Overlay */}
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

      {/* Desktop: fixed sidebar */}
      {!isMobile && (
        <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-200 shrink-0`}>
          <SidebarContent collapsed={collapsed} />
          <div className="p-2 border-t border-sidebar-border">
            <button onClick={() => setCollapsed(c => !c)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50 w-full">
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4 shrink-0" /><span>Collapse</span></>}
            </button>
          </div>
        </aside>
      )}

      {/* Main */}
      <main className={`flex-1 overflow-auto ${isMobile ? 'pt-12' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
