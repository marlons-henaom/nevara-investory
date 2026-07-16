'use client';

import { COLORS } from '@/lib/utils/colors';

export default function SectionTitle({ children, icon: Icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      {Icon && <Icon size={18} color={COLORS.gold} />}
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: COLORS.mauveDark, margin: 0 }}>
        {children}
      </h2>
    </div>
  );
}
