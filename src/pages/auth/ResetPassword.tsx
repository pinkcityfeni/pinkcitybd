import { useState, useEffect } from 'react';
import logoImg from '@/assets/logo.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { isStrongPassword } from '@/lib/security';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const navigate = useNavigate();

  const passwordCheck = isStrongPassword(password);

  useEffect(() => {
    // Check if user arrived via recovery link
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    if (type === 'recovery') {
      setHasSession(true);
    } else {
      // Also check if there's an active session (user might already be logged in via the link)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setHasSession(true);
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordCheck.valid) { setError(passwordCheck.message); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) {
      setError(authError.message);
    } else {
      setDone(true);
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h2 className="font-display text-xl font-bold mb-2">Password changed!</h2>
            <p className="text-sm text-muted-foreground mb-4">Your password has been successfully updated.।</p>
            <Button onClick={() => navigate('/login')} className="rounded-lg">Log In</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <h2 className="font-display text-xl font-bold mb-2">Link invalid</h2>
            <p className="text-sm text-muted-foreground mb-4">The reset link is expired or invalid. Please try again.।</p>
            <Link to="/forgot-password" className="text-primary font-medium text-sm hover:underline">Get new reset link</Link>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="font-display text-xl font-bold mb-1">Set new password</h1>
          <p className="text-xs text-muted-foreground mb-5">Enter a strong password.।</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="password" className="text-xs">New Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="rounded-lg" autoComplete="new-password" maxLength={128} />
              {password.length > 0 && (
                <p className={`text-[10px] mt-1 ${passwordCheck.valid ? 'text-green-600' : 'text-destructive'}`}>
                  {passwordCheck.valid ? 'Strong password ✓' : passwordCheck.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="confirm" className="text-xs">Confirm password</Label>
              <Input id="confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required className="rounded-lg" autoComplete="new-password" maxLength={128} />
            </div>
            <Button type="submit" className="w-full rounded-lg h-10 font-semibold" disabled={loading}>
              {loading ? '...' : 'Update password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
