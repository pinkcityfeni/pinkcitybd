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
import { sanitizeEmail, isValidEmail } from '@/lib/security';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/';

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleGoogleLogin = async () => {
    setError('');
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError('Google লগইন ব্যর্থ হয়েছে');
      return;
    }
    if (result.redirected) return;
    toast.success(t('auth.welcomeBackToast'));
    navigate(from, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = sanitizeEmail(email);
    if (!isValidEmail(cleanEmail)) {
      setError('সঠিক ইমেইল দিন');
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? t('auth.invalidCreds')
        : authError.message);
    } else {
      toast.success(t('auth.welcomeBackToast'));
      navigate(from, { replace: true });
    }
    setLoading(false);
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

          <Button variant="outline" className="w-full rounded-lg h-10 mb-4 gap-2" onClick={handleGoogleLogin}>
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google দিয়ে লগইন
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">অথবা</span></div>
          </div>

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
              <div className="flex justify-end mt-1">
                <Link to="/forgot-password" className="text-[10px] text-primary hover:underline">পাসওয়ার্ড ভুলে গেছেন?</Link>
              </div>
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
