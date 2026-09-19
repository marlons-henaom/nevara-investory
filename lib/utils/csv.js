// Utilidades genéricas para exportar filas a CSV desde el navegador.
// Un CSV es la salida más liviana posible para un reporte tabular (texto
// plano, sin librerías de spreadsheet), por eso se genera aquí en vez de
// un .xlsx/.pdf.

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

// columns: [{ label: 'Encabezado', value: (row) => row.campo }, ...]
export const toCSV = (rows, columns) => {
  const header = columns.map((c) => escapeCsvValue(c.label)).join(',');
  const lines = rows.map((row) => columns.map((c) => escapeCsvValue(c.value(row))).join(','));
  return [header, ...lines].join('\r\n');
};

// Antepone un BOM UTF-8 para que Excel muestre bien tildes/ñ, y dispara la
// descarga en el navegador (no hay backend propio que sirva el archivo).
export const downloadCSV = (filename, csvContent) => {
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
