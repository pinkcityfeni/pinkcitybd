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
    if (!isValidEmail(cleanEmail)) { setError('সঠিক ইমেইল দিন'); return; }

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
            <h2 className="font-display text-xl font-bold mb-2">ইমেইল পাঠানো হয়েছে</h2>
            <p className="text-sm text-muted-foreground mb-4">
              আপনার ইমেইলে একটি পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। লিংকে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন।
            </p>
            <Link to="/login" className="text-primary font-medium text-sm hover:underline">
              লগইন পেজে ফিরে যান
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
            <ArrowLeft className="h-3 w-3 mr-1" /> লগইনে ফিরে যান
          </Link>
          <h1 className="font-display text-xl font-bold mb-1">পাসওয়ার্ড ভুলে গেছেন?</h1>
          <p className="text-xs text-muted-foreground mb-5">আপনার ইমেইল দিন, আমরা রিসেট লিংক পাঠাবো।</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-xs">ইমেইল</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required className="rounded-lg" autoComplete="email" maxLength={255} />
            </div>
            <Button type="submit" className="w-full rounded-lg h-10 font-semibold" disabled={loading}>
              {loading ? '...' : 'রিসেট লিংক পাঠান'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
