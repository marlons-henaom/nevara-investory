'use client';

import { AlertTriangle, LogOut } from 'lucide-react';
import { COLORS } from '@/lib/utils/colors';
import { authService } from '@/lib/services/authService';
import { useRouter } from 'next/navigation';

export default function Header({ lowStock }) {
  const router = useRouter();

  const handleLogout = async () => {
    await authService.signOut();
    router.replace('/login');
  };

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${COLORS.mauve}, ${COLORS.mauveDark})`,
        padding: '22px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        borderBottom: `3px solid ${COLORS.gold}`,
      }}
    >
      <img src="/PROFILE-INSTAGRAM-NEVARA.png" alt="Nevara" style={{ width: 52, height: 52, filter: 'brightness(0) invert(0)' }} />
      <div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: COLORS.snow, letterSpacing: 1 }}>
          Nevara
        </div>
        <div style={{ fontSize: 11, color: COLORS.pinkSoft, letterSpacing: 3 }}>
          SISTEMA DE INVENTARIO Y VENTAS
        </div>
      </div>

      {lowStock && lowStock.length > 0 && (
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.15)',
            padding: '8px 14px',
            borderRadius: 999,
            color: COLORS.snow,
            fontSize: 13,
          }}
        >
          <AlertTriangle size={16} />
          {lowStock.length} producto{lowStock.length > 1 ? 's' : ''} con stock bajo
        </div>
      )}

      <button
        onClick={handleLogout}
        id="no-print"
        style={{
          marginLeft: lowStock && lowStock.length > 0 ? 12 : 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255,255,255,0.12)',
          border: 'none',
          color: COLORS.snow,
          padding: '8px 14px',
          borderRadius: 999,
          fontSize: 13,
        }}
      >
        <LogOut size={15} /> Salir
      </button>
    </div>
  );
}
