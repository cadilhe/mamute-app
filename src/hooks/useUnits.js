'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { units as unitsApi } from '../lib/api';

const UnitContext = createContext(null);

export function UnitProvider({ children }) {
  const { profile } = useAuth();
  const [units, setUnits] = useState([]);
  const [activeUnitId, setActiveUnitId] = useState('all');
  const [loading, setLoading] = useState(false);

  // Carregar lista de unidades do banco (apenas se professor)
  const fetchUnits = useCallback(async () => {
    if (!profile || profile.role !== 'teacher') return;
    try {
      setLoading(true);
      const { data, error } = await unitsApi.list();
      if (error) throw error;
      setUnits(data || []);
    } catch (err) {
      console.error('Erro ao carregar unidades:', err.message);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  // Sincronizar unidade ativa com o perfil do professor logado
  useEffect(() => {
    if (profile) {
      if (profile.role === 'teacher' && profile.unit_id) {
        // Professor associado a uma unidade específica
        setActiveUnitId(profile.unit_id);
      } else {
        // Administrador global ou Responsável
        setActiveUnitId('all');
      }
    } else {
      setActiveUnitId('all');
    }
  }, [profile]);

  // Modificar a unidade ativa (apenas se for admin/global)
  const changeActiveUnit = useCallback((unitId) => {
    if (profile?.role === 'teacher' && profile.unit_id) {
      // Impede alteração se for professor de unidade fixa
      return;
    }
    setActiveUnitId(unitId);
  }, [profile]);

  // Obter o objeto da unidade ativa (caso queira exibir o nome)
  const activeUnit = units.find(u => u.id === activeUnitId) || null;

  return (
    <UnitContext.Provider
      value={{
        units,
        activeUnitId,
        activeUnit,
        setActiveUnitId: changeActiveUnit,
        loading,
        refresh: fetchUnits
      }}
    >
      {children}
    </UnitContext.Provider>
  );
}

export function useUnits() {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnits deve ser usado dentro de um UnitProvider');
  }
  return context;
}
