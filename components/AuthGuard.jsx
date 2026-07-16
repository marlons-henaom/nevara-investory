'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import { COLORS } from '@/lib/utils/colors';

// Protege las rutas del dashboard en el cliente: si no hay sesión activa,
// redirige a /login. Se queda escuchando cambios de sesión (ej. logout).
export default function AuthGuard({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    authService.getSession().then((session) => {
      if (!active) return;
      if (!session) {
        router.replace('/login');
      } else {
        setAuthenticated(true);
      }
      setChecking(false);
    });

    const subscription = authService.onAuthStateChange((session) => {
      if (!session) {
        router.replace('/login');
      }
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  if (checking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: COLORS.snow,
          fontFamily: 'Georgia, serif',
          color: COLORS.mauveDark,
        }}
      >
        Verificando sesión…
      </div>
    );
  }

  if (!authenticated) return null;

  return children;
}
