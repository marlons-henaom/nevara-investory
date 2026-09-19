'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, Plus } from 'lucide-react';
import { useAccounting } from '@/lib/context/AccountingContext';
import { accountingService, mapAccountingError } from '@/lib/services/accountingService';
import Card from '@/components/Card';
import SectionTitle from '@/components/SectionTitle';
import JournalEntriesTable from '@/components/accounting/JournalEntriesTable';
import { COLORS } from '@/lib/utils/colors';
import { btnPrimary } from '@/lib/utils/styles';

export default function MovimientosPage() {
  const { organizationId } = useAccounting();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!organizationId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setEntries(await accountingService.entries.list(organizationId));
      } catch (e) {
        setError(mapAccountingError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [organizationId]);

  return (
    <Card style={{ padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <SectionTitle icon={ArrowLeftRight}>Movimientos</SectionTitle>
        <Link href="/contabilidad/movimientos/nuevo" style={{ textDecoration: 'none' }}>
          <span style={btnPrimary}>
            <Plus size={16} /> Registrar movimiento
          </span>
        </Link>
      </div>

      {error && <div style={{ marginBottom: 14, color: COLORS.danger, fontSize: 14 }}>{error}</div>}
      {loading ? <div style={{ color: COLORS.inkSoft, fontSize: 14 }}>Cargando…</div> : <JournalEntriesTable entries={entries} />}
    </Card>
  );
}
