'use client';

import { useState } from 'react';
import { Check, Trash2, Mail, Printer, X } from 'lucide-react';
import { COLORS } from '@/lib/utils/colors';
import { money, fmtDate } from '@/lib/utils/format';
import { btnSuccess, btnPrimary, btnDanger, btnGhost, inputStyle, labelStyle, iconBtn } from '@/lib/utils/styles';
import { sendInvoiceEmail } from '@/lib/services/emailService';
import { clientsService } from '@/lib/services/clientsService';
import { salesService } from '@/lib/services/salesService';

const handlePrint = () => {
  const printContents = document.getElementById('invoice-print').innerHTML;
  const win = window.open('', '', 'width=900,height=700');
  win.document.write(`
    <html>
      <head>
        <title>Factura</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; }
          th { border-bottom: 2px solid #ddd; }
          tr { border-bottom: 1px solid #eee; }
        </style>
      </head>
      <body>${printContents}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
};

export default function InvoiceModal({ sale, clients, showNotice, onClose, onClientEmailUpdated }) {
  const clientRecord = clients.find((c) => c.name === sale.client);
  const [email, setEmail] = useState(sale.clientEmail || clientRecord?.email || '');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const cancel_sale_status = sale.paymentStatus == 'Anulada';
  const [paymentMethod, setPaymentMethod] = useState('Nequi');

  const cancelSale = async () => {
    if(!confirm("¿Estas seguro/a de anular la factura?")){
      return;
    }
    
    try {
      const saleRecord = await salesService.anular({
        p_sale_id: sale.id
      });

      await onClientEmailUpdated();
      showNotice(`Venta Anulada - Factura ${saleRecord.invoiceNumber}`);
    } catch (e) {
      showNotice(e.message || 'No se pudo registrar la venta', 'error');
    } finally{
      onClose();
    }
  };

  const paySale = async () => {
    if(!confirm("¿Estas seguro/a de pagar la factura?")){
      return;
    }
    
    try {
      const saleRecord = await salesService.updatePayedStatus({
        id: sale.id,
        paymentMethod: paymentMethod
      });

      await onClientEmailUpdated();
      showNotice(`Venta Paga - Factura ${saleRecord.invoiceNumber}`);
    } catch (e) {
      showNotice(e.message || 'No se pudo registrar la venta', 'error');
    } finally{
      onClose();
    }
  };

  const handleSend = async () => {
    if (!confirm('¿Estás seguro de enviar la factura mediante correo?')){
      return;
    }
    if (!email.trim()) {
      showNotice('Escribe el correo del cliente para poder enviarle la factura', 'error');
      return;
    }
    setSending(true);
    try {
      await sendInvoiceEmail(sale, email.trim());
      setSent(true);
      showNotice(`Factura enviada por correo a ${email.trim()}`);
      if (clientRecord && email.trim() !== clientRecord.email) {
        await clientsService.updateEmail(clientRecord.id, email.trim());
        onClientEmailUpdated?.();
      }
    } catch (e) {
      if (e.message === 'CONFIG_MISSING') {
        showNotice('Falta configurar EmailJS en las variables de entorno del proyecto.', 'error');
      } else {
        showNotice('No se pudo enviar el correo. Revisa la configuraciÃ³n de EmailJS.', 'error');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(74,58,68,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: 560, maxHeight: '90vh', overflow: 'auto', position: 'relative' }}>
        <div id="no-print" style={{ padding: '14px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 10 }}> 
            {sale.paymentStatus === 'Pendiente' && (
              <>
                <label style={labelStyle}>MÃ©todo de pago</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ ...inputStyle }}>
                  {['Nequi', 'Efectivo', 'Transferencia', 'Daviplata', 'Otro'].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <button onClick={paySale} style={btnSuccess}>
                  <Check size={15} /> Pagar
                </button>
              </>
            )}
            {sale.paymentStatus !== 'Anulada' && (
              <>
                <button onClick={cancelSale} style={btnDanger}>
                  <Trash2 size={15} /> Anular
                </button>
              </>
            )}
            <button onClick={onClose} style={iconBtn}>
              <X size={15} />
            </button>
          </div>
          {sale.paymentStatus !== 'Anulada' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 10 }}> 
                <button disabled={cancel_sale_status} onClick={handlePrint} style={btnPrimary}>
                  <Printer size={15} /> Imprimir / Guardar PDF
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: COLORS.snowWarm, padding: 10, borderRadius: 10 }}>
                <Mail size={15} color={COLORS.mauveDark} />
                <input
                  disabled={cancel_sale_status}
                  placeholder="correo@cliente.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ ...inputStyle, flex: 1, background: '#fff' }}
                />
                <button onClick={handleSend} disabled={sending | cancel_sale_status} style={{ ...btnGhost, opacity: sending ? 0.6 : 1 }}>
                  <Mail size={15} />
                  {sending ? 'Enviandoâ¦' : sent ? 'Reenviar' : 'Enviar factura'}
                </button>
              </div>
            </>
          )}
        </div>

        <div id="invoice-print" style={{ padding: '20px 40px 40px', fontFamily: 'Georgia, serif', color: COLORS.ink }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: `3px solid ${COLORS.gold}`, paddingBottom: 18, marginBottom: 24 }}>
            <img src="/PROFILE-INSTAGRAM-NEVARA.png" alt="Nevara" style={{ width: 60, height: 60 }} />
            <div>
              <div style={{ fontSize: 26, color: COLORS.mauveDark }}>Nevara</div>
              <div style={{ fontSize: 11, letterSpacing: 3, color: COLORS.gold }}>BEAUTY MAKEUP</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: COLORS.inkSoft, textTransform: 'uppercase', letterSpacing: 1 }}>Factura</div>
              <div style={{ fontSize: 20, color: COLORS.gold, fontWeight: 700 }}>{sale.invoiceNumber}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontFamily: 'Arial, sans-serif', fontSize: 14 }}>
            <div>
              <div style={{ color: COLORS.inkSoft, fontSize: 11, textTransform: 'uppercase' }}>Cliente</div>
              <div style={{ fontSize: 16 }}>{sale.client}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: COLORS.inkSoft, fontSize: 11, textTransform: 'uppercase' }}>Fecha</div>
              <div style={{ fontSize: 16 }}>{fmtDate(sale.date)}</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif', fontSize: 14, marginBottom: 20 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLORS.pink}`, textAlign: 'left' }}>
                <th style={{ padding: '8px 0' }}>Producto</th>
                <th style={{ padding: '8px 0', textAlign: 'center' }}>Cant.</th>
                <th style={{ padding: '8px 0', textAlign: 'right' }}>Precio</th>
                <th style={{ padding: '8px 0', textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((it, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${COLORS.snowWarm}` }}>
                  <td style={{ padding: '10px 0' }}>{it.name}</td>
                  <td style={{ padding: '10px 0', textAlign: 'center' }}>{it.qty}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right' }}>{money(it.price)}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right' }}>{money(it.qty * it.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            <div style={{ width: 220 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, borderTop: `2px solid ${COLORS.gold}`, paddingTop: 10 }}>
                <span>Total</span>
                <strong style={{ color: COLORS.gold }}>{money(sale.total)}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, fontFamily: 'Arial, sans-serif', fontSize: 12 }}>
            <span
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                background: sale.paymentStatus === 'Pagado' ? '#EAF4EC' : '#FBEAEA',
                color: sale.paymentStatus === 'Pagado' ? '#3D7A4A' : COLORS.danger,
              }}
            >
              {sale.paymentStatus}
              {sale.paymentMethod ? ' Â· ' + sale.paymentMethod : ''}
            </span>
          </div>

          <div style={{ marginTop: 30, textAlign: 'center', fontSize: 12, color: COLORS.inkSoft, fontFamily: 'Arial, sans-serif' }}>
            Gracias por tu compra!
            <br/>
            Siguenos en nuestras redes sociales
            <br />
            <div>
              <a href="https://www.instagram.com/nevara_oficial" target="_blank">
                <svg xmlns="http://w3.org" width="50" height="50" viewBox="0 0 100 100">
                  <svg xmlns="http://w3.org" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <circle cx="12" cy="12" r="4"></circle>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@nevara293" target="_blank">
                <svg xmlns="http://w3.org" width="50" height="50" viewBox="0 0 100 100">
                  <svg xmlns="http://w3.org" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                  </svg>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
