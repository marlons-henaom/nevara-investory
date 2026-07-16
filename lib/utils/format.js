export const money = (n) => '$ ' + Math.round(n || 0).toLocaleString('es-CO');

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
};
