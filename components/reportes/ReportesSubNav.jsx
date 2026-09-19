'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart } from 'lucide-react';
import { COLORS } from '@/lib/utils/colors';

const TABS = [
  { href: '/reportes', label: 'Resumen', icon: LayoutDashboard },
  { href: '/reportes/ventas', label: 'Ventas', icon: ShoppingCart },
];

export default function ReportesSubNav() {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = t.href === '/reportes' ? pathname === '/reportes' : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 999,
              fontSize: 13,
              textDecoration: 'none',
              border: `1px solid ${active ? COLORS.gold : COLORS.pink}`,
              background: active ? COLORS.pinkSoft : '#fff',
              color: COLORS.mauveDark,
              fontWeight: active ? 600 : 400,
            }}
          >
            <Icon size={14} /> {t.label}
          </Link>
        );
      })}
    </div>
  );
}
