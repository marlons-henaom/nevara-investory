'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useAccounting } from '@/lib/context/AccountingContext';
import { accountingService, mapAccountingError } from '@/lib/services/accountingService';
import Card from '@/components/Card';
import SectionTitle from '@/components/SectionTitle';
import JournalEntriesTable from '@/components/accounting/JournalEntriesTable';
import { COLORS } from '@/lib/utils/colors';

const STATUS_FILTERS = ['Todos', 'POSTED', 'VOIDED'];

export default function AsientosPage() {
  const { organizationId } = useAccounting();
  const [entries, setEntries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Todos');
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

  const filtered = statusFilter === 'Todos' ? entries : entries.filter((e) => e.status === statusFilter);

  return (
    <Card style={{ padding: 22 }}>
      <SectionTitle icon={BookOpen}>Asientos</SectionTitle>

      {error && <div style={{ marginBottom: 14, color: COLORS.danger, fontSize: 14 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: 13,
              border: `1px solid ${statusFilter === s ? COLORS.gold : COLORS.pink}`,
              background: statusFilter === s ? COLORS.pinkSoft : '#fff',
              color: COLORS.mauveDark,
              fontWeight: statusFilter === s ? 600 : 400,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? <div style={{ color: COLORS.inkSoft, fontSize: 14 }}>Cargando…</div> : <JournalEntriesTable entries={filtered} />}
    </Card>
  );
}
