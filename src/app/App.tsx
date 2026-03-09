import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase/client';

export default function App() {
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session) {
          supabase.auth.signInAnonymously().catch(() => {
            // App can still run with mock fallback if auth fails.
          });
        }
      });
    }

    const webApp = (window as Window & { Telegram?: { WebApp?: { ready: () => void; initData?: string } } }).Telegram?.WebApp;
    if (!webApp?.initData) {
      return;
    }

    webApp.ready();

    fetch('/api/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: webApp.initData }),
    }).catch(() => {
      // UI keeps working with local session fallback.
    });
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  );
}
