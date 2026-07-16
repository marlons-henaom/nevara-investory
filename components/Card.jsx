'use client';

import { COLORS } from '@/lib/utils/colors';

export default function Card({ children, style }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        border: `1px solid ${COLORS.pink}`,
        boxShadow: '0 2px 10px rgba(138,100,132,0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
