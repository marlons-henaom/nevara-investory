'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, ShoppingCart, FileText, Users } from 'lucide-react';
import { COLORS } from '@/lib/utils/colors';

const TABS = [
  { href: '/resumen', label: 'Resumen', icon: Package },
  { href: '/venta', label: 'Nueva venta', icon: ShoppingCart },
  { href: '/historial', label: 'Historial y facturas', icon: FileText },
  { href: '/inventario', label: 'Inventario', icon: Package },
  { href: '/clientes', label: 'Clientes', icon: Users },
];

export default function TabsNav() {
  const pathname = usePathname();

  return (
    <div
      id="no-print"
      style={{ display: 'flex', gap: 4, padding: '14px 28px 0', borderBottom: `1px solid ${COLORS.pink}` }}
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              fontSize: 14,
              textDecoration: 'none',
              background: active ? COLORS.snow : 'transparent',
              color: active ? COLORS.mauveDark : COLORS.inkSoft,
              borderBottom: active ? `3px solid ${COLORS.gold}` : '3px solid transparent',
              borderRadius: '8px 8px 0 0',
              fontWeight: active ? 600 : 400,
            }}
          >
            <Icon size={15} /> {t.label}
          </Link>
        );
      })}
    </div>
  );
}
