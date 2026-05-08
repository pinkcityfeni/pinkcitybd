import { useState } from 'react';
import { Trash2, Plus, Truck, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  useDeliveryAreas, useAddDeliveryArea, useUpdateDeliveryArea, useDeleteDeliveryArea,
  useAppSettings, useUpdateAppSetting,
} from '@/hooks/useSupabaseData';

export default function DeliveryAreas() {
  const { data: areas = [] } = useDeliveryAreas();
  const addMut = useAddDeliveryArea();
  const updateMut = useUpdateDeliveryArea();
  const deleteMut = useDeleteDeliveryArea();
  const { data: settings } = useAppSettings();
  const updateSetting = useUpdateAppSetting();

  const [newName, setNewName] = useState('');
  const [newCharge, setNewCharge] = useState<number>(0);
  const [outsideCharge, setOutsideCharge] = useState<string>(settings?.['delivery.outside_charge'] || '120');

  // sync setting once loaded
  if (settings && settings['delivery.outside_charge'] && outsideCharge !== settings['delivery.outside_charge'] && outsideCharge === '120') {
    setOutsideCharge(settings['delivery.outside_charge']);
  }

  const handleAdd = async () => {
    if (!newName.trim()) { toast.error('Area name required'); return; }
    try {
      await addMut.mutateAsync({ name: newName.trim(), charge: Number(newCharge) || 0, sort_order: areas.length });
      setNewName(''); setNewCharge(0);
      toast.success('Area added');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUpdate = async (id: string, updates: any) => {
    try { await updateMut.mutateAsync({ id, updates }); } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this area?')) return;
    try { await deleteMut.mutateAsync(id); toast.success('Deleted'); } catch (e: any) { toast.error(e.message); }
  };

  const saveOutside = async () => {
    try {
      await updateSetting.mutateAsync({ key: 'delivery.outside_charge', value: String(Number(outsideCharge) || 0) });
      toast.success('Saved');
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Delivery Areas</h1>
      </div>

      {/* Outside Feni flat charge */}
      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <h2 className="font-semibold">Outside Feni — Flat charge for all other districts</h2>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label>Delivery charge (Tk )</Label>
            <Input type="number" value={outsideCharge} onChange={e => setOutsideCharge(e.target.value)} />
          </div>
          <Button onClick={saveOutside}><Save className="h-4 w-4 mr-1" /> Save</Button>
        </div>
        <p className="text-xs text-muted-foreground">This charge applies to every district in Bangladesh except Feni.</p>
      </div>

      {/* Feni areas */}
      <div className="rounded-2xl border bg-card p-4 space-y-4">
        <h2 className="font-semibold">Feni Areas</h2>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_auto] gap-2 items-end">
          <div>
            <Label>Area name</Label>
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g., Feni Sadar" />
          </div>
          <div>
            <Label>Charge (Tk )</Label>
            <Input type="number" value={newCharge} onChange={e => setNewCharge(Number(e.target.value))} />
          </div>
          <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>

        <div className="space-y-2">
          {areas.length === 0 && <p className="text-sm text-muted-foreground">No areas yet.</p>}
          {areas.map(a => (
            <div key={a.id} className="grid grid-cols-[1fr_120px_auto_auto] gap-2 items-center p-2 rounded-lg border">
              <Input
                defaultValue={a.name}
                onBlur={(e) => e.target.value !== a.name && handleUpdate(a.id, { name: e.target.value })}
              />
              <Input
                type="number"
                defaultValue={a.charge}
                onBlur={(e) => Number(e.target.value) !== a.charge && handleUpdate(a.id, { charge: Number(e.target.value) })}
              />
              <div className="flex items-center gap-2 px-2">
                <Switch checked={a.active} onCheckedChange={v => handleUpdate(a.id, { active: v })} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}