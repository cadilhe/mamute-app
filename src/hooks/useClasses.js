'use client';

import { useState, useEffect, useCallback } from 'react';
import { classes as classesApi } from '../lib/api';

export function useClassesByStudent(studentId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    const { data: result } = await classesApi.listByStudent(studentId);
    setData(result || []);
    setLoading(false);
  }, [studentId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useTodayClasses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    classesApi.listToday().then(({ data: result }) => {
      setData(result || []);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}
