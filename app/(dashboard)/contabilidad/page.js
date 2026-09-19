'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calculator, Wallet, ArrowLeftRight, BookOpen } from 'lucide-react';
import { useAccounting } from '@/lib/context/AccountingContext';
import { accountingService } from '@/lib/services/accountingService';
import Card from '@/components/Card';
import SectionTitle from '@/components/SectionTitle';
import { COLORS } from '@/lib/utils/colors';

const SECTIONS = [
  { href: '/contabilidad/saldos', label: 'Saldos', icon: Wallet, description: 'Consulta el saldo de una cuenta contable.' },
  { href: '/contabilidad/movimientos', label: 'Movimientos', icon: ArrowLeftRight, description: 'Historial y registro de movimientos.' },
  { href: '/contabilidad/asientos', label: 'Asientos', icon: BookOpen, description: 'Detalle, estado y reversión de asientos.' },
];

export default function ContabilidadHomePage() {
  const { organizationId } = useAccounting();
  const [counts, setCounts] = useState({ accounts: 0, posted: 0, voided: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) return;
    (async () => {
      setLoading(true);
      try {
        const [accounts, entries] = await Promise.all([
          accountingService.accounts.list(organizationId),
          accountingService.entries.list(organizationId),
        ]);
        setCounts({
          accounts: accounts.filter((a) => a.isActive).length,
          posted: entries.filter((e) => e.status === 'POSTED').length,
          voided: entries.filter((e) => e.status === 'VOIDED').length,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [organizationId]);

  return (
    <Card style={{ padding: 22 }}>
      <SectionTitle icon={Calculator}>Contabilidad</SectionTitle>

      {!loading && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <StatPill label="Cuentas activas" value={counts.accounts} />
          <StatPill label="Asientos vigentes" value={counts.posted} />
          <StatPill label="Asientos reversados" value={counts.voided} />
        </div>
      )}

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

function StatPill({ label, value }) {
  return (
    <div style={{ padding: '10px 16px', borderRadius: 10, background: COLORS.snowWarm, minWidth: 140 }}>
      <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.mauveDark }}>{value}</div>
      <div style={{ fontSize: 12, color: COLORS.inkSoft }}>{label}</div>
    </div>
  );
}
