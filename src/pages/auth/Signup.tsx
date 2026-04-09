import { useState } from 'react';
import logoImg from '@/assets/logo.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/data/auth';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError(t('auth.passwordShort')); return; }
    if (signup(name, email, password)) {
      toast.success(t('auth.accountCreated'));
      navigate('/');
    } else {
      setError(t('auth.createError'));
    }
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
          <h1 className="font-display text-xl font-bold mb-1">{t('auth.createAccount')}</h1>
          <p className="text-xs text-muted-foreground mb-5">{t('auth.joinDesc')}</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="name" className="text-xs">{t('auth.fullName')}</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder={t('auth.fullName')} required className="rounded-lg" />
            </div>
            <div>
              <Label htmlFor="email" className="text-xs">{t('auth.emailLabel')}</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required className="rounded-lg" />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">{t('auth.passwordLabel')}</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="rounded-lg" />
            </div>
            <Button type="submit" className="w-full rounded-lg h-10 font-semibold">{t('auth.createBtn')}</Button>
          </form>

          <p className="text-xs text-center mt-4 text-muted-foreground">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">{t('auth.signIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
