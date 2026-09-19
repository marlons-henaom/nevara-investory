'use client';

import { AccountingProvider, useAccounting } from '@/lib/context/AccountingContext';
import AccountingSubNav from '@/components/accounting/AccountingSubNav';
import Card from '@/components/Card';
import { COLORS } from '@/lib/utils/colors';
import { inputStyle, labelStyle } from '@/lib/utils/styles';

function ContabilidadShell({ children }) {
  const { memberships, organizationId, setOrganizationId, loading, error } = useAccounting();

  if (loading) {
    return <div style={{ color: COLORS.inkSoft, fontFamily: 'Georgia, serif' }}>Cargando organización contable…</div>;
  }

  if (error) {
    return (
      <Card style={{ padding: 22 }}>
        <div style={{ color: COLORS.danger, fontSize: 14 }}>No se pudo cargar la contabilidad: {error}</div>
      </Card>
    );
  }

  if (memberships.length === 0) {
    return (
      <Card style={{ padding: 22 }}>
        <div style={{ color: COLORS.danger, fontSize: 14 }}>
          No tienes una organización contable asignada. Contacta al administrador.
        </div>
      </Card>
    );
  }

  if (!organizationId) {
    return (
      <Card style={{ padding: 22, maxWidth: 360 }}>
        <label style={labelStyle}>Selecciona una organización</label>
        <select
          defaultValue=""
          onChange={(e) => setOrganizationId(e.target.value)}
          style={{ ...inputStyle, width: '100%' }}
        >
          <option value="" disabled>
            Elige una organización…
          </option>
          {memberships.map((m) => (
            <option key={m.organizationId} value={m.organizationId}>
              {m.organizationName || m.organizationId}
            </option>
          ))}
        </select>
      </Card>
    );
  }

  return (
    <div>
      <AccountingSubNav />
      {children}
    </div>
  );
}

export default function ContabilidadLayout({ children }) {
  return (
    <AccountingProvider>
      <ContabilidadShell>{children}</ContabilidadShell>
    </AccountingProvider>
  );
}
