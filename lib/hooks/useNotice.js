'use client';

import { useCallback, useRef, useState } from 'react';

// Pequeño hook reutilizable para mostrar avisos temporales (éxito/error)
// en cualquier página, igual que el `showNotice` del componente original.
export function useNotice() {
  const [notice, setNotice] = useState(null);
  const timer = useRef(null);

  const showNotice = useCallback((text, kind = 'success') => {
    setNotice({ text, kind });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 3800);
  }, []);

  return { notice, showNotice };
}
