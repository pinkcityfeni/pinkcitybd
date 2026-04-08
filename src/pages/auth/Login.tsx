import { useState } from 'react';
import logoImg from '@/assets/logo.jpg';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/data/auth';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
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
      setError(t('auth.invalidCreds'));
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
          <h1 className="font-display text-xl font-bold mb-1">{t('auth.welcomeBack')}</h1>
          <p className="text-xs text-muted-foreground mb-5">{t('auth.signInDesc')}</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-xl px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-xs">{t('auth.emailLabel')}</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required className="rounded-xl" />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">{t('auth.passwordLabel')}</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="rounded-xl" />
            </div>
            <Button type="submit" className="w-full rounded-full shadow-lg shadow-primary/20">{t('auth.signInBtn')}</Button>
          </form>

          <p className="text-xs text-center mt-4 text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">{t('auth.signUp')}</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
