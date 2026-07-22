export const COLORS = {
  snow: '#FDFBF8',
  snowWarm: '#F7F1EC',
  mauve: '#B08CA8',
  mauveDark: '#8A6484',
  pink: '#F7D1D6',
  pinkSoft: '#FBE7E9',
  gold: '#B98D4F',
  goldLight: '#D4AF7A',
  ink: '#4A3A44',
  inkSoft: '#7A6670',
  danger: '#C0605B',
  success: '#00ff22',
};

// Colores del badge de estado de pago (Pagado / Parcial / Pendiente / Anulada).
export const paymentStatusColors = (status) => {
  if (status === 'Pagado') return { background: '#EAF4EC', color: '#3D7A4A' };
  if (status === 'Parcial') return { background: '#FBF1E3', color: COLORS.gold };
  return { background: '#FBEAEA', color: COLORS.danger };
};
