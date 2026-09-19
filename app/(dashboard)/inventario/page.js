'use client';

import { useRef, useState } from 'react';
import { Package, Plus, Save } from 'lucide-react';
import { useNevaraData } from '@/lib/context/NevaraDataContext';
import { useNotice } from '@/lib/hooks/useNotice';
import Card from '@/components/Card';
import SectionTitle from '@/components/SectionTitle';
import Notice from '@/components/Notice';
import { COLORS } from '@/lib/utils/colors';
import { inputStyle, btnPrimary } from '@/lib/utils/styles';
import { productsService } from '@/lib/services/productsService';

export default function InventarioPage() {
  const { products, refresh } = useNevaraData();
  const { notice, showNotice } = useNotice();

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [busyId, setBusyId] = useState(null);
  const priceRefs = useRef({});
  const stockRefs = useRef({});

  // Guarda precio y stock juntos, en una sola llamada al servicio (una sola
  // sentencia UPDATE), para que nunca queden desincronizados entre sí.
  const saveRow = async (product) => {
    const price = Math.max(0, parseInt(priceRefs.current[product.id]?.value, 10) || 0);
    const stock = Math.max(0, parseInt(stockRefs.current[product.id]?.value, 10) || 0);
    if (price === product.price && stock === product.stock) return;

    setBusyId(product.id);
    try {
      await productsService.update(product.id, { price, stock });
      await refresh();
      showNotice(`${product.name} actualizado`);
    } catch (e) {
      showNotice('No se pudo actualizar el producto', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const addProduct = async () => {
    if (!newName.trim() || !newPrice) {
      showNotice('Escribe el nombre y el precio del producto', 'error');
      return;
    }
    try {
      const created = await productsService.add({
        name: newName.trim(),
        price: parseInt(newPrice),
        stock: parseInt(newStock) || 0,
      });
      await refresh();
      setNewName('');
      setNewPrice('');
      setNewStock('');
      showNotice(`${created.name} agregado al inventario`);
    } catch (e) {
      showNotice('No se pudo agregar el producto', 'error');
    }
  };

  return (
    <div>
      <Notice notice={notice} />
      <Card style={{ padding: 22, marginBottom: 20, marginTop: notice ? 20 : 0 }}>
        <SectionTitle icon={Package}>Inventario</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 12, padding: '8px 16px', fontSize: 12, color: COLORS.inkSoft, textTransform: 'uppercase' }}>
            <div style={{ flex: 1 }}>Producto</div>
            <div style={{ width: 110 }}>Precio</div>
            <div style={{ width: 90, textAlign: 'center' }}>Stock</div>
            <div style={{ width: 110 }} />
          </div>
          {products.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', border: `1px solid ${COLORS.pink}`, borderRadius: 10 }}>
              <div style={{ flex: 1, fontSize: 14 }}>{p.name}</div>
              <input
                key={`${p.id}-price-${p.price}`}
                ref={(el) => (priceRefs.current[p.id] = el)}
                type="number"
                defaultValue={p.price}
                disabled={busyId === p.id}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveRow(p);
                }}
                style={{ ...inputStyle, width: 110 }}
              />
              <input
                key={`${p.id}-stock-${p.stock}`}
                ref={(el) => (stockRefs.current[p.id] = el)}
                type="number"
                defaultValue={p.stock}
                disabled={busyId === p.id}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveRow(p);
                }}
                style={{
                  ...inputStyle,
                  width: 90,
                  textAlign: 'center',
                  fontWeight: 600,
                  color: p.stock <= 2 ? COLORS.danger : COLORS.ink,
                }}
              />
              <button onClick={() => saveRow(p)} disabled={busyId === p.id} style={{ ...btnPrimary, width: 110, opacity: busyId === p.id ? 0.6 : 1 }}>
                <Save size={14} /> {busyId === p.id ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 22 }}>
        <SectionTitle icon={Plus}>Agregar producto nuevo</SectionTitle>
        <div style={{ display: 'flex', gap: 10 }}>
          <input placeholder="Nombre del producto" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <input placeholder="Precio" type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} style={{ ...inputStyle, width: 120 }} />
          <input placeholder="Stock inicial" type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} style={{ ...inputStyle, width: 120 }} />
          <button onClick={addProduct} style={btnPrimary}>
            <Plus size={16} /> Agregar
          </button>
        </div>
      </Card>
    </div>
  );
}
