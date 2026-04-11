import { MessageCircleMore } from 'lucide-react';
import { useEffect } from 'react';
import { useLanguage } from '@/data/language';

type TawkApi = {
  maximize?: () => void;
  toggle?: () => void;
  hideWidget?: () => void;
};

export function SupportChatButton() {
  const { lang } = useLanguage();
  const label = lang === 'bn' ? 'লাইভ চ্যাট' : 'Live Chat';

  useEffect(() => {
    const timer = window.setInterval(() => {
      const api = (window as Window & { Tawk_API?: TawkApi }).Tawk_API;
      if (api?.hideWidget) {
        api.hideWidget();
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const handleOpenChat = () => {
    const api = (window as Window & { Tawk_API?: TawkApi }).Tawk_API;

    if (api?.maximize) {
      api.maximize();
      return;
    }

    api?.toggle?.();
  };

  return (
    <button
      type="button"
      onClick={handleOpenChat}
      aria-label={label}
      title={label}
      className="fixed bottom-20 right-4 z-[70] flex h-[72px] w-[72px] flex-col items-center justify-center gap-1 rounded-[1.75rem] bg-primary text-primary-foreground shadow-xl shadow-primary/30 transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:bottom-6 md:right-6"
    >
      <MessageCircleMore className="h-6 w-6" />
      <span className="text-[10px] font-semibold leading-none">{lang === 'bn' ? 'চ্যাট' : 'Chat'}</span>
      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-primary animate-pulse" aria-hidden="true" />
    </button>
  );
}
