'use client';

import { useState } from 'react';
import { FileText, Search, ChevronRight } from 'lucide-react';
import { useNevaraData } from '@/lib/context/NevaraDataContext';
import { useNotice } from '@/lib/hooks/useNotice';
import Card from '@/components/Card';
import SectionTitle from '@/components/SectionTitle';
import Notice from '@/components/Notice';
import InvoiceModal from '@/components/InvoiceModal';
import { COLORS } from '@/lib/utils/colors';
import { money, fmtDate } from '@/lib/utils/format';

export default function HistorialPage() {
  const { sales, clients, refresh } = useNevaraData();
  const { notice, showNotice } = useNotice();
  const [search, setSearch] = useState('');
  const [invoiceView, setInvoiceView] = useState(null);

  const filtered = sales.filter(
    (s) => s.client.toLowerCase().includes(search.toLowerCase()) || s.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card style={{ padding: 22 }}>
      <Notice notice={notice} />
      <SectionTitle icon={FileText}>Historial de ventas y facturas</SectionTitle>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, background: COLORS.snowWarm, borderRadius: 8, padding: '8px 12px' }}>
        <Search size={15} color={COLORS.inkSoft} />
        <input
          placeholder="Buscar por cliente o número de factura…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: 14 }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && <div style={{ color: COLORS.inkSoft, fontSize: 14 }}>No se encontraron ventas.</div>}
        {filtered.map((s) => (
          <div
            key={s.id}
            onClick={() => setInvoiceView(s)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              border: `1px solid ${COLORS.pink}`,
              borderRadius: 10,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontFamily: 'Georgia, serif', color: COLORS.gold, fontWeight: 600, minWidth: 90 }}>{s.invoiceNumber}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14 }}>{s.client}</div>
              <div style={{ fontSize: 12, color: COLORS.inkSoft }}>
                {fmtDate(s.date)} · {s.items.length} producto{s.items.length > 1 ? 's' : ''}
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 999,
                background: s.paymentStatus === 'Pagado' ? '#EAF4EC' : '#FBEAEA',
                color: s.paymentStatus === 'Pagado' ? '#3D7A4A' : COLORS.danger,
              }}
            >
              {s.paymentStatus}
            </span>
            <div style={{ minWidth: 90, textAlign: 'right', fontWeight: 600, color: COLORS.mauveDark }}>{money(s.total)}</div>
            <ChevronRight size={16} color={COLORS.inkSoft} />
          </div>
        ))}
      </div>

      {invoiceView && (
        <InvoiceModal
          sale={invoiceView}
          clients={clients}
          showNotice={showNotice}
          onClose={() => setInvoiceView(null)}
          onClientEmailUpdated={refresh}
        />
      )}
    </Card>
  );
}
