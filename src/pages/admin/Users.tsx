import { useLanguage } from '@/data/language';
import { Badge } from '@/components/ui/badge';

const MOCK_USERS = [
  { id: '1', name: 'Alice Chen', email: 'alice@email.com', role: 'customer', points: 245, orders: 3 },
  { id: '2', name: 'Bob Smith', email: 'bob@email.com', role: 'customer', points: 120, orders: 1 },
  { id: '3', name: 'Carol Davis', email: 'carol@email.com', role: 'customer', points: 89, orders: 2 },
  { id: '4', name: 'Admin User', email: 'admin@shop.com', role: 'admin', points: 0, orders: 0 },
  { id: '5', name: 'Cashier 1', email: 'cashier@shop.com', role: 'cashier', points: 0, orders: 0 },
];

export default function Users() {
  const { t } = useLanguage();

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="page-header">{t('user.title')}</h1>
      <p className="page-subheader mb-6">{t('user.nUsers', { n: MOCK_USERS.length })}</p>
      <div className="stat-card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">{t('user.name')}</th>
              <th className="pb-3 font-medium">{t('user.email')}</th>
              <th className="pb-3 font-medium">{t('user.role')}</th>
              <th className="pb-3 font-medium text-right">{t('user.points')}</th>
              <th className="pb-3 font-medium text-right">{t('user.orders')}</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map(u => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-3 font-medium">{u.name}</td>
                <td className="py-3 text-muted-foreground">{u.email}</td>
                <td className="py-3"><Badge variant="outline" className="capitalize text-xs">{u.role}</Badge></td>
                <td className="py-3 text-right">{u.points}</td>
                <td className="py-3 text-right">{u.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
