import '../styles/globals.css';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';

function MyApp({ Component, pageProps }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess?.session ?? null);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  return <Component {...pageProps} supabaseSession={session} />;
}

export default MyApp;
