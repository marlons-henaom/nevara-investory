'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, ShoppingCart, FileText } from 'lucide-react';
import { useNevaraData } from '@/lib/context/NevaraDataContext';
import Card from '@/components/Card';
import { COLORS } from '@/lib/utils/colors';
import { money } from '@/lib/utils/format';
import { btnPrimary, btnGhost } from '@/lib/utils/styles';

export default function ResumenPage() {
  const router = useRouter();
  const { products, clients, sales } = useNevaraData();

  const ventasCompletas = sales.filter((s) => s.paymentStatus == 'Pagado');
  const ventasParciales = sales.filter((s) => s.paymentStatus == 'Parcial');

  const lowStock = products.filter((p) => p.stock <= 2);
  const totalStock = products.reduce((a, p) => a + p.stock, 0);
  const totalVentas = ventasCompletas.reduce((a, s) => a + s.total, 0);
  const totalVentasP = ventasParciales.reduce((a, s) => a + s.amountPaid, 0);
  const pendientes = sales.filter((s) => s.paymentStatus === 'Pendiente');
  const pendienteTotal = pendientes.reduce((a, s) => a + s.total, 0);
  const inventarioValor = products.reduce((a, p) => a + p.stock * p.price, 0);

  const stats = [
    { label: 'Ventas registradas', value: ventasCompletas.length, sub: money(totalVentas) + ' en total' },
    { label: 'Ventas Parciales', value: ventasParciales.length, sub: money(totalVentasP) + ' en total' },
    { label: 'Por cobrar', value: pendientes.length, sub: money(pendienteTotal), warn: pendientes.length > 0 },
    { label: 'Unidades en stock', value: totalStock, sub: money(inventarioValor) + ' en inventario' },
    { label: 'Clientes', value: clients.length, sub: 'registrados' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <Card key={i} style={{ padding: 18 }}>
            <div style={{ fontSize: 12, color: COLORS.inkSoft, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontSize: 30, fontFamily: 'Georgia, serif', color: s.warn ? COLORS.danger : COLORS.mauveDark, margin: '6px 0' }}>
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: COLORS.inkSoft }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {lowStock.length > 0 && (
        <Card style={{ padding: 18, marginBottom: 24, borderColor: COLORS.gold }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <AlertTriangle size={18} color={COLORS.gold} />
            <strong style={{ color: COLORS.mauveDark }}>Stock bajo — considera reponer pronto</strong>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {lowStock.map((p) => (
              <span key={p.id} style={{ background: COLORS.pinkSoft, color: COLORS.mauveDark, padding: '6px 12px', borderRadius: 999, fontSize: 13 }}>
                {p.name} · quedan {p.stock}
              </span>
            ))}
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', gap: 14 }}>
        <button onClick={() => router.push('/venta')} style={btnPrimary}>
          <ShoppingCart size={16} /> Registrar nueva venta
        </button>
        <button onClick={() => router.push('/historial')} style={btnGhost}>
          <FileText size={16} /> Ver facturas anteriores
        </button>
      </div>
    </div>
  );
}
