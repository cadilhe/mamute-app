'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { disciplines as disciplinesApi } from '../lib/api';
import { DISCIPLINES as FALLBACK } from '../lib/constants';

const DisciplineContext = createContext(null);

export function DisciplineProvider({ children }) {
  const [disciplines, setDisciplines] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await disciplinesApi.list();
    if (data && data.length > 0) {
      const map = {};
      data.forEach(d => {
        map[d.key] = { label: d.label, color: d.color, bg: d.bg_color, id: d.id };
      });
      setDisciplines(map);
    } else {
      setDisciplines(FALLBACK);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <DisciplineContext.Provider value={{ disciplines, loading, refetch: fetch }}>
      {children}
    </DisciplineContext.Provider>
  );
}

export function useDisciplines() {
  const ctx = useContext(DisciplineContext);
  if (!ctx) {
    return { disciplines: null, loading: false, refetch: () => {} };
  }
  return ctx;
}

export function useDisciplineList() {
  const ctx = useContext(DisciplineContext);
  if (!ctx || !ctx.disciplines) {
    return [];
  }
  return Object.entries(ctx.disciplines).map(([key, val]) => ({ key, ...val }));
}
