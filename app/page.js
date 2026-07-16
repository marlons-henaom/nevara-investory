'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      router.replace(data.session ? '/resumen' : '/login');
    });
    return () => {
      active = false;
    };
  }, [router]);

  return null;
}
