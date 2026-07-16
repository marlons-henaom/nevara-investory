import { supabase } from '@/lib/supabase/client';

// Convierte una fila de `sales` (con sale_items anidados) al shape de la UI.
const mapSale = (row) => ({
  id: row.id || row.sale_id,
  invoiceNumber: row.invoice_number,
  date: row.sale_date,
  client_id: row.client_id,
  client: row.client_name,
  clientEmail: row.client_email || '',
  total: row.total,
  paymentStatus: row.payment_status,
  paymentMethod: row.payment_method || '',
  items: (row.sale_items || []).map((it) => ({
    id: it.product_id,
    name: it.name,
    qty: it.qty,
    price: it.price,
  })),
});

export const salesService = {
  async list() {
    const { data, error } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapSale);
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return mapSale(data);
  },

  // Operación atómica: genera el número de factura, valida y descuenta stock,
  // e inserta la venta + sus ítems. Todo corre en la función `create_sale`
  // de Postgres (RPC), vía la misma REST API con el mismo apikey.
  async create({ clientName, clientId, clientEmail, paymentStatus, paymentMethod, items }) {
    const { data, error } = await supabase.rpc('create_sale', {
      p_client_name: clientName,
      p_client_id: clientId || null,
      p_client_email: clientEmail || null,
      p_payment_status: paymentStatus,
      p_payment_method: paymentMethod || null,
      p_items: items.map((it) => ({
        product_id: it.id || null,
        name: it.name,
        qty: it.qty,
        price: it.price,
      })),
    });
    if (error) throw error;

    const created = Array.isArray(data) ? data[0] : data;
    return salesService.getById(created.id);
  },

  async anular({ p_sale_id }) {
    const { data, error } = await supabase.rpc('cancel_sale', {
      p_sale_id: p_sale_id,
    });
    if (error) throw error;

    return salesService.getById(p_sale_id);
  },

  async anular({ p_sale_id }) {
    const { data, error } = await supabase.rpc('cancel_sale', {
      p_sale_id: p_sale_id,
    });
    if (error) throw error;

    return salesService.getById(p_sale_id);
  },

  async updatePayedStatus({id, paymentMethod}) { 
    const { error } = await supabase
        .from('sales')
        .update({ payment_status: 'Pagado', payment_method: paymentMethod })
        .eq('id', id);

    if (error) throw error;

    return salesService.getById(id);
  }
};
