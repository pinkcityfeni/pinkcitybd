import { useState } from 'react';
import logoImg from '@/assets/logo.jpg';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/data/auth';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeEmail, checkLoginRateLimit, recordLoginAttempt, isValidEmail } from '@/lib/security';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

    const cleanEmail = sanitizeEmail(email);

    // Validate email format
    if (!isValidEmail(cleanEmail)) {
      setError('সঠিক ইমেইল দিন');
      return;
    }

    // Check rate limiting
    const rateCheck = checkLoginRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      setError(rateCheck.message);
      return;
    }

    setLoading(true);

    // Small delay to prevent timing attacks
    setTimeout(() => {
      const success = login(cleanEmail, password);
      recordLoginAttempt(cleanEmail, success);

      if (success) {
        toast.success(t('auth.welcomeBackToast'));
        navigate(from, { replace: true });
      } else {
        setError(t('auth.invalidCreds'));
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <img src={logoImg} alt="PINK CITY" className="h-10 w-10 rounded-lg object-cover" />
          <div className="leading-none">
            <span className="font-display text-xl font-bold block">
              <span className="text-gradient-pink">PINK</span> CITY
            </span>
            <span className="text-[9px] text-muted-foreground tracking-widest uppercase">Beauty & Care</span>
          </div>
        </Link>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="font-display text-xl font-bold mb-1">{t('auth.welcomeBack')}</h1>
          <p className="text-xs text-muted-foreground mb-5">{t('auth.signInDesc')}</p>

          <form onSubmit={handleSubmit} className="space-y-3" autoComplete="on">
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-xs">{t('auth.emailLabel')}</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required className="rounded-lg" autoComplete="email" maxLength={255} />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">{t('auth.passwordLabel')}</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="rounded-lg" autoComplete="current-password" maxLength={128} />
            </div>
            <Button type="submit" className="w-full rounded-lg h-10 font-semibold" disabled={loading}>
              {loading ? '...' : t('auth.signInBtn')}
            </Button>
          </form>

          <div className="flex items-center gap-1.5 justify-center mt-3 text-[10px] text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>নিরাপদ লগইন</span>
          </div>

          <p className="text-xs text-center mt-3 text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">{t('auth.signUp')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}