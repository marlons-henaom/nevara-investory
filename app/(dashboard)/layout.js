'use client';

import AuthGuard from '@/components/AuthGuard';
import { NevaraDataProvider, useNevaraData } from '@/lib/context/NevaraDataContext';
import Header from '@/components/Header';
import TabsNav from '@/components/TabsNav';
import { COLORS } from '@/lib/utils/colors';

function DashboardShell({ children }) {
  const { products, loading, error } = useNevaraData();
  const lowStock = products.filter((p) => p.stock <= 2);

  return (
    <div
      style={{
        background: COLORS.snow,
        minHeight: '100vh',
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        color: COLORS.ink,
      }}
    >
      <Header lowStock={lowStock} />
      <TabsNav />

      {error && (
        <div style={{ margin: '14px 28px 0', padding: '12px 16px', borderRadius: 10, background: '#FBEAEA', color: COLORS.danger, fontSize: 14 }}>
          No se pudieron cargar los datos: {error}
        </div>
      )}

      <div style={{ padding: 28 }}>
        {loading ? (
          <div style={{ color: COLORS.inkSoft, fontFamily: 'Georgia, serif' }}>Cargando datos…</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <NevaraDataProvider>
        <DashboardShell>{children}</DashboardShell>
      </NevaraDataProvider>
    </AuthGuard>
  );
}
