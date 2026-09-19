'use client';

import { useState } from 'react';
import { ShoppingCart, Download } from 'lucide-react';
import { reportsService } from '@/lib/services/reportsService';
import { toCSV, downloadCSV } from '@/lib/utils/csv';
import { useNotice } from '@/lib/hooks/useNotice';
import Card from '@/components/Card';
import SectionTitle from '@/components/SectionTitle';
import Notice from '@/components/Notice';
import { COLORS } from '@/lib/utils/colors';
import { inputStyle, labelStyle, btnPrimary } from '@/lib/utils/styles';

const ESTADOS = ['Pagado', 'Parcial', 'Pendiente', 'Anulada'];

const CSV_COLUMNS = [
  { label: 'Factura', value: (r) => r.invoiceNumber },
  { label: 'Fecha', value: (r) => r.date },
  { label: 'Cliente', value: (r) => r.clientName },
  { label: 'Correo', value: (r) => r.clientEmail },
  { label: 'Total a pagar', value: (r) => r.totalToPay },
  { label: 'Total pagado', value: (r) => r.totalPaid },
  { label: 'Saldo pendiente', value: (r) => r.amountDue },
  { label: 'Estado', value: (r) => r.paymentStatus },
  { label: 'Método de pago', value: (r) => r.paymentMethod },
];

export default function ReporteVentasPage() {
  const { notice, showNotice } = useNotice();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('');
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    if (!dateFrom || !dateTo) {
      showNotice('Selecciona la fecha de inicio y de fin', 'error');
      return;
    }
    if (dateFrom > dateTo) {
      showNotice('La fecha de inicio no puede ser posterior a la fecha de fin', 'error');
      return;
    }

    setGenerating(true);
    try {
      const rows = await reportsService.sales.list({ dateFrom, dateTo, status: status || undefined });
      if (rows.length === 0) {
        showNotice('No se encontraron ventas en el rango seleccionado', 'error');
        return;
      }
      const csv = toCSV(rows, CSV_COLUMNS);
      downloadCSV(`ventas_${dateFrom}_a_${dateTo}.csv`, csv);
      showNotice(`Se exportaron ${rows.length} venta${rows.length !== 1 ? 's' : ''}`);
    } catch (e) {
      showNotice('No se pudo generar el reporte', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card style={{ padding: 22 }}>
      <Notice notice={notice} />
      <SectionTitle icon={ShoppingCart}>Reporte de ventas</SectionTitle>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ minWidth: 180 }}>
          <label style={labelStyle}>Fecha inicio *</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
        </div>
        <div style={{ minWidth: 180 }}>
          <label style={labelStyle}>Fecha fin *</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
        </div>
        <div style={{ minWidth: 180 }}>
          <label style={labelStyle}>Estado (opcional)</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
            <option value="">Todos</option>
            {ESTADOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button onClick={generate} disabled={generating} style={{ ...btnPrimary, padding: '10px 20px', opacity: generating ? 0.6 : 1 }}>
          <Download size={16} /> {generating ? 'Generando…' : 'Generar CSV'}
        </button>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, color: COLORS.inkSoft }}>* Campos obligatorios.</div>
    </Card>
  );
}
