import { supabase } from '@/lib/supabase/client';

const mapClient = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email || '',
});

export const clientsService = {
  async list() {
    const { data, error } = await supabase.from('clients').select('*').order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapClient);
  },

  async add({ name, email }) {
    const { data, error } = await supabase
      .from('clients')
      .insert([{ name, email: email || null }])
      .select()
      .single();
    if (error) throw error;
    return mapClient(data);
  },

  async updateEmail(id, email) {
    const { error } = await supabase.from('clients').update({ email: email || null }).eq('id', id);
    if (error) throw error;
  },

  async updateName(id, name) {
    const { error } = await supabase.from('clients').update({ name: name || null }).eq('id', id);
    if (error) throw error;
  },

  // Busca un cliente por nombre exacto; si no existe, lo crea.
  // Si existe y llega un email nuevo, lo actualiza.
  // Se usa al registrar una venta, igual que en la versión original.
  async upsertByName({ name, email }) {
    const { data: existing, error: findError } = await supabase
      .from('clients')
      .select('*')
      .eq('name', name)
      .maybeSingle();
    if (findError) throw findError;

    if (existing) {
      if (email && email !== existing.email) {
        await clientsService.updateEmail(existing.id, email);
        return mapClient({ ...existing, email });
      }
      return mapClient(existing);
    }

    return clientsService.add({ name, email });
  },
};
