import { useState } from 'react';
import logoImg from '@/assets/logo.jpg';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { sanitizeEmail, isValidEmail } from '@/lib/security';
import { supabase } from '@/integrations/supabase/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = sanitizeEmail(email);
    if (!isValidEmail(cleanEmail)) { setError('Enter a valid email'); return; }

    setLoading(true);
    const { error: authError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h2 className="font-display text-xl font-bold mb-2">Email sent</h2>
            <p className="text-sm text-muted-foreground mb-4">
              A password reset link has been sent to your email. Click the link to set a new password.।
            </p>
            <Link to="/login" className="text-primary font-medium text-sm hover:underline">
              Go back to Login Page
            </Link>
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
          <Link to="/login" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary mb-3">
            <ArrowLeft className="h-3 w-3 mr-1" /> Go back to login
          </Link>
          <h1 className="font-display text-xl font-bold mb-1">Forgot password?</h1>
          <p className="text-xs text-muted-foreground mb-5">Enter your email, we will send a reset link.।</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required className="rounded-lg" autoComplete="email" maxLength={255} />
            </div>
            <Button type="submit" className="w-full rounded-lg h-10 font-semibold" disabled={loading}>
              {loading ? '...' : 'Send Reset Link'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
