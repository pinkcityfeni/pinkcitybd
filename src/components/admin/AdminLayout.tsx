import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Users, Warehouse, FileText, ScanBarcode, Store, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/admin/sales', label: 'Sales', icon: BarChart3 },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: FileText },
];

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-200 shrink-0`}>
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border gap-2">
          <LayoutDashboard className="h-5 w-5 text-sidebar-primary shrink-0" />
          {!collapsed && <span className="font-bold text-sm text-sidebar-primary-foreground">Admin Panel</span>}
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {NAV.map(n => {
            const active = n.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50'}`}
              >
                <n.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{n.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-sidebar-border space-y-0.5">
          <Link to="/pos" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50">
            <ScanBarcode className="h-4 w-4 shrink-0" />
            {!collapsed && <span>POS</span>}
          </Link>
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50">
            <Store className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Storefront</span>}
          </Link>
          <button onClick={() => setCollapsed(c => !c)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50 w-full">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4 shrink-0" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
