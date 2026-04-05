import { useStore } from '@/data/store';
import { useAuth } from '@/data/auth';
import { Star, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const orders = useStore(s => s.orders.filter(o => o.type === 'online'));
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="page-header">My Account</h1>
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="stat-card flex items-center gap-3">
          <Star className="h-8 w-8 text-accent" />
          <div>
            <p className="text-2xl font-bold">245</p>
            <p className="text-sm text-muted-foreground">Reward Points</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-sm text-muted-foreground">Orders</p>
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{user?.name || 'Guest'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
      <h2 className="font-bold mt-8 mb-4">Recent Orders</h2>
      <div className="space-y-3">
        {orders.map(o => (
          <div key={o.id} className="stat-card flex items-center justify-between">
            <div>
              <p className="font-mono text-sm">{o.id}</p>
              <p className="text-xs text-muted-foreground">{new Date(o.date).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">${o.total.toFixed(2)}</p>
              <p className={`text-xs capitalize ${o.status === 'completed' ? 'text-success' : o.status === 'pending' ? 'text-warning' : 'text-info'}`}>{o.status}</p>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet</p>}
      </div>
    </div>
  );
}
