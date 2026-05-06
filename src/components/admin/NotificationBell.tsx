import { useState } from 'react';
import { Bell, Check, Trash2, BellRing } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications, requestBrowserNotificationPermission } from '@/hooks/useNotifications';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICON: Record<string, string> = {
  order: '🛒',
  advance_paid: '💸',
  review: '⭐',
  signup: '👤',
};

export function NotificationBell() {
  const { items, unread, markAllRead, markRead, remove } = useNotifications();
  const [open, setOpen] = useState(false);

  const enablePush = async () => {
    const r = await requestBrowserNotificationPermission();
    if (r === 'granted') {
      try { new Notification('🔔 Notifications enabled', { body: 'Glamora will alert you on new activity.' }); } catch {}
    }
  };

  const canAskPush = typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
          aria-label="Notifications"
        >
          {unread > 0 ? <BellRing className="h-5 w-5 text-primary animate-in zoom-in" /> : <Bell className="h-5 w-5" />}
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-semibold text-sm">Notifications</div>
          {unread > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="h-7 text-xs">
              <Check className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>
        {canAskPush && (
          <button
            onClick={enablePush}
            className="w-full px-4 py-2 text-xs bg-primary/5 hover:bg-primary/10 text-primary border-b text-left"
          >
            🔔 Enable browser notifications (works even when tab is closed)
          </button>
        )}
        <ScrollArea className="max-h-[400px]">
          {items.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {items.map(n => (
                <div key={n.id} className={`group relative px-4 py-3 hover:bg-muted/50 ${!n.read ? 'bg-primary/5' : ''}`}>
                  <div className="flex items-start gap-2">
                    <div className="text-xl shrink-0">{TYPE_ICON[n.type] || '🔔'}</div>
                    <div className="flex-1 min-w-0">
                      {n.link ? (
                        <Link to={n.link} onClick={() => { markRead(n.id); setOpen(false); }} className="block">
                          <div className="text-sm font-medium truncate">{n.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{n.message}</div>
                        </Link>
                      ) : (
                        <>
                          <div className="text-sm font-medium truncate">{n.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{n.message}</div>
                        </>
                      )}
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  </div>
                  <button
                    onClick={() => remove(n.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-opacity"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}