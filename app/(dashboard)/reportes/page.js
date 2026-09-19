'use client';

import Link from 'next/link';
import { BarChart3, ShoppingCart } from 'lucide-react';
import Card from '@/components/Card';
import SectionTitle from '@/components/SectionTitle';
import { COLORS } from '@/lib/utils/colors';

const SECTIONS = [{ href: '/reportes/ventas', label: 'Ventas', icon: ShoppingCart, description: 'Exporta las ventas de un rango de fechas a CSV.' }];

export default function ReportesHomePage() {
  return (
    <Card style={{ padding: 22 }}>
      <SectionTitle icon={BarChart3}>Reportes</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: 18,
                border: `1px solid ${COLORS.pink}`,
                borderRadius: 12,
                textDecoration: 'none',
                color: COLORS.ink,
              }}
            >
              <Icon size={20} color={COLORS.gold} />
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: COLORS.mauveDark }}>{s.label}</div>
              <div style={{ fontSize: 13, color: COLORS.inkSoft }}>{s.description}</div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
