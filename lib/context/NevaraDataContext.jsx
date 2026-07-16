'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { productsService } from '@/lib/services/productsService';
import { clientsService } from '@/lib/services/clientsService';
import { salesService } from '@/lib/services/salesService';

const NevaraDataContext = createContext(null);

// Carga products/clients/sales una vez (al entrar al dashboard) y expone
// un refresh() para volver a pedirlos después de cualquier mutación.
// Sigue el mismo espíritu del `data`/`setData` original, pero cada
// mutación real pasa por un servicio -> Supabase, no por estado local puro.
export function NevaraDataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [p, c, s] = await Promise.all([
        productsService.list(),
        clientsService.list(),
        salesService.list(),
      ]);
      setProducts(p);
      setClients(c);
      setSales(s);
    } catch (e) {
      setError(e.message || 'Error cargando los datos');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const value = { products, clients, sales, loading, error, refresh };

  return <NevaraDataContext.Provider value={value}>{children}</NevaraDataContext.Provider>;
}

export function useNevaraData() {
  const ctx = useContext(NevaraDataContext);
  if (!ctx) throw new Error('useNevaraData debe usarse dentro de NevaraDataProvider');
  return ctx;
}
