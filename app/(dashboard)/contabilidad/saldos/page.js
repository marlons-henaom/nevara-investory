'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { useAccounting } from '@/lib/context/AccountingContext';
import { accountingService, mapAccountingError } from '@/lib/services/accountingService';
import Card from '@/components/Card';
import SectionTitle from '@/components/SectionTitle';
import AccountPicker from '@/components/accounting/AccountPicker';
import { COLORS } from '@/lib/utils/colors';
import { labelStyle } from '@/lib/utils/styles';
import { money, fmtDate } from '@/lib/utils/format';

export default function SaldosPage() {
  const { organizationId } = useAccounting();
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [balance, setBalance] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!organizationId) return;
    accountingService.accounts.list(organizationId).then(setAccounts).catch((e) => setError(mapAccountingError(e)));
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId || !accountId) {
      setBalance(null);
      setMovements([]);
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [b, m] = await Promise.all([
          accountingService.balances.get(organizationId, accountId),
          accountingService.movements.listByAccount(organizationId, accountId),
        ]);
        setBalance(b);
        setMovements(m);
      } catch (e) {
        setError(mapAccountingError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [organizationId, accountId]);

  return (
    <Card style={{ padding: 22 }}>
      <SectionTitle icon={Wallet}>Saldos</SectionTitle>

      {error && <div style={{ marginBottom: 14, color: COLORS.danger, fontSize: 14 }}>{error}</div>}

      <div style={{ marginBottom: 20, maxWidth: 360 }}>
        <label style={labelStyle}>Cuenta</label>
        <AccountPicker accounts={accounts} value={accountId} onChange={setAccountId} style={{ width: '100%' }} />
      </div>

      {loading && <div style={{ color: COLORS.inkSoft, fontSize: 14 }}>Cargando…</div>}

      {!loading && balance && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 14,
            marginBottom: 24,
            padding: 18,
            background: COLORS.snowWarm,
            borderRadius: 12,
          }}
        >
          <Field label="Cuenta" value={`${balance.code} - ${balance.name}`} />
          <Field label="Tipo" value={balance.accountType} />
          <Field label="Débitos" value={money(balance.totalDebit)} />
          <Field label="Créditos" value={money(balance.totalCredit)} />
          <Field label="Saldo" value={money(balance.balance)} highlight />
        </div>
      )}

      {!loading && accountId && !balance && (
        <div style={{ marginBottom: 24, color: COLORS.inkSoft, fontSize: 14 }}>
          Esta cuenta aún no tiene movimientos registrados.
        </div>
      )}

      {!loading && accountId && (
        <>
          <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
            Movimientos
          </div>
          {movements.length === 0 && <div style={{ color: COLORS.inkSoft, fontSize: 14 }}>No hay movimientos para esta cuenta.</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {movements.map((m) => (
              <Link
                key={m.lineId}
                href={`/contabilidad/asientos/${m.entryId}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 14px',
                  border: `1px solid ${COLORS.pink}`,
                  borderRadius: 10,
                  textDecoration: 'none',
                  color: COLORS.ink,
                }}
              >
                <div style={{ fontSize: 13, color: COLORS.inkSoft, minWidth: 130 }}>{fmtDate(m.date)}</div>
                <div style={{ flex: 1, fontSize: 14 }}>{m.lineDescription || m.description}</div>
                <div style={{ minWidth: 110, textAlign: 'right', fontSize: 14 }}>{m.debit > 0 ? money(m.debit) : ''}</div>
                <div style={{ minWidth: 110, textAlign: 'right', fontSize: 14 }}>{m.credit > 0 ? money(m.credit) : ''}</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

function Field({ label, value, highlight }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: COLORS.inkSoft, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: highlight ? 20 : 15, fontWeight: 600, color: highlight ? COLORS.mauveDark : COLORS.ink }}>{value}</div>
    </div>
  );
}
