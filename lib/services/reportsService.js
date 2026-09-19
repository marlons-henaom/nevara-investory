import { supabase } from '@/lib/supabase/client';

// Fuente: la vista `vw_sales_report` (public), que ya trae cliente,
// totales y saldo pendiente resueltos — este servicio solo filtra y mapea.
const mapSalesReportRow = (row) => ({
  saleId: row.sale_id,
  invoiceNumber: row.invoice_number,
  date: row.sale_date,
  clientId: row.client_id,
  clientName: row.client_name || '',
  clientEmail: row.client_email || '',
  totalToPay: Number(row.total_to_pay || 0),
  totalPaid: Number(row.total_paid || 0),
  amountDue: Number(row.amount_due || 0),
  paymentStatus: row.payment_status,
  paymentMethod: row.payment_method || '',
  createdAt: row.created_at,
});

export const reportsService = {
  sales: {
    // dateFrom/dateTo son obligatorios (validados en la UI); status es opcional.
    async list({ dateFrom, dateTo, status }) {
      let query = supabase
        .from('vw_sales_report')
        .select('*')
        .gte('sale_date', dateFrom)
        .lte('sale_date', dateTo)
        .order('sale_date', { ascending: true });
      if (status) query = query.eq('payment_status', status);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapSalesReportRow);
    },
  },
};
