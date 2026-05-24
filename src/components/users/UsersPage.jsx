'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '../shared/Button';
import { Loading } from '../shared/Loading';
import { ConfirmModal } from '../shared/ConfirmModal';
import { useToast } from '../shared/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useUnits } from '@/hooks/useUnits';
import { supabase } from '@/lib/supabase';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';

export function UsersPage() {
  const toast = useToast();
  const { user: currentUser, profile: currentProfile } = useAuth();
  const { units } = useUnits();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Exclusão
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Carregar lista de usuários da API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      setUsers(json.data || []);
    } catch (err) {
      toast.error('Erro ao listar usuários: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleDeleteClick = (user) => {
    // Impedir que o super administrador logado exclua a si mesmo
    if (user.id === currentUser?.id) {
      toast.warning('Você não pode excluir sua própria conta administrativa.');
      return;
    }
    setDeleteTarget(user);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/users?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const json = await res.json();
      if (json.error) throw new Error(json.error);

      toast.success('Usuário excluído com sucesso!');
      fetchUsers();
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Erro ao excluir usuário: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Verificar acesso de super administrador na renderização
  const isSuperAdmin = currentProfile?.role === 'teacher' && currentProfile.unit_id === null;
  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center text-danger text-sm font-semibold select-none">
        Acesso restrito. Apenas o Super Administrador pode acessar esta tela.
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Usuários</h1>
          <p className="text-xs text-text-3 mt-1">
            Gerenciamento de contas de professores, administradores e responsáveis.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>+ Novo Usuário</Button>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        {users.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center select-none">
            <span className="text-4xl mb-3 text-text-3">👥</span>
            <div className="font-bold text-sm text-text-2">Nenhum usuário cadastrado</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-surface-2/30 select-none">
                  <th className="px-5 py-3 text-xs font-bold text-text-2">Nome Completo</th>
                  <th className="px-5 py-3 text-xs font-bold text-text-2">E-mail</th>
                  <th className="px-5 py-3 text-xs font-bold text-text-2">Nível</th>
                  <th className="px-5 py-3 text-xs font-bold text-text-2">Unidade</th>
                  <th className="px-5 py-3 text-xs font-bold text-text-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {users.map((u) => {
                  let roleLabel = '';
                  let roleBadge = '';
                  
                  if (u.role === 'teacher') {
                    if (u.unit_id === null) {
                      roleLabel = 'Admin Global';
                      roleBadge = 'bg-danger-bg/40 text-danger border-danger/20';
                    } else {
                      roleLabel = 'Professor';
                      roleBadge = 'bg-piano-bg bg-text/10 text-text border-text/10';
                    }
                  } else {
                    roleLabel = 'Responsável';
                    roleBadge = 'bg-warning-bg/40 text-warning border-warning/20';
                  }

                  const isSelf = u.id === currentUser?.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-surface-2/15 transition-all group"
                    >
                      <td className="px-5 py-3.5 text-sm font-semibold text-text truncate max-w-[220px]">
                        {u.full_name || 'Usuário Sem Nome'}
                        {isSelf && (
                          <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-surface-3 border border-border text-text-3 font-normal">
                            Você
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-text-2">
                        {u.email || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-sm whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold select-none capitalize ${roleBadge}`}>
                          {roleLabel}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-text-2 whitespace-nowrap">
                        {u.role === 'teacher' && u.unit_id !== null ? (
                          <span>🏢 {u.units?.name || 'Não informada'}</span>
                        ) : (
                          <span className="text-text-3 font-light select-none">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-right whitespace-nowrap">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditClick(u)}
                            className="px-3 py-1 rounded bg-surface-2 hover:bg-surface-3 border border-border text-xs text-text-2 font-medium transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteClick(u)}
                            disabled={isSelf}
                            className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
                              isSelf
                                ? 'bg-surface-2 border-border text-text-3 cursor-not-allowed opacity-50'
                                : 'bg-danger-bg/25 border-danger/20 text-danger hover:bg-danger-bg/50'
                            }`}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modais */}
      <AddUserModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        units={units}
        onSuccess={() => {
          setAddOpen(false);
          fetchUsers();
        }}
      />

      <EditUserModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={selectedUser}
        units={units}
        onSuccess={() => {
          setEditOpen(false);
          setSelectedUser(null);
          fetchUsers();
        }}
      />

      {/* Confirmação de Exclusão */}
      <ConfirmModal
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a conta de ${deleteTarget?.full_name || 'este usuário'} (${deleteTarget?.email})? Esta ação removerá o login do usuário permanentemente.`}
        confirmText="Excluir Usuário"
        cancelText="Cancelar"
        loading={deleting}
      />
    </div>
  );
}
