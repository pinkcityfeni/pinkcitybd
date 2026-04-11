import { useState } from 'react';
import logoImg from '@/assets/logo.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/data/auth';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeInput, sanitizeEmail, sanitizePhone, isValidEmail, isValidPhone, isStrongPassword, isValidName } from '@/lib/security';

export default function Signup() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const passwordCheck = isStrongPassword(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = sanitizeInput(name);
    const cleanEmail = sanitizeEmail(email);
    const cleanPhone = sanitizePhone(phone);

    if (!isValidName(cleanName)) {
      setError('নাম কমপক্ষে ২ অক্ষর হতে হবে');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError('সঠিক ইমেইল দিন');
      return;
    }

    if (!isValidPhone(cleanPhone)) {
      setError('সঠিক ফোন নম্বর দিন (যেমন: 01XXXXXXXXX)');
      return;
    }

    if (!passwordCheck.valid) {
      setError(passwordCheck.message);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (signup(cleanName, cleanEmail, password, cleanPhone)) {
        toast.success(t('auth.accountCreated'));
        navigate('/');
      } else {
        setError(t('auth.createError'));
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
          <h1 className="font-display text-xl font-bold mb-1">{t('auth.createAccount')}</h1>
          <p className="text-xs text-muted-foreground mb-5">{t('auth.joinDesc')}</p>

          <form onSubmit={handleSubmit} className="space-y-3" autoComplete="on">
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="name" className="text-xs">{t('auth.fullName')}</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder={t('auth.fullName')} required className="rounded-lg" autoComplete="name" maxLength={100} />
            </div>
            <div>
              <Label htmlFor="phone" className="text-xs">Phone Number</Label>
              <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" required className="rounded-lg" autoComplete="tel" maxLength={15} />
            </div>
            <div>
              <Label htmlFor="email" className="text-xs">{t('auth.emailLabel')}</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required className="rounded-lg" autoComplete="email" maxLength={255} />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">{t('auth.passwordLabel')}</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="rounded-lg" autoComplete="new-password" maxLength={128} />
              {password.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {passwordCheck.valid ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-destructive" />
                  )}
                  <span className={`text-[10px] ${passwordCheck.valid ? 'text-green-600' : 'text-destructive'}`}>
                    {passwordCheck.valid ? 'শক্তিশালী পাসওয়ার্ড ✓' : passwordCheck.message}
                  </span>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full rounded-lg h-10 font-semibold" disabled={loading}>
              {loading ? '...' : t('auth.createBtn')}
            </Button>
          </form>

          <div className="flex items-center gap-1.5 justify-center mt-3 text-[10px] text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>আপনার তথ্য সুরক্ষিত</span>
          </div>

          <p className="text-xs text-center mt-3 text-muted-foreground">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">{t('auth.signIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}