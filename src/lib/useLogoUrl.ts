// src/lib/useLogoUrl.ts
import { useEffect, useState, useRef } from 'react';
import { getLogoUrl } from './logo-storage';

type Result = { url: string | null; loading: boolean };

export function useLogoUrl(logo?: string | null): Result {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const currentObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // cleanup previously created object URL if any
    const revokeCurrent = () => {
      if (currentObjectUrlRef.current && currentObjectUrlRef.current.startsWith('blob:')) {
        try { URL.revokeObjectURL(currentObjectUrlRef.current); } catch {}
      }
      currentObjectUrlRef.current = null;
    };

    revokeCurrent(); // revoke any old when logo changes
    setUrl(null);

    if (!logo) {
      setLoading(false);
      return () => { mounted = false; revokeCurrent(); };
    }

    // if looks like an IndexedDB id we created (logo-...), fetch blob URL
    if (/^logo-/.test(logo)) {
      setLoading(true);
      getLogoUrl(logo)
        .then(u => {
          if (!mounted) return;
          if (u) {
            currentObjectUrlRef.current = u;
            setUrl(u);
          } else {
            setUrl(null);
          }
        })
        .catch((err) => {
          console.error('useLogoUrl getLogoUrl error', err);
          if (mounted) setUrl(null);
        })
        .finally(() => { if (mounted) setLoading(false); });
      return () => { mounted = false; revokeCurrent(); };
    }

    // If it's an inline data URL or remote URL, use directly
    setUrl(logo);
    setLoading(false);

    return () => { mounted = false; revokeCurrent(); };
  }, [logo]);

  return { url, loading };
}
