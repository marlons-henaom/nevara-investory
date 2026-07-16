'use client';

import { Check } from 'lucide-react';
import { COLORS } from '@/lib/utils/colors';

export default function Notice({ notice }) {
  if (!notice) return null;
  return (
    <div
      id="no-print"
      style={{
        margin: '14px 28px 0',
        padding: '12px 16px',
        borderRadius: 10,
        background: notice.kind === 'success' ? '#EAF4EC' : '#FBEAEA',
        color: notice.kind === 'success' ? '#3D7A4A' : COLORS.danger,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 14,
      }}
    >
      <Check size={16} /> {notice.text}
    </div>
  );
}
