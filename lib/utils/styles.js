import { COLORS } from './colors';

export const btnPrimary = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '5px',
  background: COLORS.gold,
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

export const btnDanger = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '5px',
  background: COLORS.danger,
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

export const btnSuccess = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '5px',
  background: COLORS.success,
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

export const btnGhost = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '5px',
  background: '#fff',
  color: COLORS.mauveDark,
  border: `1px solid ${COLORS.mauve}`,
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

export const labelStyle = {
  fontSize: 12,
  color: COLORS.inkSoft,
  textTransform: 'uppercase',
  letterSpacing: 1,
  marginBottom: 6,
  display: 'block',
};

export const inputStyle = {
  padding: '10px 12px',
  borderRadius: 8,
  border: `1px solid ${COLORS.pink}`,
  fontSize: 14,
  outline: 'none',
  color: COLORS.ink,
  background: '#fff',
};

export const iconBtn = {
  width: 26,
  height: 26,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: COLORS.snowWarm,
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  color: COLORS.mauveDark,
};
