import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/data/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Gift } from 'lucide-react';
import { toast } from 'sonner';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (signup(name, email, password)) {
      toast.success('Account created! Welcome! 🎉');
      navigate('/');
    } else {
      setError('Could not create account');
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
          <h1 className="font-display text-xl font-bold mb-1">Create an account</h1>
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Gift className="h-3 w-3 text-primary" /> Start earning reward points today
          </p>
          <p className="text-xs text-muted-foreground mb-5">Join for exclusive offers & track your orders</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-xl px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="name" className="text-xs">Full Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required className="rounded-xl" />
            </div>
            <div>
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required className="rounded-xl" />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="rounded-xl" />
            </div>
            <Button type="submit" className="w-full rounded-full shadow-lg shadow-primary/20">Create Account</Button>
          </form>

          <p className="text-xs text-center mt-4 text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
