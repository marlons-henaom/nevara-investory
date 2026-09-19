import { supabase } from '@/lib/supabase/client';

// Convierte una fila de la tabla `products` al shape que usa la UI.
const mapProduct = (row) => ({
  id: row.id,
  name: row.name,
  price: row.price,
  stock: row.stock,
});

export const productsService = {
  async list() {
    const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapProduct);
  },

  async add({ name, price, stock }) {
    const { data, error } = await supabase
      .from('products')
      .insert([{ name, price, stock: stock || 0 }])
      .select()
      .single();
    if (error) throw error;
    return mapProduct(data);
  },

  async updatePrice(id, price) {
    const { error } = await supabase.from('products').update({ price }).eq('id', id);
    if (error) throw error;
  },

  async updateStock(id, stock) {
    const { error } = await supabase.from('products').update({ stock }).eq('id', id);
    if (error) throw error;
  },

  // Actualiza precio y stock juntos en una sola sentencia UPDATE (una sola
  // transacción), para que el inventario no quede en un estado a medio
  // guardar si algo falla entre los dos campos.
  async update(id, { price, stock }) {
    const { data, error } = await supabase.from('products').update({ price, stock }).eq('id', id).select().single();
    if (error) throw error;
    return mapProduct(data);
  },
};
