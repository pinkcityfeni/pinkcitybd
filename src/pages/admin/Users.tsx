import { useState } from 'react';
import { useLanguage } from '@/data/language';
import { useUserRegistry } from '@/data/userRegistry';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, ShieldCheck } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { RegisteredUser } from '@/data/userRegistry';

type DialogMode = 
  | { type: 'delete'; user: RegisteredUser }
  | { type: 'role'; user: RegisteredUser; newRole: RegisteredUser['role'] }
  | null;

export default function Users() {
  const { t } = useLanguage();
  const users = useUserRegistry((s) => s.users);
  const removeUser = useUserRegistry((s) => s.removeUser);
  const updateRole = useUserRegistry((s) => s.updateRole);
  const [dialog, setDialog] = useState<DialogMode>(null);

  const handleConfirm = () => {
    if (!dialog) return;
    if (dialog.type === 'delete') {
      removeUser(dialog.user.id);
      toast.success(`${dialog.user.name} removed`);
    } else {
      updateRole(dialog.user.id, dialog.newRole);
      toast.success(`${dialog.user.name} is now ${dialog.newRole}`);
    }
    setDialog(null);
  };

  const handleRoleSelect = (user: RegisteredUser, newRole: string) => {
    const role = newRole as RegisteredUser['role'];
    if (role === user.role) return;
    setDialog({ type: 'role', user, newRole: role });
  };

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="page-header">{t('user.title')}</h1>
      <p className="page-subheader mb-6">{t('user.nUsers', { n: users.length })}</p>
      <div className="stat-card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">{t('user.name')}</th>
              <th className="pb-3 font-medium">Phone</th>
              <th className="pb-3 font-medium">{t('user.email')}</th>
              <th className="pb-3 font-medium">{t('user.role')}</th>
              <th className="pb-3 font-medium text-right">{t('user.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-3 font-medium">{u.name}</td>
                <td className="py-3 text-muted-foreground">{u.phone || '—'}</td>
                <td className="py-3 text-muted-foreground">{u.email}</td>
                <td className="py-3">
                  {u.id === 'u1' ? (
                    <Badge variant="outline" className="capitalize text-xs">admin</Badge>
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
                <td className="py-3 text-right">
                  {u.id !== 'u1' ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDialog({ type: 'delete', user: u })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialog?.type === 'delete' ? t('user.confirmDelete') : 'Change Role?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialog?.type === 'delete'
                ? `${dialog.user.name} (${dialog.user.email}) — ${t('user.deleteWarning')}`
                : dialog?.type === 'role'
                  ? `Are you sure you want to change ${dialog.user.name}'s role from "${dialog.user.role}" to "${dialog.newRole}"?`
                  : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('user.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={dialog?.type === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {dialog?.type === 'delete' ? t('user.delete') : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
