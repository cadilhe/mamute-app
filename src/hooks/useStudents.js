'use client';

import { useState, useEffect, useCallback } from 'react';
import { students as studentsApi } from '../lib/api';
import { useUnits } from './useUnits';

export function useStudents() {
  const { activeUnitId } = useUnits();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: result, error: err } = await studentsApi.list(activeUnitId);
    if (err) setError(err.message);
    else setData(result || []);
    setLoading(false);
  }, [activeUnitId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useStudent(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data: result, error: err } = await studentsApi.get(id);
    if (err) setError(err.message);
    else setData(result);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
