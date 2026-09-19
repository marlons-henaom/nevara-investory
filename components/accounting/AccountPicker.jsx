'use client';

import { inputStyle } from '@/lib/utils/styles';

// Select puro de cuentas activas: recibe la lista ya cargada por la página
// (accountingService.accounts.list) para evitar refetch por cada fila de un
// formulario con varias líneas.
export default function AccountPicker({ accounts, value, onChange, style, placeholder = 'Selecciona una cuenta…' }) {
  const active = accounts.filter((a) => a.isActive);

  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, ...style }}>
      <option value="" disabled>
        {placeholder}
      </option>
      {active.map((a) => (
        <option key={a.id} value={a.id}>
          {a.code} — {a.name}
        </option>
      ))}
    </select>
  );
}
