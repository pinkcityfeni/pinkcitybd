import { useState } from 'react';
import { Banner } from '@/data/store';
import { useBanners, useAddBanner, useUpdateBanner, useDeleteBanner, useAppSettings, useUpdateAppSetting, uploadImage } from '@/hooks/useSupabaseData';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Image as ImageIcon, GripVertical, Megaphone, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBanners() {
  const { data: banners = [] } = useBanners();
  const addBannerMut = useAddBanner();
  const updateBannerMut = useUpdateBanner();
  const deleteBannerMut = useDeleteBanner();
  const { data: settings } = useAppSettings();
  const updateSettingMut = useUpdateAppSetting();
  const announcementText = settings?.announcement_text || '';
  const { t } = useLanguage();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLink, setNewLink] = useState('/shop');
  const [newImage, setNewImage] = useState('');
  const [editAnnouncement, setEditAnnouncement] = useState(announcementText);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, bannerId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      if (bannerId) { updateBannerMut.mutate({ id: bannerId, updates: { image: url } }); toast.success(t('banner.imageUpdated')); }
      else { setNewImage(url); }
    } catch { toast.error('Upload failed'); }
  };

  const handleAdd = () => {
    if (!newTitle.trim()) { toast.error(t('banner.enterTitle')); return; }
    addBannerMut.mutate({ title: newTitle, link: newLink, image: newImage, active: true });
    setNewTitle(''); setNewLink('/shop'); setNewImage(''); setShowAdd(false);
    toast.success(t('banner.added'));
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header text-xl">{t('banner.title')}</h1>
          <p className="page-subheader">{t('banner.subtitle')}</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="rounded-full gap-1.5">
          <Plus className="h-4 w-4" /> {t('banner.newBanner')}
        </Button>
      </div>

      {/* Announcement Text Editor */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Megaphone className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Announcement Bar Text</h3>
        </div>
        <div className="flex gap-2">
          <Input
            value={editAnnouncement}
            onChange={e => setEditAnnouncement(e.target.value)}
            placeholder="Enter announcement text..."
            className="text-sm"
          />
          <Button
            size="sm"
            className="rounded-full gap-1.5 shrink-0"
            onClick={() => {
              updateSettingMut.mutate({ key: 'announcement_text', value: editAnnouncement });
              toast.success('Announcement updated!');
            }}
          >
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">This text appears at the top of your store</p>
      </Card>

      {showAdd && (
        <Card className="p-4 mb-6 space-y-4">
          <h3 className="font-medium text-sm">{t('banner.addNew')}</h3>
          <div className="relative">
            {newImage ? (
              <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-muted">
                <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                <Button size="sm" variant="secondary" className="absolute bottom-2 right-2 rounded-full text-xs" onClick={() => setNewImage('')}>{t('banner.change')}</Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[21/9] rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                <ImageIcon className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <span className="text-sm text-muted-foreground">{t('banner.uploadImage')}</span>
                <span className="text-xs text-muted-foreground/60 mt-1">{t('banner.recommendedSize')}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e)} />
              </label>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder={t('banner.titlePlaceholder')} value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            <Input placeholder={t('banner.linkPlaceholder')} value={newLink} onChange={e => setNewLink(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm" className="rounded-full">{t('banner.addBtn')}</Button>
            <Button onClick={() => { setShowAdd(false); setNewImage(''); }} size="sm" variant="ghost" className="rounded-full">{t('banner.cancel')}</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {banners.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">{t('banner.noBanners')}</div>}
        {banners.map(b => (
          <Card key={b.id} className="p-3 flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-48 shrink-0">
              {b.image ? (
                <div className="aspect-[21/9] sm:aspect-video rounded-lg overflow-hidden bg-muted">
                  <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <label className="flex items-center justify-center aspect-[21/9] sm:aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="text-center">
                    <ImageIcon className="h-5 w-5 text-muted-foreground/50 mx-auto mb-1" />
                    <span className="text-[10px] text-muted-foreground">{t('banner.imageUpload')}</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, b.id)} />
                </label>
              )}
              {b.image && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg cursor-pointer">
                  <span className="text-white text-xs font-medium">{t('banner.changeImage')}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, b.id)} />
                </label>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <Input value={b.title} onChange={e => updateBannerMut.mutate({ id: b.id, updates: { title: e.target.value } })} className="text-sm font-medium" />
              <Input value={b.link} onChange={e => updateBannerMut.mutate({ id: b.id, updates: { link: e.target.value } })} className="text-xs" placeholder={t('banner.linkPlaceholder')} />
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <Switch checked={b.active} onCheckedChange={v => updateBannerMut.mutate({ id: b.id, updates: { active: v } })} />
                  <span className="text-xs text-muted-foreground">{b.active ? t('banner.active') : t('banner.inactive')}</span>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8 p-0" onClick={() => setDeleteTarget(b)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Banner Delete??</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && <><strong>{deleteTarget.title || 'This banner'}</strong> will be deleted. This action cannot be undone.।</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) { deleteBannerMut.mutate(deleteTarget.id); toast.success(t('banner.deleted')); }
                setDeleteTarget(null);
              }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
