import { money, fmtDate } from '@/lib/utils/format';
import { COLORS } from '@/lib/utils/colors';

// Envía la factura por correo usando EmailJS, tal como en la versión original,
// pero leyendo las credenciales desde variables de entorno de Vercel en vez
// de una tabla editable en la UI.
export async function sendInvoiceEmail(sale, clientEmail) {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error('CONFIG_MISSING');
  }
  if (!clientEmail) {
    throw new Error('EMAIL_MISSING');
  }

  const itemsHtml = sale.items
    .map(
      (it) => `
    <tr style="border-bottom: 1px solid ${COLORS.snowWarm};">
      <td style="padding: 10px 0px;">${it.name}</td>
      <td style="padding: 10px 0px; text-align: center;">${it.qty}</td>
      <td style="padding: 10px 0px; text-align: right;">${money(it.price)}</td>
      <td style="padding: 10px 0px; text-align: right;">${money(it.qty * it.price)}</td>
    </tr>`
    )
    .join('');

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      to_email: clientEmail,
      to_name: sale.client,
      invoice_number: sale.invoiceNumber,
      invoice_date: fmtDate(sale.date),
      items_text: itemsHtml,
      total: money(sale.total),
      payment_status: sale.paymentStatus + (sale.paymentMethod ? ' · ' + sale.paymentMethod : ''),
      business_name: 'Nevara Beauty Makeup',
    },
  };

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'EMAILJS_ERROR');
  }
  return true;
}
