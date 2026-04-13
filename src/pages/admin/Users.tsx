import { useState } from 'react';
import { useLanguage } from '@/data/language';
import { useAuth } from '@/data/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'cashier' | 'customer';

interface DbUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: AppRole;
  created_at: string;
}

type DialogMode =
  | { type: 'role'; user: DbUser; newRole: AppRole }
  | null;

function useDbUsers() {
  return useQuery({
    queryKey: ['db-users'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('list-users', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      return res.data as DbUser[];
    },
  });
}

function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      // Delete existing role and insert new one
      const { error: delErr } = await supabase.from('user_roles').delete().eq('user_id', userId);
      if (delErr) throw delErr;
      const { error: insErr } = await supabase.from('user_roles').insert({ user_id: userId, role: newRole });
      if (insErr) throw insErr;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db-users'] }),
  });
}

export default function Users() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading } = useDbUsers();
  const updateRoleMut = useUpdateUserRole();
  const [dialog, setDialog] = useState<DialogMode>(null);

  const handleConfirm = async () => {
    if (!dialog || dialog.type !== 'role') return;
    try {
      await updateRoleMut.mutateAsync({ userId: dialog.user.id, newRole: dialog.newRole });
      toast.success(`${dialog.user.name} এখন ${dialog.newRole}`);
    } catch (err: any) {
      toast.error(err.message || 'Role পরিবর্তন ব্যর্থ');
    }
    setDialog(null);
  };

  const handleRoleSelect = (user: DbUser, newRole: string) => {
    const role = newRole as AppRole;
    if (role === user.role) return;
    setDialog({ type: 'role', user, newRole: role });
  };

  const roleBadgeColor = (role: AppRole) => {
    switch (role) {
      case 'admin': return 'bg-primary/10 text-primary border-primary/20';
      case 'cashier': return 'bg-accent/10 text-accent-foreground border-accent/20';
      default: return '';
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="page-header">{t('user.title')}</h1>
      <p className="page-subheader mb-6">{t('user.nUsers', { n: users.length })}</p>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="stat-card overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">{t('user.name')}</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">{t('user.email')}</th>
                <th className="pb-3 font-medium">{t('user.role')}</th>
                <th className="pb-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 font-medium">
                      {u.name}
                      {isSelf && <span className="text-[10px] text-muted-foreground ml-1">(আপনি)</span>}
                    </td>
                    <td className="py-3 text-muted-foreground">{u.phone || '—'}</td>
                    <td className="py-3 text-muted-foreground">{u.email}</td>
                    <td className="py-3">
                      {isSelf ? (
                        <Badge variant="outline" className={`capitalize text-xs ${roleBadgeColor(u.role)}`}>
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          {u.role}
                        </Badge>
                      ) : (
                        <Select value={u.role} onValueChange={(val) => handleRoleSelect(u, val)}>
                          <SelectTrigger className="h-7 w-28 text-xs capitalize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="cashier">Cashier</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString('bn-BD')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Role পরিবর্তন করবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              {dialog?.type === 'role'
                ? `${dialog.user.name} এর role "${dialog.user.role}" থেকে "${dialog.newRole}" তে পরিবর্তন হবে।`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('user.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={updateRoleMut.isPending}>
              {updateRoleMut.isPending ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
