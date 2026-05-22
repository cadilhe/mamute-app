'use client';

import { useState, useEffect, useCallback } from 'react';
import { classes as classesApi } from '../lib/api';

export function useClassesByStudent(studentId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    const { data: result, error: err } = await classesApi.listByStudent(studentId);
    if (err) {
      setError(err.message);
      setData([]);
    } else {
      setData(result || []);
    }
    setLoading(false);
  }, [studentId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useTodayClasses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    classesApi.listToday().then(({ data: result, error: err }) => {
      if (err) {
        setError(err.message);
        setData([]);
      } else {
        setData(result || []);
      }
      setLoading(false);
    });
  }, []);

  return { data, loading, error };
}
