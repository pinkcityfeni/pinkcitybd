import { useState } from 'react';
import { useLanguage } from '@/data/language';
import { useAuth } from '@/data/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2, Trash2 } from 'lucide-react';
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
  | { type: 'delete'; user: DbUser }
  | null;

async function getAdminAccessToken() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    const refreshedToken = refreshed.session?.access_token;

    if (refreshError || !refreshedToken) {
      throw new Error('Session has expired, please log in again.');
    }

    return refreshedToken;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    throw new Error('Session not found, please log in again.');
  }

  return accessToken;
}

async function callAdminFunction<T>(
  functionName: 'list-users' | 'delete-user',
  options?: { method?: 'GET' | 'POST'; body?: unknown }
) {
  const accessToken = await getAdminAccessToken();
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`, {
    method: options?.method || (options?.body ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null) as { error?: string } | null;

  if (!response.ok) {
    throw new Error(data?.error || 'Request failed');
  }

  return data as T;
}

function useDbUsers() {
  const { loading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['db-users'],
    enabled: !loading && isAuthenticated,
    queryFn: async () => callAdminFunction<DbUser[]>('list-users'),
    retry: false,
  });
}

function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { error: delErr } = await supabase.from('user_roles').delete().eq('user_id', userId);
      if (delErr) throw delErr;
      const { error: insErr } = await supabase.from('user_roles').insert({ user_id: userId, role: newRole });
      if (insErr) throw insErr;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db-users'] }),
  });
}

function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await callAdminFunction<{ success: boolean }>('delete-user', {
        method: 'POST',
        body: { userId },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db-users'] }),
  });
}

export default function Users() {
  const { t, locale } = useLanguage();
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading, error, refetch, isFetching } = useDbUsers();
  const updateRoleMut = useUpdateUserRole();
  const deleteUserMut = useDeleteUser();
  const [dialog, setDialog] = useState<DialogMode>(null);

  const handleConfirm = async () => {
    if (!dialog) return;
    if (dialog.type === 'role') {
      try {
        await updateRoleMut.mutateAsync({ userId: dialog.user.id, newRole: dialog.newRole });
        toast.success(`${dialog.user.name} Now ${dialog.newRole}`);
      } catch (err: any) {
        toast.error(err.message || 'Role Change failed');
      }
    } else if (dialog.type === 'delete') {
      try {
        await deleteUserMut.mutateAsync(dialog.user.id);
        toast.success(`${dialog.user.name} account has been deleted.`);
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete account');
      }
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

  const isPending = updateRoleMut.isPending || deleteUserMut.isPending;
  const errorMessage = error instanceof Error ? error.message : 'Users Could not load';

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="page-header">{t('user.title')}</h1>
      <p className="page-subheader mb-6">{error ? errorMessage : t('user.nUsers', { n: users.length })}</p>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="stat-card flex flex-col items-start gap-3">
          <p className="text-sm text-destructive">{errorMessage}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Loading...' : 'Try again'}
          </Button>
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
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 font-medium">
                      {u.name}
                      {isSelf && <span className="text-[10px] text-muted-foreground ml-1">(You)</span>}
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
                      {new Date(u.created_at).toLocaleDateString(locale)}
                    </td>
                    <td className="py-3">
                      {!isSelf && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDialog({ type: 'delete', user: u })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
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
            <AlertDialogTitle>
              {dialog?.type === 'delete' ? 'Delete Account?' : 'Role You will change?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialog?.type === 'role'
                ? `${dialog.user.name} Of role "${dialog.user.role}" From "${dialog.newRole}" will be changed to।`
                : dialog?.type === 'delete'
                ? `${dialog.user.name} (${dialog.user.email}) account will be permanently deleted. This action cannot be undone.।`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('user.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
              className={dialog?.type === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {isPending ? 'Processing...' : dialog?.type === 'delete' ? 'Delete' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
