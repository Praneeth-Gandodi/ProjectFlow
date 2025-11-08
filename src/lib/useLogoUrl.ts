
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

    const revokeCurrent = () => {
      if (currentObjectUrlRef.current && currentObjectUrlRef.current.startsWith('blob:')) {
        try { URL.revokeObjectURL(currentObjectUrlRef.current); } catch {}
      }
      currentObjectUrlRef.current = null;
    };

    revokeCurrent();
    setUrl(null);
    setLoading(false);

    if (!logo) {
      return () => { mounted = false; revokeCurrent(); };
    }

    if (logo.startsWith('indexeddb:')) {
      setLoading(true);
      const id = logo.replace('indexeddb:', '');
      getLogoUrl(id)
        .then(u => {
          if (!mounted) {
            if (u) URL.revokeObjectURL(u);
            return;
          }
          currentObjectUrlRef.current = u;
          setUrl(u);
        })
        .catch((err) => {
          console.error('useLogoUrl getLogoUrl error', err);
          if (mounted) setUrl(null);
        })
        .finally(() => { if (mounted) setLoading(false); });
    } else {
      setUrl(logo);
    }

    return () => { mounted = false; revokeCurrent(); };
  }, [logo]);

  return { url, loading };
}
