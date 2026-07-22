'use client';

import { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { ShoppingCart, FileText, Plus, Minus, Trash2, Mail } from 'lucide-react';
import { useNevaraData } from '@/lib/context/NevaraDataContext';
import { useNotice } from '@/lib/hooks/useNotice';
import Card from '@/components/Card';
import SectionTitle from '@/components/SectionTitle';
import Notice from '@/components/Notice';
import InvoiceModal from '@/components/InvoiceModal';
import { COLORS } from '@/lib/utils/colors';
import { money } from '@/lib/utils/format';
import { btnPrimary, btnGhost, inputStyle, labelStyle, iconBtn } from '@/lib/utils/styles';
import { salesService } from '@/lib/services/salesService';
import { clientsService } from '@/lib/services/clientsService';

export default function VentaPage() {
  const { products, clients, refresh } = useNevaraData();
  const { notice, showNotice } = useNotice();

  const [client, setClient] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [newClient, setNewClient] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState('Pagado');
  const [paymentMethod, setPaymentMethod] = useState('Nequi');
  const [montoParcial, setMontoParcial] = useState('');
  const [saving, setSaving] = useState(false);
  const [invoiceView, setInvoiceView] = useState(null);

  const availableFor = (id) => {
    const p = products.find((x) => x.id === id);
    if (!p) return 0;
    const inCart = cart.find((c) => c.id === id);
    return p.stock - (inCart ? inCart.qty : 0);
  };

  const addToCart = () => {
    const p = products.find((x) => x.id === selectedProduct);
    if (!p) return;
    const avail = availableFor(selectedProduct);
    if (qty < 1 || qty > avail) {
      showNotice(`Solo hay ${avail} unidades disponibles de ${p.name}`, 'error');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((c) => c.id === p.id);
      if (existing) {
        return prev.map((c) => (c.id === p.id ? { ...c, qty: c.qty + qty } : c));
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, qty }];
    });
    setQty(1);
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c.id !== id));

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const p = products.find((x) => x.id === id);
        const newQty = Math.max(1, Math.min(p.stock, c.qty + delta));
        return { ...c, qty: newQty };
      })
    );
  };

  const total = cart.reduce((a, c) => a + c.qty * c.price, 0);

  const finalizeSale = async () => {
    if (cart.length === 0) {
      showNotice('Agrega al menos un producto a la venta', 'error');
      return;
    }
    if (!client.trim()) {
      showNotice('Escribe o selecciona el nombre del cliente', 'error');
      return;
    }

    const abono = parseFloat(montoParcial) || 0;
    if (paymentStatus === 'Parcial') {
      if (abono <= 0) {
        showNotice('Escribe el abono inicial de la venta parcial', 'error');
        return;
      }
      if (abono >= total) {
        showNotice('El abono debe ser menor al total de la venta. Si paga el total, regístrala como Pagado', 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const clientRecord = await clientsService.upsertByName({
        name: client.trim(),
        email: clientEmail.trim(),
      });

      const sale = await salesService.create({
        clientName: client.trim(),
        clientId: clientRecord.id,
        clientEmail: clientEmail.trim(),
        paymentStatus,
        paymentMethod: paymentStatus !== 'Pendiente' ? paymentMethod : '',
        amountPaid: paymentStatus === 'Parcial' ? abono : undefined,
        items: cart,
      });

      await refresh();
      showNotice(`Venta registrada · Factura ${sale.invoiceNumber}`);
      setCart([]);
      setClient('');
      setClientEmail('');
      setMontoParcial('');
      setInvoiceView(sale);
    } catch (e) {
      showNotice(e.message || 'No se pudo registrar la venta', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24 }}>
      <Notice notice={notice} />
      <Card style={{ padding: 22 }}>
        <SectionTitle icon={ShoppingCart}>Nueva venta</SectionTitle>

        <label style={labelStyle}>Cliente</label>
        {!newClient ? (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <Dropdown
              value={client}
              onChange={(e) => {
                setClient(e.value);
                const found = clients.find((c) => c.name === e.value);
                setClientEmail(found?.email || '');
              }}
              options={clients}
              optionLabel="name"
              optionValue="name"
              filter
              filterPlaceholder="Buscar cliente…"
              placeholder="Selecciona un cliente…"
              virtualScrollerOptions={{ itemSize: 38 }}
              className="nevara-dropdown"
            />
            <button
              onClick={() => {
                setNewClient(true);
                setClient('');
                setClientEmail('');
              }}
              style={btnGhost}
            >
              Nuevo
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input placeholder="Nombre del cliente" value={client} onChange={(e) => setClient(e.target.value)} style={inputStyle} />
            <button onClick={() => setNewClient(false)} style={btnGhost}>
              Elegir existente
            </button>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Mail size={14} color={COLORS.inkSoft} />
          <input
            placeholder="correo@cliente.com (para enviarle la factura)"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>

        <label style={labelStyle}>Producto</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <Dropdown
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.value)}
            options={products}
            optionLabel="name"
            optionValue="id"
            optionDisabled={(p) => availableFor(p.id) <= 0}
            filter
            filterPlaceholder="Buscar producto…"
            placeholder="Selecciona un producto…"
            virtualScrollerOptions={{ itemSize: 38 }}
            className="nevara-dropdown"
            style={{ flex: 1 }}
            itemTemplate={(p) => (
              <span>
                {p.name} — {money(p.price)} ({availableFor(p.id)} disp.)
              </span>
            )}
          />
          <input type="number" min={1} value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 1)} style={{ ...inputStyle, width: 70 }} />
          <button onClick={addToCart} style={btnPrimary}>
            <Plus size={16} /> Agregar
          </button>
        </div>

        <div style={{ marginTop: 20 }}>
          <label style={labelStyle}>Estado de pago</label>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            {['Pagado', 'Parcial', 'Pendiente'].map((s) => (
              <button
                key={s}
                onClick={() => setPaymentStatus(s)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  fontSize: 13,
                  border: `1px solid ${paymentStatus === s ? COLORS.gold : COLORS.pink}`,
                  background: paymentStatus === s ? COLORS.pinkSoft : '#fff',
                  color: COLORS.mauveDark,
                  fontWeight: paymentStatus === s ? 600 : 400,
                }}
              >
                {s}
              </button>
            ))}
          </div>
          {(paymentStatus === 'Pagado' || paymentStatus === 'Parcial') && (
            <>
              <label style={labelStyle}>Método de pago</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }}>
                {['Nequi', 'Efectivo', 'Transferencia', 'Daviplata', 'Otro'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </>
          )}
          {paymentStatus === 'Parcial' && (
            <>
              <label style={labelStyle}>Abono inicial (debe ser menor al total)</label>
              <input
                type="number"
                min={1}
                max={total > 0 ? total - 1 : undefined}
                value={montoParcial}
                onChange={(e) => setMontoParcial(e.target.value)}
                placeholder="Ej: 20000"
                style={{ ...inputStyle, marginBottom: 14, width: '100%' }}
              />
            </>
          )}
        </div>
      </Card>

      <Card style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
        <SectionTitle icon={FileText}>Resumen de la venta</SectionTitle>
        {cart.length === 0 ? (
          <div style={{ color: COLORS.inkSoft, fontSize: 14, padding: '20px 0' }}>Aún no has agregado productos.</div>
        ) : (
          <div style={{ flex: 1 }}>
            {cart.map((c) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: `1px solid ${COLORS.snowWarm}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: COLORS.ink }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.inkSoft }}>{money(c.price)} c/u</div>
                </div>
                <button onClick={() => updateQty(c.id, -1)} style={iconBtn}>
                  <Minus size={13} />
                </button>
                <span style={{ minWidth: 20, textAlign: 'center' }}>{c.qty}</span>
                <button onClick={() => updateQty(c.id, 1)} style={iconBtn}>
                  <Plus size={13} />
                </button>
                <div style={{ minWidth: 80, textAlign: 'right', fontWeight: 600, color: COLORS.mauveDark }}>{money(c.qty * c.price)}</div>
                <button onClick={() => removeFromCart(c.id)} style={{ ...iconBtn, color: COLORS.danger }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 18,
            paddingTop: 14,
            borderTop: `2px solid ${COLORS.gold}`,
          }}
        >
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: COLORS.mauveDark }}>Total</span>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: COLORS.gold }}>{money(total)}</span>
        </div>
        <button
          onClick={finalizeSale}
          disabled={saving}
          style={{ ...btnPrimary, justifyContent: 'center', marginTop: 16, padding: '14px', opacity: saving ? 0.7 : 1 }}
        >
          <FileText size={16} /> {saving ? 'Registrando…' : 'Registrar venta y generar factura'}
        </button>
      </Card>

      {invoiceView && (
        <InvoiceModal
          sale={invoiceView}
          clients={clients}
          showNotice={showNotice}
          onClose={() => setInvoiceView(null)}
          onClientEmailUpdated={refresh}
        />
      )}
    </div>
  );
}
