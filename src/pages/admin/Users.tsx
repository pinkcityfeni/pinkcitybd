import { useState } from 'react';
import { useLanguage } from '@/data/language';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  orders: number;
}

const INITIAL_USERS: UserItem[] = [
  { id: '4', name: 'Admin User', email: 'pinkcity.feni@gmail.com', role: 'admin', points: 0, orders: 0 },
];

export default function Users() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);

  const handleDelete = () => {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    toast.success(`${deleteTarget.name} removed`);
    setDeleteTarget(null);
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
              <th className="pb-3 font-medium">{t('user.email')}</th>
              <th className="pb-3 font-medium">{t('user.role')}</th>
              <th className="pb-3 font-medium text-right">{t('user.points')}</th>
              <th className="pb-3 font-medium text-right">{t('user.orders')}</th>
              <th className="pb-3 font-medium text-right">{t('user.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-3 font-medium">{u.name}</td>
                <td className="py-3 text-muted-foreground">{u.email}</td>
                <td className="py-3">
                  <Badge variant="outline" className="capitalize text-xs">
                    {u.role}
                  </Badge>
                </td>
                <td className="py-3 text-right">{u.points}</td>
                <td className="py-3 text-right">{u.orders}</td>
                <td className="py-3 text-right">
                  {u.role !== 'admin' ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(u)}>
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('user.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} ({deleteTarget?.email}) — {t('user.deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('user.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('user.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
