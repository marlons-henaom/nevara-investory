'use client';

import { useState } from 'react';
import { Package, Plus, Minus } from 'lucide-react';
import { useNevaraData } from '@/lib/context/NevaraDataContext';
import { useNotice } from '@/lib/hooks/useNotice';
import Card from '@/components/Card';
import SectionTitle from '@/components/SectionTitle';
import Notice from '@/components/Notice';
import { COLORS } from '@/lib/utils/colors';
import { inputStyle, btnPrimary, iconBtn } from '@/lib/utils/styles';
import { productsService } from '@/lib/services/productsService';

export default function InventarioPage() {
  const { products, refresh } = useNevaraData();
  const { notice, showNotice } = useNotice();

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [busyId, setBusyId] = useState(null);

  const changeStock = async (product, delta) => {
    const newStockValue = Math.max(0, product.stock + delta);
    setBusyId(product.id);
    try {
      await productsService.updateStock(product.id, newStockValue);
      await refresh();
    } catch (e) {
      showNotice('No se pudo actualizar el stock', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const changePrice = async (product, price) => {
    try {
      await productsService.updatePrice(product.id, price);
      await refresh();
    } catch (e) {
      showNotice('No se pudo actualizar el precio', 'error');
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
            <div style={{ width: 130 }}>Precio</div>
            <div style={{ width: 160, textAlign: 'center' }}>Stock</div>
          </div>
          {products.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', border: `1px solid ${COLORS.pink}`, borderRadius: 10 }}>
              <div style={{ flex: 1, fontSize: 14 }}>{p.name}</div>
              <input
                type="number"
                defaultValue={p.price}
                onBlur={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  if (val !== p.price) changePrice(p, val);
                }}
                style={{ ...inputStyle, width: 110 }}
              />
              <div style={{ width: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <button onClick={() => changeStock(p, -1)} disabled={busyId === p.id} style={iconBtn}>
                  <Minus size={13} />
                </button>
                <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600, color: p.stock <= 2 ? COLORS.danger : COLORS.ink }}>{p.stock}</span>
                <button onClick={() => changeStock(p, 1)} disabled={busyId === p.id} style={iconBtn}>
                  <Plus size={13} />
                </button>
              </div>
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
