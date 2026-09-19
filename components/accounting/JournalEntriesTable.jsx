'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { COLORS, journalEntryStatusColors } from '@/lib/utils/colors';
import { fmtDate } from '@/lib/utils/format';

// Tabla de asientos (accounting.journal_entries) compartida entre
// /contabilidad/movimientos (historial) y /contabilidad/asientos (gestión/estado).
export default function JournalEntriesTable({ entries }) {
  if (entries.length === 0) {
    return <div style={{ color: COLORS.inkSoft, fontSize: 14 }}>No se encontraron asientos.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {entries.map((e) => (
        <Link
          key={e.id}
          href={`/contabilidad/asientos/${e.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 16px',
            border: `1px solid ${COLORS.pink}`,
            borderRadius: 10,
            textDecoration: 'none',
            color: COLORS.ink,
          }}
        >
          <div style={{ fontSize: 13, color: COLORS.inkSoft, minWidth: 130 }}>{fmtDate(e.date)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14 }}>{e.description}</div>
            {e.conceptName && <div style={{ fontSize: 12, color: COLORS.inkSoft }}>{e.conceptName}</div>}
          </div>
          <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, ...journalEntryStatusColors(e.status) }}>
            {e.status}
          </span>
          <ChevronRight size={16} color={COLORS.inkSoft} />
        </Link>
      ))}
    </div>
  );
}
