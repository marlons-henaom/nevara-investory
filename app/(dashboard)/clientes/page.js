'use client';

import { useState } from 'react';
import { Users, Plus, Mail } from 'lucide-react';
import { useNevaraData } from '@/lib/context/NevaraDataContext';
import { useNotice } from '@/lib/hooks/useNotice';
import Card from '@/components/Card';
import SectionTitle from '@/components/SectionTitle';
import Notice from '@/components/Notice';
import { COLORS } from '@/lib/utils/colors';
import { inputStyle, btnPrimary } from '@/lib/utils/styles';
import { clientsService } from '@/lib/services/clientsService';

export default function ClientesPage() {
  const { clients, sales, refresh } = useNevaraData();
  const { notice, showNotice } = useNotice();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const addClient = async () => {
    if (!name.trim()) return;
    if (clients.some((c) => c.name === name.trim())) {
      showNotice('Ese cliente ya existe', 'error');
      return;
    }
    try {
      await clientsService.add({ name: name.trim(), email: email.trim() });
      await refresh();
      setName('');
      setEmail('');
      showNotice('Cliente agregado');
    } catch (e) {
      showNotice('No se pudo agregar el cliente', 'error');
    }
  };

  const updateName = async (client, newName) => {
    try {
      await clientsService.updateName(client.id, newName);
      await refresh();
    } catch (e) {
      showNotice('No se pudo actualizar el correo', 'error');
    }
  };

  const updateEmail = async (client, newEmail) => {
    try {
      await clientsService.updateEmail(client.id, newEmail);
      await refresh();
    } catch (e) {
      showNotice('No se pudo actualizar el correo', 'error');
    }
  };

  return (
    <Card style={{ padding: 22 }}>
      <Notice notice={notice} />
      <SectionTitle icon={Users}>Clientes</SectionTitle>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <input placeholder="Nombre del nuevo cliente" value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        <input placeholder="Correo (opcional)" value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        <button onClick={addClient} style={btnPrimary}>
          <Plus size={16} /> Agregar
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {clients.map((c) => {
          const count = sales.filter((s) => s.client_id === c.id).length;
          return (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: `1px solid ${COLORS.pink}`, borderRadius: 10, fontSize: 14 }}>
              <div style={{ flex: 1 }}>
                <input
                  placeholder="Nombre Cliente"
                  defaultValue={c.name || ''}
                  onBlur={(e) => {
                    if (e.target.value !== (c.name || '')) updateName(c, e.target.value);
                  }}
                  style={{ ...inputStyle, width: 220 }}
                />
                <span style={{ color: COLORS.inkSoft, fontSize: 12 }}>· {count} compra{count !== 1 ? 's' : ''}</span>
              </div>
              <Mail size={14} color={COLORS.inkSoft} />
              <input
                placeholder="correo@cliente.com"
                defaultValue={c.email || ''}
                onBlur={(e) => {
                  if (e.target.value !== (c.email || '')) updateEmail(c, e.target.value);
                }}
                style={{ ...inputStyle, width: 220 }}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
