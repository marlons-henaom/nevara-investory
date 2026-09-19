'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { accountingService } from '@/lib/services/accountingService';

const AccountingContext = createContext(null);

// Resuelve la organización contable del usuario actual (accounting.organization_members)
// una sola vez por sesión del módulo /contabilidad, y la expone a todas sus páginas.
export function AccountingProvider({ children }) {
  const [memberships, setMemberships] = useState([]);
  const [organizationId, setOrganizationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await accountingService.organizations.listMemberships();
        setMemberships(list);
        if (list.length === 1) setOrganizationId(list[0].organizationId);
      } catch (e) {
        setError(e.message || 'No se pudo cargar la organización contable');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = { memberships, organizationId, setOrganizationId, loading, error };

  return <AccountingContext.Provider value={value}>{children}</AccountingContext.Provider>;
}

export function useAccounting() {
  const ctx = useContext(AccountingContext);
  if (!ctx) throw new Error('useAccounting debe usarse dentro de AccountingProvider');
  return ctx;
}
