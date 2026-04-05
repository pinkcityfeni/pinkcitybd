import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/data/store';
import { Star, Package } from 'lucide-react';

export default function Account() {
  const orders = useStore(s => s.orders.filter(o => o.type === 'online'));
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) return (
    <div className="container mx-auto px-4 py-12 max-w-md animate-fade-in">
      <Tabs defaultValue="login">
        <TabsList className="w-full">
          <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
          <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login" className="stat-card mt-4 space-y-4">
          <div><Label>Email</Label><Input type="email" placeholder="your@email.com" /></div>
          <div><Label>Password</Label><Input type="password" placeholder="••••••••" /></div>
          <Button className="w-full" onClick={() => setLoggedIn(true)}>Login</Button>
        </TabsContent>
        <TabsContent value="signup" className="stat-card mt-4 space-y-4">
          <div><Label>Name</Label><Input placeholder="Your name" /></div>
          <div><Label>Email</Label><Input type="email" placeholder="your@email.com" /></div>
          <div><Label>Password</Label><Input type="password" placeholder="••••••••" /></div>
          <Button className="w-full" onClick={() => setLoggedIn(true)}>Create Account</Button>
        </TabsContent>
      </Tabs>
    </div>
  );

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
          <span className="text-sm font-medium">Demo User</span>
          <Button variant="outline" size="sm" onClick={() => setLoggedIn(false)}>Logout</Button>
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
      </div>
    </div>
  );
}
