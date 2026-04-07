import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/data/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/';

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(email, password)) {
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
           <img src={logoImg} alt="PINK CITY" className="h-10 w-10 rounded-lg object-cover" />
           <span className="font-display text-xl font-semibold">PINK CITY</span>
        </Link>

        <div className="rounded-2xl border bg-card/90 backdrop-blur-sm p-6 shadow-lg">
          <h1 className="font-display text-xl font-bold mb-1">Welcome back</h1>
          <p className="text-xs text-muted-foreground mb-5">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-xl px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required className="rounded-xl" />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="rounded-xl" />
            </div>
            <Button type="submit" className="w-full rounded-full shadow-lg shadow-primary/20">Sign In</Button>
          </form>

          <p className="text-xs text-center mt-4 text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </div>

        <div className="mt-5 rounded-2xl border bg-card/60 backdrop-blur-sm p-4 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground text-xs mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" /> Demo Accounts</p>
          <p><span className="font-mono text-[11px]">admin@shop.com</span> / <span className="font-mono text-[11px]">admin123</span></p>
          <p><span className="font-mono text-[11px]">cashier@shop.com</span> / <span className="font-mono text-[11px]">cashier123</span></p>
          <p><span className="font-mono text-[11px]">user@shop.com</span> / <span className="font-mono text-[11px]">user123</span></p>
        </div>
      </div>
    </div>
  );
}
